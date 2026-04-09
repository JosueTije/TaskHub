# Prompt para Claude: Diagrama de Arquitectura de IA en TaskHub

Por favor, genera un diagrama de arquitectura detallado en formato Mermaid que muestre cómo funciona el sistema de Inteligencia Artificial en TaskHub. La arquitectura debe incluir:

## Componentes del Sistema:

### 1. Frontend (React)
- **AIAssistant Component** (`/src/app/pages/AIAssistant.tsx`)
  - Chat conversacional con interfaz de usuario
  - Manejo de mensajes (user/ai)
  - Visualización de KPIs embebidos
  - Gráficos (recharts) para tendencias
  - Sugerencias rápidas predefinidas
  - Sistema de RAG Context display

### 2. Capa de Datos (PostgreSQL)
- **Tabla: ai_insights**
  - `insight_type`: risk_detection, schedule_prediction, resource_optimization, velocity_forecast
  - `severity`: low, medium, high, critical
  - `recommendations`: JSON con acciones sugeridas
  - `metrics`: JSON con KPIs asociados
  - `is_active`: estado del insight

- **Fuentes de Datos RAG**:
  - `projects`: métricas (SPI, CPI, progress, risk, budget)
  - `sprints`: velocity, planned_points, completed_points, status
  - `tickets`: status, priority, story_points, actual_hours, estimated_hours
  - `milestones`: due_date, status, progress
  - `user_points`: total_points, tickets_completed, bugs_fixed
  - `activity_logs`: historial completo de cambios
  - `burndown_data`: tendencias históricas
  - `time_tracking`: horas trabajadas vs estimadas

### 3. Motor de IA (Conceptual - Backend)
- **RAG Pipeline**:
  - Vector Store con embeddings de documentación del proyecto
  - Semantic Search sobre tickets, comentarios y actividades
  - Context Window de ~8K tokens con datos en tiempo real

- **Análisis Predictivo**:
  - Detección de riesgos mediante análisis de:
    - SPI < 0.95 (Schedule Performance Index bajo)
    - Varianza de schedule negativa
    - Tickets bloqueados por >3 días
    - Milestones con >20% de retraso
  
  - Predicción de cronograma:
    - Análisis de velocity histórica del sprint
    - Proyección de fecha de entrega
    - Identificación de cuellos de botella

  - Optimización de recursos:
    - Balance de carga por developer
    - Sugerencias de reasignación
    - Identificación de over/under allocation

- **Generación de Insights**:
  - Análisis de tendencias (burndown, velocity)
  - Comparación con sprints anteriores
  - Benchmarking con estándares de la industria
  - Generación de recomendaciones accionables

### 4. Flujo de Interacción:

**Flujo 1: Consulta del Usuario**
```
Usuario → AIAssistant UI → Query Processing → RAG Context Builder 
→ Vector Search + SQL Queries → LLM (Claude/GPT-4) 
→ Response Generator → UI con KPIs/Charts/Recommendations
```

**Flujo 2: Insights Automáticos (Cron Jobs)**
```
Scheduled Task (cada 6 horas) → Data Aggregation → AI Analysis Engine 
→ Risk Detection → Insight Generation → ai_insights table 
→ Notifications table → User Alerts
```

**Flujo 3: Recomendaciones en Tiempo Real**
```
User Action (cambio de status, asignación) → Trigger Event 
→ Context Analysis → AI Evaluation → Quick Recommendations 
→ In-app Suggestions
```

### 5. Contexto RAG (Retrieval-Augmented Generation):
El sistema mantiene un contexto actualizado que incluye:
- **Metadata del Proyecto Activo**: nombre, fechas, manager, equipo
- **Data Sources Status**: 
  - Milestones (12 registros activos)
  - Sprints (8 registros activos)
  - KPIs (45 métricas en tiempo real)
  - Riesgo IA (3 alertas activas)
  - Team Performance (24 registros de developers)
- **Last Update**: timestamp de última sincronización

### 6. Casos de Uso Implementados:

1. **Detección de Proyectos de Alto Riesgo**
   - Input: "¿Cuál es el proyecto con mayor riesgo?"
   - Output: KPIs (SPI, Hitos retrasados, Schedule Variance), gráfico de tendencia, 4 recomendaciones, 2 acciones

