const fs = require('fs').promises;
const fs2 = require('fs');
const { Routes } = require('../config.json');

const File = {
    async createLinks(data) {
        await fs.writeFile(`${Routes.ReadData}/AllLinks.json`, JSON.stringify(data, null, 2));
    },

    async returnList(file, folder) {
        const data = JSON.parse(await fs.readFile(file, 'utf8'));
        return data;
    },

    async update(html_jobs) {
        if (!fs2.existsSync(Routes.ResultData)) {
            const keys = Object.keys(html_jobs[0]);
            const result = keys.join(";");
            await fs.writeFile(Routes.ResultData, result + "\r");
        }

        for (const k of html_jobs) {
            const values = Object.values(k);
            const csvData = values.join(";");
            //console.log(csvData.replace(/,/gmi,'>') + "\r");
            fs2.appendFile(Routes.ResultData, csvData.replace(/,/gmi,'>') + "\r", err => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
};

module.exports = File;
