# TaskHub

*Built on Monday. Designed on Tuesday. Developed by Friday's.*

Sistema de gestión ágil de proyectos de software con sprints, kanban en tiempo real, analíticas, asistente IA y webhooks de GitHub.

---

## Equipo

| Nombre | |
|--------|--|
| Marco Salinas | ⛷️ |
| Ivan Ornelas | 👾 |
| Fatima Alonso | ⭐️ |
| Josué Tijerina | 🦧 |
| Julieta Lozano | ‼️ |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express 5 |
| Base de datos | PostgreSQL + Prisma ORM |
| Tiempo real | Socket.io |
| Autenticación | JWT (httpOnly cookies) + OTP por email |
| Emails | Resend + Nodemailer |
| IA generativa | Groq (llama-3.3-70b) |
| RAG / embeddings | pgvector + Nomic Embed Text |
| GitHub integration | Webhooks → auto-actualización de tickets |
| Documentación API | Swagger UI (`/api-docs`) |
| Linting | ESLint (flat config) |
| Tests | Jest (backend) · Vitest + Testing Library (frontend) |
| CI/CD | GitHub Actions |
| Análisis estático | SonarCloud |

---

## Arquitectura

```
TaskHub/
├── Backend/          # API REST + Socket.io
│   ├── src/
│   │   ├── config/   # prisma, socket, swagger, mailer
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── prisma/
├── FrontEnd/         # SPA React
│   └── src/
│       ├── app/
│       │   ├── components/
│       │   ├── contexts/
│       │   └── pages/
│       └── services/
└── .github/
    └── workflows/ci.yml
```

---

## Levantar el proyecto localmente

### Requisitos

- Node.js v20+
- PostgreSQL con extensión `vector` habilitada (pgvector)
- Git

### 1. Clonar

```bash
git clone https://github.com/JosueTije/TaskHub.git
cd TaskHub
```

### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Crea `Backend/.env`:

```env
# Servidor
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de datos
DATABASE_URL="postgresql://<usuario>:<password>@localhost:5432/taskhub?schema=public"

# Auth
JWT_SECRET="un_secreto_largo_y_seguro"

# Email (Resend — https://resend.com)
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_RESET_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxx

# IA — Groq (https://console.groq.com)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TIMEOUT_MS=30000

# RAG / embeddings — Nomic (https://atlas.nomic.ai)
NOMIC_API_KEY=nk-xxxxxxxxxxxxxxxxxxxxxxxx

# GitHub webhook (se genera al conectar un proyecto)
GITHUB_WEBHOOK_SECRET=un_secreto_para_webhooks
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=tu_usuario_o_org

# Opcional — caché del contexto IA (ms, default 5min)
AI_CONTEXT_CACHE_TTL_MS=300000
```

Aplica migraciones y levanta:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Backend disponible en `http://localhost:4000`.  
Documentación Swagger en `http://localhost:4000/api-docs`.

### 3. Configurar el Frontend

```bash
cd ../FrontEnd
npm install
```

Crea `FrontEnd/.env`:

```env
VITE_API_URL=http://localhost:4000
```

Levanta:

```bash
npm run dev
```

Frontend disponible en `http://localhost:5173`.

### 4. Crear el primer usuario Admin

Con el backend corriendo, ejecuta el script incluido:

```bash
cd Backend
node scripts/create-admin.js
```

O carga datos de prueba completos (usuarios, proyectos, sprints y tickets demo):

```bash
node prisma/seed-full.js
```

Credenciales demo tras el seed:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@taskhub.com | Admin123! |
| PM | pm@taskhub.com | PM123! |
| Developer | dev@taskhub.com | Dev123! |

### 5. Habilitar pgvector (RAG)

La función de contexto IA y búsqueda semántica requiere la extensión `vector` en PostgreSQL:

```sql
-- Ejecutar una vez en tu base de datos
CREATE EXTENSION IF NOT EXISTS vector;
```

Con pgvector habilitado, puedes generar embeddings de los tickets existentes:

```bash
cd Backend
node scripts/backfill-embeddings.js
```

### 6. Integración con GitHub (opcional)

Dentro de la app, en cualquier proyecto ve a **Configuración → GitHub** e introduce la URL del repositorio. TaskHub genera automáticamente:

- Una **webhook URL** que debes registrar en GitHub (Settings → Webhooks)
- Un **secret** para validar los eventos

Eventos soportados:
- PR abierto / reabierto → ticket pasa a `IN_REVIEW`
- PR mergeado → ticket pasa a `DONE`
- PR cerrado sin merge → ticket vuelve a `IN_PROGRESS`

Los cambios se reflejan en el kanban en tiempo real vía Socket.io.

---

## Scripts disponibles

### Backend

```bash
npm run dev          # servidor con hot-reload (nodemon)
npm start            # producción
npm run lint         # ESLint
npm test             # Jest (unit tests)
npm run prisma:migrate   # aplica migraciones nuevas
npm run prisma:studio    # GUI de la base de datos
```

### Frontend

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run lint         # ESLint
npm test             # Vitest (unit tests)
```

---

## CI/CD

Cada push a cualquier rama ejecuta automáticamente en GitHub Actions:

1. **Backend** — lint + tests
2. **Frontend** — lint + tests + build
3. **SonarCloud** — análisis estático de calidad (solo si los dos anteriores pasan)

Para activar SonarCloud, agrega el secret `SONAR_TOKEN` en GitHub → Settings → Secrets.

---

## Despliegue

| Servicio | URL |
|---------|-----|
| Frontend | Vercel |
| Backend + BD | Render |
| Base de datos | PostgreSQL en Render |

---

*Designed by Friday's.*
