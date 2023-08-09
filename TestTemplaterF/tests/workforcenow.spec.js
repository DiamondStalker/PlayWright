// @ts-check

const { test, expect } = require('@playwright/test');
const File = require('../components/file');
const links = require('../Read/links.json');
//const codes = require('../Read/config');

const miObjetoConFunciones = {
  extract: async function (page, global) { // Añadimos 'page' como parámetro

    global = await page.evaluate(async (global) => {

      let msg = console.log;

      msg(global);

      let pass_it = { ...global.pass_it };

      let out = {};

      if (typeof pass_it == "undefined") pass_it = {};
      if (!pass_it["page"]) {
        out["pass_it"] = {
          "page": 0,
          "jobs": 0,
          "totalJobs": 0
        };
      } else {
        out["pass_it"] = pass_it;
      }
      let cid = window.location.href.split("cid=").pop().split("&").shift();
      let ccId = window.location.href.split("ccId=").pop().split("&").shift();
      let lang = window.location.href.split("lang=").pop().split("&").shift();


      console.log(cid);
      console.log(ccId);
      console.log(lang);

      let time = new Date();
      time = Date.now();
      try {
        let jobs = [];
        const page = out.pass_it['page']
        const resp = await fetch(`https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions?cid=${cid}&timeStamp=${time}&lang=${lang}&iccFlag=yes&eccFlag=yes&ccId=${ccId}&locale=${lang}&$top=20&$skip=${page}`);
        const data = await resp.json(); // The response.json() method parses the response as JSON and returns a promise. if request not return a JSON necessary change to 'resp.text()'
        // msg(data);
        // Job data
        const json_jobs = data.jobRequisitions;
        out["pass_it"]["jobs"] = data.meta.totalNumber; // stop condition
        out["pass_it"]["totalJobs"] = out["pass_it"]["totalJobs"] + json_jobs.length; // all jobs
        for (i in json_jobs) {
          let job = {}; /*init*/
          let elem = json_jobs[i];
          job.title = elem.requisitionTitle;
          job.url = `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=${cid}&ccId=${ccId}&jobId=${elem.customFieldGroup.stringFields[0].stringValue}&lang=${lang}`
          job.reqid = elem.clientRequisitionID;
          //job.source_location = elem.positionOfsource_location;
          //job.street_location = elem.positionOfstreet_location;
          job.dateposted_raw = elem.postDate.split("T").shift();
          job.dateposted_raw = `${job.dateposted_raw.split("-")[1]}/${job.dateposted_raw.split("-")[2]}/${job.dateposted_raw.split("-")[0]}`;
          //job.dateclosed_raw = elem.positionOf.dateposted_raw;
          //job.logo = elem.positionOflogo;
          //job.source_apply_email = elem.positionOfemail;
          //job.source_empname = elem.positionOfempname;
          job.source_jobtype = elem.workLevelCode?.shortName
          //job.source_salary = elem.positionOfsalary;
          job.temp = "1";
          elem.requisitionLocations.map(a => {
            var jobw = { ...job };
            jobw.source_location = a.nameCode.shortName;
            let loc = [];
            if (a.address.cityName) loc.push(a.address.cityName);
            if (a.address.countrySubdivisionLevel1.codeValue) loc.push(a.address.countrySubdivisionLevel1.codeValue)
            jobw.location = loc.join(", ");
            jobs.push(jobw);
          })
        }
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
    out.pass_it.page+=20;
    out["has_next_page"] = out.pass_it.totalJobs < out.pass_it.jobs ? true : false;  
    return out;
    }, global);
    return global;
  }
};

async function runTests() {
  for (const link of links) {
    test(`Test for ${link}`, async ({ page }) => {
      try {
        await page.goto(link);


        let global = { pass_it: {}, has_next_page: false };
        // // Ejecutar la función extract del objeto miObjetoConFunciones
        // let data2 = await miObjetoConFunciones.extract(page, global); // Pasamos 'page' como parámetro

        // let jobs = [{ title: "GHSOT" }];
        // await expect(jobs.length).toBeGreaterThan(0);

        // if (jobs.length > 0) {
        //   console.log("Jobs extraidos de forma correcta");
        //   console.log(`Cantidad de jobs extraidos #${data2.length}`)
        // }

        let jobs = [];

        do {
          // Ejecutar la función extract del objeto miObjetoConFunciones
          global = await miObjetoConFunciones.extract(page, global); // Pasamos 'page' como parámetro

          jobs.push(global.jobs);
          jobs = jobs.flat();

          global = await miObjetoConFunciones.pagination(page, global);


        } while (global.has_next_page != false);

        await expect(jobs.length).toBeGreaterThan(0);

        if (jobs.length > 0) {
          console.log("Jobs extraidos de forma correcta");
          console.log(`Total de jobs extraidos => ${jobs.length}`);
        }



      } catch (error) {
        throw new Error(`Se esperaba información en el link ${link}, pero se obtuvo un valor igual a 0`);
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


