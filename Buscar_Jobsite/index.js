
/* -------------------------------------------------------------------------- */
/*                                   IMPORTS                                  */
/* -------------------------------------------------------------------------- */

const { chromium } = require("playwright");
const csv = require('csv-parser');
const inquirer = require("inquirer");
const XlsxPopulate = require('xlsx-populate');
const fs = require("fs").promises;
const fs2 = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const translate = require('translate-google');

const axios = require('axios');
const cheerio = require('cheerio');


/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */

const { chatGPT, Routes, user_data } = require('./config.json');

const usuario = user_data.user



const prompt = inquirer.createPromptModule();
const stringToHTML = (str) => new DOMParser().parseFromString(str, 'text/html').body;
const configuration = new Configuration({
    apiKey: chatGPT,
});

let ruteRead;
let fileRead;
let list

/* -------------------------------------------------------------------------- */
/*                                  Main Code                                 */
/* -------------------------------------------------------------------------- */

(async () => {
    ruteRead = await fs.readdir(Routes.Excel);

    await selectFile();
    await createTempList();

    await traverseList()

})()

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */


//SECTION  Functions

//NOTE - selectFile

/**
 * What this function allows you to do is select the 
 * file you want to work with, if there are no files, 
 * the execution will stop completely.
 */
async function selectFile() {

    if (ruteRead.length > 0) {
        const answer = await prompt([
            {
                type: "list",
                name: "Entry",
                message:
                    "\x1b[32m ********** \n Selecciona el archivo que quires leer\x1b[0m",
                choices: ruteRead
            },
        ]);

        fileRead = answer.Entry
    } else {
        console.log(`${"\x1b[31m"}--------------------------------------------------\n La caperta Companies no tiene archivos por leer \n--------------------------------------------------${"\x1b[0m"}`)
        process.exit()
    }
}

//NOTE - createTempList
/**
 * Creates a temporary list based on the provided file.
 * This function reads a CSV file, extracts the necessary data, and creates a temporary list in JSON format.
 * It supports CSV files only and saves the resulting list to a "continue_list.json" file.
 * If the file format is not supported or an error occurs during the process, an appropriate message is logged.
 *
 * @returns {Promise<void>} A promise that resolves when the temporary list creation is complete.
 */
async function createTempList() {
    if (/\.json/.test(fileRead)) {
        // console.log(`${"\x1b[31m"}--------------------------------------------------\n Aun no disponible \n--------------------------------------------------${"\x1b[0m"}`)
        // process.exit()
        list = JSON.parse(await fs.readFile(`${Routes.Excel}/${fileRead}`, "utf8"));

    } else if (/\.csv/.test(fileRead)) {

        list = [];

        let results = [];
        let headers;

        try {
            const stream = fs2.createReadStream(`${Routes.Excel}/${fileRead}`, 'utf8');

            const csvStream = stream.pipe(csv({
                headers: false,
            }));

            csvStream.on('data', (row) => {
                results.push(row);
            });

            csvStream.on('end', () => {
                results.slice(0, 1).forEach(elem => {
                    headers = elem;
                });
            });

            await new Promise((resolve, reject) => {
                csvStream.on('end', resolve);
                csvStream.on('error', reject);
            });


            results.slice(1, results.length).map(data => {
                let tempData = {
                    id: data[Object.keys(headers).find(key => /id/.test(headers[key]))],
                    company_name: data[Object.keys(headers).find(key => /company/.test(headers[key]))],
                    home_page: data[Object.keys(headers).find(key => /website/.test(headers[key]))],
                    status: data[Object.keys(headers).find(key => /status/.test(headers[key]))],
                    headcount_real: data[Object.keys(headers).find(key => /headcount_real/.test(headers[key]))],
                }
                list.push(tempData)
            })

            fs.writeFile(`${Routes.Excel}/continue_list.json`, JSON.stringify(list, null, 2))

        } catch (error) {
            console.error('Error al leer el archivo CSV:', error);
        }


    }
    else {
        console.log(`${"\x1b[31m"}--------------------------------------------------\n Archivo seleccionado no permitido \n--------------------------------------------------${"\x1b[0m"}`)
        process.exit()
    }
}

//NOTE - traverseList


