const puppeteer = require("puppeteer");
const Scanid = require('../UpdateIcims/Read/Scanid.json');


(async () => {
    // Inicia un navegador Puppeteer
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: "DiamondStalker",
        ignoreHTTPSErrors: true,
        timeout: 120000
    });

    for (const id of Scanid) {

        console.log(`${"\x1b[32m"} Actualmente estamos en el Scanid => ${id}`);
        const page = await browser.newPage();

        await page.setViewport({ width: 1920, height: 1080 }); // Ajusta el valor de deviceScaleFactor según tus necesidades


        await page.goto(`https://www.talent.com/private/tools/content/scraper/spiderCodeTool.php?scanid=${id}`);

        await page.goto(`https://www.talent.com/private/tools/content/scraper/services/loadSpiderCode.php?scanid=${id}&step=dynamic-extract`,
            { waitUntil: 'networkidle0' });

        let data = await page.evaluate(() => {
            return JSON.parse(document.querySelector('body').textContent)
        })

        await page.goto(`https://www.talent.com/private/tools/content/scraper/spiderCodeTool.php?scanid=${id}`);

        let change = data.code.replace(" job.title = elem.querySelector('h2').textContent.trim();", " job.title = elem.querySelector('h3').textContent.trim();")

        let resp = await page.evaluate(async (id, change) => {
            let send = await fetch("https://www.talent.com/private/tools/content/scraper/services/saveSpiderCode.php", {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest"
                },
                "referrer": `https://www.talent.com/private/tools/content/scraper/spiderCodeTool.php?scanid=${id}`,
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": `scanid=${id}&step=dynamic-extract&code=${encodeURIComponent(change)}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });
        }, id, change)

        // Abrimos la configuracion del spider
        await page.waitForTimeout(1000);
        await page.click("#btn-spider-info");

        /**
         * Eliminamos los comentarios de error con el patron de error consecutivo
         */
        await page.waitForTimeout(1000);
        await page.evaluate(() => {
            let comments = document.querySelector('[name="comments"]').textContent.trim()
            document.querySelector('[name="comments"]').value = comments.replace(/\[Status changed to stuck, last 3 consecutive execution in prod were different of successful, status of spider was changed to Stuck, please remove this comment once fix spider, \d{4}-\d{2}-\d{2}T(\d*:*\.*)*Z\]/gmi, '')
        });
        //await page.screenshot({ path: `${id}.png` });



        // Guardamos para saber si sale el error de owner
        await page.waitForTimeout(1000);
        await page.evaluate(() => {
            document.querySelector('[class="fieldSubmit hyper-btn"]').click()
        })

        //Cambiamos el status del Spider
        await page.waitForTimeout(1000);
        await page.evaluate(() => {
            document.querySelector('[name="status"]').value = 9
        });


        // Validamos si al guardar salir error por owner, lo validamos, cambios de owner y volmemos a guardar
        await page.waitForTimeout(1000);
        await page.evaluate(() => {

            if (document.querySelector('[class="card card--error"]')) {
                document.querySelector('[name="owner"]').value = "carlos.moreno"
            }

            document.querySelector('[class="fieldSubmit hyper-btn"]').click()
        })

        //Guardado Final
        await page.waitForTimeout(1000);
        await page.evaluate(() => {
            document.querySelector('[class="fieldSubmit hyper-btn"]').click()
        })

        //Hacemos click en salir
        await page.waitForTimeout(500);
        await page?.click('[class="close__icon-container"]');

        //Hacemos un test Manual
        await page.waitForTimeout(500);
        await page?.click("#test3");



        //Hacemos un run Manual
        await page.waitForTimeout(2560);
        await page?.click('#run3');


        await page.close();

    }

    await browser.close();
})();
