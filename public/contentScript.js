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
    console.log("✅ mutations", mutations);
    handleNextBtn();
    handleReviewBtn();
    // handleApplicationSend();
    handleSubmitApplication();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// function handleApplicationSend() {
//   const applicationSendBtn = document.querySelector(
//     "[data-test-modal-close-btn]"
//   );

//   if (applicationSendBtn) {
//     setTimeout(() => {
//       applicationSendBtn.click();
//     }, 1000);
//   }
// }

function getJobCollection() {
  const jobCollection = document.querySelectorAll(
    ".job-card-container--clickable"
  );

  console.log("✅ jobCollection", jobCollection);

  jobCollection[3].click();
}

(() => {
  console.log("content script is loaded");
  handleEasyApply();
  // handleApplicationSend();
  observeButtons();
})();
