require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./models/initDb");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // multipart/form-data 지원

// Swagger UI 및 OpenAPI 문서 제공
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const yaml = require("js-yaml");
const openapiPath = require("path").join(
  __dirname,
  "../lipcoding_mihyejeon/openapi.yaml"
);
const openapiDoc = yaml.load(fs.readFileSync(openapiPath, "utf8"));

app.use("/openapi.json", (req, res) => {
  res.json(openapiDoc);
});
app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(openapiDoc));
app.get("/", (req, res) => {
  res.redirect("/swagger-ui");
});

// 라우터 연결
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/mentors", require("./routes/mentors"));
app.use("/api/match-requests", require("./routes/matchRequests"));
app.use("/api/images", require("./routes/images"));

// 기본 라우트
app.get("/", (req, res) => {
  res.send("Mentor-Mentee Matching Platform API");
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
