console.log("Auto Apply Script Running...");
// let url = "https://pleasant-mole-nominally.ngrok-free.app/api/v1/";
let url = "https://api.jobbeey.com/api/v1/";

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

    chrome.storage.local.get(["shouldStartAutoApply"], (result) => {
      if (result.shouldStartAutoApply) {
        chrome.storage.local.set({
          shouldStartAutoApplySecond: true,
          shouldStartAutoApply: false,
        });
        if (applyButton && applyButton?.textContent !== "Applied") {
          console.log("Found apply button, clicking....");
          applyButton.click();
        } else {
          moveToNextJob();
        }
      } else {
        console.log(
          "Not running apply btn clicked because it wasn't triggered from search page."
        );
      }
    });
  }, 1000);
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
  }, 2000);
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
      options,
    };
  });

  console.log("📤 Sending to server:", questionArray);

  try {
    const response = await fetch(url + "cv/get-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWYwNmFjZDgtOWUxOS00Y2JmLTk3YWYtOGViMzFmMzg4ODlhIiwiaWF0IjoxNzQ1OTMwMDg5LCJleHAiOjE3NDY1MzQ4ODl9.EIxLeakH2iMhi2PF9-K9nkIkMUrpjNy_fGyd-vY_GFo",
      },
      body: JSON.stringify({ questions: questionArray }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();

    console.log("✅ API result:", result);

    questionItems.forEach((item) => {
      const questionText =
        item.querySelector("label, legend")?.textContent?.trim() ||
        item.textContent?.trim();
      const match = result?.response?.details?.questions?.find((r) =>
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
        console.log("🚀 ~ questionItems.forEach ~ answer:", answer);
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
          console.log("object");
          if (label && label.toLowerCase() === answer.toLowerCase()) {
            // radio.checked = true;
            // radio.dispatchEvent(new Event("change", { bubbles: true }));
            setCheckedRadio(radio);
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
            // if (opt.textContent?.trim().toLowerCase() === "pakistan") {
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

    handleApplicationForm();
  } catch (error) {
    console.error("❌ Error submitting questions:", error);
  }
};

const finalSubmit = () => {
  console.log("observer start");
  observer.observe(document.body, {
    childList: true,
    subtree: false,
  });
  console.log("Application review step reached...");
  const captchaWrapper = document.querySelector("#captcha-wrapper");
  const textNode = document.createTextNode(
    "Fill captcha and click on Submit (Jobbey)"
  );
  captchaWrapper.appendChild(textNode);
  if (captchaWrapper) {
    captchaWrapper.scrollIntoView({
      behavior: "smooth",
    });
  }

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
  }, 1000);
};

//for set value of radio
function setCheckedRadio(radio) {
  const prototype = Object.getPrototypeOf(radio);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "checked");
  descriptor.set.call(radio, true);

  radio.dispatchEvent(new Event("click", { bubbles: true }));
  radio.dispatchEvent(new Event("change", { bubbles: true }));
}

const updateStatus = async (status = "") => {
  try {
    await fetch("https://api.jobbeey.com/api/v1/applications-log", {
      method: "POST",
      body: JSON.stringify({
        status: status,
        application_url: window.location.href,
        platform: "INDEED",
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

// Helper function to find elements by text content
Element.prototype.contains = function (text) {
  return this.textContent.includes(text);
};

// Add mutation observer to handle dynamic content
const observer = new MutationObserver((mutations) => {
  const formContainer = document?.querySelector("#ia-container");

  if (formContainer) {
    observer.disconnect();
    setTimeout(handleApplicationForm, 1000);
    console.log("mutation run");
    chrome.storage.local.set({ shouldStartAutoApplySecond: false });
  }
});

chrome.storage.local.get(
  ["shouldStartAutoApplySecond", "shouldStartAutoApply"],
  (result) => {
    if (!result.shouldStartAutoApply && result.shouldStartAutoApplySecond) {
      chrome.storage.local.set({ shouldStartAutoApplySecond: false });

      observer.observe(document.body, {
        childList: true,
        subtree: false,
      });
    } else {
      console.log("Observer not started: Auto-apply flag is false.");
    }
  }
);

chrome.storage.local.get(["access_token"], (result) => {
  console.log("access_token", result);
});
