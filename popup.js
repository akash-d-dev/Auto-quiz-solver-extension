class QuizSolver {
  // static apiUrl = 'https://k-quiz-solver-api.onrender.com'
  static apiUrl = 'http://localhost:8000';

  constructor() {
    this.ansArray = [-1, -1, -1, -1, -1]
    this.ansData = [null, null, null, null, null]
    this.currentQuestion = 0
    this.G_API_KEY = localStorage.getItem('G_API_KEY') || ''
    this.C_API_KEY = localStorage.getItem('C_API_KEY') || ''
    this.X_API_KEY = localStorage.getItem('X_API_KEY') || ''
    this.delay = 8
    this.autoStart = '0'
    this.AI_MODEL = 'gemini-1.5-pro'
    this.modal = null
    this.modalContent
    this.toggleModalBtn
    this.closeModelBtn
    this.kalviApiToken = ''

    console.log(this.X_API_KEY)
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
        const aiModel = data.aiModel || 'gemini-1.5-pro'
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

  getKalviApiToken() {
    return new Promise((resolve) => {
      chrome.storage.sync.get('kalviApiToken', function (data) {
        const kalviApiToken = data.kalviApiToken || ''
        resolve(kalviApiToken)
      })
    })
  }

  startSolvingQuiz() {
    if (this.currentQuestion === 5) {
      this.currentQuestion = 0
      console.log('All questions answered')
      // removeModalWindow();
      return
    }
    let correctAnswer = this.ansData[this.currentQuestion]
    const optionBtn =
      document.getElementsByClassName('css-1njvaw6')[correctAnswer]

    // console.log(optionBtn);
    optionBtn.click()
    this.currentQuestion++
    setTimeout(() => {
      const submitBtn = document.getElementsByClassName(
        'chakra-button css-1mb6l07'
      )[0]
      submitBtn.click()
      setTimeout(() => {
        this.startSolvingQuiz()
      }, 1000)
    }, 1000)
  }

  //Deal with warning popup
  handlePopup() {
    const closeBtn = document.getElementsByClassName(
      'chakra-button css-1l9ol99'
    )[0]
    if (closeBtn) closeBtn.click()
    setTimeout(() => {
      this.main()
    }, 1500)
  }

  async getQuizAnswers(qna) {
    console.log('Starting to get answers from ai')
    const background = document.getElementsByClassName('css-1t3n037')[0]
    try {
      const AI_MODELS = {
        gpt: ['chatgpt-4o-latest', 'gpt-3.5-turbo'],
        gemini: ['gemini-1.5-pro', 'gemini-1.0-pro'],
        grok: ['grok-2-latest']
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

      const response = await fetch(QuizSolver.apiUrl, {
        method: 'POST',
        body: JSON.stringify(qna),
        headers: {
          'Content-Type': 'application/json',
          key: keyToUse,
          model: this.AI_MODEL,
          model_type: modelToUse
        }
      })
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
        if (this.ansArray.length !== 5)
          throw new Error('Failed to fetch all answers')
        this.ansArray.map((ans) => {
          if (ans === -1) {
            throw new Error('Failed to fetch all answers')
          }
        })
        background.style.backgroundColor = '#ecffec'
        return this.ansArray
      } else {
        throw new Error('Failed to fetch quiz')
      }
    } catch (error) {
      background.style.backgroundColor = '#ff605f'
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

    const { token } = await new Promise((resolve) => {
      chrome.storage.sync.get(['token'], (data) => {
        resolve(data)
      })
    })
    const currentTabUrl = window.location.href
    const regex = /https:\/\/kalvium\.community\/quiz\/[^\/]+$/

    if (regex.test(currentTabUrl)) {
      let quizUrl = `https://assessment-api.kalvium.community/api/assessments/${currentTabUrl
        .split('/')
        .pop()}/attempts`

      let userToken = this.kalviApiToken ? this.kalviApiToken : token.value

      console.log('##################################')
      console.log('Using saved token:', !userToken === token.value)
      console.log('##################################')

      console.log('##################################')
      console.log(' kalviApiToken: ')
      console.log(this.kalviApiToken)
      console.log('##################################')

      console.log('##################################')
      console.log('Curr Token: ')
      console.log(token.value)
      console.log('##################################')

      const background = document.getElementsByClassName('css-1t3n037')[0]
      const qNum = document.getElementsByClassName('chakra-text css-itr5sx')[0]

      if (background) background.style.backgroundColor = '#fbfac0'

      try {
        if (!qna) {
          const response = await fetch(quizUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: userToken
            }
          })

          if (!response.ok) {
            throw new Error('Failed to fetch quiz')
          }

          const data = await response.json()
          console.log(data.attempt_info)
          qna = this.formartQuizData(data.attempt_info)
        }

        this.ansData = await this.getQuizAnswers(qna)
        this.startSolvingQuiz()
      } catch (error) {
        background.style.backgroundColor = '#ff605f'
        if (!retryBtn) {
          const button = document.createElement('button')
          button.className = 'chakra-button css-fgqgi2'
          button.textContent = 'Retry'
          button.style.marginLeft = '16px'
          button.style.backgroundColor = 'green'
          button.addEventListener('click', () => {
            this.main(qna, true)
          })
          qNum.appendChild(button)
        }
        console.error(error)
      }
    } else {
      console.log('This is not a quiz page')
    }
  }

  // Start main function
  start() {
    console.log('Clicked start button')
    let startBtn = document.getElementsByClassName(
      'chakra-button css-fgqgi2'
    )[0]
    if (!startBtn) return
    startBtn.click()
    setTimeout(() => {
      this.handlePopup()
    }, 1500)
  }

  // Initialize the script
  init() {
    let launchBtn =
      document.getElementsByClassName('chakra-button css-1ou4qco')[0] ||
      document.getElementsByClassName('chakra-button css-1lzs6nh')[0]
    if (!launchBtn) return
    launchBtn.addEventListener('click', () => {
      this.start()
    })
    launchBtn.style.backgroundColor = 'green'
  }

  async runScript() {
    this.autoStart = await this.getAutoStart()
    this.AI_MODEL = await this.getAiModel()
    this.delay = await this.getWaitFor()
    this.kalviApiToken = await this.getKalviApiToken()

    console.log('Existing KalviApiToken: ', Boolean(this.kalviApiToken))

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
      this.autoStart === '1' ? this.start() : this.init()
    }, this.delay * 1000)

    console.log('Foreground script running')
    console.log('Delay: ', this.delay)
    console.log('Auto Start: ', this.autoStart === '1' ? 'Yes' : 'No')
    console.log('AI Model: ', this.AI_MODEL)
  }
}

