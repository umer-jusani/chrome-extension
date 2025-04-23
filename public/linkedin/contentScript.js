let observer;
let isEasyApplyButton;
let allQuestions = [];

// Set up listener first
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLYING") {
    handleEasyApply(sendResponse);
    if (isEasyApplyButton) {
      observeButtons(sendResponse);
    }
  }

  return true;
});

// Then notify background script
function handleEasyApply(sendResponse) {
  const easyApplyBtn = document.getElementById("jobs-apply-button-id");

  if (easyApplyBtn?.innerText == "Easy Apply") {
    console.log("easy apply button found");
    isEasyApplyButton = true;
    setTimeout(() => {
      easyApplyBtn.click();
    }, 2000);
  } else if (easyApplyBtn?.innerText == "Already applied") {
    console.log("already applied button found");
    isEasyApplyButton = false;
    setTimeout(() => {
      sendResponse({ action: "AlreadyApplied" });
    }, 2000);
  } else {
    console.log("easy apply button not found");
    isEasyApplyButton = false;
    setTimeout(() => {
      sendResponse({ action: "EasyApplyButtonNotFound" });
    }, 2000);
  }
}

function handleNextBtn() {
  const nextBtn = document.querySelector("[data-easy-apply-next-button]");
  if (nextBtn) {
    console.log("next button found");
    setTimeout(() => {
      nextBtn.click();
    }, 2000);
  } else {
    console.log("next button not found");
  }
}

function handleJobQuestions(sendResponse) {
  const container = document.querySelector("form");
  const inputs = container && container?.querySelectorAll(".artdeco-text-input--container")
  const selectBox = container && container?.querySelectorAll("[data-test-text-entity-list-form-component]")

  if (!inputs || inputs?.length == 0) return;

  // if (observer) observer.disconnect();

  let Obj_Form_Input = Array.from(inputs)?.map(ele => ({
    label: ele.children[0].innerText,
    element: ele.children[1],
  }));

  let Obj_Form_SelectBox = Array.from(selectBox)?.map(ele => ({
    label: ele.children[0].innerText,
    element: ele.children[2],
    options: Array.from(ele.children[2]?.children)?.map(ele => ele.value)
  }));


  // filling the input field
  Obj_Form_Input?.forEach(ele => {
    ele.element.value = "23"
  })

  // filling the selectbox field
  Obj_Form_SelectBox?.forEach(ele => {
    ele.element.value = ele.options[2];
  })

  console.log(Obj_Form_Input, "Obj_Form_Input")
  console.log(Obj_Form_SelectBox, "Obj_Form_SelectBox")

  // observeButtons(sendResponse)
}

function handleReviewBtn() {
  const reviewBtn = document.querySelector(
    "[data-live-test-easy-apply-review-button]"
  );
  if (reviewBtn) {
    console.log("review button found");
    setTimeout(() => {
      reviewBtn.click();
    }, 2000);
  }
}

function handleContinueApplyBtn() {
  const reviewBtn = document.querySelector("[data-live-test-job-apply-button]");

  if (reviewBtn?.innerText == "Continue applying") {
    console.log("continue apply button found");
    setTimeout(() => {
      reviewBtn.click();
    }, 2000);
  }
}

function handleSubmitApplication(sendResponse) {
  const submitApplicationBtn = document.querySelector(
    "[data-live-test-easy-apply-submit-button]"
  );
  if (submitApplicationBtn) {
    console.log("submit application button found");
    setTimeout(() => {
      submitApplicationBtn.click();
    }, 2000);
  }
}

function checkAndHandleApplicationSentPopup(sendResponse) {
  const postApplyModal = document.querySelector("[id='post-apply-modal']");
  const crossBtn = document.querySelector("[data-test-modal-close-btn]");

  if (
    (postApplyModal && crossBtn) ||
    postApplyModal?.innerText?.includes("Application sent")
  ) {
    console.log("Application sent popup found, closing...");
    setTimeout(() => {
      crossBtn.click();
      if (observer) observer.disconnect();
      sendResponse({ action: "moveToNextJob" });
    }, 2000);
  }
}

function observeButtons(sendResponse) {
  observer = new MutationObserver((mutations) => {
    handleNextBtn(sendResponse);
    handleContinueApplyBtn(sendResponse);
    handleReviewBtn(sendResponse);
    handleSubmitApplication(sendResponse);
    handleJobQuestions(sendResponse);
    checkAndHandleApplicationSentPopup(sendResponse);
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// function handleCrossBtn(sendResponse) {
//   const crossBtn = document.querySelector("[data-test-modal-close-btn]");
//   const postApplyModal = document.querySelector("[id='post-apply-modal']");

//   if (crossBtn && postApplyModal?.innerText?.includes("Application sent")) {
//     console.log("cross button found");
//     crossBtn?.click();
//     sendResponse({ action: "moveToNextJob" });
//     if (observer) observer.disconnect();
//   }
// }
