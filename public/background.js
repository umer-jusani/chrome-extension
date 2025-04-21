chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action == "jobCollectionScriptReady") {
        sendResponse({ message: "START_COLLECTING_JOBS" })
    }


    // if (request.action === "contentScriptReady") {
    //     // Acknowledge the content script
    //     sendResponse({ message: "START_APPLYING" });

    //     // Add your background logic here (e.g. start job processing)
    //     return true; // Keep the message channel open
    // }
});