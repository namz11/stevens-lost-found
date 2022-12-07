const express = require("express");
const exphbs = require("express-handlebars");
// const mongoCollections = require("./config/mongoCollections");
// const Group50_Project_CS546 = mongoCollections.itemsCollection;
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");

const app = express();
// const data = await Group50_Project_CS546();
const configRoutes = require("./routes");

app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
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

app.engine(
  "handlebars",
  exphbs.create({
    helpers: require("./utils/handlebars").helpers,
    defaultLayout: "home",
    partialsDir: __dirname + "/views/templates/",
  }).engine
);
app.set("view engine", "handlebars");

// app.get("/listing/:page", (req, res, next) => {
//   var perPage = 5;
//   //  const page = parseInt(req.query.page);
//   var page = req.params.page || 1;

//   // const limit = parseInt(req.query.limit);
//   // const startIndex = (page - 1) * limit;
//   // const endIndex = page * limit;

//    data
//     .find({})
//     .skip(perPage * page - perPage)
//     .limit(perPage)
//     .exec(function (err, data) {
//       data.count().exec(function (err, count) {
//         if (err) return next(err);
//         res.render("listing/listing", {
//           data: data,
//           current: page,
//           pages: Math.ceil(count / perPage),
//         });
//       });
//     });
// });

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
