const { chromium } = require("playwright");
const File = require("./file");
const cliProgress = require("cli-progress");
const { Routes } = require('../config.json');
var console = require('./logger.js');


const State = {
    async getStates(Country) {
        console.log("Extrayendo los estados básicos....");

        const browser = await chromium.launch({
            args: ["--incognito"],
            headless: false,
        });

        const context = await browser.newContext();
        const page = await context.newPage();

        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        await page.goto(`https://${Country}.indeed.com/browsejobs`);
        await page.waitForSelector(".state");

        const stateNames = await page.evaluate(() => {
            const states = Array.from(document.querySelectorAll(".state")).map(
                (elem) => ({
                    state: elem.querySelector("a").textContent.trim(),
                    url: elem.querySelector("a").href.trim(),
                })
            );

            return states;
        });

        console.log(`Se extrajeron ${stateNames.length} estados básicos`);
        console.log('\nCargando Links de los estados...\n');


        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progressBar.start(stateNames.length, 0);

        await this.getAllLinks(stateNames, context, progressBar);

        progressBar.stop();

        await browser.close();
        return stateNames;
    },

    async getAllLinks(stateNames, context, progressBar) {

        let urlJobs = [];
        let progressCount = 0;

        for (const elem of stateNames) {
            const page = await context.newPage();

            await page.goto(elem.url);
            await page.waitForSelector("ul#cities");

            const jobs = await page.evaluate(() => {
                const pageLinks = [];

                document.querySelectorAll("ul#cities li .gap a").forEach((elem) => {
                    const job = {
                        name: elem.textContent.trim(),
                        url: elem.href.trim(),
                    };
                    pageLinks.push(job);
                });

                return pageLinks;
            });

            urlJobs.push(jobs);
            urlJobs = urlJobs.flat();

            await page.close();

            progressCount++;
            progressBar.update(progressCount);
        }

        await File.createLinks(urlJobs);

        console.log(`\nSe creo un archivo en ${Routes.ReadData} con un total de ${urlJobs.length} links disponibles para la extraccion de informacion basica`)
    },
};

module.exports = State;
