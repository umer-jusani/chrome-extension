// let currentJobIndex = 0;

// function getJobCollection() {
//   const jobCollection = document.querySelectorAll(
//     ".job-card-container--clickable"
//   );

//   if (jobCollection.length > currentJobIndex) {
//     jobCollection[currentJobIndex].click();
//     currentJobIndex++;
//   } else {
//     console.log("No more jobs to apply to");
//   }
// }

// // Initial click
// getJobCollection();

// const observer = new MutationObserver(async (mutations) => {
//   //   let [tab] = await chrome.tabs.query({ active: true });
//   //   chrome.scripting.executeScript({
//   //     target: { tabId: tab.id },
//   //     files: ["contentScript.js"],
//   //   });
//   //   getJobCollection();
//   console.log("✅ observer run huwa");
// });

// observer.observe(currentJobIndex, { childList: true, subtree: true });


chrome.runtime.sendMessage(
  { action: "jobCollectionScriptReady" },
  (response) => {
    if (response.message == "START_COLLECTING_JOBS") {
      console.log("START_COLLECTING_JOBS");

      
      // collectJobs();
      // clickAndApplyNextJob();
    }
  }
);


// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
});

let currentJobIndex = 0;
let jobCollection = [];

function collectJobs() {
  jobCollection = Array.from(
    document.querySelectorAll(".job-card-container--clickable")
  );
  console.log(`Collected ${jobCollection.length} jobs`);
}

async function clickAndApplyNextJob() {
  if (currentJobIndex < jobCollection.length) {
    const job = jobCollection[currentJobIndex];
    job.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      job.click();
    }, 2000);

    console.log("job is clicked");
  } else {
    console.log("✅ No more jobs to apply to.");
    observer.disconnect();
  }
}

const observer = new MutationObserver((mutations) => {
  currentJobIndex++;
  setTimeout(clickAndApplyNextJob, 2000); // Wait 2 seconds before moving to the next job
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});




// Start the whole process

