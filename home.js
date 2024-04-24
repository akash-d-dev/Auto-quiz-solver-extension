console.log("home script running");

let autoStart = "0";

document.addEventListener("DOMContentLoaded", function () {
  const autoStartElement = document.getElementById("auto-start");
  const geminiModelElement = document.getElementById("gemini-model");
  const delayElement = document.getElementById("delay");

  chrome.storage.sync.get("autoStart", function (data) {
    autoStart = data.autoStart || "0";
    autoStartElement.value = autoStart;
  });

  autoStartElement.addEventListener("change", function () {
    autoStart = autoStartElement.value;

    chrome.storage.sync.set({ autoStart: autoStart });
  });

  chrome.storage.sync.get("geminiModel", function (data) {
    const geminiModel = data.geminiModel || "gemini-1.0-pro";
    geminiModelElement.value = geminiModel;
  });

  geminiModelElement.addEventListener("change", function () {
    const geminiModel = geminiModelElement.value;

    chrome.storage.sync.set({ geminiModel: geminiModel });
  });

  chrome.storage.sync.get("delay", function (data) {
    const delay = data.delay || 8;
    delayElement.value = delay;
  });

  delayElement.addEventListener("change", function () {
    let delay = delayElement.value;
    if (delay < 0 || delay > 100) delayElement.value = 8;
    delay = delayElement.value;
    chrome.storage.sync.set({ delay: delay });
  });
});
