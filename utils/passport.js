const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoCollections = require("../config/mongoCollections");
const auth = mongoCollections.usersCollection;
const { ObjectId } = require("mongodb");
const { userDL } = require("../data");

function initialize(passport) {
  const authenticateUser = async (req, email, password, done) => {
    const readData = await auth();
    const user = await readData.findOne({ email: email });

    if (user === null) {
      return done(null, false, { message: "No user with that email" });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        const user = await userDL.getUserByEmail(email);
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: true },
      authenticateUser
    )
  );
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser(async (user, done) => {
    const readData = await auth();
    const userDe = await readData.findOne({ _id: ObjectId(user._id) });
    return done(null, userDe._id);
  });
}

module.exports = initialize;
