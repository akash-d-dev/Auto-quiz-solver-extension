let ansData = [null, null, null, null, null];
let ansArray = [-1, -1, -1, -1, -1];
let loading = false;
let currentQuestion = 0;
let G_API_KEY = localStorage.getItem('G_API_KEY') || '';
let C_API_KEY = localStorage.getItem('C_API_KEY') || '';
let delay = 8;
let autoStart = '0';
let AI_MODEL = 'gemini-1.5-pro';
let modal = null;
let modalContent;
let toggleModalBtn;
let closeModelBtn;
let kalviApiToken = '';

console.log('https://jhat-pat-quiz-node-api.onrender.com');

function createModalWindow() {
  modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50px'; // Position at top right corner
  modal.style.right = '20px';
  modal.style.backgroundColor = '#fff';
  modal.style.padding = '20px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
  modal.style.width = 'auto'; // Adjust width as needed
  modal.style.height = 'auto'; // Adjust height as needed
  modal.style.maxHeight = '400px'; // Adjust height as needed
  modal.style.overflowY = 'auto';
  modal.style.zIndex = '10000';

  modalContent = document.createElement('div');
  modalContent.style.marginBottom = '10px';
  modalContent.id = 'modal-content';

  toggleModalBtn = document.createElement('button');
  toggleModalBtn.textContent = 'Click';
  toggleModalBtn.style.marginRight = '10px';
  toggleModalBtn.style.padding = '8px 16px';
  toggleModalBtn.style.backgroundColor = '#007bff';
  toggleModalBtn.style.color = '#fff';
  toggleModalBtn.style.border = 'none';
  toggleModalBtn.style.borderRadius = '4px';
  toggleModalBtn.style.cursor = 'pointer';

  closeModelBtn = document.createElement('button');
  closeModelBtn.textContent = 'Close';
  closeModelBtn.style.marginLeft = '10px';
  closeModelBtn.style.padding = '8px 16px';
  closeModelBtn.style.backgroundColor = 'red';
  closeModelBtn.style.color = '#fff';
  closeModelBtn.style.border = 'none';
  closeModelBtn.style.borderRadius = '4px';
  closeModelBtn.style.cursor = 'pointer';

  // Append elements
  modal.appendChild(modalContent);
  modal.appendChild(toggleModalBtn);
  modal.appendChild(closeModelBtn);
  document.body.appendChild(modal);

  // Close modal functionality
  toggleModalBtn.addEventListener('click', () => {
    if (modalContent.innerHTML !== '') {
      modalContent.innerHTML = '';
    } else {
      toggleModalWindow();
    }
  });

  closeModelBtn.addEventListener('click', () => {
    removeModalWindow();
  });
}

function toggleModalWindow() {
  // Show the modal and display ansArray
  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `<h3>Quiz Answers</h3><pre>${JSON.stringify(
    ansArray,
    null,
    2
  )}</pre>`;
}

function removeModalWindow() {
  modal.remove();
  modal = null;

  // modal.style.display = "none";
}

function getAutoStart() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('autoStart', function (data) {
      const autoStart = data.autoStart || '0';
      resolve(autoStart);
    });
  });
}

function getAiModel() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('aiModel', function (data) {
      const aiModel = data.aiModel || 'gemini-1.5-pro';
      resolve(aiModel);
    });
  });
}

function getWaitFor() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('delay', function (data) {
      const delay = data.delay || 8;
      resolve(delay);
    });
  });
}

function getKalviApiToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('kalviApiToken', function (data) {
      const kalviApiToken = data.kalviApiToken || '';
      resolve(kalviApiToken);
    });
  });
}

function startSolvingQuiz() {
  if (currentQuestion === 5) {
    currentQuestion = 0;
    console.log('All questions answered');
    // removeModalWindow();
    return;
  }
  correctAnswer = ansData[currentQuestion];
  const optionBtn =
    document.getElementsByClassName('css-1njvaw6')[correctAnswer];

  console.log(optionBtn);
  optionBtn.click();
  currentQuestion++;
  setTimeout(() => {
    const submitBtn = document.getElementsByClassName(
      'chakra-button css-1mb6l07'
    )[0];
    submitBtn.click();
    setTimeout(() => {
      startSolvingQuiz();
    }, 1500);
  }, 1000);
}

