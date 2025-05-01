let isEasyApplyButton;
let allQuestions = [];
let isStopFlow = false;
let answerFillAttempts = 0;
let isAnswerFilled = false;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLYING") {
    handleEasyApply(sendResponse);
  }

  // return true;
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

function handleLimitReach(sendResponse) {
  let msg = document.querySelector(".artdeco-inline-feedback__message");

  if (msg?.innerText?.includes("reached the Easy Apply application limit")) {
    console.log("limitReached");
    isStopFlow = true;
    sendResponse({ action: "limitReached" });
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
    handleLimitReach(sendResponse);
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

function handleCrossBtn() {
  const crossBtn = document.querySelector("[data-test-modal-close-btn]");
  if (crossBtn) {
    console.log("cross button found");
    crossBtn.click();
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

function handleDiscardBtn() {
  const discardBtn = document.querySelector(
    "[data-control-name=discard_application_confirm_btn]"
  );
  if (discardBtn) {
    console.log("Discard button found");
    discardBtn.click();
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
    console.log("No error message - skipping questions");
    answerFillAttempts = 0; // Reset counter when no errors
    return;
  }

  // Only proceed if we haven't filled answers yet OR we've tried less than 3 times
  if (errorMessage && (!isAnswerFilled || answerFillAttempts < 1)) {
    console.log("Processing questions...");
    const data = await getAnswer(
      questions?.map((q) => ({
        options: q?.options,
        question: q?.question,
      }))
    );

    if (data?.status === 201) {
      answerFillAttempts++;
      isStopFlow = true;

      await sleep(1000);
      fillAnswers(questions, data?.response?.details?.questions || []);
      isAnswerFilled = true;

      // Wait longer after filling answers before continuing
      await sleep(2000);

      isStopFlow = false;
      return;
    }
  }
  // If we've tried multiple times and still have errors, give up
  else if (errorMessage && isAnswerFilled && answerFillAttempts >= 1) {
    sendResponse({ action: "moveToNextJob" });
    console.log("Multiple attempts failed - moving to next job");
    isStopFlow = true;
    answerFillAttempts = 0; // Reset for next job
    handleCrossBtn();
    handleDiscardBtn();
    statusApiCall("not_applicable");
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
  let checkbox = container.querySelectorAll(
    "fieldset[data-test-checkbox-form-component]"
  );

  let question = [];

  if (inputs?.length) question.push(...serializeQuestion(inputs, "input"));
  if (selectBox?.length)
    question.push(...serializeQuestion(selectBox, "select"));
  if (radioBtn?.length) question.push(...serializeQuestion(radioBtn, "radio"));
  if (textArea?.length)
    question.push(...serializeQuestion(textArea, "textarea"));
  if (checkbox?.length) {
    question.push(...serializeQuestion(checkbox, "checkbox"));
  }

  return question;
}

function fillAnswers(questionList, answerDetails) {
  console.log("now filling answers");
  questionList.forEach((q) => {
    const answerObj = answerDetails.find((item) =>
      item?.question?.includes(q.question.trim())
    );

    if (!answerObj) return;

    const answer = answerObj.answer?.trim().toLowerCase();
    const el = q?.element;

    // Text input
    const input = el?.querySelector(
      "input:not([type=radio]):not([type=checkbox])"
    );
    if (input) {
      input.value = answerObj.answer;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Select dropdown
    const select = el?.querySelector("select");
    if (select) {
      select.value = answerObj.answer;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Textarea
    const textarea = el?.querySelector("textarea");
    if (textarea) {
      textarea.value = answerObj.answer;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Radio buttons
    const radios = el?.querySelectorAll("input[type=radio]");
    if (radios?.length) {
      radios.forEach((radio) => {
        const label =
          radio?.nextElementSibling?.innerText?.trim().toLowerCase() ||
          radio.value?.trim().toLowerCase();

        if (label?.includes(answer)) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          radio.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
    }

    //checkbox
    const checkboxes = el?.querySelectorAll("input[type=checkbox]");
    if (checkboxes?.length) {
      checkboxes.forEach((cb) => {
        const label =
          cb?.nextElementSibling?.innerText?.trim().toLowerCase() ||
          cb.value?.trim().toLowerCase();

        console.log({ label: label, answer }, "checkbox");
        if (label?.includes(answer)) {
          cb.checked = true;
          cb.dispatchEvent(new Event("change", { bubbles: true }));
          cb.dispatchEvent(new Event("input", { bubbles: true }));
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
  if (!questionElements || questionElements.length === 0) return [];

  return Array.from(questionElements)
    .map((ele) => {
      if (!ele) return null;

      // Common base object
      const questionObj = {
        question: "",
        element: ele,
      };

      // Get question text more reliably
      const questionText =
        ele.querySelector(".question-text") || ele.children[0] || ele;
      if (questionText) {
        questionObj.question = (
          questionText.innerText ||
          questionText.textContent ||
          ""
        )
          .replace(/\s+/g, " ")
          .trim()
          .split("\n")[0]
          .trim();
      }

      // Handle different question types
      switch (type) {
        case "input":
        case "textarea":
          // Simple input types just need the question text
          return questionObj;

        case "select":
          const selectElement = ele.querySelector("select");
          if (selectElement) {
            questionObj.options = Array.from(selectElement.options)
              .map((option) => option.value)
              .filter(
                (value) =>
                  value && !value.toLowerCase().includes("select an option")
              );
          } else {
            questionObj.options = [];
          }
          return questionObj;

        case "radio":
        case "checkbox":
          const inputs = ele.querySelectorAll(`input[type=${type}]`);
          questionObj.options = Array.from(inputs)
            .map((input) => {
              // Try different ways to get the option text
              return (
                input.getAttribute("data-test-text-selectable-option__input") ||
                input.value ||
                input.nextElementSibling?.textContent ||
                input.closest("label")?.textContent
              );
            })
            .filter((option) => option && option.trim());
          return questionObj;

        default:
          return questionObj;
      }
    })
    .filter((item) => item !== null); // Filter out any null entries
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

function setCheckedRadio(radio) {
  const prototype = Object.getPrototypeOf(radio);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "checked");
  descriptor.set.call(radio, true);

  radio.dispatchEvent(new Event("click", { bubbles: true }));
  radio.dispatchEvent(new Event("change", { bubbles: true }));
}
