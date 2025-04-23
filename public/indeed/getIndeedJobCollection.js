export const getIndeedJobCollection = async () => {
  console.log("getIndeedJobCollection");
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes("indeed.com")) {
    // Get all job links from the current page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: collectJobLinks,
    });

    const jobLinks = results[0].result;
    console.log(`Found ${jobLinks.length} jobs to apply to`);

    if (jobLinks.length > 0) {
      console.log("🚀 ~ document.getElementById ~ jobLinks:", jobLinks);
      // Store links in background script and start the process
      chrome.runtime.sendMessage({
        action: "startAutoApply",
        jobLinks: jobLinks,
      });
      document.getElementById(
        "status"
      ).textContent = `Starting to apply to ${jobLinks.length} jobs...`;
    } else {
      document.getElementById("status").textContent =
        "No job links found. Make sure you're on an Indeed search results page.";
    }
  } else {
    document.getElementById("status").textContent =
      "Please navigate to Indeed jobs search page first";
  }
};

export function collectJobLinks() {
  console.log("Collecting Job Application");
  const jobCards = document.querySelectorAll('[class*="job_seen_beacon"]');
  return Array.from(jobCards)
    .map((card) => {
      // const anchor = card.querySelector('a[id^="job_"]');
      const anchor =
        card.querySelector('a[href*="/rc/clk"]') ||
        card.querySelector('a[href*="/pagead/"]') ||
        card.querySelector('a[id^="job_"]');

      return anchor ? anchor.href : null;
    })
    .filter((link) => link);
}
