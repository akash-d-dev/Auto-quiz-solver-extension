console.log("home script running");

let autoStart = "0";

document.addEventListener("DOMContentLoaded", function () {
  const autoStartElement = document.getElementById("auto-start");

  chrome.storage.sync.get("autoStart", function (data) {
    autoStart = data.autoStart || "0";
    autoStartElement.value = autoStart;
  });

  autoStartElement.addEventListener("change", function () {
    autoStart = autoStartElement.value;

    chrome.storage.sync.set({ autoStart: autoStart });
  });
});
