const express = require("express");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, JWT_OPTIONS, SECRET_KEY } = require("../config");

const User = require("../models/user.js");
const Message = require("../models/message.js");
const ExpressError = require("../expressError");

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
router.post("/login", async function(req, res, next){
  try{
    //load data from request
    const {username, password} = req.body;
    //verify the username and password
    let auth = await User.authenticate(username, password);
    if(auth === true){
      //update the last login data
      await User.updateLoginTimestamp(username);
      //configure payload
      let payload = {username:username, iat: Date.now()};
      //generate token
      let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
      //pass token along
      return res.json({token});
    }
    if(typeof auth === ExpressError)
      throw auth;
    //throw an error if it doesn't authenticate
    else throw new ExpressError(`Invalid username or password`, 400);
  }
  catch(err){
    console.log(err.message);
    return next(err);
  }
});


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function(req, res, next){
  try{
    //load data from request
    const {username, password, first_name, last_name, phone} = req.body;
    let newUser = {
      username: username,
      password: password,
      first_name: first_name,
      last_name: last_name,
      phone: phone,
    }
    //register the user from data provided
    newUser = await User.register(newUser);
    //configure payload
    let payload = {username:username, iat: Date.now()};
    //generate token
    let token = jwt.sign(payload, SECRET_KEY, JWT_OPTIONS);
    //pass token along
    return res.json({token});
  }
  catch(err){
    return next(err);
  }
})
module.exports = router;