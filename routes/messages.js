const express = require("express");
const{ensureLoggedIn} = require("../middleware/auth");

const User = require("../models/user.js");
const Message = require("../models/message.js");
const ExpressError = require("../expressError");

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function(req, res, next) {
  try {
    //get message
    let message = await Message.get(req.params.id);
    if(typeof message === ExpressError) throw message;
    //use authenticateJWT to check if the logged in user is authorized to view this message
    if(message.from_user.username === req.user.username || message.to_user.username === req.user.username)
      return res.json({message: message});
    else return next({ status: 401, message: "Unauthorized" });
  } catch (err) {
    return next(err);
  }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function(req, res, next) {
  try {
    //create message
    let newMessage ={
      from_username: req.user.username,
      to_username: req.body.to_username,
      body:req.body.body
    }
    newMessage = await Message.create(newMessage);
    //pass along the created message
    return res.json({message:newMessage});
  } catch (err) {
    return next(err);
  }
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function(req, res, next) {
  try {
    //get message
    let message = await Message.get(req.params.id);
    if(typeof message === ExpressError) throw message;
    //use authenticateJWT to check if the logged in user is authorized to view this message
    if(message.to_user.username === req.user.username){
      message = await Message.markRead(message.id);
      return res.json({message: message});
    }
    else return next({ status: 401, message: "Unauthorized" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;