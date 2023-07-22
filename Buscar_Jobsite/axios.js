const axios = require('axios');

(async () => {

    try {

        const response = await axios.get('https://www.linkedin.com/school/seneca-college/');
        const html = response.data;
        const $ = cheerio.load(html);

        console.log(response);

    } catch (error) {
        console.log(error.response.status); // Código de estado de la respuesta
        console.log(error.response.data); // Datos de la respuesta
        console.log(error.response.headers); // Cabeceras de la respuesta
    }
})()