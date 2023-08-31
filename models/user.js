/** User class for message.ly */
const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");
const { use } = require("bcrypt/promises");


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashed_password = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
        `INSERT INTO users (
              username,
              password,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at)
            VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
            RETURNING username, password, first_name, last_name, phone`,
        [username, hashed_password, first_name, last_name, phone]);

    return result.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      //Example code from Hashing and JWTs with Node modifies simply enough to serv this function

      const result = await db.query(
        `SELECT password FROM users WHERE username = $1`,
        [username]);
      const user = result.rows[0];
  
      if (user) {
        return bcrypt.compare(password, user.password)
      }
      throw new ExpressError("User not found", 400);
    } catch (err) {
      return next(err);
    }
  }


  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
        `UPDATE users
           SET last_login_at = current_timestamp
           WHERE username = $1
           RETURNING *`,
        [username]);

    if (!result.rows[0]) {
      throw new ExpressError(`No such message: ${username}`, 404);
    }
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone FROM users`
    )
    return result.rows;
   }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at  FROM users WHERE username = $1`,
      [username]
    );
    if(!result.rows[0]) 
      throw new ExpressError("User not found: " + username, 404);

    return result.rows[0];
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    let result = await db.query(
      `SELECT 
      m.id, 
      CONCAT('{"username":"' , u.username ,'",
      "first_name":"' , u.first_name , '",
      "last_name":"' , u.last_name , '",
      "phone":"' , u.phone , '"}') AS to_user, 
      m.body, 
      m.sent_at, 
      m.read_at
      FROM messages AS m
      INNER JOIN users AS u ON u.username = m.to_username
      WHERE from_username = $1`,
      [username]
    );

    for(let rowNum = 0; rowNum< result.rows.length; rowNum++)
      result.rows[rowNum].to_user = JSON.parse(result.rows[rowNum].to_user);
    return result.rows; 
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    let result = await db.query(
      `SELECT 
      m.id, 
      CONCAT('{"username":"' , u.username ,'",
      "first_name":"' , u.first_name , '",
      "last_name":"' , u.last_name , '",
      "phone":"' , u.phone , '"}') AS from_user, 
      m.body, 
      m.sent_at, 
      m.read_at
      FROM messages AS m
      INNER JOIN users AS u ON u.username = m.from_username
      WHERE to_username = $1`,
      [username]
    );

    for(let rowNum = 0; rowNum< result.rows.length; rowNum++)
      result.rows[rowNum].from_user = JSON.parse(result.rows[rowNum].from_user);
    return result.rows; 
  }
}


module.exports = User;