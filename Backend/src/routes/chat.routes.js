const express = require("express");
const router = express.Router();

const prisma = require("../config/prisma");

const { GoogleGenAI } = require("@google/genai");

const puppeteer = require("puppeteer");
const { marked } = require("marked");

// ===============================
// GEMINI CONFIG
// ===============================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// ===============================
// CHAT ENDPOINT
// ===============================

router.post("/", async (req, res) => {

    try {

        const { message, history, reportData } = req.body;

        let projects = [];

        // ===== DATABASE =====

        try {

            projects = await prisma.project.findMany({
                take: 5,

                include: {
                    sprints: true,
                    tickets: true,
                },
            });

        } catch (dbError) {

            console.error("DATABASE ERROR:", dbError);

        }

        // ===== PROJECT SUMMARY =====

        const summarizedProjects = projects.map(project => ({
            name: project.name,

            sprintCount: project.sprints.length,

            completedSprints: project.sprints.filter(
                sprint => sprint.status === "DONE"
            ).length,
        }));

        // ===== CHAT HISTORY =====

        const formattedHistory = (history || [])
            .map(msg => `${msg.type}: ${msg.content}`)
            .join("\n");

        // ===== PROMPT =====

        const prompt = `
        Eres Tally, un asistente experto en project management y productividad de la plataforma TaskHub.

        Analiza:
        - progreso de proyectos
        - riesgos
        - bloqueos
        - tickets pendientes
        - carga de trabajo
        - productividad de sprints
        
        Reglas:
        - Si el usuario saluda, saluda y preséntate.
        - No hables de proyectos si el usuario no los menciona.
        - responde de forma clara
        - usa bullets
        - identifica riesgos importantes
        - menciona proyectos atrasados
        - da recomendaciones accionables
        - NO te presentes otra vez si ya estás en una conversación
        - responde directamente a la pregunta
        - evita repetir saludos
        - Si te preguntan algo que no sea de TaskHub o de la plataforma, si puedes contestar.

        Historial de conversación:
        ${formattedHistory}

        Estos son los proyectos actuales:

        ${JSON.stringify(reportData, null, 2)}

        Pregunta del usuario:
        ${message}
        `;

        // ===== GEMINI =====

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        // ===== RESPONSE TEXT =====

        const text =
            response.candidates?.[0]?.content?.parts?.[0]?.text
            || "No response from Gemini";

        console.log("AI RESPONSE:", text);

        // ===== SEND RESPONSE =====

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

// ===============================
// PDF ENDPOINT
// ===============================

router.post("/pdf", async (req, res) => {

    try {

        const { reportContent } = req.body;

        // ===== VALIDATION =====

        if (!reportContent) {

            return res.status(400).json({
                error: "reportContent is required",
            });

        }

        // ===== MARKDOWN -> HTML =====

        const htmlContent = marked(reportContent);

        // ===== PUPPETEER =====

        const browser = await puppeteer.launch({
            headless: true,
        });

        const page = await browser.newPage();

        // ===== HTML TEMPLATE =====

        await page.setContent(`

            <html>

                <head>

                    <style>

                        body {
                            font-family: Arial, sans-serif;
                            padding: 40px;
                            background: #F9FAFB;
                            color: #111827;
                        }

                        .header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 40px;
                        }

                        h1 {
                            color: #5F0229;
                            margin: 0;
                        }

                        .subtitle {
                            color: #6B7280;
                            margin-top: 5px;
                        }

                        .date {
                            font-size: 14px;
                            color: #6B7280;
                        }

                        .analysis-card {
                            background: white;
                            border-radius: 20px;
                            padding: 30px;
                            border: 1px solid #E5E7EB;
                        }

                        h1, h2, h3 {
                            color: #5F0229;
                        }

                        p {
                            line-height: 1.7;
                        }

                        ul {
                            padding-left: 20px;
                        }

                        li {
                            margin-bottom: 10px;
                        }

                    </style>

                </head>

                <body>

                    <div class="header">

                        <div>

                            <h1>TaskHub AI Report</h1>

                            <p class="subtitle">
                                Generado por Tally AI
                            </p>

                        </div>

                        <div class="date">
                            ${new Date().toLocaleDateString()}
                        </div>

                    </div>

                    <div class="analysis-card">

                        ${htmlContent}

                    </div>

                </body>

            </html>

        `);

        // ===== GENERATE PDF =====

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        // ===== CLOSE BROWSER =====

        await browser.close();

        // ===== RESPONSE HEADERS =====

        res.set({
            "Content-Type": "application/pdf",

            "Content-Disposition":
                "attachment; filename=taskhub-report.pdf",

            "Content-Length": pdf.length,
        });

        // ===== SEND PDF =====

        res.send(pdf);

    } catch (error) {

        console.error("PDF ERROR:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});

// ===============================
// EXPORT
// ===============================

module.exports = router;