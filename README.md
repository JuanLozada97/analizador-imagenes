# Analizador Inteligente de Contenido de Imágenes

Aplicación web full-stack que permite a los usuarios subir una imagen, analizarla con un servicio de **IA de terceros** y devolver etiquetas descriptivas del contenido.  

El proyecto está dividido en dos módulos principales:
- **Backend**: API con Node.js + Express
- **Frontend**: UI con React + Vite

---

## 🚀 Tecnologías

- **Backend**: Node.js 18+, Express, Multer, CORS, dotenv  
- **Frontend**: React 18 (Vite), Fetch API  
- **IA externa**: OpenAI Vision / Google Cloud Vision / Imagga (configurable)  
- **DevOps**: GitHub Actions, GitHub Projects (Kanban), Revisor de PR con IA  

---

## 📂 Estructura del proyecto

```
analizador-imagenes/
├─ backend/        # API con Express
├─ frontend/       # React con Vite
├─ tools/          # scripts auxiliares (ej: revisor AI de PRs)
├─ .github/workflows/ # workflows CI/CD y AI PR review
├─ .gitignore
├─ README.md
└─ .env.example
```

---

## 🔑 Variables de Entorno

En cada carpeta (`backend/`, `frontend/`) hay un archivo `.env.example`.

### Backend `.env.example`
```env
PORT=4000
AI_PROVIDER=openai   # opciones: openai | google | imagga
OPENAI_API_KEY=sk-xxxx
GOOGLE_APPLICATION_CREDENTIALS=./google-key.json
IMAGGA_API_KEY=your-key
IMAGGA_API_SECRET=your-secret
```

### Frontend `.env.example`
```env
VITE_API_BASE=http://localhost:4000
```

---

## ⚙️ Instalación y ejecución

### Clonar y preparar
```bash
git clone https://github.com/<tu-usuario>/analizador-imagenes.git
cd analizador-imagenes
```

### Backend
```bash
cd backend
npm install
cp .env.example .env   # editar con tus claves
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

### Ejecución conjunta
En la raíz:
```bash
npm install
npm run dev
```

---

## 📡 Endpoints

### `POST /api/analyze`
- **Body**: multipart/form-data (`image`)  
- **Response**:
```json
{
  "tags": [
    { "label": "Perro", "confidence": 0.98 },
    { "label": "Parque", "confidence": 0.91 }
  ]
}
```

### `GET /api/health`
- **Response**: `{ "ok": true }`

---

## 🤖 Revisor de Pull Requests con IA

Este proyecto incluye un **workflow de GitHub Actions** que utiliza **OpenAI (gpt-4o-mini)** para revisar automáticamente cada Pull Request y dejar un comentario con observaciones.  

- **Cuándo se ejecuta**: al abrir o actualizar un PR (que no sea *draft*).  
- **Qué revisa**:
  - Posibles errores o bugs
  - Seguridad (exposición de claves, validaciones faltantes, etc.)
  - Rendimiento
  - Mantenibilidad y clean code
  - Accesibilidad y UX en el frontend
- **Formato de salida**:
  1. Resumen ejecutivo (2-4 bullets)
  2. Hallazgos por categoría (bugs, seguridad, performance, mantenibilidad, etc.)
  3. Checklist de recomendaciones
  4. Riesgo y prioridad (Bajo/Medio/Alto)

### Configuración del revisor
1. Crear un secret en GitHub (`Settings → Secrets → Actions → New secret`):
   - **Name:** `OPENAI_API_KEY`
   - **Value:** tu API key de OpenAI (ej: `sk-...`)
2. El workflow `.github/workflows/ai-pr-review.yml` ya está configurado para usar ese secret.  
3. En cada PR verás un comentario de la IA consolidando los hallazgos.

> ⚠️ **Nota**: los comentarios de la IA son de apoyo. La decisión final siempre corresponde al revisor humano.

---

## ✅ Criterios de Evaluación

- Funcionalidad completa (backend + frontend)  
- Código limpio y modular  
- Manejo de errores (archivos inválidos, API caída)  
- Uso profesional de Git (commits, ramas, PRs)  
- README claro y completo  
- UX intuitiva con feedback visual (spinner, errores)  
- Uso de herramientas de apoyo (IA PR Reviewer)

---

## 📄 Licencia
MIT
