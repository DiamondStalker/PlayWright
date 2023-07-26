
/* --------------------------------- IMPORTS -------------------------------- */

const os = require('os');
const fs = require('fs');
const cluster = require('cluster');

const { Routes } = require('./config.json');
const console = require('./components/logger.js');
const talent = require('./components/talent');
/* -------------------------------------------------------------------------- */
/*                                    MAIN                                    */
/* -------------------------------------------------------------------------- */
// (async () => {
//     try {
//         const numWorkers = os.cpus().length;
//         if (cluster.isMaster) {
//             const jsonData = fs.readFileSync(`${Routes.ReadData}/links.json`);
//             const links = JSON.parse(jsonData);
//             const sublists = divideList(links, numWorkers);

//             console.log(`Iniciando ${numWorkers} workers...`);

//             for (let i = 0; i < numWorkers; i++) {
//                 const worker = cluster.fork();
//                 worker.send(sublists[i]);
//                 console.log(`Worker ${worker.process.pid} ha recibido la sublista.`);
//             }

//             cluster.on('online', (worker) => {
//                 console.log(`Worker ${worker.process.pid} está en línea.`);
//             });

//             cluster.on('exit', (worker, code, signal) => {
//                 console.log(`Worker ${worker.process.pid} ha finalizado con el código de salida ${code}.`);
//             });

//         } else {
//             await process.on('message', (sublist) => {
//                 console.log(`Worker ${process.pid} está ejecutando el código de procesamiento para la sublista.`);

//                 sublist.forEach(async (elem) => {
//                     console.log(elem)
//                 })

//                 //process.exit(0);

//             });

//         }
//     } catch (error) {
//         console.log(error);
//     }
// })();

console.log("    /* -------------------------------- NEW ENTRY ------------------------------- */    ");

(async () => {
    try {
        const numWorkers = os.cpus().length;
        if (cluster.isMaster) {
            const jsonData = fs.readFileSync(`${Routes.ReadData}/links.json`);
            const links = JSON.parse(jsonData);
            const sublists = divideList(links, numWorkers);

            console.log(`Iniciando ${numWorkers} workers...`);

            const workerPromises = [];

            for (let i = 0; i < numWorkers; i++) {
                const worker = cluster.fork();
                const workerPromise = new Promise((resolve) => {
                    worker.on('message', (message) => {
                        console.log(`Worker ${worker.process.pid} ha terminado de procesar la sublista.`);
                        resolve();
                    });
                });

                worker.send(sublists[i]);
                console.log(`Worker ${worker.process.pid} ha recibido la sublista.`);

                workerPromises.push(workerPromise);
            }

            await Promise.all(workerPromises);

            console.log('Todos los workers han terminado.');

            setTimeout(() => {
                console.log('Finalizando el proceso maestro...');
                process.exit(0); // Salir de manera adecuada
            }, 5000); // Ajusta el tiempo de espera según sea necesario

            cluster.on('online', (worker) => {
                console.log(`Worker ${worker.process.pid} está en línea.`);
            });

            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} ha finalizado con el código de salida ${code}.`);
            });
        } else {
            const workerPromise = new Promise((resolve) => {
                process.on('message', async (sublist) => {
                    console.log(`Worker ${process.pid} está ejecutando el código de procesamiento para la sublista.`);

                    try {

                        // LOGICA Para cada worker

                        await talent.test();


                        // El worker ha terminado de procesar la sublista
                        resolve();

                    } catch (error) {
                        console.error(`Worker ${process.pid} ha encontrado un error:`);
                        console.error(error);

                        // Si ocurre un error, también podemos finalizar el worker
                        await process.exit(1);
                    }
                });
            });

            await workerPromise;
            process.send('Terminado');
            process.exit(0); // Salir de manera adecuada
        }
    } catch (error) {
        console.log(error);
    }
})();

/* -------------------------------------------------------------------------- */
/*                                  FUNCTIONS                                 */
/* -------------------------------------------------------------------------- */
function divideList(list, numSublists) {
    const sublists = new Array(numSublists).fill().map(() => []);
    let sublistIndex = 0;

    for (const item of list) {
        sublists[sublistIndex].push(item);
        sublistIndex = (sublistIndex + 1) % numSublists;
    }

    return sublists;
}
