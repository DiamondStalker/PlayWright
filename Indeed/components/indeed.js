// const { chromium } = require("playwright");
// const cliProgress = require("cli-progress");
// const File = require("./file");
// var console = require('./logger.js');

// const Indeed = {
//     async run(links) {
//         const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//         progressBar.start(links.length, 0);

//         for (const elem of links) {
//             // const browser = await chromium.launch({
//             //     args: ["--incognito"],
//             //     headless: false,
//             //     ignoreHTTPSErrors: true,
//             //     timeout: 60000
//             // });

//             // const context = await browser.newContext();
//             // const page = await context.newPage();

//             const browser = await chromium.launchPersistentContext('./Cache', {
//                 headless: false,
//                 ignoreHTTPSErrors: true,
//                 timeout: 60000
//             });

//             const page = await browser.newPage();


//             await page.goto(`${elem.url}?filter=0&fromage=14&start=0`);
//             await page.waitForSelector('[class*="jobsearch-ResultsList"] > li', { timeout: 0 });

//             // await page.evaluate(() => {
//             //     if (document.querySelector("#filter-dateposted > div.yosegi-FilterPill-pillIcon"))
//             //         document.querySelector("#filter-dateposted > div.yosegi-FilterPill-pillIcon")?.click();
//             // });

//             // await page.waitForTimeout(5000).then(() => { console.log("ESPERANDO 5 SEG") });



//             let hasNextPage = true;
//             let contador = 0;
//             let trabajos = 0;
//             let pag = 1;

//             await page.evaluate(() => {
//                 if (document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button"))
//                     document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button")?.click();
//             });

//             let limit = await page.evaluate(() => {
//                 return parseInt(document.querySelector('[class*=jobCount]').textContent.trim().replaceAll(',', '').match(/\d*/).pop());
//             });

//             let currentJobs = 0;

//             do {


//                 let html_jobs = await page.evaluate(() => {
//                     const jobs = [];

//                     const htmlJobs = document.querySelectorAll('[class*="jobsearch-ResultsList"] > li');
//                     htmlJobs.forEach((elem) => {
//                         if (elem.querySelector('h2.jobTitle')) {
//                             let job = {
//                                 title: elem.querySelector('h2.jobTitle').textContent.trim(),
//                                 location: elem.querySelector("div.companyLocation").textContent.trim(),
//                                 url: elem.querySelector('h2.jobTitle > a').href.trim(),
//                                 source_empname: elem.querySelector('span.companyName').textContent.trim(),
//                             };

//                             if (elem.querySelector('tr[class="jobCardShelf"]')) {
//                                 const tags = Array.from(elem.querySelectorAll('tr.jobCardShelf td')).map((el) =>
//                                     el.textContent.trim()
//                                 );
//                                 job.tags = tags.join("|");
//                             }

//                             if (!job.tags) {
//                                 job.tags = 'No tags';
//                             }

//                             job.date = elem.querySelector('span.date').textContent.trim();

//                             jobs.push(job);
//                         }
//                     });

//                     return jobs;
//                 });

//                 const nextButton = await page.$('a[aria-label*="Next"]');
//                 if (nextButton) {
//                     await nextButton.click();
//                     await page.waitForNavigation();
//                 } else {
//                     hasNextPage = false;
//                 }

//                 await page.evaluate(() => {
//                     if (document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button"))
//                         document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button")?.click();
//                 });

//                 await page.waitForTimeout(5000).then(() => { console.log("ESPERANDO 5 SEG") });

//                 await File.update(html_jobs);

//                 contador += 10;
//                 currentJobs += html_jobs.length;
//                 pag++;
//                 trabajos += html_jobs.length;
//                 console.log(`PAGINA: ${pag}, CONTADOR: ${contador}`);
//                 console.log(`Extracted jobs ==> ${trabajos}`);
//                 console.log(`URL ==> ${elem.url}&start=${contador}`);
//             } while (hasNextPage);

//             // if (currentJobs < limit) {
//             //     console.log(`La ejecucion termino antes de tiempo, debes volver a ejecutarlos desde la pagina #${contador}`);
//             //     await page.waitForTimeout(2000).then(() => { console.log("ESPERANDO 2 SEG") });

//             //     process.exit();
//             // }

