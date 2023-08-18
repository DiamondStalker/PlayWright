// const miObjetoConFunciones = {
//     nombre: "Ejemplo",
//     sumar: function (a, b) {
//         return a + b;
//     },
//     restar: async function (a, b) {
//         return a - b;
//     },
//     extract: async function () {
//         let out = {};
//         let jobs = [];

//         try {
//             let url = `https://apply.workable.com/api/v1/widget/accounts/salad-and-go?details=true`;
//             const resp = await fetch(url, { "headers": {} });
//             const data = await resp.json();
//             let html_jobs = data.jobs;

//             for (let elem of html_jobs) {
//                 const calculatePosted = () => {
//                     if (elem.published_on) {
//                         if (new Date(elem.published_on).toLocaleDateString().search('Invalid Date') > -1) {
//                             let [y, m, d] = elem.published_on.split('T').shift().split('-');
//                             return `${m}/${d}/${y}`;
//                         } else return new Date(elem.published_on).toLocaleDateString();
//                     } else return undefined;
//                 };

//                 let loc = () => {
//                     let location = [];
//                     if (elem.city) location.push(elem.city);
//                     if (elem.state) location.push(elem.state);
//                     if (elem.country) location.push(elem.country);
//                     return location.join(', ');
//                 };

//                 let job = {
//                     temp: 'Đ丂',
//                     title: elem.title,
//                     dateposted_raw: calculatePosted(),
//                     reqid: elem.shortcode,
//                     url: elem.url,
//                     source_jobtype: elem.employment_type.replace(/Contract/gmi, '').trim(),
//                     source_location: loc(),
//                     location: loc(),
//                     html: elem.description
//                 };

//                 let tempHTML = document.createElement('div');
//                 tempHTML.innerHTML = job.html;

//                 job.experience_required = "";

//                 [...tempHTML.querySelectorAll('li,p')].forEach((tmp) => {
//                     let texto = tmp.textContent;
//                     if (
//                         texto.search(
//                             /experience|Experience|esperienza|expérience|werkervaring|experiencia|expérience|experiencia/gim
//                         ) > -1 &&
//                         texto.search(
//                             /years|Years|year|Year|month|Months|anni|ans|mesi|jaar|maand|años|yrs/gim
//                         ) > -1 &&
//                         texto.search(/\d|one|two|three|four|five|six|seven|eight|nine|ten/gim) > -1
//                     )
//                         job.experience_required += '\n' + texto;
//                 });

//                 if (job.experience_require) job.experience_require = undefined;

//                 let beneficios = Array.from(tempHTML.querySelectorAll('p,h2,h4')).filter(
//                     (x) =>
//                         x.textContent
//                             .trim()
//                             .search(
//                                 /Wat bieden wij jou|avantages|Wij bieden|Our offer|What You Will Receive From Us|What working at|What working at EY offers|benefit|beneficio|Unser Angebot|Wir bieten Ihnen|WE OFFER|Benefits|benefit/gim
//                             ) > -1
//                 );

//                 if (beneficios.length > 0)
//                     job.source_benefit = beneficios[0].nextElementSibling.textContent.trim();

//                 job.html = removeTextAfter(job.html, 'Only CVs in English will be reviewed', true);
//                 job.html = removeTextAfter(job.html, 'For more detailed information about the role, please click on the attached Job Description', true);
//                 job.html = removeTextAfter(job.html, 'Please click on the Apply', true);
//                 job.html = cleanHTML(job.html);
//                 var tmp = document.createElement('div');
//                 tmp.innerHTML = job.html;
//                 job.jobdesc = tmp.textContent.trim();
//                 job.jobdesc = cleanHTML(job.jobdesc);

//                 jobs.push(job);
//             }

//             console.log(jobs);
//             out.jobs = jobs;
//             return out;
//         } catch (e) {
//             throw e;
//         }
//     }
// };

// export default miObjetoConFunciones;


// @ts-check

// const miObjetoConFunciones = {
//     extract: async function (page) {
//         let out = {};
//         let jobs = [];

//         try {
//             let url = `https://apply.workable.com/api/v1/widget/accounts/${document.location.pathname.replaceAll('/','')}?details=true`;
//             const resp = await fetch(url, { "headers": {} });
//             const data = await resp.json();
//             let html_jobs = data.jobs;

//             for (let elem of html_jobs) {

//                 const calculatePosted = () => {
//                     if (elem.published_on) {
//                         if (new Date(elem.published_on).toLocaleDateString().search('Invalid Date') > -1) {
//                             let [y, m, d] = elem.elem.published_on.split('T').shift().split('-')
//                             return `${m}/${d}/${y}`
//                         } else return new Date(elem.published_on).toLocaleDateString()
//                     } else return undefined
//                 }
    
//                 let loc = () => {
//                     let location = []
//                     if (elem.city) location.push(elem.city)
//                     if (elem.state) location.push(elem.state)
//                     if (elem.country) location.push(elem.country)
    
//                     return location.join(', ')
//                 }
    
//                 let job = {
//                     temp: 'Đ丂',
//                     title: elem.title,
//                     dateposted_raw: calculatePosted(),
//                     reqid: elem.shortcode,
//                     url: elem.url,
//                     source_jobtype: elem.employment_type.replace(/Contract/gmi,'').trim(),
//                     source_location: loc(),
//                     location: loc(),
//                     html: elem.description
//                 }
    
//                 jobs.push(job)
//             }

//             out.jobs = jobs;
//             return out;
//         } catch (e) {
//             throw e;
//         }
//     }
// };

// export default miObjetoConFunciones;
