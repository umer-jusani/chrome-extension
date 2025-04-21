
chrome.runtime.sendMessage(
  { action: "contentScriptReady" },
  (response) => {
    if (response.message == "START_APPLYING") {
      console.log("Start_Applying")
      handleEasyApply();
      observeButtons()
    }
  }
);

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
});

function handleEasyApply() {
  const easyApplyBtn = document.getElementById("jobs-apply-button-id");
  if (easyApplyBtn) {
    setTimeout(() => {
      easyApplyBtn.click();
    }, 1000);
  }
}

function handleNextBtn() {
  const nextBtn = document.querySelector("[data-easy-apply-next-button]");
  if (nextBtn) {
    setTimeout(() => {
      nextBtn.click();
    }, 1000);
  }
}

function handleReviewBtn() {
  const reviewBtn = document.querySelector(
    "[data-live-test-easy-apply-review-button]"
  );
  console.log("✅review", reviewBtn);
  if (reviewBtn) {
    setTimeout(() => {
      reviewBtn.click();
    }, 1000);
  }
}

function handleSubmitApplication() {
  const submitApplicationBtn = document.querySelector(
    "[data-live-test-easy-apply-submit-button]"
  );
  if (submitApplicationBtn) {
    setTimeout(() => {
      submitApplicationBtn.click();
    }, 1000);
  }
}

function observeButtons() {
  const observer = new MutationObserver((mutations) => {
    handleNextBtn();
    handleReviewBtn();
    // handleVerifyBtn();
    handleCrossBtn();
    handleSubmitApplication();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function handleCrossBtn() {
  const crossBtn = document.querySelector(
    "[data-test-modal-close-btn]"
  );

  if (crossBtn) {
    setTimeout(() => {
      crossBtn.click();
    }, 1000);
  }
}



