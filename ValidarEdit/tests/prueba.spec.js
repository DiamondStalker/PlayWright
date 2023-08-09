//@ts-check

const { test, expect, chromium } = require('@playwright/test');
const chromeProfilePath = "C:/Users/mate9/AppData/Local/Google/Chrome/User" || "C:/Users/Talent/AppData/Local/Google/Chrome/User Data/Default";
const chromeExecutablePath = "C:/Users/mate9/AppData/Local/Google/Chrome/Application/chrome.exe" || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const idS = require("../src/data.json");

test.describe('Pruebas en Chrome con perfil específico', () => {
    for (let id of idS) {
        test(`Test for ${id}`, async ({ page }) => {
            await page.goto(`https://talent.com/private/tools/jobs/pageCompanyView.php?id=${id}`);
            await page.click('[class="hyper-btn hyper-btn--mobile-cta"]');
            await page.waitForTimeout(1500);
            await page.click('[class="choice"]');
            await page.waitForTimeout(3000);

            try {
                await expect(page.locator('[id="tab-edit"]')).toBeVisible();
            } catch (error) {
                const screenshotPath = `error_screenshot_${id}.png`;
                await page.screenshot({ path: screenshotPath });
                throw new Error(`El campo de edit no se está mostrando o cargando como debería ser. Se capturó una imagen: ${screenshotPath}`);
            }
        }, { video: 'retain-on-failure'}); // Habilitar la grabación de video solo en caso de falla
    }
});