2. **Resumen Ejecutivo del Portafolio**
   - Input: "Dame un resumen ejecutivo del portafolio"
   - Output: Métricas agregadas, estado por proyecto, alertas prioritarias

3. **Análisis de Retrasos en Sprints**
   - Input: "¿Qué sprint tiene m��s retrasos?"
   - Output: Comparativa de velocity, tickets bloqueados, causas raíz

4. **Simulación de Cambios**
   - Input: "Simula mover el milestone 3 tres días"
   - Output: Impacto en cronograma, dependencias afectadas, riesgos nuevos

5. **Performance de Developers**
   - Input: "¿Qué developer tiene mejor rendimiento este mes?"
   - Output: Ranking por puntos, tickets completados, quality metrics

### 7. Tecnologías Sugeridas:

- **LLM**: Claude 3.5 Sonnet (razonamiento) o GPT-4 Turbo (velocidad)
- **Vector DB**: Pinecone, Weaviate o pgvector (extensión de PostgreSQL)
- **Embeddings**: text-embedding-3-large de OpenAI o embed-english-v3.0 de Cohere
- **Framework**: LangChain o LlamaIndex para orquestación RAG
- **Cache**: Redis para responses frecuentes
- **Queue**: RabbitMQ o AWS SQS para procesamiento asíncrono

## Formato del Diagrama:

Usa **Mermaid** con el siguiente formato:
- `graph TB` o `flowchart TB` para flujo vertical
- Usa colores diferentes para cada capa:
  - Frontend: `#E31837` (Mahindra Red)
  - Backend/API: `#0A0638` (Blueprint Navy)
  - Base de Datos: `#34C759` (verde)
  - IA/ML: `#AF52DE` (morado)
  - External Services: `#FF9500` (naranja)
- Incluye flechas con etiquetas descriptivas
- Agrupa componentes relacionados en subgraphs

## Salida esperada:

Un diagrama Mermaid completo que muestre:
1. Componentes frontend y su interacción
2. Backend API endpoints para IA
3. Motor de procesamiento de IA con RAG
4. Conexiones a la base de datos
5. Flujos de datos bidireccionales
6. Servicios externos (LLM API)
7. Cache y optimizaciones
8. Triggers y procesamiento asíncrono

---

# Párrafo Explicativo del Sistema de IA

## Arquitectura de Inteligencia Artificial en TaskHub

TaskHub integra un sistema de IA conversacional avanzado basado en **Retrieval-Augmented Generation (RAG)** que actúa como asistente inteligente para Project Managers y equipos de desarrollo. El motor de IA tiene acceso en tiempo real a todas las métricas del sistema (proyectos, sprints, tickets, burndown, velocity, SPI/CPI, gamificación, y actividades), almacenadas en PostgreSQL, y utiliza embeddings vectoriales para realizar búsqueda semántica sobre el contexto histórico. Cuando un usuario realiza una consulta a través de la interfaz de chat (`AIAssistant.tsx`), el sistema construye un contexto enriquecido combinando datos estructurados (queries SQL) con embeddings de documentación y comentarios, que se envían a un modelo de lenguaje grande (Claude 3.5 Sonnet o GPT-4) para generar respuestas contextualizadas. El sistema no solo responde preguntas, sino que ejecuta **análisis predictivo automático** cada 6 horas mediante cron jobs, detectando riesgos (SPI < 0.95, milestones retrasados, tickets bloqueados), proyectando cronogramas basándose en velocity histórica, y sugiriendo optimizaciones de recursos. Los insights generados se almacenan en la tabla `ai_insights` con severidad clasificada (low/medium/high/critical), recomendaciones accionables en formato JSON, y métricas asociadas, activando notificaciones automáticas para alertar a los usuarios. La arquitectura incluye una capa de cache (Redis) para optimizar consultas frecuentes, procesamiento asíncrono mediante colas (RabbitMQ) para análisis intensivos, y presenta los resultados mediante una UI rica con KPIs embebidos, gráficos de tendencia (Recharts), y botones de acción directa que permiten navegar al proyecto afectado o generar planes de recuperación, convirtiendo datos crudos en insights estratégicos que impulsan la toma de decisiones basada en evidencia.
