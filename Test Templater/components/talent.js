// const { test, expected } = require('@playwrigth/test');

// const Talent = {
//     async test(list) {

//     },
// };

// module.exports = Talent;


const { test, expect } = require('@playwright/test');
const playwright = require('@playwright/core');

module.exports = {
    test: async ({ page }) => {
        await page.goto('https://example.com');
        const title = await page.title();
        expect(title).toBe('Ejemplo'); // Verifica que el título de la página sea "Ejemplo"
    }
};