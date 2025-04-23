console.log("Auto Apply Script Running...");

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
      console.log("Found apply button, clicking...");
      chrome.storage.local.set({ autoApplyInProgress: true });
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

const finalSubmit = () => {
  console.log("Application review step reached...");

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

  continueButton?.addEventListener("click", () => {
    handleApplicationForm();
  });
};

const moveToNextJob = () => {
  setTimeout(() => {
    console.log("Moving to next job...");
    chrome.runtime.sendMessage({ action: "applicationCompleted" });
  }, 2000);
  chrome.runtime.sendMessage({ action: "applicationCompleted" });
  chrome.runtime.sendMessage({ action: "applicationCompleted" });
  chrome.runtime.sendMessage({ action: "applicationCompleted" });
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
