function handleEasyApply() {
    const easyApplyBtn = document.getElementById("jobs-apply-button-id");
    if (easyApplyBtn) {
        console.log("✅ Easy Apply clicked");
        easyApplyBtn.click();
    }
}

function handleNextBtn() {
    console.log("✅ Next button clicked");
    const nextBtn = document.querySelector('[data-easy-apply-next-button]');
    if (nextBtn) {
        nextBtn.click();
    }
}

function handleReviewBtn() {
    const reviewBtn = document.querySelector('[data-live-test-easy-apply-review-button]');
    console.log("✅review", reviewBtn);
    if (reviewBtn) {
        reviewBtn.click();
    }
}

function handleSubmitApplication() {
    const submitApplicationBtn = document.querySelector('[data-live-test-easy-apply-submit-button]');
    if (submitApplicationBtn) {
        console.log("✅ Submit Application clicked");
        submitApplicationBtn.click();
    }
}

function observeButtons() {
    const observer = new MutationObserver(() => {
        handleNextBtn();
        handleReviewBtn();
        handleSubmitApplication();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

(() => {
    console.log("content script is loaded");

    handleEasyApply();

    observeButtons();
})();
