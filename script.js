class QuizSolver {
  static apiUrl = 'https://k-quiz-solver-api.onrender.com'
  // static apiUrl = 'http://localhost:8000';

  constructor() {
    this.ansArray = [-1, -1, -1, -1, -1]
    this.ansData = [null, null, null, null, null]
    this.currentQuestion = 0
    this.G_API_KEY = localStorage.getItem('G_API_KEY') || ''
    this.C_API_KEY = localStorage.getItem('C_API_KEY') || ''
    this.X_API_KEY = localStorage.getItem('X_API_KEY') || ''
    this.delay = 8
    this.autoStart = '0'
    this.AI_MODEL = 'gemini-flash-latest'
    this.modal = null
    this.modalContent
    this.toggleModalBtn
    this.closeModelBtn
    this.quizData = null; // Store intercepted data
  }

  async reset() {
    this.ansArray = [-1, -1, -1, -1, -1];
    this.ansData = [null, null, null, null, null];
    this.currentQuestion = 0;
    this.G_API_KEY = localStorage.getItem('G_API_KEY') || '';
    this.C_API_KEY = localStorage.getItem('C_API_KEY') || '';
    this.X_API_KEY = localStorage.getItem('X_API_KEY') || '';
    this.AI_MODEL = 'gemini-flash-latest'
    this.modal = null;
    this.modalContent = undefined;
    this.toggleModalBtn = undefined;
    this.closeModelBtn = undefined;
    this.quizData = null;

    this.AI_MODEL = await this.getAiModel()
}

  createButton(text, bgColor, margin, onClick) {
    const btn = Object.assign(document.createElement('button'), {
      textContent: text,
      style: `margin: ${margin}; padding: 8px 16px; background: ${bgColor}; color: #fff; border: none; border-radius: 4px; cursor: pointer;`
    })
    btn.addEventListener('click', onClick)
    return btn
  }

  createModalWindow() {
    this.modal = Object.assign(document.createElement('div'), {
      style: `
            position: fixed; top: 50px; right: 20px; background: #fff; padding: 20px;
            border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            width: auto; height: auto; max-height: 400px; overflow-y: auto; z-index: 10000;
        `
    })

    this.modalContent = Object.assign(document.createElement('div'), {
      id: 'modal-content',
      style: 'margin-bottom: 10px;'
    })

    this.toggleModalBtn = this.createButton(
      'Click',
      '#007bff',
      '0 10px 0 0',
      () => {
        if (this.modalContent.innerHTML) {
          this.modalContent.innerHTML = '' // Clear content
        } else {
          this.toggleModalWindow() // Call function
        }
      }
    )

    this.closeModelBtn = this.createButton('Close', 'red', '0 0 0 10px', () =>
      this.removeModalWindow()
    )

    ;[this.modalContent, this.toggleModalBtn, this.closeModelBtn].forEach(
      (el) => this.modal.appendChild(el)
    )
    document.body.appendChild(this.modal)
  }

  toggleModalWindow() {
    const modalContent = document.getElementById('modal-content')

    let updatedAnsArray = []

    if (this.ansArray.every((ans) => ans === -1)) {
      updatedAnsArray = [...this.ansArray]
    } else {
      updatedAnsArray = this.ansArray.map((ans) => ans + 1)
    }

    const ansToDisplay = updatedAnsArray.map(
      (ans, idx) => `Q${idx + 1}: ${ans}`
    )

    modalContent.innerHTML = `<h3>Quiz Answers</h3><pre>${JSON.stringify(
      ansToDisplay,
      null,
      2
    )}</pre>`
  }

  removeModalWindow() {
    this.modal?.remove()
  }

  getAutoStart() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('autoStart', function (data) {
        const autoStart = data.autoStart || '0'
        resolve(autoStart)
      })
    })
  }

  getAiModel() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('aiModel', function (data) {
        const aiModel = data.aiModel || 'gemini-flash-latest'
        resolve(aiModel)
      })
    })
  }

  getWaitFor() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('delay', function (data) {
        const delay = data.delay || 8
        resolve(delay)
      })
    })
  }

  // Helper to find button by text
  findButtonByText(textOptions) {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(btn => textOptions.some(text => btn.textContent.trim().toLowerCase().includes(text.toLowerCase())));
  }

  startSolvingQuiz() {
    if (this.currentQuestion === this.ansData.length) {
      this.currentQuestion = 0
      console.log('All questions answered')
      // removeModalWindow();
      return
    }
    let correctAnswer = this.ansData[this.currentQuestion]
    
    // New selector for options
    // Escaping brackets for CSS selector: [ -> \\[ and ] -> \\]
    const optionBtns = document.querySelectorAll('button.w-full.rounded-\\[8px\\].cursor-pointer');
    
    console.log(`Question ${this.currentQuestion + 1}: Found ${optionBtns.length} options. Correct Answer Index: ${correctAnswer}`);

    if (optionBtns.length === 0) {
        console.error("No options found! Check selectors.");
        return;
    }

    if (optionBtns.length <= correctAnswer) {
        console.error(`Option index ${correctAnswer} out of bounds. Found ${optionBtns.length} options.`);
        return;
    }

    const optionBtn = optionBtns[correctAnswer];

    // console.log(optionBtn);
    optionBtn.click()
    this.currentQuestion++
    setTimeout(() => {
      // Find submit/next button by text
      const submitBtn = this.findButtonByText(['Next', 'Submit', 'Finish']);
      
      if (submitBtn) {
          console.log("Clicking Submit/Next button");
          submitBtn.click();
      } else {
          console.error("Submit/Next button not found");
      }

      setTimeout(() => {
        this.startSolvingQuiz()
      }, 1000)
    }, 1000)
  }

  //Deal with warning popup
  handlePopup() {
    // Try to find the "Proceed" or close button in popup
    const closeBtn = this.findButtonByText(['Proceed', 'Close', 'Yes']);
    if (closeBtn) closeBtn.click()
    setTimeout(() => {
      this.main()
    }, 1500)
  }

  async getQuizAnswers(qna) {
    console.log('Starting to get answers from ai')
    // Target the specific background div
    const background = document.querySelector('div.flex-1.pt-8.min-h-\\[78vh\\]') || document.body; 
    
    // Visual cue: Loading
    if (background) background.style.backgroundColor = '#fbfac0'; // Light Yellow

    try {
      const AI_MODELS = {
        gpt: ['chatgpt-4o-latest', 'gpt-5-mini'],
        gemini: ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-pro', 'Gemini 3 Pro'],
        grok: ['grok-2-latest', 'grok-3-latest']
      }

      const MODEL_KEYS = {
        gpt: 'C_API_KEY',
        gemini: 'G_API_KEY',
        grok: 'X_API_KEY'
      }

      function getModelType(aiModel) {
        for (const [type, models] of Object.entries(AI_MODELS)) {
          if (models.includes(aiModel)) {
            return type
          }
        }
        return null
      }

      const modelToUse = getModelType(this.AI_MODEL)
      const keyToUse = modelToUse ? this[MODEL_KEYS[modelToUse]] : null

      if (!keyToUse || keyToUse === 'null') {
        throw new Error('API Key not provided')
      }

      if (!modelToUse) {
        throw new Error('Model not found')
      }

      console.log(`Key Used: ${keyToUse}`)
      console.log(`Model Used: ${modelToUse}`)
      console.log('Getting...')

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

      try {
        const response = await fetch(QuizSolver.apiUrl, {
          method: 'POST',
          body: JSON.stringify(qna),
          headers: {
            'Content-Type': 'application/json',
            key: keyToUse,
            model: this.AI_MODEL,
            model_type: modelToUse
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('Response: ', response)

        if (response.ok) {
          console.log('Got it...')
          try {
            this.ansArray = await response.json()
            console.log(this.ansArray)
            this.createModalWindow()
            // toggleModalWindow();
          } catch (error) {
            throw new Error('AI API failed to fetch answers')
          }
          // if (this.ansArray.length !== 5)
          //   throw new Error('Failed to fetch all answers')
          this.ansArray.map((ans) => {
            if (ans === -1) {
              throw new Error('Failed to fetch all answers')
            }
          })
          
          // Visual cue: Success
          if (background) background.style.backgroundColor = '#ecffec'; // Light Green
          
          // Remove retry button if it exists
          const existingRetryBtn = document.getElementById('quiz-solver-retry-btn');
          if (existingRetryBtn) existingRetryBtn.remove();

          return this.ansArray
        } else {
          throw new Error('Failed to fetch quiz')
        }
      } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Fetch timed out after 90 seconds');
            throw new Error('Request to AI server timed out');
        }
        throw error;
      }
    } catch (error) {
      // Visual cue: Failure
      if (background) background.style.backgroundColor = '#ff605f'; // Light Red
      
      console.error(error)
      console.error('Sorry we failed')
      throw error
    }
  }

  formartQuizData(data) {
    return data.map((item, idx) => ({
      question: item.question.content,
      question_number: idx,
      options: item.question.choices.map((choice, i) => ({
        content: choice.content,
        option_number: i
      }))
    }))
  }

  async main(qna = null, retryBtn = false) {
    if (retryBtn) {
      if (this.modal !== null) this.removeModalWindow()
    }

    // Use intercepted data if available
    if (!qna && this.quizData) {
        qna = this.quizData;
    }

    if (!qna) {
        console.error("No quiz data available. Interceptor might have missed the request or page hasn't loaded data yet.");
        // alert("No quiz data found! Please refresh the page to capture the quiz data.");
        return;
    }

      try {
        this.ansData = await this.getQuizAnswers(qna)
        this.startSolvingQuiz()
      } catch (error) {
        // Visual cue: Failure (Red background) - Redundant but safe to keep sync
        const background = document.querySelector('div.flex-1.pt-8.min-h-\\[78vh\\]') || document.body;
        if (background) background.style.backgroundColor = '#ff605f';

        // Check if button already exists
        if (!document.getElementById('quiz-solver-retry-btn')) {
          const button = document.createElement('button')
          button.id = 'quiz-solver-retry-btn'; // Add ID for easy finding
          button.textContent = 'Retry'
          // Style the button to be visible
          Object.assign(button.style, {
              marginLeft: '16px',
              backgroundColor: 'red',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              position: 'fixed',
              bottom: '80px', // Above the Solve Quiz button if present
              right: '20px',
              zIndex: '10001',
              cursor: 'pointer',
              fontWeight: 'bold'
          });
          
          button.addEventListener('click', () => {
            // Reset background to loading state (optional, getQuizAnswers will do it)
            // Do NOT remove the button here, so it persists if retry fails again
            this.reset()
            this.main(qna, true)
          })
          
          document.body.appendChild(button);
        }
        console.error(error)
      }
  }

  // Start main function
  start(clickButton = true) {
    console.log('Starting quiz sequence...')
    if (clickButton) {
        const startBtn = this.findButtonByText(['Start Quiz', 'Mark as Done', 'Take Quiz']);
        if (startBtn) {
            console.log('Auto-clicking start button');
            startBtn.click();
        } else {
            console.log("Start button not found for auto-start");
        }
    }
    
    setTimeout(() => {
      this.handlePopup()
    }, 1500)
  }

  // Initialize the script
  init() {
    console.log('Initializing auto quiz solver')
    // Check if quiz is already active (options present)
    const optionBtns = document.querySelectorAll('button.w-full.rounded-\\[8px\\].cursor-pointer');
    
    if (optionBtns.length > 0) {
        console.log("Quiz already active. Adding Solve button.");
        const solveBtn = this.createButton('Solve Quiz', 'green', '0', () => {
            this.start(false); // Don't click start button, just proceed
        });
        Object.assign(solveBtn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            padding: '15px 30px',
            fontSize: '16px'
        });
        document.body.appendChild(solveBtn);
        return;
    }

    // Look for launch button by text
    const launchBtn = this.findButtonByText(['Start Quiz', 'Mark as Done', 'Take Quiz']);
    
    if (!launchBtn) {
        console.log("Start Quiz button not found on this page.");
        return;
    }
    
    // Visual indication
    launchBtn.style.backgroundColor = 'green';
    launchBtn.style.color = 'white';
    launchBtn.style.border = '2px solid #00ff00';
    
    launchBtn.addEventListener('click', () => {
      console.log("User clicked Start Quiz");
      this.start(false); // User already clicked, so we don't need to
    })
  }

  wakeUpServer() {
    console.log('Waking up server...')
    fetch(QuizSolver.apiUrl, { method: 'GET' })
      .then(res => console.log('Server wake-up signal sent:', res.status))
      .catch(err => console.log('Server wake-up failed (non-critical):', err));
  }

  async runScript() {
    console.log('Running auto quiz solver')

    // Inject Interceptor via SRC (Bypasses CSP for inline scripts)
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
    console.log("Interceptor injected from script.js via SRC");

    // Listen for intercepted data
    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        if (event.data.type && event.data.type === 'QUIZ_DATA_INTERCEPTED') {
            console.log("Content Script: Received data from", event.data.source);
            
            let rawData = event.data.data;
            let qna = null;

            if (event.data.source === 'GLOBAL') {
                // Try to find the attempt info in the deep object
                // This is a heuristic search
                const findAttemptInfo = (obj) => {
                    if (!obj || typeof obj !== 'object') return null;
                    if (obj.attempt_info) return obj.attempt_info;
                    if (Array.isArray(obj)) {
                        for (let item of obj) {
                            const found = findAttemptInfo(item);
                            if (found) return found;
                        }
                    } else {
                        for (let key in obj) {
                            const found = findAttemptInfo(obj[key]);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                
                const attemptInfo = findAttemptInfo(rawData);
                if (attemptInfo) {
                    console.log("Content Script: Extracted attempt_info from GLOBAL data");
                    qna = this.formartQuizData(attemptInfo);
                } else {
                    console.log("Content Script: Could not find attempt_info in GLOBAL data");
                }
            } else {
                // API source
                qna = this.formartQuizData(rawData.attempt_info || rawData);
            }

            if (qna) {
                this.quizData = qna;
                console.log("Quiz data stored. Ready to solve.");
            }
        }
    });

    // Wait for DOM for the rest
    const initLogic = async () => {
        console.log('Running DOM-dependent logic');
        
        // URL Validation
        const currentUrl = window.location.href;
        const lessonsRegex = /\/livebooks\/\d+\/[a-f0-9-]+\/lessons$/;
        
        if (!lessonsRegex.test(currentUrl)) {
            console.log("URL does not match lesson page structure. Script will not activate.");
            return;
        }

        // Wake up server immediately
        this.wakeUpServer();

        this.autoStart = await this.getAutoStart()
        this.AI_MODEL = await this.getAiModel()
        this.delay = await this.getWaitFor()

        if (!this.C_API_KEY) {
            this.C_API_KEY = String(prompt('Please enter your OpenAI API Key'))
            localStorage.setItem('C_API_KEY', this.C_API_KEY)
            console.log('OpenAI API Key Provided:', this.C_API_KEY)
        }

        if (!this.G_API_KEY) {
            this.G_API_KEY = String(prompt('Please enter your Google API Key'))
            localStorage.setItem('G_API_KEY', this.G_API_KEY)
            console.log('Google API Key Provided:', this.G_API_KEY)
        }

        if (!this.X_API_KEY) {
            this.X_API_KEY = String(prompt('Please enter your Grok API Key'))
            localStorage.setItem('X_API_KEY', this.X_API_KEY)
            console.log('Grok API Key Provided:', this.X_API_KEY)
        }

        setTimeout(() => {
            this.autoStart === '1' ? this.start(true) : this.init()
        }, this.delay * 1000)

        console.log('Foreground script running')
        console.log('Delay: ', this.delay)
        console.log('Auto Start: ', this.autoStart === '1' ? 'Yes' : 'No')
        console.log('AI Model: ', this.AI_MODEL)
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogic);
    } else {
        initLogic();
    }
  }
}

console.log('Background script running')
const quizSolver = new QuizSolver()
quizSolver.runScript()