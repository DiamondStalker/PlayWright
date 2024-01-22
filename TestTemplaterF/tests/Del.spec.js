const { test, expect } = require('@playwright/test');
const fs = require('fs');
const File = require('../components/file');
//const links = require('../Read/links.json');

const links = require('../Read/dellote.json');
const { stringify } = require('querystring');
//const links = require('../Read/test.json');


//const codes = require('../Read/config');

const miObjetoConFunciones = {
    extract: async function (page, global) { // Añadimos 'page' como parámetro

        global = await page.evaluate(async (global) => {

            let out = {};

            let pass_it = { ...global.pass_it }

            out.pass_it = pass_it?.offSet ?
                pass_it : {
                    offSet: 1,
                    limit: 0,
                    jobsCount: 0
                }

            out.msg = [];

            out.msg.push({valorGlobal:pass_it});

            try {
                let jobsTemp = [];
                let jobs = [];
                let resp = await fetch(`https://job.deloitte.com/search?search=&results_pp=10&page=${out.pass_it.offSet}`, {
                    "headers": {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                        "accept-language": "es-ES,es;q=0.9,en;q=0.8",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1"
                    },
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "body": null,
                    "method": "GET",
                    "mode": "cors",
                    "credentials": "include"
                });

                const stringToHTML = (str) => new DOMParser().parseFromString(str, 'text/html').body;

                //Texto
                let data = await resp.text();
                const doc = stringToHTML(data);
                let htmlJobs = doc.querySelectorAll('ul[class*="job-list"] li[class*="list-item-wrapper"]');

                out.msg.push({htmlJobsResult:Array.from(htmlJobs)});

                if (out.pass_it.limit == 0)
                    out.pass_it.limit = doc.querySelector('li[class*="page-item"]:last-child').previousElementSibling.textContent.match(/[0-9]/g, '').join('').trim();


                htmlJobs.forEach(elem => {
                    jobsTemp.push({
                        reqid: elem.querySelector('a').href.split('-_').pop().trim(),
                        title: elem.querySelector('h4').textContent.trim(),
                        url: elem.querySelector('a').href.trim()
                    })
                })

                await Promise.allSettled(jobsTemp.map(async (job) => {
                    const resp2 = await fetch(job.url, {
                        "headers": {
                            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                            "accept-language": "en-GB,en;q=0.9,es-CO;q=0.8,es;q=0.7",
                            "upgrade-insecure-requests": "1"
                        },
                        "body": null,
                        "method": "GET",
                        "mode": "cors",
                        "credentials": "include"
                    });
                    const data2 = await resp2.text();

                    let doc2 = stringToHTML(data2);

                    let full_html = doc2.querySelector('div[id="content"]');

                    ["a", "script", "i", "img", "style", "button", "figure", "noscript",
                        "svg", "form", "input", "iframe", "link"
                    ].forEach(selector => {
                        full_html.querySelectorAll(selector).forEach(x => {
                            x.remove()
                        })
                    })

                    job.html = full_html.innerHTML.trim();

                    //job.html = removeTextBefore(job.html, '', false);
                    //job.html = removeTextAfter(job.html, //, true);

                    job.html = cleanHTML(job.html);
                    let tmp = document.createElement('div');
                    tmp.innerHTML = job.html;
                    job.jobdesc = tmp.textContent.trim();

                    doc2.querySelectorAll('div[class="sidebar-item-data"]').forEach(a => {
                        const dataKey = a.querySelector('div[class="data-key"]').textContent;
                        const dataValue = a.querySelector('div[class="data-value"]')?.textContent.trim();

                        if (/Job-Id/ig.test(dataKey)) {
                            job.reqid = dataValue;
                        } else if (/Standort/ig.test(dataKey)) {
                            job.source_location = dataValue;
                        } else if (/Jobart/ig.test(dataKey)) {
                            job.source_jobtype = dataValue;
                        }
                    });

                    job.dateposted_raw = new Date(doc2.querySelector('[itemprop="datePosted"]')?.content)?.toLocaleDateString()
                    //job.source_empname = doc2.querySelector('[itemprop="hiringOrganization"] [itemprop="name"]')?.content
                    //job.logo = doc2.querySelector('[itemprop="hiringOrganization"] [itemprop="logo"]')?.content

                    job.experience_required = "";
                    job.experience_required += doc2.querySelector('[itemprop="experienceRequirements"]')?.textContent.trim()
                    if (job.experience_required == '') job.experience_required = undefined;


                    job.temp = "001";

                    if (/,/gmi.test(job.source_location)) {
                        job.source_location.split(',')
                            .forEach(temploc => {
                                jobs.push({
                                    ...job,
                                    location: temploc.trim()
                                })
                            })
                    } else {
                        jobs.push({
                            ...job,
                            location: job.source_location.trim()
                        })
                    }

                }));


                out["jobs"] = jobs;
            } catch (err) {
                throw err;
            }
            return out;
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

    var Resultados = [];


    for (const elem of links) {
        elem.isValid = false;

        test(`Test for ${elem.id} Enlace  \n ${elem.url}`, async ({ page }) => {

            try {
                await page.goto(elem.url);


                let global = { pass_it: {}, has_next_page: false, link: elem.url };

                let jobs = [];

                do {

                    // Ejecutar la función extract del objeto miObjetoConFunciones
                    global = await miObjetoConFunciones.extract(page, global); // Pasamos 'page' como parámetro

                    console.log(`Cantidad de jobs ==> ${global.jobs.length}`);
                    console.log(`Valor del extract es ==> XX  XX`);
                    console.log(global.msg)


                    jobs.push(global.jobs);
                    jobs = jobs.flat();

                    //global = await miObjetoConFunciones.pagination(page, global);
                    global.has_next_page = false // Forzamos a que no pagine
                } while (global.has_next_page != false);

                console.log(jobs)

                if (jobs.length > 0) {
                    console.log("Jobs extraidos de forma correcta");
                    console.log(`Total de jobs extraidos => ${jobs.length}`);
                    elem.isValid = true
                }
                await Resultados.push(elem);
                await expect(jobs.length).toBeGreaterThan(0);

            } catch (error) {
                //await Resultados.push(elem);
                //console.error (`Se esperaba información en el link ${elem.url}, pero se obtuvo un valor igual a 0`);
                //console.error("Error details:", error.message, error.stack);
                throw ("Se esperaba información en el link ${elem.url}, pero se obtuvo un valor igual a 0")
            } finally {
                // Independientemente de si hubo un error o no, registra el elemento en Resultados
                Resultados.push(elem);
                // Espera a que File.update sea completado si es asíncrono
                await File.update(Resultados);
            }

            await File.update(Resultados);

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


