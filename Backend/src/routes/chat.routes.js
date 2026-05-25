const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

const { GoogleGenAI } = require("@google/genai");

const puppeteer = require("puppeteer");
const { marked } = require("marked");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
    try {
        const { message, history } = req.body;

        let projects = [];

        try { 
            projects = await prisma.project.findMany({
            take: 5,
            include: {
                sprints: true,
                tickets: true,
            },
        });
    } catch (error) {
        console.error("Error fetching projects:", error);
    }

        const summarizedProjects = projects.map(project => ({
            name: project.name,
            sprintCount: project.sprints.length,
            completedSprints: project.sprints.filter(
                sprint => sprint.status === "DONE"
            ).length,
        }));

        console.log("PROJECTS:", projects);

        const formattedHistory = history
            ?.map(msg => `${msg.type}: ${msg.content}`)
            .join("\n");

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

    ${JSON.stringify(summarizedProjects, null, 2)}

    Pregunta del usuario:
    ${message}
    `;

        console.log("MENSAJE:", message);
        console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        console.log(JSON.stringify(response, null, 2));

        console.log("RESPUESTA COMPLETA:", response);

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";


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

router.post("/pdf", async (req, res) => {

    try {

        const { message, history } = req.body;

        let projects = [];

        try {

            projects = await prisma.project.findMany({
                take: 5,
                include: {
                    sprints: true,
                    tickets: true,
                },
            });

        } catch (error) {

            console.error("DATABASE ERROR:", error);

        }

        const summarizedProjects = projects.map(project => ({
            name: project.name,

            sprintCount: project.sprints.length,

            completedSprints: project.sprints.filter(
                sprint => sprint.status === "DONE"
            ).length,
        }));

        const formattedHistory = history
            ?.map(msg => `${msg.type}: ${msg.content}`)
            .join("\n");

        const prompt = `
        Eres Tally, un asistente experto en project management.

        Genera un reporte ejecutivo profesional.

        Usa:
        - títulos
        - bullets
        - recomendaciones
        - conclusiones

        Historial:
        ${formattedHistory}

        Proyectos:
        ${JSON.stringify(summarizedProjects, null, 2)}

        Pregunta:
        ${message}
        `;

        // ===== GEMINI =====

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text =
            response.candidates?.[0]?.content?.parts?.[0]?.text
            || "No response";

        // ===== MARKDOWN -> HTML =====

        const htmlContent = marked(text);

        // ===== PUPPETEER =====

        const browser = await puppeteer.launch({
            headless: true,
        });

        const page = await browser.newPage();

        await page.setContent(`

            <html>

            <head>

                <style>

                    body {
                        font-family: Arial;
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

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        console.log("PDF GENERATED");
        console.log(pdf.length);

        await browser.close();

        res.set({
            "Content-Type": "application/pdf",

            "Content-Disposition":
                "attachment; filename=taskhub-report.pdf",

            "Content-Length": pdf.length,
        });

        res.send(pdf);

    } catch (error) {

        console.error("PDF ERROR:", error);

        res.status(500).json({
            error: error.message,
        });
    }
});


module.exports = router;