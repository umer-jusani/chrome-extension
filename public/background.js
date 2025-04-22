let jobIndex = 0;
let activeTabId = null;

// Track the active tab where the extension is running
chrome.runtime.onMessage.addListener((request, sender) => {
  activeTabId = sender.tab.id;

  if (request.action === "jobCollectionScriptReady") {
    startJobProcessing();
  } else if (request.action === "jobClicked") {
    jobIndex = request.jobIndex;

    // Start Easy Apply process for this job
    chrome.tabs.sendMessage(
      activeTabId,
      { action: "START_APPLYING" },
      (response) => {
        continueApplying(response);
      }
    );
  } else if (request.action === "noMoreJobs") {
    jobIndex = 0; // Reset for next use
    activeTabId = null;
  }

  return true;
});

function continueApplying(response) {
  switch (response?.action) {
    case "moveToNextJob":
      jobIndex++;
      startJobProcessing();
      break;

    case "EasyApplyButtonNotFound":
      jobIndex++;
      startJobProcessing();
      break;

    case "AlreadyApplied":
      jobIndex++;
      startJobProcessing();
      break;
  }
}

function startJobProcessing() {
  if (activeTabId !== null) {
    chrome.tabs.sendMessage(activeTabId, {
      action: "CLICK_JOB",
      jobIndex: jobIndex,
    });
  }
}

