const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const LocalStorage = require("node-localstorage").LocalStorage;
const mongoCollections = require("../config/mongoCollections");
const auth = mongoCollections.usersCollection;
var localStorage = new LocalStorage("./scratch");
const { ObjectId } = require("mongodb");

function initialize(passport) {
    const authenticateUser = async(email, password, done) => {
        const readData = await auth();
        const user = await readData.findOne({ email: email });
        if (user === null) {
            return done(null, false, { message: "No user with that email" });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                localStorage.setItem("user", JSON.stringify(user));
                //console.log(user);
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (e) {
            return done(e);
        }
    };

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user._id));
    passport.deserializeUser(async(id, done) => {
        const readData = await auth();
        const user = await readData.findOne({ _id: ObjectId(id) });
        return done(null, user._id);
    });
}

module.exports = initialize;