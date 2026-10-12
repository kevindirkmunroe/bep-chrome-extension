chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SET_EVENT") {
        chrome.storage.local.set({ event_data: message.payload }, () => {
            // console.log("Event stored");
            sendResponse({ success: true });
        });

        return true; // required for async response
    }

    if (message.type === "FORM_SUBMITTED") {
        chrome.tabs.query({
            url: [
                "https://airhorn.events/*",
                "http://localhost:4150/*"
            ]
        }).then(tabs => {
            for (const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, {
                    type: "PLATFORM_FORM_SUBMITTED",
                    platformUrl: message.url,
                    sourceTabId: sender.tab?.id
                }).catch(console.error);
            }

            sendResponse({ success: true });
        }).catch(error => {
            sendResponse({
                success: false,
                error: error.message
            });
        });

        return true;
    }
});