//             progressBar.increment();
//             await context.close();
//         }

//         progressBar.stop();
//     },
// };

// module.exports = Indeed;


const { chromium } = require("playwright");
const cliProgress = require("cli-progress");
const File = require("./file");
var console = require('./logger.js');

const Indeed = {
    async run(links) {
        const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progressBar.start(links.length, 0);

        const browser = await chromium.launchPersistentContext('./Cache61', {
            headless: false,
            ignoreHTTPSErrors: true,
            timeout: 120000 
        });

        const page = await browser.newPage();

        // Configurar la página para evitar el desafío de Cloudflare
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        for (const elem of links) {

            await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36' });

            await page.goto(`${elem.url}?filter=0&fromage=14&start=0`);
            await page.waitForSelector('[class*="jobsearch-ResultsList"] > li', { timeout: 2000 });

            // Resto del código...

            let hasNextPage = true;
            let contador = 0;
            let trabajos = 0;
            let pag = 1;

            await page.evaluate(() => {
                if (document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button"))
                    document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button")?.click();
            });

            let limit = await page.evaluate(() => {
                return parseInt(document.querySelector('[class*=jobCount]')?.textContent?.trim()?.replaceAll(',', '')?.match(/\d*/)?.pop());
            });

            let currentJobs = 0;

            do {
                let html_jobs = await page.evaluate(() => {
                    const jobs = [];

                    const htmlJobs = document.querySelectorAll('[class*="jobsearch-ResultsList"] > li');
                    htmlJobs.forEach((elem) => {
                        if (elem.querySelector('h2.jobTitle')) {
                            let job = {
                                title: elem.querySelector('h2.jobTitle').textContent.trim(),
                                location: elem.querySelector("div.companyLocation").textContent.trim(),
                                url: elem.querySelector('h2.jobTitle > a').href.trim(),
                                source_empname: elem.querySelector('span.companyName').textContent.trim(),
                            };

                            if (elem.querySelector('tr[class="jobCardShelf"]')) {
                                const tags = Array.from(elem.querySelectorAll('tr.jobCardShelf td')).map((el) =>
                                    el.textContent.trim()
                                );
                                job.tags = tags.join("|");
                            }

                            if (!job.tags) {
                                job.tags = 'No tags';
                            }

                            job.date = elem.querySelector('span.date').textContent.trim();

                            jobs.push(job);
                        }
                    });

                    return jobs;
                });

                // const nextButton = await page.$("#jobsearch-JapanPage > div > div > div.jobsearch-SerpMainContent > div.jobsearch-LeftPane > nav > div:nth-child(6) > a") || await page.$('a[aria-label*="Next"]');
                // if (nextButton) {
                //     await nextButton.click();
                //     await page.waitForNavigation();
                // } else {
                //     hasNextPage = false;
                // }

                const nextButtonSelector = '[data-testid="pagination-page-next"]';
                const nextButton = await page.$(nextButtonSelector);

                if (nextButton) {
                    await Promise.all([
                        nextButton.click(),
                        page.waitForNavigation()
                    ]);
                    // Puedes agregar una pausa opcional aquí si es necesario para permitir que la siguiente página se cargue completamente.
                    // await page.waitForTimeout(2000); // Espera 2 segundos (ajusta el tiempo según sea necesario)
                    hasNextPage = true;
                } else {
                    hasNextPage = false;
                }


                await page.evaluate(() => {
                    if (document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button"))
                        document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button")?.click();
                });

                await page.waitForTimeout(5000).then(() => { console.log("ESPERANDO 5 SEG") });

                await page.evaluate(() => {
                    if (document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button"))
                        document.querySelector("#mosaic-desktopserpjapopup > div.css-otmc9o.eu4oa1w0 > button")?.click();
                });

                await File.update(html_jobs);

                contador += 10;
                currentJobs += html_jobs.length;
                pag++;
                trabajos += html_jobs.length;
                console.log(`PAGINA: ${pag}, CONTADOR: ${contador}`);
                console.log(`Extracted jobs ==> ${trabajos}`);
                console.log(`URL ==> ${elem.url}&start=${contador}`);
                // console.log(hasNextPage);
            } while (hasNextPage);

            progressBar.increment();
        }

        progressBar.stop();
        await browser.close();
    },
};

module.exports = Indeed;


