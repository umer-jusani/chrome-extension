// asddddddddd
const onBackground = async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (currentTab?.url?.includes("indeed.com")) {
    indeedBackground();
  } else {
    linkedinBackground();
  }
};

const indeedBackground = () => {
  let isRunning = false;
  let currentJobIndex = 0;
  let jobLinks = [];
  console.log("🚀 ~ jobLinks:", jobLinks);
  console.log("bg js");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(
      "🚀 ~ chrome.runtime.onMessage.addListener ~ message:",
      message
    );
    if (message.action === "startAutoApply") {
      jobLinks = message.jobLinks;
      isRunning = true;
      currentJobIndex = 0;
      processNextJob();
    } else if (message.action === "applicationCompleted") {
      currentJobIndex++;
      processNextJob();
    }
  });

  async function processNextJob() {
    console.log(
      "🚀 ~ processNextJob ~ currentTab:",
      isRunning,
      currentJobIndex,
      jobLinks
    );
    if (!isRunning || currentJobIndex >= jobLinks.length) {
      isRunning = false;
      currentJobIndex = 0;
      return;
    }

    // Get current active tab
    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (currentTab) {
      // Only close the tab if it's a job details page
      if (currentTab.url.includes("indeed.com/viewjob")) {
        await chrome.tabs.remove(currentTab.id);
        // Open new job in new tab
        chrome.tabs.create({ url: jobLinks[currentJobIndex], active: true });
      } else if (currentTab.url.includes("indeed.com")) {
        // If on indeed.com but not a job page, just open new tab
        chrome.tabs.create({ url: jobLinks[currentJobIndex], active: true });
      } else {
        // If not on indeed.com at all, focus back to indeed tab and open new job
        const indeeds = await chrome.tabs.query({ url: "*://*.indeed.com/*" });
        if (indeeds.length > 0) {
          // Focus the first indeed tab
          await chrome.tabs.update(indeeds[0].id, { active: true });
          // Then open new job
          chrome.tabs.create({ url: jobLinks[currentJobIndex], active: true });
        } else {
          // If no indeed tabs exist, just open new job
          chrome.tabs.create({ url: jobLinks[currentJobIndex], active: true });
        }
      }
    } else {
      // If no active tab, just open new job
      chrome.tabs.create({ url: jobLinks[currentJobIndex], active: true });
    }
  }
};

const linkedinBackground = () => {
  let jobIndex = 0;
  let activeTabId = null;

  // Track the active tab where the extension is running
  chrome.runtime.onMessage.addListener((request, sender) => {
    console.log("requestBackgruond", request)
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
      jobIndex = 0;
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

      case "limitReached":
        jobIndex = 0;
        activeTabId = null;
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
};

onBackground();
