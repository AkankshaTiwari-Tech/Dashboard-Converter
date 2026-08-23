const axios = require("axios");
require("dotenv").config();

async function downloadExcel() {
    const fileId = process.env.DRIVE_FILE_ID;

    const downloadUrl =
        `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;

    const response = await axios.get(downloadUrl, {
        responseType: "arraybuffer"
    });

    return Buffer.from(response.data);
}

module.exports = downloadExcel;