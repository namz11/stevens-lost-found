const path = require("path");
const itemsRoutes = require("./items");
const authRoutes = require("./auth");

const constructorMethod = (app) => {
  app.use("/auth", authRoutes);
  app.use("/items", itemsRoutes);

  app.get("/", (req, res) => {
    res.redirect("/auth");
  });

  app.use("*", (req, res) => {
    res.status(404).sendFile(path.resolve("static/404.html"));
  });
};

module.exports = constructorMethod;