async function traverseList() {

    let global = { pass_it: { iterance: 5 } };

    const listLength = list.length;
    const totalPages = Math.ceil(listLength / global.pass_it.iterance);

    //const boxWidth = Math.ceil(listLength / global.pass_it.iterance);
    const boxWidth = Math.min(Math.ceil(listLength / global.pass_it.iterance), 200);
    const startTime = performance.now();

    const boxChar = '▉';
    let page = 1;

    do {
        global = await extract(global);
        global = await pagination(global);

        // const progress = Math.ceil((page / totalPages) * boxWidth);
        // const remaining = boxWidth - progress;

        // const progressBar = `${'\u001b[32m'}${boxChar.repeat(progress)}${'\u001b[0m'}${' '.repeat(remaining)}`;

        const progress = Math.ceil((page / totalPages) * boxWidth);
        const remaining = boxWidth - progress;
        const percentCompleted = Math.floor((page / totalPages) * 100);

        //const progressBar = `${'\u001b[32m'}${boxChar.repeat(progress)} ${percentCompleted}%${' '.repeat(remaining - String(percentCompleted).length - 1)}${'\u001b[0m'}`;
        const progressBar = `${'\u001b[32m'}${boxChar.repeat(progress)} ${percentCompleted}%${' '.repeat(Math.max(remaining - String(percentCompleted).length - 1, 0))}${'\u001b[0m'}`;

        const pageLabel = `${'\u001b[31m'}Page ${page}${'\u001b[0m'}`;
        console.clear();
        console.log(`[${progressBar}] ${pageLabel}`);
        page++;
    } while (global.has_next_page);

    console.log(convertirTiempo(Math.abs(startTime - performance.now())))
}
//NOTE - Convertir Tiempo
/**
 * 
 * @param {Float} milisegundos Valor numerico tipo float que representa los milisegundos
 * @returns {Object} Object de los valores convertidos de Milisegundos a Hora,Minuto,Segundos y los propios Milisegundos
 */
function convertirTiempo(milisegundos) {
    const segundosTotales = Math.floor(milisegundos / 1000);
    const minutosTotales = Math.floor(segundosTotales / 60);
    const horasTotales = Math.floor(minutosTotales / 60);

    const milisegundosRestantes = milisegundos % 1000;
    const segundos = segundosTotales % 60;
    const minutos = minutosTotales % 60;
    const horas = horasTotales % 24;

    const tiempo = {
        horas: horas,
        minutos: minutos,
        segundos: segundos,
        milisegundos: milisegundosRestantes
    };

    return tiempo;
}


async function extract(global) {

    let out = {};
    out.pass_it = global.pass_it["iterance"] ? global.pass_it : {
        iterance: 5
    }


    console.log(`${"\x1b[45m"} Tamano de la lista ==> ${list.length} ${"\x1b[0m"}`);


    let tempListData = [];

    for (let i = 0; i < out.pass_it.iterance; i++) {
        tempListData.push(list.shift())
    }

    fs.writeFile(`${Routes.Excel}/continue_list.json`, JSON.stringify(list, null, 2))

    // const browser = await chromium.launch({
    //     headless: false,
    //     args: ["--incognito"],
    // });
    // const context = await browser.newContext();



    //     await Promise.allSettled(tempListData.map(async (elem) => {


    //         const page = await context.newPage();

    //         await page.goto(elem.home_page, { waitUntil: 'domcontentloaded' })


    //         let regexLinkJobsite = /(jobs|careers|work|employment|opportunities|join us|vacancies|job board|job site|hiring|job opportunities)/gmi

    //         const pageLanguage = await page.evaluate(() => {
    //             return document.documentElement.lang;
    //         });

    //         console.log(pageLanguage)


    //         await page.close()

    //     }))

    //    await  browser.close()


    await Promise.allSettled(tempListData.map(async (elem) => {

        // try {
        //     const response = await axios.get(elem.home_page);
        //     const html = response.data;
        //     const $ = cheerio.load(html);

        //     const lang = $('html').attr('lang') || $('html').attr('xml:lang');

        //     const hasJobLinks = await checkForJobLinks($, lang || 'en');

        //     console.log(`URL: ${elem.home_page}`);
        //     console.log(`Language declared in HTML: ${lang || 'Unknown'}`);
        //     console.log(`Has job links: ${hasJobLinks}`);
        //     console.log('-------------------------');

        //     await addDataToFile({ ...elem, links: hasJobLinks.join('\n'), withJobs: hasJobLinks.length > 0 }, Routes.Result)

        // } catch (error) {
        //      console.error(`Error analyzing ${elem.home_page}:`, error.message);
        //     const page = await context.newPage();

        //     await page.goto(elem.home_page, { waitUntil: 'domcontentloaded' })

        //     const pageLanguage = await newPage.evaluate(() => {
        //         return document.documentElement.lang;
        //     });

        //     console.log(`El idioma de la página es: ${pageLanguage}`);

        //     let regexLinkJobsite = /(jobs|careers|work|employment|opportunities|join us|vacancies|job board|job site|hiring|job opportunities)/gmi

        //     if (pageLanguage.split('-').shift() != 'en') {

        //         console.log("IDIOAM DIFERENTE DE EN")
        //         await translate(`${regexLinkJobsite}`, { from: 'en', to: pageLanguage.split('-').shift() }).then(res => {
        //             console.log(res.replace(/ \| /mg, '|').replace(' (', '(').replace(') ', ')'))
        //             regexLinkJobsite = res.replace(/ \| /mg, '|').replace(' (', '(').replace(') ', ')').replace('/ GIM', '/gmi')
        //         }).catch(err => {
        //             console.error(err)
        //         })

        //     }


        //     const elements = await page.evaluate((regex) => {
        //         let data = [...document.querySelectorAll('a')].filter((x) => regex.test(x.textContent.trim()));
        //         //data = data.filter(x => regex.test(x))
        //         return data.map((elem) => elem.href.trim());
        //     }, regexLinkJobsite);

        //     console.log(elements)
        //     await page.close()
        // }


        try {
            const response = await axios.get(elem.home_page);
            const html = response.data;
            const $ = cheerio.load(html);

            const lang = $('html').attr('lang') || $('html').attr('xml:lang');

            const hasJobLinks = await checkForJobLinks($, lang || 'en');

            // console.log(`URL: ${elem.home_page}`);
            // console.log(`Language declared in HTML: ${lang || 'Unknown'}`);
            // console.log(`Has job links: ${hasJobLinks}`);
            // console.log('-------------------------');

            await addDataToFile({ ...elem, links: hasJobLinks.join('\n'), withJobs: hasJobLinks.length > 0 }, Routes.Result);

        } catch (error) {
            //console.error(`Error analyzing ${elem.home_page}:`, error.message);
            await handleCatch(elem);
        }
    }))

    //await browser.close()
    return out
}

