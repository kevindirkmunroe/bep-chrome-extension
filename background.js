console.log("[background.js] Service worker initialized");

async function waitForTabComplete(tabId, timeoutMs = 15000) {
    const tab = await chrome.tabs.get(tabId);

    if (tab.status === "complete") {
        return tab;
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Timed out waiting for tab to load"));
        }, timeoutMs);

        function cleanup() {
            clearTimeout(timeout);
            chrome.tabs.onUpdated.removeListener(onUpdated);
            chrome.tabs.onRemoved.removeListener(onRemoved);
        }

        function onUpdated(updatedTabId, changeInfo, updatedTab) {
            if (
                updatedTabId === tabId &&
                changeInfo.status === "complete"
            ) {
                cleanup();
                resolve(updatedTab);
            }
        }

        function onRemoved(removedTabId) {
            if (removedTabId === tabId) {
                cleanup();
                reject(new Error("Platform tab was closed"));
            }
        }

        chrome.tabs.onUpdated.addListener(onUpdated);
        chrome.tabs.onRemoved.addListener(onRemoved);

        // Avoid missing completion between the initial check
        // and listener registration.
        chrome.tabs.get(tabId).then(current => {
            if (current.status === "complete") {
                cleanup();
                resolve(current);
            }
        }).catch(error => {
            cleanup();
            reject(error);
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log("[background.js] Received:", message.type);

    switch (message.type) {

        case "AGENT_START_INSPECTION": {
            console.log("[background.js] Starting inspection");

            (async () => {
                try {
                    const tabs = await chrome.tabs.query({
                        url: "https://hub.cityspark.com/*"
                    });

// For our current single-window test
                    const target = tabs[0];

                    console.log("[Agent] Waiting for tab:", target.id);

                    await waitForTabComplete(target.id);

                    console.log("[Agent] Tab loaded, inspecting...");

                    const result = await inspectTab(target.id);

                    console.log("[Agent] Inspection result:", result);

                } catch (error) {
                    console.error("[Agent] Inspection error:", error);

                    sendResponse({
                        success: false,
                        error: error.message
                    });
                }
            })();

            return true;
        }

        case "SET_EVENT": {
            chrome.storage.local.set(
                { event_data: message.payload },
                () => sendResponse({ success: true })
            );

            return true;
        }

        case "FORM_SUBMITTED": {
            chrome.tabs.query({
                url: [
                    "https://airhorn.events/*",
                    "http://localhost:4150/*"
                ]
            }).then(tabs => {
                return Promise.all(
                    tabs.map(tab =>
                        chrome.tabs.sendMessage(tab.id, {
                            type: "PLATFORM_FORM_SUBMITTED",
                            platformUrl: message.url,
                            sourceTabId: sender.tab?.id
                        }).catch(console.error)
                    )
                );
            }).then(() => {
                sendResponse({ success: true });
            }).catch(error => {
                sendResponse({
                    success: false,
                    error: error.message
                });
            });

            return true;
        }

        default:
            console.warn(
                "[background.js] Unhandled message:",
                message.type
            );
            return false;
    }
});

async function inspectTab(tabId) {
    console.log(`[background.js] sending msg AGENT_INSPECT_FORM`);
    const result = await chrome.tabs.sendMessage(
        tabId,
        { type: "AGENT_INSPECT_FORM" }
    );

    console.log("[Agent] Form inspection:", result);

    return result;
}
