let ansData = [null, null, null, null, null];
// let ansData = [1,1,1,1,1];
let loading = false;
let currentQuestion = 0;
let G_API_KEY = localStorage.getItem("G_API_KEY") || "";

function startSolvingQuiz() {
  if (currentQuestion === 5) {
    currentQuestion = 0;
    console.log("All questions answered");
    return;
  }
  correctAnswer = ansData[currentQuestion];
  //option button
  document.getElementsByClassName("css-1njvaw6")[correctAnswer].click();
  currentQuestion++;
  setTimeout(() => {
    //submit button
    document.getElementsByClassName("chakra-button css-1mb6l07")[0].click();
    setTimeout(() => {
      startSolvingQuiz();
    }, 500);
  }, 1000);
}

(async () => {
  function start() {
    setTimeout(() => {
      console.log("Clicked start button");
      var startBtn = document.querySelectorAll("button")[4];
      startBtn.click();
      setTimeout(() => {
        if (!main()) return;
        setTimeout(() => {
          if (ansData[0] !== null) startSolvingQuiz();
          else {
            setTimeout(() => {
              startSolvingQuiz();
            }, 5000);
          }
        }, 2000);
      }, 1500);
    }, 6000);
  }
  if (G_API_KEY === "") {
    console.log(G_API_KEY);
    G_API_KEY = String(prompt("Please enter your Google API Key"));
    localStorage.setItem("G_API_KEY", G_API_KEY);
    console.log(G_API_KEY);
    start();
  } else {
    start();
  }
  console.log("Foreground script running");
})();

function openTabWithUrl(url) {
  chrome.tabs.create({ url: url });
}

async function solveQuiz(qna) {
  try {
    const response = await fetch("http://127.0.0.1:8000/", {
      method: "POST",
      body: JSON.stringify(qna),
      headers: {
        "Content-Type": "application/json",
        key: G_API_KEY,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const ansArray = JSON.parse(data);
      console.log(ansArray);
      return ansArray;
    } else {
      throw new Error("Failed to fetch quiz");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function main() {
  const getToken = new Promise((resolve) => {
    chrome.storage.sync.get(["token", "currentTabUrl"], (data) => {
      resolve(data);
    });
  });

  const { token, currentTabUrl } = await getToken;

  const regex = /https:\/\/kalvium\.community\/quiz\/[^\/]+$/;

  if (regex.test(currentTabUrl)) {
    ////////////////////////////////////////////
    ////////////////////////////////////////////
    // get token and make a request to the api
    let quizUrl = `https://assessment-api.kalvium.community/api/assessments/${currentTabUrl
      .split("/")
      .pop()}/attempts`;
    let userToken = token.value;

    ////////////////////////////////////////////
    ////////////////////////////////////////////

    // make a request to the api
    fetch(quizUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userToken,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch quiz");
        }
      })
      .then(async (data) => {
        console.log(data.attempt_info);
        const qna = data.attempt_info.map((item, idx) => ({
          q: item.question.content,
          q_id: item.question.id,
          question_number: idx,
          options: item.question.choices.map((choice, i) => ({
            content: choice.content,
            id: choice.id,
            option_number: i,
          })),
        }));
        ansData = await solveQuiz(qna);
      })
      .catch((error) => {
        console.error(error);
      });
    ////////////////////////////////////////////
    ////////////////////////////////////////////

    return true;
  } else {
    console.log("This is not a quiz page");
    return false;
  }
}
