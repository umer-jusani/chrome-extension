let jobIndex = 0;
let activeTabId = null;

// Track the active tab where the extension is running
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "jobCollectionScriptReady") {
    activeTabId = sender.tab.id;
    startJobProcessing();
  } else if (request.action === "jobClicked") {
    jobIndex = request.jobIndex;

    // Start Easy Apply process for this job
    chrome.tabs.sendMessage(
      activeTabId,
      { action: "START_APPLYING" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError);
          return;
        }

        console.log(response, "response")
        if (response?.action == "moveToNextJob") {

        }
      }
    );

  } else if (request.action === "noMoreJobs") {
    jobIndex = 0; // Reset for next use
    activeTabId = null;
  }
});

function startJobProcessing() {
  if (activeTabId !== null) {
    chrome.tabs.sendMessage(activeTabId, { action: "CLICK_JOB", jobIndex: jobIndex });
  }
}