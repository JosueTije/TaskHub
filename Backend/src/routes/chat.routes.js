const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
    try {
        const { message } = req.body;

        console.log("MENSAJE:", message);
        console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message,
        });

        console.log("RESPUESTA COMPLETA:", response);

        const text = response.text;

        console.log("TEXT:", text);

        res.json({
            reply: text,
        });

    } catch (error) {
        console.error("ERROR GEMINI:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});

module.exports = router;