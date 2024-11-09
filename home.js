console.log("home script running");

let autoStart = "0";

document.addEventListener("DOMContentLoaded", function () {
  const autoStartElement = document.getElementById("auto-start");
  const geminiModelElement = document.getElementById("gemini-model");
  const delayElement = document.getElementById("delay");
  const kalviApiTokenElement = document.getElementById("api-token");
  const saveBtn = document.getElementById("save-token");

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

  chrome.storage.sync.get("kalviApiToken", function (data) {
    const kalviApiToken = data.kalviApiToken || "";
    kalviApiTokenElement.value = kalviApiToken;
  });

  saveBtn.addEventListener("click", function () {
    let kalviApiToken = kalviApiTokenElement.value;
    if (kalviApiToken.length < 1) kalviApiTokenElement.value = 0;
    kalviApiToken = kalviApiTokenElement.value;
    chrome.storage.sync.set({ kalviApiToken: kalviApiToken });
  });

  // kalviApiTokenElement.addEventListener("change", function () {
  //   let kalviApiToken = kalviApiTokenElement.value;
  //   if (kalviApiToken.length < 1) kalviApiTokenElement.value = null;
  //   kalviApiToken = kalviApiTokenElement.value;
  //   chrome.storage.sync.set({ kalviApiToken: kalviApiToken });
  // });
});
