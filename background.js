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
  if (request.action === 'bypassFullscreen') {
    console.log('🔓 Background: Received fullscreen bypass request');
    
    (async () => {
      try {
        const currentTab = sender.tab;
        
        if (!currentTab || !currentTab.id) {
          console.error('❌ Background: No tab found');
          sendResponse({ success: false, error: 'No tab found' });
          return;
        }

        console.log(`📍 Background: Current quiz tab ID: ${currentTab.id}`);
        console.log('🔍 Background: Finding another tab to switch to...');
        
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        let targetTab = allTabs.find(tab => tab.id !== currentTab.id);
        
        if (!targetTab) {
          console.log('📱 Background: No other tabs found, creating temporary tab...');
          targetTab = await chrome.tabs.create({ 
            url: 'about:blank', 
            active: true 
          });
        } else {
          console.log(`✅ Background: Found existing tab ${targetTab.id}, switching to it...`);
          await chrome.tabs.update(targetTab.id, { active: true });
        }
        
        console.log('⏱️  Background: Waiting 1.5 seconds for quiz to fully load...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('🔙 Background: Returning to quiz tab...');
        await chrome.tabs.update(currentTab.id, { active: true });
        
        console.log('✅ Background: Fullscreen bypass complete!');
        sendResponse({ success: true });
      } catch (error) {
        console.error('❌ Background: Fullscreen bypass error:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    
    return true;
  }
});