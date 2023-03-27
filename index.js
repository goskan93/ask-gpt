 import yargs from 'yargs'
 import { hideBin } from 'yargs/helpers';
import { CrawlerGPT } from './crawler.js';
import { sleep } from './sleep.js';

const argv = yargs(hideBin(process.argv))
    .usage('Hello! Try: node $0 -e [string] -p [string] -q "[string]"')
    .options({
      'e': {
        demandOption: true,
        alias: ["email"],
        string: true,
        desc: "E-mail to login to chatGPT"
      },
      'p' : {
        demandOption: true,
        alias: ["password"],
        string: true,
        desc: "Password to login to chatGPT"
      },
      'q' : {
        demandOption: true,
        alias: ["question"],
        string: true,
        desc: "Question for chatGPT"
      }
    })
    .demandOption(["e", "p", "q"])
    .argv

const { email, password, question } = argv;
console.log("Wait for an answer...")

const crawler = new CrawlerGPT(email, password);
await crawler.askGPT(question);
await sleep(10000);
const responseArray = await crawler.getResponse();
const responseClean =  [...new Set(responseArray)]
    .filter(Boolean)
    .map(text => text.slice(-2) === "/n" ? text.slice(0,-2) : text)


 responseClean.map( t => console.log(t))
