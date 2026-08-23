const XLSX = require("xlsx");
const downloadExcel = require("./services/driveService");

async function convertExcel() {
    const buffer = await downloadExcel();

    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true
    });

    const allRows = [];

    for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            continue;
        }

        const rows = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: true
        });

        if (!rows.length) {
            continue;
        }

        /*
         * Only accept sheets that actually look like student-response
         * sheets. This prevents summary/calculation sheets from being
         * mixed into the dashboard data.
         */
        const firstRow = rows[0] || {};
        const headers = Object.keys(firstRow).map(header =>
            String(header).trim().toLowerCase()
        );

        const hasStudentName =
            headers.some(header =>
                header === "student name" ||
                header.includes("student name")
            );

        const hasUid =
            headers.some(header =>
                header === "uid" ||
                header.includes("uid")
            );

        const hasMentor =
            headers.some(header =>
                header === "mentor name" ||
                header.includes("mentor")
            );

        const hasProgramme =
            headers.some(header =>
                header === "programme name" ||
                header.includes("programme")
            );

        if (
            !hasStudentName &&
            !hasUid &&
            !hasMentor &&
            !hasProgramme
        ) {
            continue;
        }

        /*
         * Remove completely empty rows.
         */
        const cleanedRows = rows.filter(row =>
            Object.values(row).some(value =>
                String(value).trim() !== ""
            )
        );

        /*
         * Add the source sheet name so we know where each
         * response came from.
         */
        for (const row of cleanedRows) {
            allRows.push({
                ...row,
                __sheetName: sheetName
            });
        }
    }

    /*
     * Remove duplicate records that may appear in both a
     * consolidated sheet and individual sheets.
     */
    const uniqueRows = [];
    const seen = new Set();

    for (const row of allRows) {
        const studentName = String(
            row["Student Name"] ??
            row["Student Name "] ??
            ""
        ).trim();

        const uid = String(
            row["UID"] ??
            row["Uid"] ??
            row["uid"] ??
            ""
        ).trim();

        const date = String(
            row["Date"] ??
            row["Timestamp"] ??
            row["timestamp"] ??
            ""
        ).trim();

        const mentor = String(
            row["Mentor Name"] ??
            row["Mentor"] ??
            ""
        ).trim();

        const programme = String(
            row["Programme Name"] ??
            row["Programme"] ??
            ""
        ).trim();

        const section = String(
            row["Section"] ??
            ""
        ).trim();

        /*
         * Prefer UID when available.
         * Otherwise use the combination of identifying fields.
         */
        const uniqueKey =
            uid
                ? `uid:${uid}|date:${date}|mentor:${mentor}`
                : `name:${studentName}|date:${date}|mentor:${mentor}|programme:${programme}|section:${section}`;

        if (seen.has(uniqueKey)) {
            continue;
        }

        seen.add(uniqueKey);
        uniqueRows.push(row);
    }

    return uniqueRows;
}

module.exports = convertExcel;