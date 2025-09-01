import request from "supertest";
import app from "../src/app.js";

// PNG 1x1 transparente
const PNG_1x1_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

function bufFromBase64(b64) {
  return Buffer.from(b64, "base64");
}

describe("POST /api/analyze", () => {
  it("400 si no se envía archivo", async () => {
    const res = await request(app).post("/api/analyze");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("400 si el archivo no es imagen", async () => {
    const res = await request(app)
      .post("/api/analyze")
      .attach("image", Buffer.from("not-an-image"), "nota.txt");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("200 con tags si se envía imagen válida y AI_PROVIDER=mock", async () => {
    // Nos aseguramos de que el provider mock esté activo en tests
    process.env.AI_PROVIDER = "mock";

    const res = await request(app)
      .post("/api/analyze")
      .attach("image", bufFromBase64(PNG_1x1_BASE64), {
        filename: "pixel.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("tags");
    expect(Array.isArray(res.body.tags)).toBe(true);
    // Ejemplo: al menos un tag
    expect(res.body.tags.length).toBeGreaterThan(0);
    // Estructura label/confidence
    const t = res.body.tags[0];
    expect(t).toHaveProperty("label");
    expect(t).toHaveProperty("confidence");
    expect(typeof t.label).toBe("string");
    expect(typeof t.confidence).toBe("number");
  });
});
