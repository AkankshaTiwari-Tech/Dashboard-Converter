const XLSX = require("xlsx");
const downloadExcel = require("./services/driveService");

async function convertExcel() {
    const buffer = await downloadExcel();

    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true
    });

    // Use ONLY the Consolidated sheet.
    const sheetName = workbook.SheetNames.find(
        name => name.trim().toLowerCase() === "consolidated"
    );

    if (!sheetName) {
        throw new Error("Consolidated sheet not found in workbook.");
    }

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
        throw new Error("Consolidated worksheet could not be opened.");
    }

    // Read the Consolidated sheet as normal JSON rows.
    let rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: true
    });

    // Remove completely empty rows.
    rows = rows.filter(row =>
        Object.values(row).some(value =>
            String(value).trim() !== ""
        )
    );

    return rows;
}

module.exports = convertExcel;