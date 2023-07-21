/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

const cliProgress = require('cli-progress');

const State = require('./components/state');
const Questions = require('./components/questions');
const File = require('./components/file');
const In = require('./components/indeed');
const mostrarNotificacion = require('./components/notificationModule');



const { contry, Routes } = require('./config.json');

/* -------------------------------------------------------------------------- */
/*                                    MAIN                                    */
/* -------------------------------------------------------------------------- */


(async () => {

    //

    try {
        await Questions.getStates() && await State.getStates(contry);

        let links = await File.returnList(await Questions.selectFile(Routes.ReadData));
        await In.run(links);
    } catch (error) {
        mostrarNotificacion();
        console.log(error);
    }

})();
