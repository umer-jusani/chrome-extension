let observer;
let isEasyApplyButton;
let allQuestions = [];
let isStopFlow = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLYING") {
    handleEasyApply(sendResponse);
  }

  return true;
});

function handleEasyApply(sendResponse) {
  const easyApplyBtn = document.getElementById("jobs-apply-button-id");

  if (easyApplyBtn?.innerText == "Easy Apply") {
    isStopFlow = false;
    isEasyApplyButton = true;
    setTimeout(() => easyApplyBtn.click(), 1000);
    setTimeout(() => runEasyApplyFlow(sendResponse), 2000);
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runEasyApplyFlow = async (sendResponse) => {
  while (!isStopFlow) {
    console.log("🔁 Running Easy Apply Step...");

    handleJobQuestions(sendResponse);
    handleContinueApplyBtn();
    handleNextBtn();
    handleReviewBtn();
    handleSubmitApplication();
    await sleep(1500);

    const postApplyModal = document.querySelector("[id='post-apply-modal']");
    const crossBtn = document.querySelector("[data-test-modal-close-btn]");

    if (
      postApplyModal &&
      (crossBtn || postApplyModal.innerText.includes("Application sent"))
    ) {
      console.log("✅ Application sent detected!");
      crossBtn?.click();
      isStopFlow = true;
      sendResponse({ action: "moveToNextJob" });
      break;
    }

    await sleep(1500);
  }
};

function handleNextBtn() {
  const nextBtn = document.querySelector("[data-easy-apply-next-button]");
  if (nextBtn) {
    console.log("next button found");
    nextBtn.click();
  } 
}

function handleReviewBtn() {
  const reviewBtn = document.querySelector(
    "[data-live-test-easy-apply-review-button]"
  );
  if (reviewBtn) {
    console.log("review button found");
    reviewBtn.click();
  }
}

function handleContinueApplyBtn() {
  const continueBtn = document.querySelector(
    "[data-live-test-job-apply-button]"
  );
  if (continueBtn?.innerText === "Continue applying") {
    console.log("continue apply button found");
    continueBtn.click();
  }
}

function handleSubmitApplication() {
  const submitApplicationBtn = document.querySelector(
    "[data-live-test-easy-apply-submit-button]"
  );
  if (submitApplicationBtn) {
    console.log("submit application button found");
    submitApplicationBtn.click();
  }
}

async function handleJobQuestions(sendResponse) {
  return new Promise(async (resolve) => {
    const container = document.querySelector("form");
    if (!container) return resolve();

    const inputs = container.querySelectorAll(".artdeco-text-input--container");
    const selectBox = container.querySelectorAll(
      "[data-test-text-entity-list-form-component]"
    );
    const radioBtn = container.querySelectorAll("fieldset");
    const textArea = container.querySelectorAll(
      "[data-test-multiline-text-form-component]"
    );
    let question = [];

    if (inputs?.length > 0)
      question.push(...serializeQuestion(inputs, "input"));
    if (selectBox?.length > 0)
      question.push(...serializeQuestion(selectBox, "select"));
    if (radioBtn?.length > 0)
      question.push(...serializeQuestion(radioBtn, "radio"));
    if (textArea?.length > 0)
      question.push(...serializeQuestion(textArea, "textarea"));

    if (question.length > 0) {
      isStopFlow = true;
      const data = await getAnswer(question);
      isStopFlow = false;
      runEasyApplyFlow(sendResponse);
      console.log(data, "data")
    }

    resolve();
  });
}

const serializeQuestion = (questionElements, type) => {
  if (type === "input") {
    return Array.from(questionElements).map((ele) => ({
      question: ele.children[0]?.innerText,
    }));
  }

  if (type === "select") {
    return Array.from(questionElements).map((ele) => ({
      question: ele.children[0]?.innerText,
      options: Array.from(ele.children[2]?.children)?.map((el) => el.value),
    }));
  }

  if (type === "radio") {
    return Array.from(questionElements).map((ele) => ({
      question: ele.children[0]?.children[0]?.innerText,
      options: Array.from(ele.children[1]?.querySelectorAll("input")).map(
        (el) => el?.getAttribute("data-test-text-selectable-option__input")
      ),
    }));
  }

  if (type === "textarea") {
    return Array.from(questionElements).map((ele) => ({
      question: ele.querySelector("label")?.innerText,
    }));
  }

  return [];
};

const getAnswer = async (questionList) => {
  try {
    const response = await fetch(
      "https://spaniel-charming-logically.ngrok-free.app/api/v1/cv/get-answer",
      {
        method: "POST",
        body: JSON.stringify({
          questions: ["What is Your age?", "What is Your First Name?", "What is Your Last Name?"],
        }),
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDI2OWFhZmQtMzQyNi00ZmFjLTk0NGYtYmUzZDUzMmY4ZDI1IiwiaWF0IjoxNzQ1MzkzMTc0LCJleHAiOjE3NDU0MjkxNzR9.IjBlHIbr5kWPit82VWkJPyEMQte8cP79tHASVUqA2WM",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching answers:", error);
    return [];
  }
};
