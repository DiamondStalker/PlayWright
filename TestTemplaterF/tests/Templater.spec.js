
// // // @ts-check

// // const { test, expect } = require('@playwright/test');
// // const File = require('../components/file');
// // const links = require('../Read/links.json');
// // const codes = require('../Read/config');

// // async function runTests() {

// //   for (const link of links) {

// //     test(`Test for ${link}`, async ({ page }) => {
// //       try {
// //         await page.goto(link);

// //         let global = { pass_it: {} };

// //         let data2 = codes.default.extract()

// //         console.log(codes.default.extract())

// //         // do{
// //         //   global = await extract(global);
// //         // }while(global.has_next_page)

// //         let jobs = [{ title: "GHSOT" }];
// //         await expect(jobs.length).toBeGreaterThan(0);
// //         if (jobs.length > 0) {
// //           console.log("Manual message: Expect passed!  ==>");
// //           console.table(jobs);
// //           console.log("Result Data =>")
// //           data2.then((out) => {console.log(out)})
// //         }
// //       } catch (error) {
// //         throw new Error(`Se esperaba información en el link ${link}, pero se obtuvo un valor igual a 0`);
// //       }
// //     });
// //   }
// // }



// // async function extract(global) {
// //   let out = {};
// //   return out;
// // }
// // (async () => {
// //   try {
// //     // Iniciar las pruebas
// //     await runTests();
// //   } catch (error) {
// //     console.error(error);
// //   }
// // })();

// // @ts-check

// const { test, expect } = require('@playwright/test');
// const File = require('../components/file');
// const links = require('../Read/links.json');
// const codes = require('../Read/config');

// async function runTests() {
//   for (const link of links) {
//     test(`Test for ${link}`, async ({ page }) => {
//       try {
//         await page.goto(link);
//         let global = { pass_it: {} };
//         let data2 = await codes.default.extract(); // Wait for the promise to resolve

//         let jobs = [{ title: "GHSOT" }];
//         await expect(jobs.length).toBeGreaterThan(0);

//         if (jobs.length > 0) {
//           console.log("Jobs extraidos de forma correcta");
//         }
//       } catch (error) {
//         throw new Error(`Se esperaba información en el link ${link}, pero se obtuvo un valor igual a 0`);
//       }
//     });
//   }
// }

// async function extract(global) {
//   let out = {};
//   return out;
// }

// (async () => {
//   try {
//     // Iniciar las pruebas
//     await runTests();
//   } catch (error) {
//     console.error(error);
//   }
// })();


// @ts-check

const { test, expect } = require('@playwright/test');
const File = require('../components/file');
const links = require('../Read/links.json');
//const codes = require('../Read/config');

const miObjetoConFunciones = {
  extract: async function (page) { // Añadimos 'page' como parámetro
    let out = {};
    let jobs = [];

    try {
      const pathname = await page.evaluate(() => window.location.pathname);
      let url = `https://apply.workable.com/api/v1/widget/accounts/${pathname.replaceAll('/', '')}?details=true`;
      const resp = await fetch(url, { "headers": {} });
      const data = await resp.json();
      let html_jobs = data.jobs;

      for (let elem of html_jobs) {
        const calculatePosted = () => {
          if (elem.published_on) {
            if (new Date(elem.published_on).toString() === "Invalid Date") {
              let [y, m, d] = elem.published_on.split('T').shift().split('-');
              return `${m}/${d}/${y}`;
            } else {
              return new Date(elem.published_on).toLocaleDateString();
            }
          } else {
            return undefined;
          }
        };

        let loc = () => {
          let location = [];
          if (elem.city) location.push(elem.city);
          if (elem.state) location.push(elem.state);
          if (elem.country) location.push(elem.country);
          return location.join(', ');
        };

        let job = {
          temp: 'Đ丂',
          title: elem.title,
          dateposted_raw: calculatePosted(),
          reqid: elem.shortcode,
          url: elem.url,
          source_jobtype: elem.employment_type.replace(/Contract/gmi, '').trim(),
          source_location: loc(),
          location: loc(),
          html: elem.description
        };

        jobs.push(job);
      }

      out.jobs = jobs;
      return out;
    } catch (e) {
      throw e;
    }
  }
};

async function runTests() {
  for (const link of links) {
    test(`Test for ${link}`, async ({ page }) => {
      try {
        await page.goto(link);
        let global = { pass_it: {} };
        
        let data2 = await miObjetoConFunciones.extract(page); // Pasamos 'page' como parámetro

        let jobs = [{ title: "GHSOT" }];
        await expect(jobs.length).toBeGreaterThan(0);

        if (jobs.length > 0) {
          console.log("Jobs extraidos de forma correcta");
        }
        // Ejecutar la función extract del objeto miObjetoConFunciones
        const data = await miObjetoConFunciones.extract(page); // Pasamos 'page' como parámetro
        console.log('Resultado de extract:', data);

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