const quizSolver = new QuizSolver()
quizSolver.runScript()
















fetch("https://k-quiz-solver-api.onrender.com/", {
  "headers": {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.5",
    "content-type": "application/json",
    "key": "GROK_API_KEY",
    "model": "grok-2-latest",
    "model_type": "grok",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Brave\";v=\"133\", \"Chromium\";v=\"133\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "sec-gpc": "1",
    "Referer": "https://kalvium.community/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": "[{\"question\":\"Please identify whether the following sentence is an example for irony or pun.\\r\\n\\r\\n\\\"Reading while sunbathing makes you well-red.\\\"\",\"question_number\":0,\"options\":[{\"content\":\"Irony\",\"option_number\":0},{\"content\":\"Pun\",\"option_number\":1},{\"content\":\"Neither of the two\",\"option_number\":2}]},{\"question\":\"Please identify whether the following sentence is an example for irony or pun.\\r\\n\\r\\n\\\"I know a guy who's addicted to brake fluid, but he says he can stop at any time.\\\"\",\"question_number\":1,\"options\":[{\"content\":\"Irony\",\"option_number\":0},{\"content\":\"Pun\",\"option_number\":1},{\"content\":\"Neither of the two\",\"option_number\":2}]},{\"question\":\"Please identify whether the following sentence is an example for irony or pun.\\r\\n\\r\\n\\\"The locksmith got locked out of his house.\\\"\",\"question_number\":2,\"options\":[{\"content\":\"Irony\",\"option_number\":0},{\"content\":\"Pun\",\"option_number\":1},{\"content\":\"Neither of the two\",\"option_number\":2}]},{\"question\":\"Please identify whether the following sentence is an example for irony or pun.\\r\\n\\r\\n\\\"Water water everywhere, not a drop to drink.\\\"\",\"question_number\":3,\"options\":[{\"content\":\"Irony\",\"option_number\":0},{\"content\":\"Pun\",\"option_number\":1},{\"content\":\"Neither of the two\",\"option_number\":2}]},{\"question\":\"Please identify whether the following sentence is an example for irony or pun.\\r\\n\\r\\n\\\"The electrician couldn’t fix the problem because he was shocked at what he found.\\\"\",\"question_number\":4,\"options\":[{\"content\":\"Irony\",\"option_number\":0},{\"content\":\"Pun\",\"option_number\":1},{\"content\":\"Neither of the two\",\"option_number\":2}]}]",
  "method": "POST"
});