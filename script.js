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
    this.delay = 30
    this.autoStart = '0'
    this.AI_MODEL = 'gemini-2.5-flash'
    this.modal = null
    this.modalContent
    this.toggleModalBtn
    this.closeModelBtn
    this.quizData = null;
    this.syncKeysFromChromeStorage();
  }

  async syncKeysFromChromeStorage() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      console.log('Chrome storage API not available, skipping sync');
      return;
    }
    
    try {
      const keys = await new Promise((resolve, reject) => {
        try {
          chrome.storage.local.get(['C_API_KEY', 'G_API_KEY', 'X_API_KEY'], (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result);
            }
          });
        } catch (err) {
          reject(err);
        }
      });
      
      if (keys.C_API_KEY && keys.C_API_KEY !== this.C_API_KEY) {
        this.C_API_KEY = keys.C_API_KEY;
        localStorage.setItem('C_API_KEY', this.C_API_KEY);
      }
      if (keys.G_API_KEY && keys.G_API_KEY !== this.G_API_KEY) {
        this.G_API_KEY = keys.G_API_KEY;
        localStorage.setItem('G_API_KEY', this.G_API_KEY);
      }
      if (keys.X_API_KEY && keys.X_API_KEY !== this.X_API_KEY) {
        this.X_API_KEY = keys.X_API_KEY;
        localStorage.setItem('X_API_KEY', this.X_API_KEY);
      }
    } catch (error) {
      console.log('Could not sync keys from chrome.storage.local:', error.message || error);
    }
  }

  async reset() {
    this.ansArray = [-1, -1, -1, -1, -1];
    this.ansData = [null, null, null, null, null];
    this.currentQuestion = 0;
    this.G_API_KEY = localStorage.getItem('G_API_KEY') || '';
    this.C_API_KEY = localStorage.getItem('C_API_KEY') || '';
    this.X_API_KEY = localStorage.getItem('X_API_KEY') || '';
    this.AI_MODEL = 'gemini-2.5-flash'
    this.modal = null;
    this.modalContent = undefined;
    this.toggleModalBtn = undefined;
    this.closeModelBtn = undefined;
    this.quizData = null;

    await this.syncKeysFromChromeStorage();
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
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        resolve('0');
        return;
      }
      try {
        chrome.storage.sync.get('autoStart', function (data) {
          if (chrome.runtime.lastError) {
            console.log('Error getting autoStart:', chrome.runtime.lastError);
            resolve('0');
          } else {
            const autoStart = data.autoStart || '0';
            resolve(autoStart);
          }
        });
      } catch (error) {
        console.log('Exception getting autoStart:', error);
        resolve('0');
      }
    })
  }

  getAiModel() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        resolve('gemini-2.5-flash');
        return;
      }
      try {
        chrome.storage.sync.get('aiModel', function (data) {
          if (chrome.runtime.lastError) {
            console.log('Error getting aiModel:', chrome.runtime.lastError);
            resolve('gemini-2.5-flash');
          } else {
            const aiModel = data.aiModel || 'gemini-2.5-flash';
            resolve(aiModel);
          }
        });
      } catch (error) {
        console.log('Exception getting aiModel:', error);
        resolve('gemini-2.5-flash');
      }
    })
  }

  getWaitFor() {
    return new Promise((resolve) => {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
        resolve(30);
        return;
      }
      try {
        chrome.storage.sync.get('delay', function (data) {
          if (chrome.runtime.lastError) {
            console.log('Error getting delay:', chrome.runtime.lastError);
            resolve(30);
          } else {
            const delay = data.delay || 30;
            resolve(delay);
          }
        });
      } catch (error) {
        console.log('Exception getting delay:', error);
        resolve(30);
      }
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
        gpt: ['gpt-5-mini', 'gpt-4o'],
        gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
        grok: ['grok-3-mini', 'grok-2']
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
        console.log(qna)
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
          console.log('Got response from API...')
          let responseData;
          try {
            responseData = await response.json();
            console.log('API Response:', responseData);
          } catch (error) {
            throw new Error('Failed to parse API response');
          }

          if (responseData.error && responseData.error !== 'null') {
            throw new Error(responseData.error);
          }

          this.ansArray = responseData.result || responseData;
          console.log('Answers:', this.ansArray);

          if (!Array.isArray(this.ansArray) || this.ansArray.length === 0) {
            throw new Error('Invalid response format from API');
          }

          const hasInvalidAnswers = this.ansArray.some((ans) => ans === -1);
          if (hasInvalidAnswers) {
            throw new Error('AI failed to answer some questions. Please check your API key and model selection.');
          }

          this.createModalWindow();
          
          if (background) background.style.backgroundColor = '#ecffec';
          
          const existingErrorContainer = document.getElementById('quiz-solver-error-container');
          if (existingErrorContainer) existingErrorContainer.remove();

          return this.ansArray;
        } else {
          throw new Error(`API request failed with status ${response.status}`);
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
        const background = document.querySelector('div.flex-1.pt-8.min-h-\\[78vh\\]') || document.body;
        if (background) background.style.backgroundColor = '#ff605f';

        if (!document.getElementById('quiz-solver-error-container')) {
          const errorContainer = document.createElement('div');
          errorContainer.id = 'quiz-solver-error-container';
          Object.assign(errorContainer.style, {
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: '10001',
              backgroundColor: 'white',
              border: '3px solid red',
              borderRadius: '8px',
              padding: '15px',
              paddingTop: '35px',
              maxWidth: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          });

          const closeButton = document.createElement('button');
          closeButton.textContent = '×';
          Object.assign(closeButton.style, {
              position: 'absolute',
              top: '5px',
              right: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              fontWeight: 'bold',
              lineHeight: '1',
              padding: '0',
              width: '30px',
              height: '30px'
          });

          closeButton.addEventListener('click', () => {
            errorContainer.remove();
          });

          closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = 'red';
          });

          closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = '#999';
          });

          const errorTitle = document.createElement('div');
          errorTitle.textContent = 'Error Occurred';
          Object.assign(errorTitle.style, {
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'red',
              marginBottom: '10px'
          });

          const errorMessage = document.createElement('div');
          errorMessage.textContent = error.message || String(error);
          Object.assign(errorMessage.style, {
              fontSize: '13px',
              color: '#333',
              marginBottom: '12px',
              wordWrap: 'break-word',
              backgroundColor: '#f9f9f9',
              padding: '8px',
              borderRadius: '4px',
              fontFamily: 'monospace'
          });

          const retryButton = document.createElement('button');
          retryButton.id = 'quiz-solver-retry-btn';
          retryButton.textContent = 'Retry';
          Object.assign(retryButton.style, {
              backgroundColor: 'red',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              width: '100%'
          });
          
          retryButton.addEventListener('click', () => {
            errorContainer.remove();
            this.reset();
            this.main(qna, true);
          });

          retryButton.addEventListener('mouseenter', () => {
            retryButton.style.backgroundColor = '#cc0000';
          });

          retryButton.addEventListener('mouseleave', () => {
            retryButton.style.backgroundColor = 'red';
          });

          errorContainer.appendChild(closeButton);
          errorContainer.appendChild(errorTitle);
          errorContainer.appendChild(errorMessage);
          errorContainer.appendChild(retryButton);
          document.body.appendChild(errorContainer);
        }
        console.error('Quiz Solver Error:', error);
      }
  }

  start(clickButton = true) {
    console.log('Starting quiz sequence...')
    if (clickButton) {
        const startBtn = this.findButtonByText(['Start Quiz']);
        if (startBtn) {
            console.log('Auto-clicking Start Quiz button');
            startBtn.click();
        } else {
            console.log("Start Quiz button not found for auto-start");
        }
    }
    
    setTimeout(() => {
      this.handlePopup()
    }, 1500)
  }

  waitForElement(selector, textOptions, maxWaitTime = 30000) {
    return new Promise((resolve) => {
      let timeoutId = null;
      let observer = null;
      let bodyObserver = null;
      let resolved = false;
      
      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (bodyObserver) {
          bodyObserver.disconnect();
          bodyObserver = null;
        }
      };
      
      const checkElement = () => {
        if (resolved) return false;
        
        if (selector) {
          try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              resolved = true;
              cleanup();
              resolve(elements);
              return true;
            }
          } catch (e) {
            console.error('Error querying selector:', e);
          }
        }
        
        if (textOptions && textOptions.length > 0) {
          const button = this.findButtonByText(textOptions);
          if (button) {
            resolved = true;
            cleanup();
            resolve(button);
            return true;
          }
        }
        
        return false;
      };

      if (checkElement()) {
        return;
      }

      observer = new MutationObserver(() => {
        checkElement();
      });

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        bodyObserver = new MutationObserver(() => {
          if (document.body && observer) {
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            checkElement();
          }
        });
        bodyObserver.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }

      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          console.log(`Timeout waiting for element (${maxWaitTime}ms). Proceeding anyway...`);
          resolve(null);
        }
      }, maxWaitTime);
    });
  }

  async init() {
    console.log('Initializing auto quiz solver - waiting for Start Quiz button...')
    
    const startBtn = await this.waitForElement(null, ['Start Quiz'], this.delay * 1000);
    
    if (!startBtn) {
        console.log("Start Quiz button not found on this page.");
        return;
    }
    
    console.log("Start Quiz button detected and ready!");
    startBtn.style.backgroundColor = 'green';
    startBtn.style.color = 'white';
    startBtn.style.border = '2px solid #00ff00';
    
    startBtn.addEventListener('click', () => {
      console.log("User clicked Start Quiz - extension taking over...");
      this.start(false);
    });
  }

  wakeUpServer() {
    console.log('Waking up server...')
    fetch(QuizSolver.apiUrl, { method: 'GET' })
      .then(res => console.log('Server wake-up signal sent:', res.status))
      .catch(err => console.log('Server wake-up failed (non-critical):', err));
  }

  setupURLChangeDetection() {
    let lastUrl = window.location.href;
    console.log('Setting up URL change detection for SPA navigation');

    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.handleUrlChange(currentUrl);
      }
    };
    const observer = new MutationObserver(() => {
      checkUrlChange();
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    }
  }

  handleUrlChange(url) {
    const lessonsRegex = /\/livebooks\/\d+\/[a-f0-9-]+\/lessons$/;
    
    if (lessonsRegex.test(url)) {
      console.log('Quiz page detected via URL change. Reinitializing...');
      setTimeout(() => {
        this.reinitialize();
      }, 500);
    } else {
      console.log('Not a quiz page URL. Skipping initialization.');
    }
  }

  async reinitialize() {
    console.log('Reinitializing extension for new quiz page...');
    
    await this.reset();
    
    const lessonsRegex = /\/livebooks\/\d+\/[a-f0-9-]+\/lessons$/;
    if (!lessonsRegex.test(window.location.href)) {
      console.log('URL validation failed during reinitialization.');
      return;
    }

    this.autoStart = await this.getAutoStart();
    this.AI_MODEL = await this.getAiModel();

    if (this.autoStart === '1') {
      console.log('Auto-start enabled. Waiting for Start Quiz button...');
      const startBtn = await this.waitForElement(null, ['Start Quiz'], this.delay * 1000);
      if (startBtn) {
        console.log('Start Quiz button detected. Auto-clicking...');
        this.start(true);
      } else {
        console.log('Start Quiz button not found within timeout.');
      }
    } else {
      await this.init();
    }

    console.log('Reinitialization complete');
    console.log('Auto Start:', this.autoStart === '1' ? 'Yes' : 'No');
    console.log('AI Model:', this.AI_MODEL);
  }

  async runScript() {
    console.log('Running auto quiz solver')

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
            // console.log("Content Script: Received data from", event.data.source);
            
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
                // console.log("Quiz data stored. Ready to solve.");
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

        // Check if all three API keys are missing
        const allKeysMissing = !this.C_API_KEY && !this.G_API_KEY && !this.X_API_KEY;
        
        if (allKeysMissing) {
            const cKey = prompt('Please enter your OpenAI API Key (or leave empty to skip)');
            if (cKey && cKey.trim()) {
                this.C_API_KEY = String(cKey.trim());
                localStorage.setItem('C_API_KEY', this.C_API_KEY);
                chrome.storage.local.set({ C_API_KEY: this.C_API_KEY });
                console.log('OpenAI API Key Provided:', this.C_API_KEY);
            }

            const gKey = prompt('Please enter your Google API Key (or leave empty to skip)');
            if (gKey && gKey.trim()) {
                this.G_API_KEY = String(gKey.trim());
                localStorage.setItem('G_API_KEY', this.G_API_KEY);
                chrome.storage.local.set({ G_API_KEY: this.G_API_KEY });
                console.log('Google API Key Provided:', this.G_API_KEY);
            }

            const xKey = prompt('Please enter your Grok API Key (or leave empty to skip)');
            if (xKey && xKey.trim()) {
                this.X_API_KEY = String(xKey.trim());
                localStorage.setItem('X_API_KEY', this.X_API_KEY);
                chrome.storage.local.set({ X_API_KEY: this.X_API_KEY });
                console.log('Grok API Key Provided:', this.X_API_KEY);
            }
        }

        if (this.autoStart === '1') {
            console.log('Auto-start enabled. Waiting for Start Quiz button...');
            const startBtn = await this.waitForElement(null, ['Start Quiz'], this.delay * 1000);
            if (startBtn) {
                console.log('Start Quiz button detected. Auto-clicking...');
                this.start(true);
            } else {
                console.log('Start Quiz button not found within timeout.');
            }
        } else {
            await this.init();
        }

        console.log('Foreground script running')
        console.log('Max wait time (delay): ', this.delay, 'seconds')
        console.log('Auto Start: ', this.autoStart === '1' ? 'Yes' : 'No')
        console.log('AI Model: ', this.AI_MODEL)
        console.log('Using smart DOM detection - will proceed as soon as elements are ready')
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

// Set up URL change detection IMMEDIATELY before React Router initializes
quizSolver.setupURLChangeDetection();

quizSolver.runScript()