let observer;
let isEasyApplyButton;
let allQuestions = [];
let isStopFlow = false;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let fakeResponse = [
  {
    question:
      "How many years of experience do you have in cloud sales or AWS solution selling?",
    answer: "0",
  },
  {
    question:
      "Have you previously worked in a sales role focused specifically on AWS products and services?\\nHave you previously worked in a sales role focused specifically on AWS products and services?\\n",
    answer: "No",
  },
  {
    question:
      "Have you completed the following level of education: Bachelor's Degree?\\nHave you completed the following level of education: Bachelor's Degree?\\n",
    answer: "Yes",
  },
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLYING") {
    handleEasyApply(sendResponse);
  }

  return true;
});

function handleEasyApply(sendResponse) {
  const easyApplyBtn = document.getElementById("jobs-apply-button-id");

  if (easyApplyBtn?.innerText == "Easy Apply") {
    console.log("Easy Apply button found");
    isStopFlow = false;
    isEasyApplyButton = true;
    setTimeout(() => easyApplyBtn.click(), 1000);
    setTimeout(() => runEasyApplyFlow(sendResponse), 1000);
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

const runEasyApplyFlow = async (sendResponse) => {
  while (!isStopFlow) {
    console.log("🔁 Running Easy Apply Step...");

    await handleJobQuestions(sendResponse);
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
    statusApiCall("success");
  }
}

function handleGetStartedBtn() {
  const getStartedBtn = Array.from(document.querySelectorAll("button")).find(
    (ele) => ele.innerText == "Get started"
  );

  if (getStartedBtn) {
    console.log("get started button found");
    getStartedBtn.click();
  }
}

async function handleJobQuestions(sendResponse) {
  const container = document.querySelector("form");
  if (!container) return;

  const questions = collectQuestions(container);

  const errorMessage = document
    ?.querySelector("[data-test-form-element-error-messages]")
    ?.querySelector("span")?.innerText;

  if (!errorMessage) {
    console.log("Skipping Questions");
    return;
  }

  // if (!errorMessage && isApiCall) {
  //   sendResponse({ action: "moveToNextJob" });
  //   isApiCall = false;
  //   return;
  // }

  // stop flow
  isStopFlow = true;

  console.log(questions, "questions");

  const data = await getAnswer(
    questions?.map((q) => ({
      options: q?.options,
      question: q?.question,
    }))
  );
  console.log("data", data);

  if (data?.status === 201) {
    fillAnswers(questions, data?.response?.details?.questions || []);
    isStopFlow = false;
    // isApiCall = true;
    runEasyApplyFlow(sendResponse);
  }
}

function collectQuestions(container) {
  const inputs = container.querySelectorAll(".artdeco-text-input--container");
  const selectBox = container.querySelectorAll(
    "[data-test-text-entity-list-form-component]"
  );
  const radioBtn = container.querySelectorAll("fieldset");
  const textArea = container.querySelectorAll(
    "[data-test-multiline-text-form-component]"
  );
  let question = [];
  if (inputs?.length) question.push(...serializeQuestion(inputs, "input"));
  if (selectBox?.length)
    question.push(...serializeQuestion(selectBox, "select"));
  if (radioBtn?.length) question.push(...serializeQuestion(radioBtn, "radio"));
  if (textArea?.length)
    question.push(...serializeQuestion(textArea, "textarea"));
  return question;
}

function fillAnswers(questionList, answerDetails) {
  questionList.forEach((q) => {
    const answerObj = answerDetails.find(
      (item) => item?.question.trim() === q.question.trim()
    );
    if (!answerObj) return;

    const answer = answerObj.answer;
    const el = q.element;

    if (el?.querySelector("input")) {
      const input = el.querySelector("input");
      if (input) {
        input.value = answer;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    if (el?.querySelector("select")) {
      const select = el.querySelector("select");
      console.log("select", select);
      if (select) {
        select.value = answer;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    if (el?.querySelector("textarea")) {
      const textarea = el.querySelector("textarea");
      if (textarea) {
        textarea.value = answer;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    if (el?.querySelector("fieldset")) {
      const radios = el.querySelectorAll("input[type='radio']");
      console.log(radios, "radios");
      radios.forEach((radio) => {
        const label = radio?.nextElementSibling?.innerText
          ?.trim()
          .toLowerCase();

        if (label == answer) {
          setCheckedRadio(radio);
        }
      });
    }
  });
}

function checkIfFieldsAlreadyFilled(questionList) {
  console.log("questionList", questionList);
  return questionList.every((q) => {
    const el = q.element;

    if (el?.querySelector("input"))
      return el.querySelector("input")?.value.trim() !== "";
    if (el?.querySelector("select"))
      return el.querySelector("select")?.value.trim() !== "";
    if (el?.querySelector("textarea"))
      return el.querySelector("textarea")?.value.trim() !== "";
    if (el?.querySelector("fieldset")) {
      const radios = el.querySelectorAll("input[type='radio']");
      return Array.from(radios).some((r) => r.checked);
    }

    return false;
  });
}

const serializeQuestion = (questionElements, type) => {
  if (type === "input") {
    return Array.from(questionElements).map((ele) => ({
      question: ele.children[0]?.innerText || "",
      element: ele,
    }));
  }

  if (type === "select") {
    return Array.from(questionElements).map((ele) => {
      const optionsContainer = ele.children[2]?.children;
      return {
        question: ele.children[0]?.innerText || "",
        options: optionsContainer
          ? Array.from(optionsContainer).map((el) => el.value)
          : [],
        element: ele,
      };
    });
  }

  if (type === "radio") {
    return Array.from(questionElements).map((ele) => {
      const radioInputs = ele.children[1]?.querySelectorAll("input");
      return {
        question: ele.children[0]?.children[0]?.innerText || "",
        options: radioInputs
          ? Array.from(radioInputs).map((el) =>
              el?.getAttribute("data-test-text-selectable-option__input")
            )
          : [],
        element: ele,
      };
    });
  }

  if (type === "textarea") {
    return Array.from(questionElements).map((ele) => ({
      question: ele.querySelector("label")?.innerText || "",
      element: ele,
    }));
  }

  return [];
};

const getAnswer = async (questionList) => {
  try {
    const response = await fetch(
      "https://api.jobbeey.com/api/v1/cv/get-answer",
      {
        method: "POST",
        body: JSON.stringify({
          questions: questionList,
        }),
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWYwNmFjZDgtOWUxOS00Y2JmLTk3YWYtOGViMzFmMzg4ODlhIiwiaWF0IjoxNzQ1OTMxOTUyLCJleHAiOjE3NDY1MzY3NTJ9.iVgaXQWuqbSmqR8rkIIqIz6AXcwSTmqk6m71Nep2Puk",
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

const statusApiCall = async (status = "") => {
  try {
    await fetch("https://api.jobbeey.com/api/v1/applications-log", {
      method: "POST",
      body: JSON.stringify({
        status: status,
        application_url: window.location.href,
        platform: "LINKEDIN",
      }),
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWYwNmFjZDgtOWUxOS00Y2JmLTk3YWYtOGViMzFmMzg4ODlhIiwiaWF0IjoxNzQ1OTI2OTUzLCJleHAiOjE3NDY1MzE3NTN9.so7up91N0yXV1qM_kymAj5LpDIrwPwhzYM3KWrTUi20",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("Error fetching answers:", error);
  }
};

//   console.log("🔁 Running Job Questions Step...");
//   const container = document.querySelector("form");
//   if (!container) return;
//   const questions = collectQuestions(container);
//   if (!questions.length) return;
//   // const isAllFieldsFilled = checkIfFieldsAlreadyFilled(questions);
//   console.log("isAllFieldsFilled", isAllFieldsFilled);
//   if (isAllFieldsFilled) {
//     console.log("All fields already filled. Skipping autofill.");
//     return;
//   }
//   isStopFlow = true;
//   const data = await getAnswer(questions);
//   if (data?.status === 201) {
//     fillAnswers(questions, data?.response?.details || []);
//   }

function setCheckedRadio(radio) {
  const prototype = Object.getPrototypeOf(radio);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "checked");
  descriptor.set.call(radio, true);

  radio.dispatchEvent(new Event("click", { bubbles: true }));
  radio.dispatchEvent(new Event("change", { bubbles: true }));
}
