let ansData = [null, null, null, null, null];
let loading = false;
let currentQuestion = 0;
let G_API_KEY = localStorage.getItem("G_API_KEY") || "";
let delay = 8;
let autoStart = "0";
let GEMINI_MODEL = "gemini-1.0-pro";

function getAutoStart() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("autoStart", function (data) {
      const autoStart = data.autoStart || "0";
      resolve(autoStart);
    });
  });
}

function getGeminiModel() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("geminiModel", function (data) {
      const geminiModel = data.geminiModel || "gemini-1.0-pro";
      resolve(geminiModel);
    });
  });
}

function getWaitFor() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("delay", function (data) {
      const delay = data.delay || 8;
      resolve(delay);
    });
  });
}

function startSolvingQuiz() {
  if (currentQuestion === 5) {
    currentQuestion = 0;
    console.log("All questions answered");
    return;
  }
  correctAnswer = ansData[currentQuestion];
  const optionBtn =
    document.getElementsByClassName("css-1njvaw6")[correctAnswer];
  optionBtn.click();
  currentQuestion++;
  setTimeout(() => {
    const submitBtn = document.getElementsByClassName(
      "chakra-button css-1mb6l07"
    )[0];
    submitBtn.click();
    setTimeout(() => {
      startSolvingQuiz();
    }, 500);
  }, 1000);
}

//Deal with warning popup
function handlePopup() {
  const closeBtn = document.getElementsByClassName(
    "chakra-button css-1l9ol99"
  )[0];
  if (closeBtn) closeBtn.click();
  setTimeout(() => {
    main();
  }, 1500);
}

function openTabWithUrl(url) {
  chrome.tabs.create({ url: url });
}

async function solveQuiz(qna) {
  console.log("Starting to get answers from gemini");
  const background = document.getElementsByClassName("css-1t3n037")[0];
  try {
    console.log("Getting...");
    const response = await fetch("https://k-quiz-solver-api.onrender.com", {
      // const response = await fetch("http://localhost:8000/", {
      method: "POST",
      body: JSON.stringify(qna),
      headers: {
        "Content-Type": "application/json",
        key: G_API_KEY,
        model: GEMINI_MODEL,
      },
    });

    if (response.ok) {
      console.log("Got it...");
      try {
        ansArray = await response.json();
      } catch (error) {
        throw new Error("Gemini API failed to fetch answers");
      }
      if (ansArray.length !== 5) throw new Error("Failed to fetch all answers");
      ansArray.map((ans) => {
        if (ans === -1) {
          throw new Error("Failed to fetch all answers");
        }
      });
      background.style.backgroundColor = "#ecffec";
      console.log(ansArray);
      return ansArray;
    } else {
      throw new Error("Failed to fetch quiz");
    }
  } catch (error) {
    background.style.backgroundColor = "#ff605f";
    console.error(error);
    console.error("Sorry we failed");
    throw error;
  }
}

async function main(qna = null, retryBtn = false) {
  const { token, currentTabUrl } = await new Promise((resolve) => {
    chrome.storage.sync.get(["token", "currentTabUrl"], (data) => {
      resolve(data);
    });
  });

  const regex = /https:\/\/kalvium\.community\/quiz\/[^\/]+$/;

  if (regex.test(currentTabUrl)) {
    let quizUrl = `https://assessment-api.kalvium.community/api/assessments/${currentTabUrl
      .split("/")
      .pop()}/attempts`;
    let userToken = token.value;

    const background = document.getElementsByClassName("css-1t3n037")[0];
    const qNum = document.getElementsByClassName("chakra-text css-itr5sx")[0];

    background.style.backgroundColor = "#fbfac0";

    try {
      if (!qna) {
        const response = await fetch(quizUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: userToken,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }

        const data = await response.json();
        console.log(data.attempt_info);

        qna = data.attempt_info.map((item, idx) => ({
          question: item.question.content,
          question_number: idx,
          options: item.question.choices.map((choice, i) => ({
            content: choice.content,
            option_number: i,
          })),
        }));
      }

      ansData = await solveQuiz(qna);
      startSolvingQuiz();
    } catch (error) {
      background.style.backgroundColor = "#ff605f";
      if (!retryBtn) {
        const button = document.createElement("button");
        button.className = "chakra-button css-fgqgi2";
        button.textContent = "Retry";
        button.style.marginLeft = "16px";
        button.style.backgroundColor = "green";
        button.addEventListener("click", () => {
          main(qna, true);
        });
        qNum.appendChild(button);
      }
      console.error(error);
    }
  } else {
    console.log("This is not a quiz page");
  }
}

// Start main function
function start() {
  console.log("Clicked start button");
  let startBtn = document.getElementsByClassName("chakra-button css-fgqgi2")[0];
  if (!startBtn) return;
  startBtn.click();
  setTimeout(() => {
    handlePopup();
  }, 1500);
}

// Initialize the script
function init() {
  let launchBtn =
    document.getElementsByClassName("chakra-button css-1ou4qco")[0] ||
    document.getElementsByClassName("chakra-button css-1lzs6nh")[0];
  if (!launchBtn) return;
  launchBtn.addEventListener("click", () => {
    start();
  });
  launchBtn.style.backgroundColor = "green";
}

// Run the script
(async () => {
  autoStart = await getAutoStart();
  GEMINI_MODEL = await getGeminiModel();
  delay = await getWaitFor();
  if (G_API_KEY === "" || G_API_KEY === "null") {
    console.log(G_API_KEY);
    G_API_KEY = String(prompt("Please enter your Google API Key"));
    localStorage.setItem("G_API_KEY", G_API_KEY);
    console.log(G_API_KEY);
    autoStart === "1"
      ? setTimeout(() => {
          start();
        }, delay * 1000)
      : setTimeout(() => {
          init();
        }, delay * 1000);
  } else {
    autoStart === "1"
      ? setTimeout(() => {
          start();
        }, delay * 1000)
      : setTimeout(() => {
          init();
        }, delay * 1000);
  }
  console.log("Foreground script running");
  console.log("Dealy: ", delay);
  console.log("Auto Start: ", autoStart === "1" ? "Yes" : "No");
  console.log("Gemini Model: ", GEMINI_MODEL);
})();
