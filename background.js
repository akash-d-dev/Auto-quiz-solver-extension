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
