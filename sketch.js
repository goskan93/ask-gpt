import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";
//import proxyChain from "proxy-chain";

const question = "What is the capital of China?";

// const oldProxyUrl = 'http://83.27.135.73:3001';
// const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
const loginUrl = "https://chat.openai.com/auth/login";

// Launch the browser
const browser = await puppeteer.launch({
  headless: false,
  executablePath: executablePath(),// "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" || null,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
  ignoreHTTPSErrors: true,
  dumpio: false,
});

// Create a page
const page = await browser.newPage();

//Randomize viewport size
await page.setViewport({
  width: 1920 + Math.floor(Math.random() * 100),
  height: 3000 + Math.floor(Math.random() * 100),
  deviceScaleFactor: 1,
  hasTouch: false,
  isLandscape: false,
  isMobile: false,
});
await page.setUserAgent(USER_AGENT);
await page.setJavaScriptEnabled(true);
page.setDefaultNavigationTimeout(0);
//Skip images/styles/fonts loading for performance
//await page.setRequestInterception(true);
// page.on('request', (request) => {
//     if (['image', 'font'].indexOf(request.resourceType()) !== -1) {
//       request.abort();
//     } else {
//         request.continue();
//     }
// });

// Go to your site
await page.goto(loginUrl, { waitUntil: "networkidle0" });
await page.waitForSelector("button");

const loginBtn = await page.$x("//button[contains(., 'Log in')]");

if (loginBtn.length) {
  await loginBtn[0].click();
  await page.waitForNavigation();
} else {
  console.log("login btn not found");
  browser.close();
}
const emailInput = await page.waitForSelector("input[name='username']");

if (emailInput) {
  await emailInput.type(email);
} else {
  console.log("email input not found");
  browser.close();
}
await emailInput.press("Enter");

const passwordInput = await page.waitForSelector("input[name='password']");

if (passwordInput) {
  await passwordInput.type(password);
} else {
  console.log("password input not found");
  browser.close();
}
await passwordInput.press("Enter");

await page.waitForNavigation();
//LoggedIn!

let nextBtn = await page.$x("//button[contains(., 'Next')]");

if (nextBtn.length) {
  await nextBtn[0].click();
} else {
  console.log("next btn not found");
  browser.close();
}

nextBtn = await page.$x("//button[contains(., 'Next')]");

if (nextBtn.length) {
  await nextBtn[0].click();
} else {
  console.log("next btn not found");
  browser.close();
}

const doneBtn = await page.$x("//button[contains(., 'Done')]");

if (doneBtn.length) {
  await doneBtn[0].click();
} else {
  console.log("done btn not found");
  browser.close();
}

//await page.waitForFunction("renderingCompleted === true")

const questionInput = await page.waitForSelector("textarea[data-id='root']");

console.log("Question: ", question);
await questionInput.type(question);
await questionInput.focus();
await questionInput.press("Tab");
await questionInput.press("Enter");

await page.waitForSelector(".markdown");
//
let response = [];
page.exposeFunction("getPieceOfAnswer", (pieceOfAnswer) => {
  console.log("Answer" , pieceOfAnswer)
  response.push(pieceOfAnswer)
})
await page.evaluate(() => {
  const observer = new MutationObserver((mutations) => {
    for (var mutation of mutations) {
      mutation.target.childNodes.forEach(n => getPieceOfAnswer(n.innerText))
    }
  });


  observer.observe(document.getElementsByClassName("markdown")[0], {
    attributes: true,
    childList: true,
    subtree: true
  });
});

