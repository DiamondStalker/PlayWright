const { test } = require('@playwright/test');
const links = require('../Read/Gupy.json');
const gupyFunctions = require('../Templates/Gupy_Extract')

const miObjetoConFunciones = {
    extract: async function (page, global) { // Añadimos 'page' como parámetro

        global = await page.evaluate(async (global) => {

            let pass_it = { ...global.pass_it };
            const extractedData = gupyFunctions();
            console.log(extractedData);

        }, global)

        return global;
    },
    pagination: async function (page, global) {
        global = await page.evaluate(async (global) => {
            var out = {};
            out["pass_it"] = global.pass_it;
            out.pass_it.offset += 1;
            out["has_next_page"] = true;

            if (out.pass_it["jobs_per_page"] < out.pass_it["jobs_count"]) {
                out["has_next_page"] = false;
            }
            if (out.pass_it["limit"] > 0)
                if (out.pass_it["offset"] > out.pass_it["limit"]) {
                    out["has_next_page"] = false;
                }

            //msg('\x1b[36m ------- ALL MESSAGES MUST BE COMMENTED ON WHEN SCANID IS IN PROD ----------');
            //msg(out.pass_it);

            /* ----------------- Multilink Logic added -------------------- */
            if (!out["has_next_page"]) {
                if (out.pass_it.multi_link.length > 0) {
                    var url = out["pass_it"].multi_link.shift();
                    window.location.assign(url);
                    out["has_next_page"] = true;

                    // Reset of variables to control pagination
                    out["pass_it"].limit = 0;
                    out["pass_it"].offset = 0;
                    out["pass_it"].jobs_per_page = 0;

                    out["wait"] = true;
                    return out;
                } else {
                    out["has_next_page"] = false;
                }
            }

            out["wait"] = false;
            return out;
        }, global);
        return global;
    }
};



async function runTests() {
    for (const elem of links) {
        test(`Test Scanid => ${elem.id}; \n Url => ${elem.url}`, async ({ page }) => {

            await page.goto(elem.url);

            let global = { pass_it: {}, has_next_page: false, link: elem.url };

            let jobs = [];

            do {
                // Ejecutamos el Extract
                //global = await miObjetoConFunciones.extract(page, global);

                global = gupyFunctions()

                console.log("Resultado")
                console.log(gupyFunctions())

                // Guardamos los jobs en una variable global
                jobs.push(global.jobs)
                jobs = jobs.flat();


            } while (global.has_next_page);

            if (jobs.length == 1 && /No Tiene Jobs|Ghost/gmi.test(jobs[0].title)) { test.skip("La pagina tiene 0 jobs"); return; }
            else if (jobs.length > 0) {
                test.expect(true);
                console.log(jobs);
                test.info().annotations.push({
                    type: 'issue',
                    description: "jobs",
                });
            } else {
                test.expect(false);
                test.info().annotations.push({
                    type: 'issue',
                    description: `El codigo Fallo y no logro extraer jobs de la pagina con el codigo presentado`,
                });
            }

        });
    }
}

(async () => {
    try {
        // Iniciar las pruebas
        await runTests();
    } catch (error) {
        console.error(error);
    }
})();


