let observer;
let isEasyApplyButton;

// Set up listener first
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLYING") {
    handleEasyApply(sendResponse);

    if (isEasyApplyButton) {
      observeButtons(sendResponse);
    } else {
      sendResponse({ action: "moveToNextJob" });
    }
  }

  return true;
});

// Then notify background script

function handleEasyApply() {
  const easyApplyBtn = document.getElementById("jobs-apply-button-id");
  if (easyApplyBtn) {
    isEasyApplyButton = true
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
  if (reviewBtn) {
    setTimeout(() => {
      reviewBtn.click();
    }, 1000);
  }
}

function handleContinueApplyBtn() {
  const reviewBtn = document.querySelector("[data-live-test-job-apply-button]");

  if (reviewBtn?.innerText == "Continue applying") {
    setTimeout(() => {
      reviewBtn.click();
    }, 1000);
  }
}

function handleSubmitApplication(sendResponse) {
  const submitApplicationBtn = document.querySelector(
    "[data-live-test-easy-apply-submit-button]"
  );
  if (submitApplicationBtn) {
    setTimeout(() => {
      submitApplicationBtn.click();
    }, 1000);

    setTimeout(() => {
      handleCrossBtn();

      // ✅ Disconnect the observer
      if (observer) {
        observer.disconnect();
        console.log("🔌 Observer disconnected after submission.");
      }

      sendResponse({ action: "moveToNextJob" });
    }, 6000);
  }
}

function observeButtons(sendResponse) {
  observer = new MutationObserver((mutations) => {
    handleNextBtn(sendResponse);
    handleContinueApplyBtn(sendResponse);
    handleReviewBtn(sendResponse);
    handleSubmitApplication(sendResponse);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function handleCrossBtn() {
  const crossBtn = document.querySelector("[data-test-modal-close-btn]");
  console.log(crossBtn, "crossBtn");

  if (crossBtn) {
    crossBtn?.click();
  }
}
