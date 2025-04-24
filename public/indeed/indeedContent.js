console.log("Auto Apply Script Running...");
let url = "https://spaniel-charming-logically.ngrok-free.app/api/v1/";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
});

// Only run on job detail pages
if (window.location.pathname.includes("/viewjob")) {
  console.log("On job details page, looking for apply button...");

  // Wait for page to load and try to find apply button
  setTimeout(() => {
    const applyButton =
      document.querySelector("#indeedApplyButton") ||
      document.querySelector(".jobsearch-IndeedApplyButton-newDesign");
    // document.querySelector('[id*="applyButton"]') ||
    // document.querySelector('button[aria-label*="Apply"]') ||
    // [...document.querySelectorAll("button")].find((btn) =>
    //   btn.textContent.toLowerCase().includes("apply")
    // );

    if (applyButton && applyButton?.textContent !== "Applied") {
      console.log("Found apply button, clicking....");
      // chrome.storage.local.set({ autoApplyInProgress: true });
      applyButton.click();
    } else {
      console.log("No apply button found, moving to next job");
      moveToNextJob();
    }
  }, 2000);
}

const formContainer =
  document.querySelector("#ia-container") ||
  document.querySelector(".ia-ApplicationForm") ||
  document.querySelector('[class*="jobsearch-Apply"]');

const isVerificationPage = document.body.innerText.includes("Verification");

function handleApplicationForm() {
  console.log("Looking for application form...");

  setTimeout(() => {
    if (!formContainer && !isVerificationPage) {
      console.log("Application form not found, moving to next job");
      chrome.runtime.sendMessage({ action: "applicationCompleted" });
      return;
    }

    console.log("Processing application form...");

    // Get form text to determine the what type of form it is
    const formText = formContainer.innerText || "";

    switch (true) {
      case formText.includes("Add your contact information"):
        fillContactForm();

        break;
      case formText.includes("Add a resume for the employer"):
        handleResumeUpload();
        break;

      case formText.includes("Select a past job"):
        pastJobSelection();
        break;

      case formText.includes("Answer these questions from the employer"):
        fillEmployerQuestions();

        // moveToNextJob();

        //yaha pr kuch nhi krna bs ye case kgy rehne dena
        break;

      case formText.includes("Please review your application"):
        finalSubmit();
        break;
      case formText.includes("Your application has been submitted"):
        moveToNextJob();
        break;
      case formText.includes("You've applied to this job"):
        moveToNextJob();
        break;

      case formText.includes(
        "It looks like you don’t meet these employer requirements"
      ):
        moveToNextJob();
        break;

      case isVerificationPage:
        setTimeout(() => {
          handleApplicationForm();
          console.log("Verification page detected, retrying...");
        }, 1000);
        break;

      default:
        console.log("Default case: Filling application form...");
        break;
    }
  }, 3000);
}

