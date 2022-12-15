const path = require("path");
const itemsRoutes = require("./items");
const authRoutes = require("./auth");

const authMiddleware = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req?.session?.passport?.user?.isVerified) {
      next();
    } else {
      return res.redirect("/auth/verify");
    }
  } else {
    return res.redirect("/auth");
  }
};

const constructorMethod = (app) => {
  app.use("/auth", authRoutes);
  app.use("/items", authMiddleware, itemsRoutes);

  app.get("/", (req, res) => {
    res.redirect("/items");
  });

  app.use("*", (req, res) => {
    res.status(404).sendFile(path.resolve("static/404.html"));
  });

  app.use(() => (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(418).send(err.code);
    }
  });
};

module.exports = constructorMethod;
