const express = require("express");
const morgan = require("morgan");
const hpp = require("hpp");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const authRoutes = require("../routes/authRoutes");
const searchOptionRoutes = require("../routes/searchOptionRoutes");
const propertyRoutes = require("../routes/propertyRoutes");
const uploadRoutes = require("../routes/uploadRoutes");

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || "*";

function registerMiddlewares(app) {
  app
    .set("trust proxy", 1)
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(hpp({}))
    .use(helmet())
    .use(
      cors({
        origin:
          ALLOWED_ORIGINS === "*"
            ? ALLOWED_ORIGINS
            : ALLOWED_ORIGINS.split(",").map((s) => s.trim()),
        credentials: true,
      }),
    )
    .use(morgan("dev"))
    .use(
      "/uploads",
      express.static(path.join(__dirname, "../../public/uploads")),
    )
    .disable("x-powered-by");
}

function userRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/search-options", searchOptionRoutes);
  app.use("/api/properties", propertyRoutes);
  app.use("/api/uploads", uploadRoutes);
}

module.exports = {
  registerMiddlewares,
  userRoutes,
};