// async function handleCatch(elem) {
//     const browser = await chromium.launch({
//         headless: false,
//         args: ["--incognito"],
//     });
//     const context = await browser.newContext();
//     const page = await context.newPage();

//     try {
//         await page.goto(elem.home_page/*, { waitUntil: 'domcontentloaded' }*/);
//         await page.waitForLoadState('domcontentloaded', { timeout: 20000 });


//         const pageLanguage = await page.evaluate(() => {
//             return document.documentElement.lang;
//         });

//         //console.log(`El idioma de la página es: ${pageLanguage}`);

//         let regexLinkJobsite = /(jobs|careers|work|employment|opportunities|join us|vacancies|job board|job site|hiring|job opportunities)/gmi;

//         if (pageLanguage.split('-').shift().toLocaleLowerCase() != 'en') {

//             const translation = await translate(`${regexLinkJobsite}`, { from: 'en', to: pageLanguage.split('-').shift() });
//             console.log(translation.replace(/ \| /mg, '|').replace(' (', '(').replace(') ', ')'));
//             regexLinkJobsite = new RegExp(translation.replace(/ \| /mg, '|').replace(' (', '(').replace(') ', ')').replace('/ GIM', '/gmi'));
//         }

//         const elements = await page.evaluate((regex) => {
//             let data = [...document.querySelectorAll('a')].filter((x) => regex.test(x.textContent.trim()));
//             return data.map((elem) => elem.href.trim());
//         }, regexLinkJobsite);

//         await addDataToFile({ ...elem, links: elements.join('\n'), withJobs: elements.length > 0 }, Routes.Result);

//     } catch (error) {
//         console.error(`Error analyzing ${elem.home_page}:`, error.message);
//     } finally {
//         await page.close();
//         await context.close();
//         await browser.close();
//     }
// }

