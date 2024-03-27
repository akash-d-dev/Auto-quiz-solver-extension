function captureText() {
    const element = document.getElementsByClassName("mdx-container")[0];
    const text = element.querySelector("p.first-child").textContent;
    return text;
}

setTimeout(() => {
    console.log("Clicked start button");
    console.log(document);
    var startBtn = document.querySelectorAll("button")[4];
    startBtn.click();
}, 8000);

setTimeout(() => {
    const text = captureText();
    console.log(text);
    console.log("Loading script running");
}, 10000);

console.log("Foreground script running");
