const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");

const userContoller = require("../controllers/user.js");

router.route("/signup")
.get(userContoller.renderSignupForm)
.post(wrapAsync(userContoller.signup))

router.route("/login")
.get(userContoller.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
}),userContoller.login);

router.get("/logout", userContoller.logout);

module.exports = router;