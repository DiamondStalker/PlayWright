const { test } = require('@playwright/test');
const fs = require('fs');
const File = require('../components/file');
//const links = require('../Read/links.json');

const links = require('../Read/BR.json');
//const links = require('../Read/test.json');


//const codes = require('../Read/config');

const miObjetoConFunciones = {
    extract: async function (page, global) { // Añadimos 'page' como parámetro

        global = await page.evaluate(async (global) => {

            let pass_it = { ...global.pass_it };

            let out = {};
            if (typeof pass_it == "undefined") pass_it = {};
            if (!pass_it["page"]) {
                out["pass_it"] = {
                    "page": 1,
                    "jobs": 0,
                    "totalJobs": 0
                };
            } else {
                out["pass_it"] = pass_it;
            }
            try {
                let jobs = [];

                const resp = await fetch(`${window.location.origin}/TgNewUI/Search/Ajax/ProcessSortAndShowMoreJobs`, {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "content-type": "application/json;charset=UTF-8",
                    },
                    "body": JSON.stringify({ "partnerId": new URL(window.location.href).searchParams.get('partnerid'), "siteId": new URL(window.location.href).searchParams.get('siteid'), "keyword": "", "location": "", "keywordCustomSolrFields": "JobTitle,FORMTEXT1,FORMTEXT23,FORMTEXT3,FORMTEXT4", "locationCustomSolrFields": "FORMTEXT1,FORMTEXT3", "linkId": "", "Latitude": 0, "Longitude": 0, "facetfilterfields": { "Facet": [] }, "powersearchoptions": { "PowerSearchOption": [] }, "SortType": "LastUpdated", "pageNumber": out.pass_it.page, "encryptedSessionValue": document.querySelector("#CookieValue").value }),
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });
                const data = await resp.json(); // The response.json() method parses the response as JSON and returns a promise. if request not return a JSON necessary change to 'resp.text()'
                // msg(data);
                // Job data
                const json_jobs = data.Jobs.Job;
                out["pass_it"]["jobs"] = data.JobsCount; // stop condition
                out["pass_it"]["totalJobs"] += json_jobs.length; // all jobs
                for (i in json_jobs) {
                    let job = {}; /*init*/
                    let elem = json_jobs[i];
                    job.title = elem.Questions.find(element => element.QuestionName === "jobtitle").Value;
                    job.source_location = elem.Questions.find(element => element.QuestionName === `${"Change_to_the_correct_variable"}`)?.Value
                    job.location = elem.Questions.find(element => element.QuestionName === `${"Change_to_the_correct_variable"}`)?.Value

                    job.url = elem.Link;
                    job.reqid = elem.Questions.find(element => element.QuestionName === "reqid") ? elem.Questions.find(element => element.QuestionName === "reqid").Value : elem.Questions.find(element => element.QuestionName === "autoreq").Value;
                    //job.street_location = elem.positionOfstreet_location;
                    job.dateposted_raw = elem.Questions.find(element => element.QuestionName === "formdate2") ? new Date(elem.Questions.find(element => element.QuestionName === "formdate2").Value).toLocaleDateString("US-en", { year: "numeric", month: "2-digit", day: "2-digit", }) : new Date(elem.Questions.find(element => element.QuestionName === "lastupdated").Value).toLocaleDateString("US-en", { year: "numeric", month: "2-digit", day: "2-digit", });
                    //job.dateclosed_raw = elem.positionOf.dateposted_raw;
                    //job.logo = elem.positionOflogo;
                    //job.source_apply_email = elem.positionOfemail;
                    //job.source_empname = elem.positionOfempname;
                    //job.source_jobtype = elem.positionOfJobtype;
                    //job.source_salary = elem.positionOfsalary;
                    job.temp = "1";
                    jobs.push(job);
                }
                await Promise.all(jobs.map(async job => {
                    let link = new URL(job.url);
                    let request = await fetch(`${link.origin}/TgNewUI/Search/Ajax/JobDetails`, {
                        "headers": {
                            "accept": "application/json, text/plain, */*",
                            "content-type": "application/json;2 echarset=UTF-8",
                        },
                        "body": JSON.stringify({ "partnerId": link.searchParams.get('partnerid'), "siteId": link.searchParams.get('siteid'), "jobid": link.searchParams.get('jobid'), "configMode": "", "jobSiteId": link.searchParams.get('siteid'), "turnOffHttps": false }),
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                    let response = await request.json();
                    if (job.location == "" || job.location == undefined) {
                        job.source_location = [response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/City/gi) > -1)?.AnswerValue, response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Region|State|Province/gi) > -1)?.AnswerValue, response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Country/gi) > -1)?.AnswerValue].filter(Boolean).join(", ").trim();
                        job.location = [response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/City/gi) > -1)?.AnswerValue, response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Region|State|Province/gi) > -1)?.AnswerValue, response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Country/gi) > -1)?.AnswerValue].filter(Boolean).join(", ").trim();
                    }
                    job.source_salary = response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Pay Range/gi) > -1)?.AnswerValue;
                    job.source_benefit = response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Benefit/gi) > -1)?.AnswerValue;
                    job.experience_required = response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Experience/gi) > -1)?.AnswerValue;
                    job.source_jobtype = response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName.search(/Employment Type|Employment Status|Job Type|Position Type|Employment/gi) > -1)?.AnswerValue;
                    if (response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.VerityZone === "dateclosed")) job.dateclosed_raw = new Date(response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.VerityZone === "dateclosed")?.AnswerValue).toLocaleDateString("US-en", { year: "numeric", month: "2-digit", day: "2-digit", });
                    //job.source_empname = response.ServiceResponse.partnername;
                    job.html = response.ServiceResponse.Jobdetails.JobDetailQuestions.find(element => element.QuestionName === "Job Posting" || element.QuestionName === "Job Summary" || element.VerityZone === "jobdescription").AnswerValue;
                    //job.html = removeTextBefore(job.html, 'Summary of Job Duties', false);
                    //job.html = removeTextAfter(job.html, 'Application Instructions', true);
                    //job.html = cleanHTML(job.html);
                    var tmp = document.createElement('div');
                    tmp.innerHTML = job.html;
                    job.jobdesc = tmp.textContent.trim();
                    //job.jobdesc = cleanHTML(job.jobdesc);

                    if (job.location.trim() == "") job.location = undefined
                }))

                if (document.querySelector('[class*="tainerNoJobs"]')) jobs.push({ title: "No Tiene Jobs" })

                out["jobs"] = jobs;
                return out;
            } catch (err) {
                throw err;
                // handle errors with fetch petion here
                //console.log(err)
            }
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

                // Esperar a que la página esté completamente cargada
                //await page.waitForLoadState('networkidle');

                let global = { pass_it: {}, has_next_page: false, link: elem.url };

                let jobs = [];

                do {

                    // Ejecutar la función extract del objeto miObjetoConFunciones
                    global = await miObjetoConFunciones.extract(page, global); // Pasamos 'page' como parámetro

                    console.log(`Cantidad de jobs ==> ${global.jobs.length}`);
                    jobs.push(global.jobs);
                    jobs = jobs.flat();

                    //global = await miObjetoConFunciones.pagination(page, global);
                    global.has_next_page = false // Forzamos a que no pagine
                } while (global.has_next_page != false);

                console.log('Informacion de la locacion=>')
                console.log(jobs[0].title)

                if (jobs.length > 0) {
                    console.log("Jobs extraidos de forma correcta");
                    console.log(`Total de jobs extraidos => ${jobs.length}`);
                    elem.isValid = true
                }

                await Resultados.push(elem);

                //await expect(jobs.length).toBeGreaterThan(0); // Validar si no retorna jobs

                test.skip("La saltamos");

                return;

            } catch (error) {
                //await Resultados.push(elem);
                //console.error (`Se esperaba información en el link ${elem.url}, pero se obtuvo un valor igual a 0`);
                //console.error("Error details:", error.message, error.stack);
                throw ("Se esperaba un valor en el campo location")
                //throw ("Se esperaba información en el link ${elem.url}, pero se obtuvo un valor igual a 0")
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


