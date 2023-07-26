const fs = require('fs').promises;

const File = {
    async returnList(file) {
        const data = JSON.parse(await fs.readFile('./Read/links.json', 'utf8'));
        return data;
    },
};

module.exports = File;
