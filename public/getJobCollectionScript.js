let jobCollection = [];

// First, let the background know we're ready
chrome.runtime.sendMessage({ action: "jobCollectionScriptReady" });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "START_COLLECTING_JOBS") {
    collectJobs();
    clickNextJob(request.jobIndex, sendResponse);
    return true; // Keep the message channel open for sendResponse
  }

  return true;
});

function collectJobs() {
  jobCollection = Array.from(
    document.querySelectorAll(
      ".job-card-container--clickable, " +
        ".job-card-list__entity-lockup, " +
        ".jobs-search-results__list-item, " +
        "[data-job-id]"
    )
  ).filter((el) => el.offsetParent !== null);
}

function clickNextJob(jobIndex, sendResponse) {
  if (jobIndex >= jobCollection.length) {
    sendResponse({ action: "noMoreJobs" });
    return;
  }

  const job = jobCollection[jobIndex];
  job.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    job.click();
    sendResponse({ action: "jobIsClick", jobIndex: jobIndex });
  }, 2000);

  // Important: Return true to keep the message channel open for the async response
  return true;
}

// Check if already initialized to prevent duplicate execution
// if (typeof window.jobCollectorInitialized === "undefined") {
//   window.jobCollectorInitialized = true;

//   let currentJobIndex = 0;
//   let jobCollection = [];
//   let observer;
//   let waitingForNextJobCommand = false;

//   // Initialize the process
//   chrome.runtime.sendMessage(
//     { action: "jobCollectionScriptReady" },
//     (response) => {
//       if (response && response.message === "START_COLLECTING_JOBS") {
//         startJobCollection();
//       }
//     }
//   );

//   function startJobCollection() {
//     collectJobs();
//     if (jobCollection.length > 0) {
//       clickNextJob();
//     } else {
//       console.log("[Job Collector] No job cards found");
//       chrome.runtime.sendMessage({ action: "jobCollectionComplete" });
//     }
//   }

//   // Communication with other scripts
//   // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   //   console.log(request.action, "request.action");
//   //   switch (request.action) {
//   //     case "moveToNextJob":
//   //       waitingForNextJobCommand = false;
//   //       currentJobIndex++;
//   //       clickNextJob();
//   //       sendResponse({ status: "success" });
//   //       break;
//   //   }
//   //   return true;
//   // });
// } else {
//   console.log("Job Collector already initialized");
// }
