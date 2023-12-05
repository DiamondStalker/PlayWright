const { test, expect } = require('@playwright/test');
const fs = require('fs');
const File = require('../components/file');
//const links = require('../Read/links.json');

const links = require('../Read/linkss.json');
//const links = require('../Read/test.json');


//const codes = require('../Read/config');

const miObjetoConFunciones = {
  extract: async function (page, global) { // Añadimos 'page' como parámetro

    global = await page.evaluate(async (global) => {

      let pass_it = { ...global.pass_it };

      const fetchData = async (url) => {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-GB,en;q=0.9,es-CO;q=0.8,es;q=0.7",
            "cache-control": "no-cache",
            pragma: "no-cache",
            "sec-ch-ua": '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
          },
          referrer: window.location.href,
          referrerPolicy: "strict-origin-when-cross-origin",
          body: null,
          mode: "cors",
          credentials: "include",
        });

        return await response.text();
      };

      const findElementsInLoop = (selector, text_to_find, context = document) => {
        let result;
        let arrFinded = [];

        context.querySelectorAll(selector).forEach((e) => {
          let text = e.textContent.trim();

          if (text_to_find.test(text)) {
            if (e.nextElementSibling)
              arrFinded.push(
                e.nextElementSibling.textContent.trim().replace(text_to_find, "").trim()
              );

            result = arrFinded[0];
          }
        });

        return result;
      };

      const cleaningLocation = (loc, limit, jobs_per_page) => {
        if (!loc && limit < 1 && jobs_per_page < 10) {
          return pass_it.head_quarters || "";
        } else if (!loc) {
          return "";
        }

        const regex_external = /Headquarters|field|home office|office/gim;
        let clean_loc = loc.trim();

        clean_loc = clean_loc.replace(regex_external, "").trim();
        clean_loc = clean_loc.split("-").reverse().join(", ").trim();
        clean_loc = clean_loc.split("-").reverse().join(", ");
        clean_loc = clean_loc.replace(/\s+/g, " ").trim();
        clean_loc = clean_loc.replace("-", "").trim();
        clean_loc = clean_loc.replace(/^, /, "").trim();
        clean_loc = clean_loc.replace(/\.\.\./g, "").trim();

        return clean_loc;
      };

      const getData = async (url) => {
        try {
          const endpoint = `${url.split("?").shift()}?in_iframe=1`;
          const req = await fetch(endpoint);
          const res = await req.text();
          const temp_div = document.createElement("DIV");
          temp_div.innerHTML = res;

          return temp_div;
        } catch (error) {
          console.error(error);
        }
      };

      const scrapeJobs = async () => {
        let out = {};
        if (typeof pass_it == "undefined") pass_it = {};

        out["pass_it"] = pass_it.hasOwnProperty("offset")
          ? pass_it
          : {
            offset: 0,
            limit: 0,
            jobs_per_page: 0,
            jobs_count: 20,
            head_quarters: "",
            multi_link: [],
          };

        try {
          const jobs = [];
          const resp = await fetchData(`${window.location.origin}${window.location.pathname}?in_iframe=1&pr=${out.pass_it.offset}`);
          const doc = document.createElement("div");



          // if (!resp.ok) { //validation of successful request with status 200, otherwise an error will be displayed.
          //   throw new Error(`Error! status: ${resp.status}`);
          // } else jobs.push({ title: "Pagina Activa" })

          doc.innerHTML = resp;

          const htmlJobs = doc.querySelectorAll('div[class*="iCIMS_JobsTable"] > div[class="row"]');
          out.pass_it["jobs_per_page"] = htmlJobs.length;


          if (htmlJobs.length === 0) {
            if (doc.querySelector('[class*="iCIMS_Message"]').textContent.trim().search(/no jobs/gmi) > -1) jobs.push({ Fantasma: "Fantasma" })
            if (doc.querySelector('[class*="iCIMS_Message"]')) jobs.push({ Fantasma: "Fantasma" })
          }

          if (out.pass_it["limit"] === 0) {
            out.pass_it.limit = doc.querySelector('div[class="iCIMS_Paging text-center"] > a:last-child')?.href?.split("pr=")?.pop()?.split("&")?.shift()?.trim() || -1;
          }

          for (const elem of htmlJobs) {
            const job = {};
            job.title = elem.querySelector("h2").textContent.trim();
            job.url = `${elem.querySelector("a").href.split("?").shift().trim()}?mode=job&iis=Job+Board&iisn=Talent.com`;

            const top_label_selector = 'span[class="sr-only field-label"]';
            const bottom_label_selector = "dt.iCIMS_JobHeaderField";

            job.source_location = findElementsInLoop(top_label_selector, /Location/i, elem);
            job.dateposted_raw = findElementsInLoop(top_label_selector, /posted date/gi, elem)?.match(/(?:\d{1,}\/\d{1,}\/\d{4})/g)?.[0];
            job.dateclosed_raw = findElementsInLoop(top_label_selector, /Fecha de cierre de la postulación|Closed Date|Post End Date/gi, elem)?.match(/(?:\d{1,}\/\d{1,}\/\d{4})/g)?.[0];
            job.reqid = findElementsInLoop(top_label_selector, /(System|Requisition)?\s*ID|Posting Number/gi, elem);
            job.source_jobtype = findElementsInLoop(top_label_selector, /Tipo de Posición|Position Type/gi, elem);

            job.source_location ||= findElementsInLoop(bottom_label_selector, /Location/i, elem);
            job.location = job.source_location;
            job.reqid ||= findElementsInLoop(bottom_label_selector, /(System|Requisition)?\s*ID|Posting Number/gi, elem);
            job.source_jobtype ||= findElementsInLoop(bottom_label_selector, /Tipo de Posición|Position Type/gi, elem);
            job.dateclosed_raw ||= findElementsInLoop(bottom_label_selector, /Fecha de cierre de la postulación|Closed Date|Post End Date/gi, elem);

            if (!job.source_location || /^\d+$/g.test(job.source_location)) {
              job.location = cleaningLocation(null, out.pass_it["limit"], out.pass_it["jobs_per_page"]);
            }

            job.temp = "icims_2_2";

            const multiloc = job.location.split("|");
            multiloc.forEach((loc) => {
              const jobx = { ...job };
              jobx.location = cleaningLocation(loc, out.pass_it["limit"], out.pass_it["jobs_per_page"]);
              jobs.push(jobx);
            });
          }

          out["jobs"] = jobs;
        } catch (err) {
          console.error(err);
          throw err;
        }

        return out;
      };

      // Ejecutar la función de scraping
      const result = await scrapeJobs();

      return result;
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
    elem.isValid=false;

    test(`Test for ${elem.id} Enlace  \n ${elem.url}`, async ({ page }) => {
      
      try {
        await page.goto(elem.url);


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


