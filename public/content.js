console.log("global content");

window.addEventListener("message", function (event) {
  if (event.source !== window) return;
  // if (
  //   event.data?.source !== "DASHBOARD_LOGIN" ||
  //   event.data?.source !== "DASHBOARD_LOGOUT"
  // ) {
  //   return;
  // }

  if (event.data.type === "LOGIN_SUCCESS") {
    chrome.storage.local.set({ accessToken: event.data.token }, () => {
      console.log("✅ Token saved.");
    });
  }

  if (event.data.type === "LOGOUT") {
    console.log("🚀 ~ event.data.types:", event.data.type);
    chrome.storage.local.remove("accessToken", () => {
      console.log("🧹 Token cleared. User logged out from extension.");
    });
  }
});