//Deal with warning popup
function handlePopup() {
  const closeBtn = document.getElementsByClassName(
    'chakra-button css-1l9ol99'
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
  console.log('Starting to get answers from gemini');
  const background = document.getElementsByClassName('css-1t3n037')[0];
  try {
    console.log('Getting...');
    const response = await fetch(
      'https://jhat-pat-quiz-node-api.onrender.com',
      {
        // const response = await fetch("http://localhost:8000/", {
        method: 'POST',
        body: JSON.stringify(qna),
        headers: {
          'Content-Type': 'application/json',
          key:
            AI_MODEL === 'gpt-3.5-turbo' || 'chatgpt-4o-latest'
              ? C_API_KEY
              : G_API_KEY,
          model: AI_MODEL,
          modelType:
            AI_MODEL === 'gpt-3.5-turbo' || 'chatgpt-4o-latest'
              ? 'gpt'
              : 'gemini',
        },
      }
    );
    console.log('Response: ', response);

    if (response.ok) {
      console.log('Got it...');
      try {
        ansArray = await response.json();
        console.log(ansArray);
        createModalWindow();
        // toggleModalWindow();
      } catch (error) {
        throw new Error('Gemini API failed to fetch answers');
      }
      if (ansArray.length !== 5) throw new Error('Failed to fetch all answers');
      ansArray.map((ans) => {
        if (ans === -1) {
          throw new Error('Failed to fetch all answers');
        }
      });
      background.style.backgroundColor = '#ecffec';
      return ansArray;
    } else {
      throw new Error('Failed to fetch quiz');
    }
  } catch (error) {
    background.style.backgroundColor = '#ff605f';
    console.error(error);
    console.error('Sorry we failed');
    throw error;
  }
}

async function main(qna = null, retryBtn = false) {
  if (retryBtn) {
    if (modal !== null) removeModalWindow();
  }
  const { token, currentTabUrl } = await new Promise((resolve) => {
    chrome.storage.sync.get(['token', 'currentTabUrl'], (data) => {
      resolve(data);
    });
  });

  // console.log("Token: ", token, "Token Value: ", token.value);

  const regex = /https:\/\/kalvium\.community\/quiz\/[^\/]+$/;

  if (regex.test(currentTabUrl)) {
    let quizUrl = `https://assessment-api.kalvium.community/api/assessments/${currentTabUrl
      .split('/')
      .pop()}/attempts`;

    let userToken = kalviApiToken ? kalviApiToken : token.value;
    console.log('##################################');
    console.log('Using curr token:'),
      console.log(token.value === kalviApiToken);
    console.log('##################################');
    console.log('##################################');
    console.log('kalviApiToken: ');
    console.log(kalviApiToken);
    console.log('##################################');
    console.log('##################################');
    console.log('Curr Token: ');
    console.log(token.value);
    console.log('##################################');

    const background = document.getElementsByClassName('css-1t3n037')[0];
    const qNum = document.getElementsByClassName('chakra-text css-itr5sx')[0];

    if (background) background.style.backgroundColor = '#fbfac0';

    try {
      if (!qna) {
        const response = await fetch(quizUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: userToken,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
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
      background.style.backgroundColor = '#ff605f';
      if (!retryBtn) {
        const button = document.createElement('button');
        button.className = 'chakra-button css-fgqgi2';
        button.textContent = 'Retry';
        button.style.marginLeft = '16px';
        button.style.backgroundColor = 'green';
        button.addEventListener('click', () => {
          main(qna, true);
        });
        qNum.appendChild(button);
      }
      console.error(error);
    }
  } else {
    console.log('This is not a quiz page');
  }
}

// Start main function
function start() {
  console.log('Clicked start button');
  let startBtn = document.getElementsByClassName('chakra-button css-fgqgi2')[0];
  if (!startBtn) return;
  startBtn.click();
  setTimeout(() => {
    handlePopup();
  }, 1500);
}

// Initialize the script
function init() {
  let launchBtn =
    document.getElementsByClassName('chakra-button css-1ou4qco')[0] ||
    document.getElementsByClassName('chakra-button css-1lzs6nh')[0];
  if (!launchBtn) return;
  launchBtn.addEventListener('click', () => {
    start();
  });
  launchBtn.style.backgroundColor = 'green';
}

// Run the script
(async () => {
  autoStart = await getAutoStart();
  AI_MODEL = await getAiModel();
  delay = await getWaitFor();
  kalviApiToken = await getKalviApiToken();
  console.log('Existing KalviApiToken: ', kalviApiToken ? true : false);
  if (C_API_KEY === '' || C_API_KEY === 'null') {
    console.log(C_API_KEY);
    C_API_KEY = String(prompt('Please enter your OpenAi API Key'));
    localStorage.setItem('C_API_KEY', C_API_KEY);
    console.log(C_API_KEY);
    autoStart === '1'
      ? setTimeout(() => {
          start();
        }, delay * 1000)
      : setTimeout(() => {
          init();
        }, delay * 1000);
  }
  if (G_API_KEY === '' || G_API_KEY === 'null') {
    console.log(G_API_KEY);
    G_API_KEY = String(prompt('Please enter your Google API Key'));
    localStorage.setItem('G_API_KEY', G_API_KEY);
    console.log(G_API_KEY);
    autoStart === '1'
      ? setTimeout(() => {
          start();
        }, delay * 1000)
      : setTimeout(() => {
          init();
        }, delay * 1000);
  }

  autoStart === '1'
    ? setTimeout(() => {
        start();
      }, delay * 1000)
    : setTimeout(() => {
        init();
      }, delay * 1000);
  console.log('Foreground script running');
  console.log('Dealy: ', delay);
  console.log('Auto Start: ', autoStart === '1' ? 'Yes' : 'No');
  console.log('AI Model: ', AI_MODEL);
})();
