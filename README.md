---

# Auto Quiz Solver 2.0 Extension for Kalvium Community

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

#### **First Time Setup:**
1. After loading the extension, open **kalvium.community**.
2. If you have no API keys stored, popups will appear asking for your LLM API keys.
   - You can skip any key by leaving it empty or clicking cancel.
   - **At least one API key is required** for the extension to work.

#### **Managing API Keys:**
- Click the extension icon in your browser toolbar to open the popup.
- View, edit, or add your API keys directly in the popup interface.
- Keys are synced between the popup and the website automatically.
- Green "(Present)" status means key is configured, Red "(Missing)" means no key.

#### **Using the Extension:**
1. Navigate to any quiz module page on **kalvium.community**.
2. The extension automatically detects quiz pages - **no manual refresh needed!**
3. The **"Start Quiz"** or **"Retake Quiz"** button will turn **green** when ready.
4. Click the green button, and the extension handles the rest! ✅

**Note:** The extension works for both first attempts and retakes - it automatically detects which button is present!

#### **Auto Start Mode:**
- Enable "Auto Start" in the extension popup to automatically start quizzes.
- The extension will click the Start Quiz button and solve automatically.
- Useful for solving multiple quizzes quickly!

---

## ❓ **FAQs**

### 🔹 **What AI Models Are Supported?**
The extension supports multiple AI providers:
- **Google Gemini**: Gemini 2.5 Flash (Fastest & Cheapest), Gemini 2.5 Pro
- **OpenAI**: GPT-5 Mini (Best for Quizzes), GPT-4o (Legacy)
- **xAI Grok**: Grok 3 Mini, Grok 2

You can switch between models anytime in the extension popup.

### 🔹 **What is Auto Start?**
- **On**: The quiz starts and solves automatically when you open a quiz page.
  - Great for batch-solving multiple quizzes.
- **Off**: The "Start Quiz" button turns green, but you need to click it manually.
  - Gives you control over when to start.
<img width="1218" height="498" alt="image" src="https://github.com/user-attachments/assets/c4cc67f3-cba0-497a-8f4c-3e05d794c924" />

### 🔹 **What is Fullscreen Bypass?**
The quiz website normally enforces fullscreen mode and pauses when you switch tabs or lose focus. This extension exploits a bug to bypass these restrictions.

**How it works:**
1. Extension clicks "Start Quiz" for you
2. Immediately switches to a temporary blank tab
3. Quiz starts in the background (website doesn't detect the switch)
4. Returns to quiz tab after 2 seconds
5. Quiz is running without fullscreen restrictions!

**Settings:**
- **On (Recommended)**: Automatically bypasses fullscreen when Auto Start is enabled.
- **Off**: Normal behavior - fullscreen enforcement remains active.

**Benefits:**
- ✅ No fullscreen mode
- ✅ Can switch tabs freely
- ✅ Console stays accessible
- ✅ Multi-monitor setup works perfectly
- ✅ Can copy questions/answers easily

### 🔹 **How to Manage API Keys?**
1. Click the extension icon in your browser toolbar.
2. Scroll to the "API Keys" section.
3. Enter or modify your API keys directly in the input fields.
4. Click "Save" for each key you modify.
5. Use the "Show/Hide" button to view your keys.
<img width="413" height="478" alt="image" src="https://github.com/user-attachments/assets/416fd52e-618f-4d86-93dc-dd9697c9387c" />

**No need to edit localStorage anymore!** Everything is managed through the UI.

### 🔹 **What Do Different Page Background Colors Mean?**
- 🟡 **Yellow**: Fetching answers from the AI backend (loading).
<img width="2544" height="1038" alt="image" src="https://github.com/user-attachments/assets/179de4c2-cf7b-4ce3-b058-ae42502e4d1f" />

- 🟢 **Green**: Answers received successfully! Quiz solving in progress.
<img width="2548" height="1003" alt="image" src="https://github.com/user-attachments/assets/ec861140-7641-4469-b5aa-51c6ba965dbf" />

- 🔴 **Red**: Error occurred. An error box will appear with details and a retry button.
<img width="2550" height="820" alt="image" src="https://github.com/user-attachments/assets/8f61cecb-4d70-43d7-a0d5-aee0a57fb1d3" />


### 🔹 **What If I Get an Error?**
When an error occurs:
1. A **red error box** appears in the bottom-right corner.
2. The error message shows the exact problem (API key invalid, model not found, etc.).
3. Click **"Retry"** to try again after fixing the issue.
4. Or click the **"×"** to dismiss the error.
<img width="423" height="444" alt="image" src="https://github.com/user-attachments/assets/2cb61dbe-0edc-4f66-a5db-fc6ddcb73aa1" />

Common errors:
- **"API Key not provided"**: Add your API key in the extension popup.
- **"Model not found"**: Select a valid model from the dropdown.
- **"AI failed to answer"**: API quota exceeded or invalid response.

### 🔹 **Do I Need to Refresh After Navigating?**
**No!** The extension automatically detects when you navigate to a quiz page using smart URL detection. Just click on quiz modules normally, and the extension activates instantly.

### 🔹 **How to Prevent Fullscreen Mode?**
**Method 1: Use Fullscreen Bypass (Recommended)**
1. Enable **Fullscreen Bypass** in the extension popup (On by default).
2. Enable **Auto Start**.
3. Navigate to any quiz page - the extension handles everything automatically!

**Method 2: Manual Background Loading**
1. Open quiz module pages in background tabs (Ctrl+Click or Middle Mouse).
2. Don't switch to them immediately.
3. Wait 5-10 seconds for the quiz to load.
4. Switch to the tab - quiz is running without fullscreen mode!

---

## 💡 **Troubleshooting & Tips**

### **Extension Not Working?**
1. **Check API Keys**: Open the popup and ensure at least one API key is present (green status).
2. **Check Console Logs**: Press `F12` → Console tab to see detailed error messages.
3. **Reload Extension**: Go to Extensions Manager → Click the refresh icon on the extension.
4. **Verify URL**: Extension only works on `app.kalvium.community/livebooks/*/lessons` pages.

### **Quiz Not Auto-Starting?**
- Make sure **Auto Start** is enabled in the popup.
- The Start Quiz button must be visible and loaded on the page.
- Check console logs for "Start Quiz button detected" message.

### **Answers Are Wrong?**
- Try switching to a different AI model (GPT-5 Mini is recommended for quizzes).
- Some models work better than others depending on question complexity.

### **Performance Tips**
- **Gemini 2.5 Flash**: Fastest and cheapest, great for simple quizzes.
- **GPT-5 Mini**: Best accuracy for complex questions.
- **Auto Start Off**: More control, better for reviewing questions first.

---

## 🎯 **Features Summary**
✅ Automatic quiz solving with AI  
✅ Smart page detection (no refresh needed)  
✅ User-friendly API key management UI  
✅ Multiple AI model support (Gemini, GPT, Grok)  
✅ Detailed error messages with retry option  
✅ Auto Start mode for batch processing  
✅ Fullscreen bypass exploit (no restrictions!)  
✅ Visual feedback with color-coded backgrounds  

**Enjoy seamless quiz solving!** 🎉


