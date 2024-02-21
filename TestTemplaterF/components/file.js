const fs = require('fs').promises;
const fs2 = require('fs');

const File = {
    async returnList(file) {
        const data = JSON.parse(await fs.readFile('./Read/links.json', 'utf8'));
        return data;
    },

    async update(html_jobs) {
        if (!fs2.existsSync("./Resultados/icims.csv")) {
            const keys = Object.keys(html_jobs[0]);
            const result = keys.join(";");
            await fs.writeFile("./Resultados/icims.csv", result + "\r");
        }

        for (const k of html_jobs) {
            const values = Object.values(k);
            const csvData = values.join(";");
            fs2.appendFile("./Resultados/BrassRing.csv", csvData.replace(/,/gmi,'>') + "\r", err => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
};

module.exports = File;
