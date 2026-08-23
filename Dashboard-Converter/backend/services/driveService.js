const axios = require("axios");
require("dotenv").config();

async function downloadConsolidated() {
    const fileId = process.env.DRIVE_FILE_ID;

    if (!fileId) {
        throw new Error("DRIVE_FILE_ID is missing from .env");
    }

    const encodedSheetName = encodeURIComponent("Consolidated");

    const downloadUrl =
        `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq` +
        `?tqx=out:csv&sheet=${encodedSheetName}`;

    const response = await axios.get(downloadUrl, {
        responseType: "text"
    });

    return response.data;
}

module.exports = downloadConsolidated;