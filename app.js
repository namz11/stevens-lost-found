const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const passport = require("passport");

const app = express();
const configRoutes = require("./routes");

app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "AuthCookie",
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.engine(
  "handlebars",
  exphbs.create({
    helpers: require("./utils/handlebars").helpers,
    defaultLayout: "home",
    partialsDir: __dirname + "/views/templates/",
  }).engine
);
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
