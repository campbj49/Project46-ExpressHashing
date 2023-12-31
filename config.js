/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI = (process.env.NODE_ENV === "test")
  ? "postgresql://postgres:@localhost:5432/messagely_test"
  : "postgresql://postgres:@localhost:5432/messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const JWT_OPTIONS ={};// { expiresIn: 60 * 60 };  // 1 hour

const BCRYPT_WORK_FACTOR = 12;


module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  JWT_OPTIONS
};