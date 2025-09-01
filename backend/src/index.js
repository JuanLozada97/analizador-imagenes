import app from "./app.js";

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
});