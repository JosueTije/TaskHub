const express = require("express");
const router = express.Router();
const prisma = require("../config/prisma");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
    try {
        const { message, history } = req.body;

        const projects = await prisma.project.findMany({
            take: 5,
            include: {
                sprints: true,
                tickets: true,
            },
        });

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
        - responde de forma clara
        - usa bullets
        - identifica riesgos importantes
        - menciona proyectos atrasados
        - da recomendaciones accionables
        - NO te presentes otra vez si ya estás en una conversación
        - responde directamente a la pregunta
        - evita repetir saludos

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

module.exports = router;