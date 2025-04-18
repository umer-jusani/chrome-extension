// Background script for the extension
let jobIndex = 0;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  if (request.greeting === "hello") {
    jobIndex++;
    console.log("✅ jobIndex", jobIndex);
  }

  // if (request.greeting === "hello") {
  //   sendResponse({ reply: "hi!" });
  // }

  return true;
});
