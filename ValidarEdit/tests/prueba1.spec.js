//@ts-check

const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const chromeProfilePath = "C://Users//mate9//AppData//Local//Google//Chrome//User Data//Default";
const chromeExecutablePath = "C://Users//mate9//AppData//Local//Google//Chrome//Application//chrome.exe";
const idS = require("../src/data.json");

test.use({
    browserName: 'chromium',
    channel: 'chrome',
    video: 'on', // Grabará un video siempre
});

// Creamos el directorio para videos si no existe
const videosDir = path.join(__dirname, '../videos/');
if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir);
}

test.describe('Pruebas en Chrome con perfil específico', () => {
    for (let id of idS) {
        test(`Test for ${id}`, async () => {
            const browser = await chromium.launchPersistentContext(chromeProfilePath, { executablePath: chromeExecutablePath });
            const page = await browser.newPage();

            await page.goto(`https://talent.com/private/tools/jobs/pageCompanyView.php?id=${id}`);
            await page.click('[class="hyper-btn hyper-btn--mobile-cta"]');
            await page.waitForTimeout(1500);
            await page.click('[class="choice"]');
            await page.waitForTimeout(1500);

            try {
                await expect(page.locator('[id="tab-edit"]')).toBeVisible();
            } catch (error) {
                throw new Error('El campo de edit no se está mostrando o cargando como debería ser.');
            }

            await browser.close();
        });
    }
});
