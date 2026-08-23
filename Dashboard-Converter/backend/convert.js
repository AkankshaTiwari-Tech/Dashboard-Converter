const XLSX = require("xlsx");
const downloadExcel = require("./services/driveService");

async function convertExcel() {

    const buffer = await downloadExcel();

    const workbook = XLSX.read(buffer, {
        type: "buffer"
    });

    // Find the Consolidated sheet automatically
    const sheetName = workbook.SheetNames.find(name =>
        name.toLowerCase().includes("consolidated")
    );

    if (!sheetName) {
        throw new Error("Consolidated sheet not found.");
    }

    const worksheet = workbook.Sheets[sheetName];

    let rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: ""
    });

    // Remove completely empty rows
    rows = rows.filter(row =>
        Object.values(row).some(value =>
            String(value).trim() !== ""
        )
    );

    return rows;
}

module.exports = convertExcel;