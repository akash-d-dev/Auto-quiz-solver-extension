console.log('home script running');

let autoStart = '0';
let aiModel = 'gemini-2.0-flash-lite';

document.addEventListener('DOMContentLoaded', function () {
  const autoStartElement = document.getElementById('auto-start');
  const aiModelElement = document.getElementById('ai-model');
  const delayElement = document.getElementById('delay');

  chrome.storage.sync.get('autoStart', function (data) {
    autoStart = data.autoStart || '0';
    autoStartElement.value = autoStart;
  });
  autoStartElement.addEventListener('change', function () {
    autoStart = autoStartElement.value;
    chrome.storage.sync.set({ autoStart: autoStart });
  });

  chrome.storage.sync.get('aiModel', function (data) {
    let aiModel = data.aiModel || 'gemini-flash-latest';
    aiModelElement.value = aiModel;
  });
  aiModelElement.addEventListener('change', function () {
    let aiModel = aiModelElement.value;
    chrome.storage.sync.set({ aiModel: aiModel });
  });

  chrome.storage.sync.get('delay', function (data) {
    let delay = data.delay || 8;
    delayElement.value = delay;
  });
  delayElement.addEventListener('change', function () {
    let delay = Number(delayElement.value);
    if (delay < 1 || delay > 100) delay = 8;
    delayElement.value = delay;
    chrome.storage.sync.set({ delay: delay });
  });
});
