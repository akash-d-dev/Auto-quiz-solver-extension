---

# Auto Quiz Solver Extension for Kalvium Community

🚀 **Tired of solving quizzes manually?**
Use this browser extension to automatically solve Kalvium community quizzes! Just have your API keys ready. 😁

## ⭐ **Show Some Love!**
More than 10 people are using this, but no one has left a star! 😩
If you find this useful, please be responsible and leave a star! ⭐😅

## 📌 **API Source Code**
[GitHub Repository](https://github.com/akash-d-dev/auto-quiz-solver-api)

---

## 📖 **User Guide**

### 🔹 **How to Install the Extension in Your Browser**
1. Clone or download this repository (**Cloning recommended** to easily pull updates).
2. Open the **Extensions Manager** tab in your browser.
3. Enable **Developer Mode**.
4. Click on **Load Unpacked** and select the entire extension directory.

### 🔹 **How to Use**
1. After loading the extension, open **kalvium.community**.
2. A popup will appear asking for your LLM API keys.
   - Provide your API keys.
   - If you want to skip any key, just press cancel (Make sure at least one LLM key is provided).
3. Open any module page on **kalvium.community**(which has a quiz) in a new tab (or refresh the page).
4. Wait for the **"Mark as Done"** button to turn green, then click it.
5. The extension will handle the rest! ✅

---

## ❓ **FAQs**

### 🔹 **What is Auto Start - On/Off ?**
- **On**: The quiz starts automatically whenever you open a module page with a quiz.
  - Useful for solving multiple quizzes at once.
- **Off**: You need to manually click on **"Mark as Done"** on the module page to start solving the quiz.

### 🔹 **What is Delay?**
- Delay is the time the extension waits before scanning the page for the **"Mark as Done"** button.
- Adjust the delay based on your internet speed:
  - **Increase** if your internet is slow.
  - **Decrease** if your internet is fast.

### 🔹 **What is Token?**
- You can provide your **own Kalvium access token** (usually from another email) to increase anonymity.
- However, this feature is **no longer useful** as every user now gets different quiz questions.

### 🔹 **How to Prevent the Quiz from Opening in Fullscreen?**
- We are **exploiting a bug** to prevent full-page mode:
  1. Turn on **Auto Start**.
  2. Open the **module page(s)** in a new tab and do not go to that tab.
  3. Wait until the quiz page for that module is opened.
  4. When you open your quiz page, it will not go fullscreen.
  - (*Recommended wait time: Delay + 5-10 seconds*)

### 🔹 **What Do Different Page Background Colors Indicate?**
- 🟡 **Yellow**: The extension is retrieving answers from the backend (loading indicator).
- 🔴 **Red**: Failed to fetch answers.
- 🟢 **Green**: Answers have been fetched and now the extension has started solving the quiz.

### 🔹 **How to Reset or Change API Keys?**
1. Open **kalvium.community** and do **Inspect**.
2. Go to **LocalStorage**.
3. Modify or reset your API keys from there.

### 🔹 **Why Did the Extension Fail to Solve the Quiz?**
A failure can happen due to:
- Invalid or expired **API keys** (Check if your API key has reached its limit or is incorrect).
- Wrong or expired **access token**.
- Other API-related issues (Check logs for more details).

---

## 💡 **Troubleshooting & Logs**
If you face any issues, check the **extension logs** for more information.

**Enjoy seamless quiz solving!** 🎉

