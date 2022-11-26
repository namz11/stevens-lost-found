const express = require("express");
const exphbs = require("express-handlebars");

const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");

const app = express();
const static = express.static(__dirname + "/public");

const configRoutes = require("./routes");

app.use("/public", static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(flash());
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log("Your routes will be running on http://localhost:3000");
});