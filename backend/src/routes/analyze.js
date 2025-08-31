import express from "express";
import multer from "multer";

const router = express.Router();

// Configuración de Multer en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // máximo 10 MB
});

// POST /api/analyze
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  if (!req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ error: "El archivo debe ser una imagen" });
  }

  // Por ahora solo confirmamos la recepción
  return res.json({
    received: true,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

export default router;