const fillContactForm = () => {
  console.log("Filling contact form...");

  // Fill form fields
  const inputs = formContainer.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    if (input.type === "text" || input.type === "email") {
      // You can customize these values
      const defaultValues = {
        name: "Your Name",
        email: "your.email@example.com",
        phone: "1234567890",
        // Add more field mappings as needed
      };

      // Try to determine field type from labels/placeholders
      const fieldName = input.name.toLowerCase();
      const placeholder = (input.placeholder || "").toLowerCase();

      if (fieldName.includes("name") || placeholder.includes("name")) {
        input.value = defaultValues.name;
      } else if (fieldName.includes("email") || placeholder.includes("email")) {
        input.value = defaultValues.email;
      } else if (fieldName.includes("phone") || placeholder.includes("phone")) {
        input.value = defaultValues.phone;
      }

      // Trigger input event to activate any listeners
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  const buttons = [...formContainer?.querySelectorAll("button")];
  const continueButton = buttons?.find((btn) => {
    const text = btn?.textContent.trim().toLowerCase();
    const style = getComputedStyle(btn);
    return (
      (text.includes("continue") ||
        text.includes("submit") ||
        text.includes("apply")) &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  });

  if (continueButton) {
    console.log("Found continue button, clicking...");
    continueButton.click();
  }

  handleApplicationForm();
};

const handleResumeUpload = () => {
  console.log("Handling resume upload...");
  document.querySelector('input[value="INDEED_RESUME"]').click();

  const buttons = [...formContainer.querySelectorAll("button")];
  const continueButton = buttons.find((btn) => {
    const text = btn.textContent.trim().toLowerCase();
    const style = getComputedStyle(btn);
    return (
      (text.includes("continue") ||
        text.includes("submit") ||
        text.includes("apply")) &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  });

  if (continueButton) {
    console.log("Found continue button, clicking...");
    continueButton.click();
  }

  handleApplicationForm();
};

const pastJobSelection = () => {
  console.log("Past job selection...");

  const buttons = [...formContainer.querySelectorAll("button")];
  const continueButton = buttons.find((btn) => {
    const text = btn.textContent.trim().toLowerCase();
    const style = getComputedStyle(btn);
    return (
      (text.includes("continue") ||
        text.includes("submit") ||
        text.includes("apply")) &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  });

  if (continueButton) {
    console.log("Found continue button, clicking...");
    continueButton.click();
  }

  handleApplicationForm();
};

const fillEmployerQuestions = async () => {
  console.log("Filling employer questions...");

  const questionItems = document.querySelectorAll(".ia-Questions-item");

  const questionArray = Array.from(questionItems).map((item) => {
    const questionText =
      item.querySelector("label, legend")?.textContent?.trim() ||
      item.textContent?.trim();

    const input = item.querySelector("input");
    const textarea = item.querySelector("textarea");
    const select = item.querySelector("select");
    const radios = item.querySelectorAll('input[type="radio"]');
    const checkboxes = item.querySelectorAll('input[type="checkbox"]');

    let type = "text";
    let options = null;

    if (textarea) {
      type = "textarea";
    } else if (select) {
      type = "select";
      options = Array.from(select.options)
        .map((opt) => opt.textContent?.trim() || "")
        .filter(Boolean);
    } else if (radios.length > 0) {
      type = "radio";
      options = Array.from(radios)
        .map((radio) => radio.closest("label")?.textContent?.trim() || "")
        .filter(Boolean);
    } else if (checkboxes.length > 0) {
      type = "checkbox";
      options = Array.from(checkboxes)
        .map((cb) => cb.closest("label")?.textContent?.trim() || "")
        .filter(Boolean);
    }

    return {
      question: questionText,
      // type,
      options,
    };
  });

  console.log("📤 Sending to server:", questionArray);

  try {
    // const response = await fetch(url + "cv/get-answer", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization:
    //       "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDI2OWFhZmQtMzQyNi00ZmFjLTk0NGYtYmUzZDUzMmY4ZDI1IiwiaWF0IjoxNzQ1MzkzMTc0LCJleHAiOjE3NDU0MjkxNzR9.IjBlHIbr5kWPit82VWkJPyEMQte8cP79tHASVUqA2WM",
    //   },
    //   body: JSON.stringify({ questions: questionArray }),
    // });
    // if (!response.ok) {
    //   throw new Error(`HTTP error! Status: ${response.status}`);
    // }
    // const result = await response.json();
    const result = {
      status: 201,
      message: "Your Answer",
      response: {
        details: [
          {
            question:
              "Please list 2-3 dates and time ranges that you could do an interview.",
            answer: "---",
          },
          {
            question:
              "What is the highest level of education you have completed?*",
            // answer: "MEng Computer Science",
            answer: "High School",
          },
          {
            question: "Do you speak English And Urdu?*",
            answer: "No",
          },
          {
            question:
              "How many years of Graphic Designing experience do you have?*",
            answer: "0",
          },
          {
            question: "Are you located in Karachi?*",
            answer: "No",
          },
        ],
      },
    };
    console.log("✅ API response:", result);

    questionItems.forEach((item) => {
      const questionText =
        item.querySelector("label, legend")?.textContent?.trim() ||
        item.textContent?.trim();
      const match = result?.response?.details?.find((r) =>
        questionText?.includes(r.question)
      );

      if (!match) return;

      const answer = match.answer;

      const inputElement = item.querySelector(
        'input:not([type="radio"]):not([type="checkbox"])'
      );
      const textareaElement = item.querySelector("textarea");
      const radioElements = item.querySelectorAll('input[type="radio"]');
      const checkboxElements = item.querySelectorAll('input[type="checkbox"]');
      const selectElement = item.querySelector("select");

      // Text or number input
      if (inputElement) {
        inputElement.value = answer;
        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Textarea
      else if (textareaElement) {
        textareaElement.value = answer;
        textareaElement.dispatchEvent(new Event("input", { bubbles: true }));
      }

      // Radio buttons
      else if (radioElements.length > 0 && typeof answer === "string") {
        radioElements.forEach((radio) => {
          const label = radio.closest("label")?.textContent?.trim();
          if (label && label.toLowerCase() === answer.toLowerCase()) {
            radio.checked = true;
            radio.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      }

      // Checkboxes (if answer is array or boolean)
      else if (checkboxElements.length > 0) {
        if (Array.isArray(answer)) {
          checkboxElements.forEach((cb) => {
            const label = cb.closest("label")?.textContent?.trim();
            if (label && answer.includes(label)) {
              cb.checked = true;
              cb.dispatchEvent(new Event("change", { bubbles: true }));
            }
          });
        } else if (typeof answer === "boolean") {
          const yesNoLabels = ["yes", "no"];
          checkboxElements.forEach((cb) => {
            const label = cb
              .closest("label")
              ?.textContent?.trim()
              .toLowerCase();
            if ((answer && label === "yes") || (!answer && label === "no")) {
              cb.checked = true;
              cb.dispatchEvent(new Event("change", { bubbles: true }));
            }
          });
        }
      }

      // Dropdown / select
      else if (selectElement && typeof answer === "string") {
        Array.from(selectElement.options).forEach((opt) => {
          if (opt.textContent?.trim().toLowerCase() === answer.toLowerCase()) {
            opt.selected = true;
            selectElement.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      }
    });

    const buttons = [...(formContainer?.querySelectorAll("button") ?? [])];
    const continueButton = buttons?.find((btn) => {
      const text = btn?.textContent.trim().toLowerCase();
      const style = getComputedStyle(btn);
      return (
        (text.includes("continue") ||
          text.includes("submit") ||
          text.includes("apply")) &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    });

    if (continueButton) {
      console.log("Found continue button, clicking...");
      continueButton.click();
    }

    // handleApplicationForm();
  } catch (error) {
    console.error("❌ Error submitting questions:", error);
  }
};

// const fillEmployerQuestions = async () => {
//   console.log("Filling employer questions...");

//   const questionItems = document.querySelectorAll(".ia-Questions-item");

//   const questionArray = Array.from(questionItems).map((q) =>
//     q.textContent?.trim()
//   );

//   try {
//     const response = await fetch(url + "cv/get-answer", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZDI2OWFhZmQtMzQyNi00ZmFjLTk0NGYtYmUzZDUzMmY4ZDI1IiwiaWF0IjoxNzQ1MzkzMTc0LCJleHAiOjE3NDU0MjkxNzR9.IjBlHIbr5kWPit82VWkJPyEMQte8cP79tHASVUqA2WM`,
//       },
//       body: JSON.stringify({ question: questionArray }),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log("✅ API response:", result);

//     //dummy Response
//     // let response = [
//     //   {
//     //     question:
//     //       "Please list 2-3 dates and time ranges that you could do an interview.",
//     //     answer: "---",
//     //   },
//     //   {
//     //     question: "How many years of Graphic Design experience do you have?*",
//     //     answer: "0",
//     //   },
//     //   {
//     //     question:
//     //       "What is the highest level of education you have completed?*Select an optionNoneMiddle SchoolHigh SchoolIntermediateBachelor'sMaster'sDoctorate",
//     //     answer: "MEng Computer Science",
//     //   },
//     //   {
//     //     question:
//     //       'This is an employer-written question. You can report inappropriate questions to Indeed through the "Report Job" link at the bottom of the job description.  "Have you ever done design work for skin care?"',
//     //     answer: "---",
//     //   },
//     //   {
//     //     question: "Are you located in Karachi?*YesNo",
//     //     answer: true,
//     //   },
//     // ];

//     questionItems.forEach((item) => {
//       const questionText = item.textContent?.trim();
//       const match = response.find((r) => questionText.includes(r.question));

//       if (!match) return;

//       const inputElement = item.querySelector('input:not([type="radio"])');
//       const textareaElement = item.querySelector("textarea");
//       const radioElements = item.querySelectorAll('input[type="radio"]');

//       if (inputElement) {
//         inputElement.value = match.answer;
//         inputElement.dispatchEvent(new Event("input", { bubbles: true }));
//       } else if (textareaElement) {
//         textareaElement.value = match.answer;
//         textareaElement.dispatchEvent(new Event("input", { bubbles: true }));
//       } else if (radioElements.length > 0) {
//         radioElements.forEach((radio) => {
//           const label = radio.closest("label")?.textContent?.trim();
//           if (match.question?.includes(label)) {
//             radio.checked = true;
//             radio.dispatchEvent(new Event("change", { bubbles: true }));
//           }
//         });
//       }
//     });

//     // if (continueButton) {
//     //   console.log("Found continue button, clicking...");
//     //   continueButton.click();
//     // }

//     // handleApplicationForm();
//   } catch (error) {
//     console.error("❌ Error submitting questions:", error);
//   }
// };

const finalSubmit = () => {
  console.log("Application review step reached...");

  // const buttons = [...(formContainer?.querySelectorAll("button") ?? [])];
  // const continueButton = buttons?.find((btn) => {
  //   const text = btn?.textContent.trim().toLowerCase();
  //   const style = getComputedStyle(btn);
  //   return (
  //     (text.includes("continue") ||
  //       text.includes("submit") ||
  //       text.includes("apply")) &&
  //     style.display !== "none" &&
  //     style.visibility !== "hidden"
  //   );
  // });

  // continueButton?.addEventListener("click", () => {
  //   handleApplicationForm();
  // });
};

const moveToNextJob = () => {
  setTimeout(() => {
    console.log("Moving to next job...");
    chrome.runtime.sendMessage({ action: "applicationCompleted" });
  }, 2000);
};

// Helper function to find elements by text content
Element.prototype.contains = function (text) {
  return this.textContent.includes(text);
};

// Add mutation observer to handle dynamic content
const observer = new MutationObserver((mutations) => {
  // for (const mutation of mutations) {
  //   if (mutation.addedNodes.length) {
  const formContainer = document?.querySelector("#ia-container");

  if (formContainer) {
    observer.disconnect();
    console.log("chala mutation");

    setTimeout(handleApplicationForm, 1000);
  }
  // chrome.storage.local.get("autoApplyInProgress", (data) => {
  //   const isAutomation = data.autoApplyInProgress;
  //   console.log(
  //     "🚀 ~ chrome.storage.local.get ~ isAutomation:",
  //     isAutomation
  //   );

  //   if (formContainer) {
  //     observer.disconnect();
  //     console.log("chala mutation");

  //     setTimeout(handleApplicationForm, 1000);
  //   }
  // });
  //   }
  // }
});

observer.observe(document.body, {
  childList: true,
  subtree: false,
});
