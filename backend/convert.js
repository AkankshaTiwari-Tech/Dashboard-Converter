const Papa = require("papaparse");
const fs = require("fs");
const path = require("path");

const downloadConsolidated = require("./services/driveService");

async function convertExcel() {
    const csv = await downloadConsolidated();

    if (!csv || !String(csv).trim()) {
        throw new Error("Consolidated sheet returned no data.");
    }

    const parsed = Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => {
            let cleaned = String(header ?? "")
                .replace(/^\uFEFF/, "")
                .trim();

            // Google Sheets may export the first header as:
            // "Sr. No. #REF!"
            // Convert it back to the expected header name.
            if (/^Sr\.\s*No\.\s*#REF!$/i.test(cleaned)) {
                cleaned = "Sr. No.";
            }

            return cleaned;
        }
    });

    if (parsed.errors && parsed.errors.length > 0) {
        console.error("CSV parsing errors:", parsed.errors);

        throw new Error(
            `Could not parse Consolidated sheet: ${parsed.errors[0].message}`
        );
    }

    let rows = parsed.data || [];

    // Remove completely empty rows.
    rows = rows.filter(row =>
        Object.values(row).some(value =>
            String(value ?? "").trim() !== ""
        )
    );

    // Generate data file for the dashboard.
    const dashboardDataPath = path.join(
    __dirname,
    "..",
    "Dashboard-Converter",
    "dashboard",
    "dashboard-data.js"
);
    const dashboardData =
        `window.DASHBOARD_DATA = ${JSON.stringify(rows)};`;

    fs.writeFileSync(
        dashboardDataPath,
        dashboardData,
        "utf8"
    );

    console.log(
        `Dashboard data updated: ${rows.length} records`
    );

    return rows;
}

module.exports = convertExcel;