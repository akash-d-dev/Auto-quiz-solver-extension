class QuizSolver {
  static apiUrl = 'https://k-quiz-solver-api.onrender.com';
  // static apiUrl = 'http://localhost:8000';

  constructor() {
    this.ansArray = [-1, -1, -1, -1, -1];
    this.ansData = [null, null, null, null, null];
    this.currentQuestion = 0;
    this.G_API_KEY = localStorage.getItem('G_API_KEY') || '';
    this.C_API_KEY = localStorage.getItem('C_API_KEY') || '';
    this.delay = 8;
    this.autoStart = '0';
    this.AI_MODEL = 'gemini-1.5-pro';
    this.modal = null;
    this.modalContent;
    this.toggleModalBtn;
    this.closeModelBtn;
    this.kalviApiToken = '';
  }

  createModalWindow() {
    this.modal = document.createElement('div');
    this.modal.style.position = 'fixed';
    this.modal.style.top = '50px';
    this.modal.style.right = '20px';
    this.modal.style.backgroundColor = '#fff';
    this.modal.style.padding = '20px';
    this.modal.style.borderRadius = '8px';
    this.modal.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
    this.modal.style.width = 'auto';
    this.modal.style.height = 'auto';
    this.modal.style.maxHeight = '400px';
    this.modal.style.overflowY = 'auto';
    this.modal.style.zIndex = '10000';

    this.modalContent = document.createElement('div');
    this.modalContent.style.marginBottom = '10px';
    this.modalContent.id = 'modal-content';

    this.toggleModalBtn = document.createElement('button');
    this.toggleModalBtn.textContent = 'Click';
    this.toggleModalBtn.style.marginRight = '10px';
    this.toggleModalBtn.style.padding = '8px 16px';
    this.toggleModalBtn.style.backgroundColor = '#007bff';
    this.toggleModalBtn.style.color = '#fff';
    this.toggleModalBtn.style.border = 'none';
    this.toggleModalBtn.style.borderRadius = '4px';
    this.toggleModalBtn.style.cursor = 'pointer';

    this.closeModelBtn = document.createElement('button');
    this.closeModelBtn.textContent = 'Close';
    this.closeModelBtn.style.marginLeft = '10px';
    this.closeModelBtn.style.padding = '8px 16px';
    this.closeModelBtn.style.backgroundColor = 'red';
    this.closeModelBtn.style.color = '#fff';
    this.closeModelBtn.style.border = 'none';
    this.closeModelBtn.style.borderRadius = '4px';
    this.closeModelBtn.style.cursor = 'pointer';

    // Append elements
    this.modal.appendChild(this.modalContent);
    this.modal.appendChild(this.toggleModalBtn);
    this.modal.appendChild(this.closeModelBtn);
    document.body.appendChild(this.modal);

    this.toggleModalBtn.addEventListener('click', () => {
      if (this.modalContent.innerHTML !== '') {
        this.modalContent.innerHTML = '';
      } else {
        this.toggleModalWindow();
      }
    });

    this.closeModelBtn.addEventListener('click', () => {
      this.removeModalWindow();
    });
  }

  toggleModalWindow() {
    const modalContent = document.getElementById('modal-content');
    const updatedAnsArray = this.ansArray.map((ans) => ans + 1);

    const ansToDisplay = updatedAnsArray.map((ans, idx) => {
      return `Q${idx + 1}: ${ans}`;
    });

    modalContent.innerHTML = `<h3>Quiz Answers</h3><pre>${JSON.stringify(
      ansToDisplay,
      null,
      2
    )}</pre>`;
  }

  removeModalWindow() {
    this.modal.remove();
    this.modal = null;
  }

  getAutoStart() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('autoStart', function (data) {
        const autoStart = data.autoStart || '0';
        resolve(autoStart);
      });
    });
  }

  getAiModel() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('aiModel', function (data) {
        const aiModel = data.aiModel || 'gemini-1.5-pro';
        resolve(aiModel);
      });
    });
  }

  getWaitFor() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('delay', function (data) {
        const delay = data.delay || 8;
        resolve(delay);
      });
    });
  }

  getKalviApiToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('kalviApiToken', function (data) {
        const kalviApiToken = data.kalviApiToken || '';
        resolve(kalviApiToken);
      });
    });
  }

  startSolvingQuiz() {
    if (this.currentQuestion === 5) {
      this.currentQuestion = 0;
      console.log('All questions answered');
      // removeModalWindow();
      return;
    }
    let correctAnswer = this.ansData[this.currentQuestion];
    const optionBtn =
      document.getElementsByClassName('css-1njvaw6')[correctAnswer];

    // console.log(optionBtn);
    optionBtn.click();
    this.currentQuestion++;
    setTimeout(() => {
      const submitBtn = document.getElementsByClassName(
        'chakra-button css-1mb6l07'
      )[0];
      submitBtn.click();
      setTimeout(() => {
        this.startSolvingQuiz();
      }, 1000);
    }, 1000);
  }

  //Deal with warning popup
  handlePopup() {
    const closeBtn = document.getElementsByClassName(
      'chakra-button css-1l9ol99'
    )[0];
    if (closeBtn) closeBtn.click();
    setTimeout(() => {
      this.main();
    }, 1500);
  }

  async solveQuiz(qna) {
    console.log('Starting to get answers from ai');
    const background = document.getElementsByClassName('css-1t3n037')[0];
    try {
      let keyToUse =
        this.AI_MODEL === 'gpt-3.5-turbo' ||
        this.AI_MODEL === 'chatgpt-4o-latest'
          ? this.C_API_KEY
          : this.G_API_KEY;

      if (keyToUse === 'null') {
        throw new Error('API Key not provided');
      }

      let modelToUse =
        this.AI_MODEL === 'gpt-3.5-turbo' ||
        this.AI_MODEL === 'chatgpt-4o-latest'
          ? 'gpt'
          : 'gemini';

      console.log('Key Used: ', keyToUse);
      console.log('Model Used: ', modelToUse);
      console.log('Getting...');

      const response = await fetch(QuizSolver.apiUrl, {
        method: 'POST',
        body: JSON.stringify(qna),
        headers: {
          'Content-Type': 'application/json',
          key: keyToUse,
          model: this.AI_MODEL,
          model_type: modelToUse,
        },
      });
      console.log('Response: ', response);

      if (response.ok) {
        console.log('Got it...');
        try {
          this.ansArray = await response.json();
          console.log(this.ansArray);
          this.createModalWindow();
          // toggleModalWindow();
        } catch (error) {
          throw new Error('AI API failed to fetch answers');
        }
        if (this.ansArray.length !== 5)
          throw new Error('Failed to fetch all answers');
        this.ansArray.map((ans) => {
          if (ans === -1) {
            throw new Error('Failed to fetch all answers');
          }
        });
        background.style.backgroundColor = '#ecffec';
        return this.ansArray;
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

  async main(qna = null, retryBtn = false) {
    if (retryBtn) {
      if (this.modal !== null) this.removeModalWindow();
    }

    const { token } = await new Promise((resolve) => {
      chrome.storage.sync.get(['token'], (data) => {
        resolve(data);
      });
    });
    const currentTabUrl = window.location.href;
    const regex = /https:\/\/kalvium\.community\/quiz\/[^\/]+$/;

    if (regex.test(currentTabUrl)) {
      let quizUrl = `https://assessment-api.kalvium.community/api/assessments/${currentTabUrl
        .split('/')
        .pop()}/attempts`;

      let userToken = this.kalviApiToken ? this.kalviApiToken : token.value;

      console.log('##################################');
      console.log('Using saved token:', !userToken === token.value);
      console.log('##################################');

      console.log('##################################');
      console.log(' kalviApiToken: ');
      console.log(this.kalviApiToken);
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

        this.ansData = await this.solveQuiz(qna);
        this.startSolvingQuiz();
      } catch (error) {
        background.style.backgroundColor = '#ff605f';
        if (!retryBtn) {
          const button = document.createElement('button');
          button.className = 'chakra-button css-fgqgi2';
          button.textContent = 'Retry';
          button.style.marginLeft = '16px';
          button.style.backgroundColor = 'green';
          button.addEventListener('click', () => {
            this.main(qna, true);
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
  start() {
    console.log('Clicked start button');
    let startBtn = document.getElementsByClassName(
      'chakra-button css-fgqgi2'
    )[0];
    if (!startBtn) return;
    startBtn.click();
    setTimeout(() => {
      this.handlePopup();
    }, 1500);
  }

  // Initialize the script
  init() {
    let launchBtn =
      document.getElementsByClassName('chakra-button css-1ou4qco')[0] ||
      document.getElementsByClassName('chakra-button css-1lzs6nh')[0];
    if (!launchBtn) return;
    launchBtn.addEventListener('click', () => {
      this.start();
    });
    launchBtn.style.backgroundColor = 'green';
  }

  // Run the script
  async runScript() {
    this.autoStart = await this.getAutoStart();
    this.AI_MODEL = await this.getAiModel();
    this.delay = await this.getWaitFor();
    this.kalviApiToken = await this.getKalviApiToken();

    console.log('getAiModel: ', this.AI_MODEL);
    console.log('Existing KalviApiToken: ', this.kalviApiToken ? true : false);

    if (this.C_API_KEY === '' || !this.C_API_KEY) {
      this.C_API_KEY = String(prompt('Please enter your OpenAi API Key'));
      localStorage.setItem('C_API_KEY', this.C_API_KEY);
      console.log('OpenAi API Key Provided', this.C_API_KEY);
      this.autoStart === '1'
        ? setTimeout(() => {
            this.start();
          }, this.delay * 1000)
        : setTimeout(() => {
            this.init();
          }, this.delay * 1000);
    }

    if (this.G_API_KEY === '' || !this.G_API_KEY) {
      this.G_API_KEY = String(prompt('Please enter your Google API Key'));
      localStorage.setItem('G_API_KEY', this.G_API_KEY);
      console.log('Google API Key Provided: ', this.G_API_KEY);
      this.autoStart === '1'
        ? setTimeout(() => {
            this.start();
          }, this.delay * 1000)
        : setTimeout(() => {
            this.init();
          }, this.delay * 1000);
    }

    this.autoStart === '1'
      ? setTimeout(() => {
          this.start();
        }, this.delay * 1000)
      : setTimeout(() => {
          this.init();
        }, this.delay * 1000);
    console.log('Foreground script running');
    console.log('Dealy: ', this.delay);
    console.log('Auto Start: ', this.autoStart === '1' ? 'Yes' : 'No');
    console.log('AI Model: ', this.AI_MODEL);
  }
}

const quizSolver = new QuizSolver();
quizSolver.runScript();
