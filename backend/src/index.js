import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurar Multer (en memoria)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // máx 10MB
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Rutas
app.use("/api/analyze", analyzeRouter);


app.listen(port, () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
});
