const Papa = require("papaparse");
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

    return rows;
}

module.exports = convertExcel;