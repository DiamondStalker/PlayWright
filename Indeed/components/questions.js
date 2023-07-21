
const inquirer = require("inquirer");
const fs = require('fs').promises;
var console = require('./logger.js');


const Questions = {

    async getStates() {
        const { confirmation } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirmation',
                message: 'Quieres capturar todos los statos del pais configurado ?',
                default: 'false'
            }
        ]);
        return confirmation;
    },

    /**
    * Selects a file from a folder.
    *
    * @param {string} folder - Folder path.
    * @returns {Promise<string>} - Promise that resolves with the full path of the selected file.
    */
    async selectFile(folder) {
        const files = await fs.readdir(folder);

        if (files.length > 0) {
            const { selectedFile } = await inquirer.prompt([
                {
                    type: 'rawlist',
                    name: 'selectedFile',
                    message: 'Selecciona un archivo:',
                    choices: files,
                },
            ]);

            return `${folder}/${selectedFile}`;
        } else {
            console.log(`${"\x1b[31m"}--------------------------------------------------\n La carpeta Companies no tiene archivos por leer \n--------------------------------------------------${"\x1b[0m"}`);
            process.exit();
        }
    },

}

module.exports = Questions;