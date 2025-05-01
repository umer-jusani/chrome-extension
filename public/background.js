let listenerAdded = false;

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("🚀 ~ chrome.runtime.onMessage.addListener ~ message:", message);
//   if (message.type === "LOGIN_SUCCESS") {
//     chrome.storage.local.set({ accessToken: message.token }, () => {
//       console.log("✅ Token saved.");
//     });
//   }
//   if (message.type === "LOGOUT") {
//     chrome.storage.local.remove("accessToken", () => {
//       console.log("🧹 Token cleared. User logged out from extension.");
//     });
//   }
// });

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
  if (listenerAdded) return;
  listenerAdded = true;

  console.log("Indeed background script loaded");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);

    if (message.action === "startAutoApply") {
      console.log("Starting auto apply");

      chrome.storage.local.set(
        {
          isRunning: true,
          currentJobIndex: 0,
          jobLinks: message.jobLinks,
          shouldStartAutoApply: true,
        },
        () => {
          console.log("Storage set, calling processNextJob");
          processNextJob();
        }
      );
    }

    if (message.action === "applicationCompleted") {
      chrome.storage.local.get(["currentJobIndex"], (data) => {
        const nextIndex = (data.currentJobIndex || 0) + 1;
        chrome.storage.local.set({ currentJobIndex: nextIndex }, () => {
          processNextJob();
        });
      });
    }

    return true;
  });

  function processNextJob() {
    console.log("object", "applicationCompleted");

    chrome.storage.local.get(
      ["jobLinks", "currentJobIndex", "isRunning"],
      async (data) => {
        const jobLinks = data.jobLinks || [];
        let currentJobIndex = data.currentJobIndex || 0;
        const isRunning = data.isRunning;

        if (!isRunning || currentJobIndex >= jobLinks.length) {
          console.log("Stopping automation: done or not running.");
          chrome.storage.local.set({ isRunning: false, currentJobIndex: 0 });
          return;
        }

        const jobUrl = jobLinks[currentJobIndex];
        console.log("Opening job:", jobUrl);

        const [currentTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (currentTab?.url?.includes("indeed.com/viewjob") && currentTab.id) {
          chrome.tabs.remove(currentTab.id, () => {
            chrome.tabs.create({ url: jobUrl, active: true });
          });
        } else {
          chrome.tabs.create({ url: jobUrl, active: true });
          chrome.storage.local.set({
            shouldStartAutoApply: true,
          });
        }
      }
    );
  }
};

const linkedinBackground = () => {
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
          console.log("RESPONSE", response);
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

      default:
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
};

onBackground();
