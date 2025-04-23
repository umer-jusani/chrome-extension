let jobCollection = [];

// Notify background script that the content script is ready
chrome.runtime.sendMessage({ action: "jobCollectionScriptReady" });

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("request", request);
  if (request.action == "CLICK_JOB") {
    collectJobs();
    clickJob(request.jobIndex);
  }

  return true;
});

function collectJobs() {
  // Collect all visible job elements
  jobCollection = Array.from(
    document.querySelectorAll(
      ".job-card-container--clickable, " +
        ".job-card-list__entity-lockup, " +
        ".jobs-search-results__list-item, " +
        "[data-job-id]"
    )
  ).filter((el) => el.offsetParent !== null);

  return;
}

function clickJob(jobIndex) {
  if (jobIndex >= jobCollection.length) {
    chrome.runtime.sendMessage({ action: "noMoreJobs" });
    return;
  }

  const job = jobCollection[jobIndex];
  job.scrollIntoView({ behavior: "smooth", block: "center" });

  // Click the job and notify the background after a delay
  if (job) {
    job.click();
    chrome.runtime.sendMessage({ action: "jobClicked", jobIndex: jobIndex });
  }
}
