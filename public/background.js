// let jobIndex = 5;

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   chrome.runtime.sendMessage(
//     {
//       action: "START_COLLECTING_JOBS",
//       jobIndex: jobIndex,
//     },
//     (response) => {
//       console.log(response, "response");
//     }
//   );
//   //   const tabId = sender.tab.id; // This gives you the correct tab ID
//   //   if (request.action === "jobCollectionScriptReady") {
//   //     sendResponse({ message: "START_COLLECTING_JOBS" });
//   //   }

//   //   if (request.action == "jobReadyForApplication") {
//   //     chrome.tabs.sendMessage(tabId, {
//   //       action: "START_APPLYING",
//   //       jobId: request.jobId,
//   //     });
//   //   }

//   return true;
// });

let jobIndex = 5;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "jobCollectionScriptReady") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "START_COLLECTING_JOBS",
          jobIndex: jobIndex,
        },
        (response) => {
          console.log(response, "response from content script");
        }
      );
    });
    return true;
  }

  // Handle other actions if needed
  return true;
});
