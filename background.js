console.log("[background.js] Service worker initialized");

async function closeSubmissionWindows(platformWindowId, referenceWindowId){
    console.log(`[background.js] closeSubmissionWindows platformWindowId=${platformWindowId} referenceWindowId=${referenceWindowId}`);

    if (!Number.isInteger(platformWindowId) || platformWindowId <= 0) {
        console.log(`[background.js] ERROR platformWindowId=${platformWindowId}`);
        return;
    }

    if (!Number.isInteger(referenceWindowId) || referenceWindowId <= 0) {
        console.log(`[background.js] ERROR referenceWindowId=${platformWindowId}`);
        return;
    }

    await chrome.windows.remove(platformWindowId, () => {
        console.log(`[background.js] removed window ${platformWindowId}`);
    });
    await chrome.windows.remove(referenceWindowId, () => {
        console.log(`[background.js] removed window ${referenceWindowId}`);
    });
}

async function openSubmissionWindows(platformUrl, referenceUrl) {
    const platformWindow = await chrome.windows.create({
        url: platformUrl,
        type: "popup",
        width: 1100,
        height: 850,
        left: 100,
        top: 100,
        focused: true
    });

    const referenceWindow = await chrome.windows.create({
        url: referenceUrl,
        type: "popup",
        width: 460,
        height: 720,
        left: 1220,
        top: 260,
        focused: false
    });

    let currUrl = new URL("http://localhost:4150");

    await chrome.windows.create({
        url: `${currUrl.host}/xr/close?platformWindowId=${platformWindow.id}&referenceWindowId=${referenceWindow.id}`,
        type: "popup",
        width: 460,
        height: 150,
        left: 1220,
        top: 100,
        focused: false
    });

    return {
        platformWindowId: platformWindow.id,
        referenceWindowId: referenceWindow.id,
        platformTabId: platformWindow.tabs?.[0]?.id,
        referenceTabId: referenceWindow.tabs?.[0]?.id
    };
}

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

        case "OPEN_SUBMISSION_WINDOWS": {
                openSubmissionWindows(
                    message.platformUrl,
                    message.referenceUrl
                )
                    .then(sendResponse)
                    .catch(error => {
                        sendResponse({
                            error: error.message
                        });
                    });

                return true;
        }

        case "CLOSE_SUBMISSION_WINDOWS": {
            closeSubmissionWindows(
                message.platformWindowId,
                message.referenceWindowId
            )
                .then(() => sendResponse({ success: true }))
                .catch(error => {
                    sendResponse({
                        error: error.message
                    });
                });

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
