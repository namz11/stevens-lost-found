const express = require("express");
const exphbs = require("express-handlebars");

const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");

const app = express();

const configRoutes = require("./routes");

app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(flash());
app.use(
  session({
    name: "Group50",
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(async (req, res, next) => {
  if (req.session.passport) {
    console.log(req.session.passport.user.email);
  }

  next();
});
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
