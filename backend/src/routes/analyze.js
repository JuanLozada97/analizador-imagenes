import express from "express";
import multer from "multer";
import { analyzeImage } from "../services/aIProvider.js"

const router = express.Router();

// Configuración de Multer en memoria (máx 10 MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/analyze
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      console.warn("❌ No se subió ningún archivo");
      return res.status(400).json({ error: "No se subió ninguna imagen" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      console.warn(`❌ Archivo inválido: ${req.file.mimetype}`);
      return res.status(400).json({ error: "El archivo debe ser una imagen" });
    }

    console.log(`📸 Analizando ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);

    const result = await analyzeImage(req.file.buffer, req.file.mimetype);

    return res.json(result);
  } catch (err) {
    console.error("⚠️ Error al procesar IA:", err.message);
    return res.status(502).json({ error: "AI service unavailable" });
  }
});

export default router;