async function handleCatch(elem) {
    const browser = await chromium.launch({
        headless: false,
        args: ["--incognito"],
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(elem.home_page);
        await page.waitForLoadState('domcontentloaded', { timeout: 5000 });

        const pageLanguage = await page.evaluate(() => {
            return document.documentElement.lang;
        });

        let regexLinkJobsite = /(jobs|careers|work|employment|opportunities|join us|vacancies|job board|job site|hiring|job opportunities)/gmi;

        if (pageLanguage.split('-').shift().toLocaleLowerCase() != 'en') {
            const translation = await translate(`${regexLinkJobsite}`, { from: 'en', to: pageLanguage.split('-').shift() });
            console.log(translation.replace(/ \| /mg, '|').replace(' (', '(').replace(') ', ')'));
            regexLinkJobsite = new RegExp(translation.replace(/ \| /mg, '|').replace(' (', '(').replace(') ', ')').replace('/ GIM', '/gmi'));
        }

        const elements = await page.evaluate((regex) => {
            let data = [...document.querySelectorAll('a')].filter((x) => regex.test(x.textContent.trim()));
            return data.map((elem) => elem.href.trim());
        }, regexLinkJobsite);

        await addDataToFile({ ...elem, links: elements.join('\n'), withJobs: elements.length > 0 }, Routes.Result);
    } catch (error) {
        console.error(`Error analyzing ${elem.home_page}:`, error.message);
    } finally {
        // Cerrar la página después de 5 minutos
        const timeout = 2000;
        setTimeout(async () => {
            await page.close();
            await context.close();
            await browser.close();
        }, timeout);
    }
}



/**
 * Checks if the links contain job-related keywords.
 * @param {CheerioStatic} $ - Cheerio object representing the HTML document.
 * @param {string} lang - Language for translating the keywords if not in English.
 * @param {string} baseUrl - Base URL to resolve relative URLs.
 * @returns {Array} - Array of URLs of the links that match the keywords.
 */
async function checkForJobLinks($, lang, baseUrl) {
    let jobSiteKeywords = /(jobs|careers|work|employment|opportunities|join us|vacancies|job board|job site|hiring|job opportunities)/gmi;

    if (lang !== 'en') {
        const openai = new OpenAIApi(configuration);
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Translate this into ${lang.split('-').pop()} \n\n${jobSiteKeywords}\n`,
            temperature: 0.3,
            max_tokens: 100,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
        });

        jobSiteKeywords = resultado.choices[0].text;
    }

    const jobLinks = [];

    $('a').each(function () {
        const text = $(this).text();
        if (text && jobSiteKeywords.test(text)) {
            const href = $(this).attr('href');
            const fullUrl = isFullUrl(href) ? href : new URL(href, baseUrl).href;
            jobLinks.push(fullUrl);
        }
    });

    return jobLinks;
}

/**
 * Checks if the URL is a full URL or a relative URL.
 * @param {string} url - URL to check.
 * @returns {boolean} - True if the URL is a full URL, false otherwise.
 */
function isFullUrl(url) {
    // Regular expression to check if the URL starts with a protocol (e.g., http:// or https://)
    const fullUrlRegex = /^(?:\w+:)?\/\/(\S+)$/;

    return fullUrlRegex.test(url);
}



/**
*
*Adds data to an Excel file.
*@param {Object} data - The data to be added to the file.
*@param {string} rutaArchivo - The path to the Excel file.
*@returns {Promise<void>} - A promise that resolves when the data is added to the file.
*/
async function addDataToFile(data, rutaArchivo) {
    let workbook;

    if (fs2.existsSync(rutaArchivo)) {
        workbook = await XlsxPopulate.fromFileAsync(rutaArchivo);
    } else {
        workbook = await XlsxPopulate.fromBlankAsync();
        // Agregar encabezados a las pestañas
        const conJobsite = workbook.addSheet('Con Jobsite');
        const sinJobsite = workbook.addSheet('Sin Jobsite');

        // Agregar encabezados a las pestañas
        conJobsite.cell('A1').value('Id');
        conJobsite.cell('B1').value('Nombre');
        conJobsite.cell('C1').value('Home Page');
        conJobsite.cell('D1').value('Links');
        conJobsite.cell('E1').value('status');
        conJobsite.cell('F1').value('headcount_real');
        
        sinJobsite.cell('A1').value('Id');
        sinJobsite.cell('B1').value('Nombre');
        sinJobsite.cell('C1').value('Home Page');
        sinJobsite.cell('D1').value('Links');
        sinJobsite.cell('E1').value('status');
        sinJobsite.cell('F1').value('headcount_real');

    }

    const conJobsite = workbook.sheet("Con Jobsite");
    const sinJobsite = workbook.sheet("Sin Jobsite");

    const conJobsiteRowCount = conJobsite.usedRange().endCell().rowNumber() || 0;
    const sinJobsiteRowCount = sinJobsite.usedRange().endCell().rowNumber() || 0;


    const sheet = data.withJobs ? conJobsite : sinJobsite;

    const rowCount = data.withJobs ? conJobsiteRowCount : sinJobsiteRowCount;
    const row = rowCount + 1;

    sheet.cell(`A${row}`).value(data.id);
    sheet.cell(`B${row}`).value(data.company_name);
    sheet.cell(`C${row}`).value(data.home_page);
    sheet.cell(`D${row}`).value(data.links);
    sheet.cell(`E${row}`).value(data.status == 3 ? "3. no_job_site": "4. no_jobs");
    sheet.cell(`F${row}`).value(data.headcount_real);

    await workbook.toFileAsync(rutaArchivo);
}

//NOTE - Pagination
async function pagination(global) {

    return { ...global, has_next_page: list.length > 0 }
}


//!SECTION
