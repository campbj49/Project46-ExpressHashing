const express = require("express");

const User = require("../models/user.js");
const Message = require("../models/message.js");

const router = new express.Router();

/** GET /auth: Show login page by default */

router.get("/", async function(req, res, next) {
  try {
    return res.json("Login page placeholder");
  } catch (err) {
    return next(err);
  }
});

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
module.exports = router;