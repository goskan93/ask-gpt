// import yargs from 'yargs'

// yargs()
//     .options({
//       'e': {
//         demandOption: true,
//         alias: ["email"],
//         string: true,
//         desc: "E-mail to login to chatGPT"
//       },
//       'p' : {
//         demandOption: true,
//         alias: ["password"],
//         string: true,
//         desc: "Password to login to chatGPT"
//       },
//       'q' : {
//         demandOption: true,
//         alias: ["question"],
//         string: true,
//         desc: "Question for chatGPT"
//       }
//     })
//     .help()
//     .alias('help', 'h')
//     .argv

import { CrawlerGPT } from './crawler.js';
import { sleep } from './sleep.js';
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({path: `.env.local`})

const email = process.env.EMAIL;
const pass = process.env.PASS;

const crawler = new CrawlerGPT(email, pass);
await crawler.askGPT("What is the capital of Sweden");
await sleep(10000);
const responseArray = await crawler.getResponse();
const responseClean =  [...new Set(responseArray)]
    .filter(Boolean)
    .map(text => text.slice(-2) === "/n" ? text.slice(0,-2) : text)


responseClean.map( t => console.log(t))
