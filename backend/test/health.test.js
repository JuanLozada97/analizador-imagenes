import request from "supertest";
import app from "../src/app.js";

describe("GET /api/health", () => {
  it("responde 200 y { ok: true }", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
