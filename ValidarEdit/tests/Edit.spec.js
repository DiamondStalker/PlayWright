
//@ts-check

const { test, expect, chromium } = require('@playwright/test');
const chromeProfilePath = "C:/Users/mate9/AppData/Local/Google/Chrome/User" || "C:/Users/Talent/AppData/Local/Google/Chrome/User Data/Default";
//const chromeExecutablePath = "C:/Users/mate9/AppData/Local/Google/Chrome/Application/chrome.exe" || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromeExecutablePath = "C://Users//mate9//AppData//Local//Google//Chrome//Application//chrome.exe";
const idS = require("../src/data.json");

test.use({
    browserName: 'chromium',
    video: 'on', // Grabará un video siempre
});


test.describe('Pruebas en Chrome con perfil específico', () => {
    for (let id of idS) {


        test(`Test for ${id}`, async () => {
            const browser = await chromium.launchPersistentContext(chromeProfilePath, { executablePath: chromeExecutablePath });

            // @ts-ignore
            const page = await browser.newPage({
                recordVideo: {
                    dir: 'videos/', // Ruta donde se guardarán los videos.
                    size: { width: 800, height: 600 }, // Tamaño del video.
                    crf: 23, // Factor de calidad de video (rango de 0 a 63, valor predeterminado: 23).
                }
            });
            await page.goto(`https://talent.com/private/tools/jobs/pageCompanyView.php?id=${id}`);
            await page.click('[class="hyper-btn hyper-btn--mobile-cta"]');
            await page.waitForTimeout(1500);
            await page.click('[class="choice"]');
            await page.waitForTimeout(1500);

            try {
                await expect(page.locator('[id="tab-edit"]')).toBeVisible();
            } catch (error) {
                throw (`El campo de edit no se está mostrando o cargando como debería ser.`);
            }
            browser.close();
        })
    }

});
