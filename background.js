// This script runs in the background and listens for requests to the Kalvium API. 
console.log("Background script running");

let currentTabUrl = "";

const logToken = (data) => {
  for (let header of data.requestHeaders) {
    if (header.name.toLowerCase() === "authorization") {
      chrome.storage.sync.set({
        token: header,
        currentTabUrl: currentTabUrl,
      });
      return;
    }
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    currentTabUrl = tab.url;
  }
});

chrome.webRequest.onSendHeaders.addListener(
  (data) => {
    logToken(data);
  },
  {
    urls: [
      "https://signal-api.kalvium.community/*",
      "https://assessment-api.kalvium.community/api/assessments/*",
    ],
  },
  ["requestHeaders"]
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "bypassFullscreen") {
    (async () => {
      try {
        const currentTab = sender.tab;

        if (!currentTab || !currentTab.id) {
          sendResponse({ success: false, error: "No tab found" });
          return;
        }

        const allTabs = await chrome.tabs.query({ currentWindow: true });
        let targetTab = allTabs.find((tab) => tab.id !== currentTab.id);

        if (!targetTab) {
          targetTab = await chrome.tabs.create({
            url: "about:blank",
            active: true,
          });
        } else {
          await chrome.tabs.update(targetTab.id, { active: true });
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));

        await chrome.tabs.update(currentTab.id, { active: true });

        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }
});
