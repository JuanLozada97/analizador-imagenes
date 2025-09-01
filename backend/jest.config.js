/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  verbose: true,
  // ESM soportado por tener "type":"module" en package.json + flag vm-modules en script
  transform: {},
  testMatch: ["**/test/**/*.test.js"],
  moduleFileExtensions: ["js", "json"]
};
