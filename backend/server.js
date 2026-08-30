const express = require("express");
const cors = require("cors");
const convertExcel = require("./convert");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Dashboard Converter Backend Running"
    });
});

// Dashboard API
app.get("/api/dashboard", async (req, res) => {
    try {
        const data = await convertExcel();

        res.json({
            success: true,
            totalRows: data.length,
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});