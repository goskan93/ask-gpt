import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { executablePath } from "puppeteer";

export class CrawlerGPT {
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
    LOGIN_URL = "https://chat.openai.com/auth/login"
    page = null;
    browser = null;
    email = null;
    password = null;
    response = [];

    constructor(email, password) {
        this.email = email;
        this.password = password
    }

    initPage = async () => {
        puppeteer.use(StealthPlugin());
        // Launch the browser
        const browser = await puppeteer.launch({
            headless: false,
            executablePath: executablePath(),// "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" || null,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            ignoreHTTPSErrors: true,
            dumpio: false,
        });
        // Create page
        const page = await browser.newPage();
        // Setup page
        // await page.setViewport({
        //     width: 1920 + Math.floor(Math.random() * 100),
        //     height: 3000 + Math.floor(Math.random() * 100),
        //     deviceScaleFactor: 1,
        //     hasTouch: false,
        //     isLandscape: false,
        //     isMobile: false,
        // });
        await page.setUserAgent(this.USER_AGENT);
        await page.setJavaScriptEnabled(true);
        page.setDefaultNavigationTimeout(0);
    
        page.exposeFunction("getPieceOfAnswer", (pieceOfAnswer) => {
          this.response.push(pieceOfAnswer)
        });

        this.page = page;
        this.browser = browser;
    }

    login = async () => {
        await this.page.goto(this.LOGIN_URL, { waitUntil: "networkidle0" });
        await this.page.waitForSelector("button");
        
        const loginBtn = await this.page.$x("//button[contains(., 'Log in')]");
        
        if (loginBtn.length) {
          await loginBtn[0].click();
          await this.page.waitForNavigation();
        } else {
          this.browser.close();
          throw new Error("Login button not found!")
        }
        const emailInput = await this.page.waitForSelector("input[name='username']");
        
        if (emailInput) {
          await emailInput.type(this.email);
        } else {
          this.browser.close();
          throw new Error("Email input not found!")
        }
    
        await emailInput.press("Enter");
        
        const passwordInput = await this.page.waitForSelector("input[name='password']");
        
        if (passwordInput) {
          await passwordInput.type(this.password);
        } else {
          this.browser.close();
          throw new Error("Password input not found!")
        }
        await passwordInput.press("Enter");
        await this.page.waitForNavigation();
    }

    closeModal = async () => {
      let nextBtn = await this.page.$x("//button[contains(., 'Next')]");

      if (nextBtn.length) {
        await nextBtn[0].click();
      } else {
        this.browser.close();
        throw new Error("Next button not found!")
      }

      nextBtn = await this.page.$x("//button[contains(., 'Next')]");

      if (nextBtn.length) {
        await nextBtn[0].click();
      } else {
        this.browser.close();
        throw new Error("Next next button not found!")
      }

      const doneBtn = await this.page.$x("//button[contains(., 'Done')]");

      if (doneBtn.length) {
        await doneBtn[0].click();
      } else {
        this.browser.close();
        throw new Error("Done next button not found!")
      }
    }

    addObserver = async () => {
      await this.page.evaluate(() => {
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
    }

    disposeAll = async () => {
      await this.browser.close();
    }

    askGPT = async (question) => {
        await this.initPage();
        await this.login()
        await this.closeModal();
        const questionInput = await this.page.waitForSelector("textarea[data-id='root']");

        await questionInput.type(question);
        await questionInput.focus();
        await questionInput.press("Tab");
        await questionInput.press("Enter");

        await this.page.waitForSelector(".markdown");
        await this.addObserver();
    }

    getResponse = async () => {
      await this.disposeAll();
      return this.response;
    }
}
