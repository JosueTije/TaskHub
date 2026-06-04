# 🚀 Taskhub
*Built on Monday. Designed on Tuesday. Developed by Friday's.*

---

## 👨‍💻 Team Members:

- Marco Salinas ⛷️
- Ivan Ornelas 👾  
- Fatima Alonso ⭐️  
- Josué Tijerina 🦧  
- Julieta Lozano ‼️  

---

## 🌟 Purpose

The purpose of this project is to design and develop a **Software Project Management System** for a company that needs to efficiently plan, execute, monitor, and control software development projects.

This system aims to:

- 📌 Centralize all project information in one platform  
- 📊 Track progress in real time  
- 👥 Improve communication and collaboration among team members  
- ⏱ Optimize resource allocation and time management  
- 📈 Increase productivity, transparency, and accountability  

The platform will allow users to:

- Create and manage multiple projects  
- Define milestones and deadlines  
- Assign tasks and priorities  
- Monitor project status through dashboards  
- Generate reports for performance analysis  

---

## 🎯 Mission and Vision

### 🚀 Mission

Develop a robust, scalable, and user-friendly software project management system that enhances collaboration, increases operational efficiency, and empowers organizations to successfully deliver high-quality software products on time and within budget.

We are committed to combining:

- 🔧 Technical excellence  
- 🤝 Effective teamwork  
- 📊 Data-driven insights  
- 💡 Continuous innovation  

---

### 🌍 Vision

Become a modern and reliable solution for managing software development projects, transforming how companies organize, execute, and deliver technological solutions.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | JWT (httpOnly cookies) |
| Emails | EmailJS |
| IA | Ollama (llama3.2) |

---

## 🚀 Cómo levantar el proyecto

### Requisitos previos

- Node.js v18+
- PostgreSQL corriendo localmente
- Git

---

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd TaskHub
```

---

### 2. Configurar el Backend

```bash
cd Backend
npm install
```

Crea el archivo `.env` en `Backend/` con las siguientes variables:

```env
PORT=4000
DATABASE_URL="postgresql://<usuario>@localhost:5432/taskhub?schema=public"
JWT_SECRET="tu_jwt_secret_aqui"
NODE_ENV="development"

EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxx
EMAILJS_RESET_TEMPLATE_ID=template_xxxxxxx

FRONTEND_URL=http://localhost:5173

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

> Las claves de EmailJS se obtienen en [emailjs.com](https://www.emailjs.com/) → Account → API Keys.

Aplica las migraciones y levanta el servidor:

```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

El backend corre en `http://localhost:4000`.

---

### 3. Configurar el Frontend

```bash
cd ../FrontEnd
npm install
```

Crea el archivo `.env` en `FrontEnd/` con:

```env
VITE_API_URL=http://localhost:4000
```

Levanta el servidor de desarrollo:

```bash
npm run dev
```

El frontend corre en `http://localhost:5173`.

---

### 4. Crear el primer usuario Admin

Con el backend corriendo, llama al endpoint de registro de admin:

```bash
curl -X POST http://localhost:4000/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ejemplo.com",
    "fullName": "Admin",
    "role": "ADMIN",
    "temporaryPassword": "Temporal123!"
  }'
```

O usa el seed incluido para cargar datos de prueba:

```bash
cd Backend
node prisma/seed-full.js
```

---

### 5. Configurar el Asistente IA con Ollama

El asistente de IA usa [Ollama](https://ollama.com) corriendo localmente. Sin él, el chat de IA no funciona pero el resto de la app sí.

**Instalar Ollama:**

```bash
# macOS
brew install ollama


**Descargar el modelo y levantarlo:**

```bash
ollama pull llama3.2
ollama serve
```

Ollama corre en `http://localhost:11434` por defecto, que coincide con el `OLLAMA_URL` del `.env`.

> Si quieres usar otro modelo, cámbialo en el `.env`: `OLLAMA_MODEL=llama3.1` (por ejemplo). El modelo debe estar descargado con `ollama pull <modelo>`.

---

### 6. Verificar que todo funciona

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend (health check) | http://localhost:4000 |
| Prisma Studio (BD) | `npx prisma studio` |

---

### Designed by Friday's.
