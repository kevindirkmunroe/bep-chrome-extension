chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SET_EVENT") {
        chrome.storage.local.set({ event_data: message.payload }, () => {
            console.log("Event stored");
            sendResponse({ success: true });
        });

        return true; // required for async response
    }
});
