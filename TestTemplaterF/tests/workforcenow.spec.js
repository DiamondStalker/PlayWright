const { test, expect } = require('@playwright/test');
const File = require('../components/file');
const links = require('../Read/links.json');
//const codes = require('../Read/config');

const miObjetoConFunciones = {
  extract: async function (page, global) { // Añadimos 'page' como parámetro

    global = await page.evaluate(async (global) => {

      let pass_it = { ...global.pass_it };

      //[2023-08-08;TPL_workforcenow_V01] //Do not Delete
      const out = {};
      const jobs = [];
      if (!pass_it.count) {
        out.pass_it = {
          count: 1,
          limit: 0,
          cid: '',
          ccid: ''
        };
      } else out.pass_it = pass_it;

      if (out.pass_it.count === 1) {
        const urlObj = new URL(window.location.href).searchParams;
        out.pass_it.cid = urlObj.get('cid');
        out.pass_it.ccid = urlObj.get('ccId');
      }

      const urlFeed = `https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions?cid=${out.pass_it.cid}&ccId=${out.pass_it.ccid}&$skip=${out.pass_it.count}&$top=20`
      try {
        const response = await fetch(urlFeed);
        const data = await response.json();
        const jsonJobs = data.jobRequisitions;
        if (out.pass_it.limit === 0 && data.meta?.totalNumber) out.pass_it.limit = data.meta?.totalNumber;
        for (const elem of jsonJobs) {
          const job = {};
          job.title = elem.requisitionTitle;
          job.reqid = elem.customFieldGroup.stringFields[0].stringValue;
          job.url = `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=${out.pass_it.cid}&ccId=${out.pass_it.ccid}&jobId=${job.reqid}&source=TA`;
          const [y, m, d] = elem.postDate.split('T')[0].split('-');
          job.dateposted_raw = [m, d, y].join('/');
          if (elem.workLevelCode) job.source_jobtype = elem.workLevelCode.shortName;
          job.temp = '8aug23';
          //job.street_location = elem.querySelector("").textContent.trim();
          //job.dateclosed_raw = elem.querySelector("").textContent.trim();
          //job.logo = elem.querySelector("").getAttribute("src").trim();
          //job.source_apply_email = elem.querySelector("").textContent.trim();
          //job.source_empname = elem.querySelector("").textContent.trim();
          //job.source_salary = elem.querySelector("").textContent.trim();

          if (elem.requisitionLocations?.length) {
            const locations = elem.requisitionLocations.filter(loc => loc.nameCode?.shortName).map(loc => loc.nameCode.shortName.trim());
            const source_location = locations.join('; ');
            for (const location of locations) {
              jobs.push({ ...job, location, source_location })
            }
          }
        }
      } catch (error) {
        throw error;
      }
      out.jobs = jobs;
      return out;
    }, global)

    return global;
  },
  pagination: async function (page, global) {
    global = await page.evaluate(async (global) => {
      const out = {};
      out.pass_it = global.pass_it;
      out.pass_it.count += 20;
      out.has_next_page = (out.pass_it.count - 1) < out.pass_it.limit;
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

          console.log(`Cantidad de jobs ==> ${global.jobs.length}`);
          jobs.push(global.jobs);
          jobs = jobs.flat();

          global = await miObjetoConFunciones.pagination(page, global);
        } while (global.has_next_page != false);

        console.log(jobs)
        await expect(jobs.length).toBeGreaterThan(0);

        if (jobs.length > 0) {
          console.log("Jobs extraidos de forma correcta");
          console.log(`Total de jobs extraidos => ${jobs.length}`);
        }



      } catch (error) {
        throw (`Se esperaba información en el link ${link}, pero se obtuvo un valor igual a 0`);
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


