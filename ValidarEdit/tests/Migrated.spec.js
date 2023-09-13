
//@ts-check
const fs = require("node:fs/promises");
const { test, expect, chromium } = require('@playwright/test');

const chromeProfilePath = "C:/Users/mate9/AppData/Local/Google/Chrome/User" || "C:/Users/Talent/AppData/Local/Google/Chrome/User Data/Default";
//const chromeProfilePath = "C:/Users/Talent/AppData/Local/Google/Chrome/User Data/Default";

//const chromeExecutablePath = "C://Program Files//Google//Chrome//Application//chrome.exe";
const chromeExecutablePath = "C://Users//mate9//AppData//Local//Google//Chrome//Application//chrome.exe";

const idS = require("../src/casesMigrated.json");

const migrated = require("../src/prueba.json");


test.use({
    browserName: 'chromium',
    video: 'on', // Grabará un video siempre
});

/*

test.describe('Pruebas en Chrome con perfil específico', () => {
    let results = [];

    for (let id of idS) {

        test(`Test for ${id.scanid}`, async () => {
            const browser = await chromium.launchPersistentContext(chromeProfilePath, { executablePath: chromeExecutablePath });

            // @ts-ignore
            const page = await browser.newPage({
                recordVideo: {
                    dir: 'videos/', // Ruta donde se guardarán los videos.
                    size: { width: 800, height: 600 }, // Tamaño del video.
                    crf: 23, // Factor de calidad de video (rango de 0 a 63, valor predeterminado: 23).
                }
            });
            await page.goto(`https://www.talent.com/private/tools/content/scraper/spiderCodeTool.php?scanid=${id.scanid}`);
            await page.click('[id="btn-spider-info"]');
            await page.waitForTimeout(1500);

            let url = await page.evaluate(async () => {
                let url = document.querySelector('[placeholder="jobSite"]')?.value
                if (/\/jobs/gmi.test(url)) return `${url}.rss`
                else return ""
            });

            await page.waitForTimeout(1500);

            results.push({
                "scanid": id.scanid,
                "url": url
            });

            await fs.appendFile('./src/Resultado.json', JSON.stringify(results, null, 2));


            try {
                await expect(page.locator('[id="tab-edit"]')).toBeVisible();
            } catch (error) {
                throw (`El campo de edit no se está mostrando o cargando como debería ser.`);
            }
            browser.close();
        })
    }

});
*/

test.describe('Pruebas en Chrome con perfil específico', () => {
    let results = [];

    for (let id of migrated) {

        if (typeof id.url == "string" && id.url != "Not_Applicable") {
            test(`Test for ${id.scanid}`, async () => {
                const browser = await chromium.launchPersistentContext(chromeProfilePath, { executablePath: chromeExecutablePath });

                // @ts-ignore
                const page = await browser.newPage({
                    recordVideo: {
                        dir: 'videos/', // Ruta donde se guardarán los videos.
                        size: { width: 800, height: 600 }, // Tamaño del video.
                        crf: 23, // Factor de calidad de video (rango de 0 a 63, valor predeterminado: 23).
                    }
                });
                await page.goto(`https://www.talent.com/private/tools/content/scraper/spiderCodeTool.php?scanid=${id.scanid}`);
                await page.click('[id="btn-spider-info"]');
                await page.waitForTimeout(1500);

                await page.evaluate(async (id) => {
                    // @ts-ignore
                    document.querySelector('[name="jobSite"]').value = id.url
                }, id);

                await page.waitForTimeout(1500);

                await page.click('[class="fieldSubmit hyper-btn"]');

                const exists = await page.$('#tab-info > form > div.fieldResponse > div');
                const alert = await exists?.textContent();

                await page.waitForTimeout(500).then(() => { console.log("Validacion guardar ---> Medio Seg") })
                // @ts-ignore
                if (exists && !/Spider updated/gmi.test(alert)) {
                    // Selecciona el elemento 'select' por su nombre y establece el valor en 'carlos.moreno'
                    await page.selectOption('select[name="owner"]', 'carlos.moreno');

                    // Haz clic en el botón correspondiente al formulario
                    await page.click('button[type="submit"]'); // Ajusta el selector según tu HTML
                }

                await page.waitForTimeout(1500);

                try {
                    await expect(page.locator('[class="card card--success"]')).toBeVisible();
                } catch (error) {
                    throw (`El campo de edit no se está mostrando o cargando como debería ser.`);
                }
                browser.close();
            })
        }
    }

});