const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtKey = "pod-secret-backend-jwt-key";
const jwtExpirySeconds = "1h";
const env = require('dotenv').config();

/**
 * @param {string} fields string of fields separated by comma
 */

export const getEncryptedPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password, encryptedPassword) => {
  return await bcrypt.compare(password, encryptedPassword);
};

export class APIMessage {
  constructor(apiMessage, messageType, data) {
    this.apiMessage = apiMessage;
    this.messageType = messageType;
    this.data = data;
  }
}

export const APIMessageTypes = {
  ERROR: "error",
  SUCCESS: "success",
  INFO: "info",
};

export const getToken = (payload) => {
  const email = payload.email;
  const roleId = payload.role;
  const id = payload.id;
  const firstName = payload.firstName;
  const lastName = payload.lastName;

  const token = jwt.sign({ id, email, roleId, firstName, lastName }, jwtKey, {
    algorithm: "HS256",
    expiresIn: jwtExpirySeconds,
  });
  return token;
};

export const isAuthenticated = (req, res, next) => {
  const token = req.headers.token;
  if (token && token !== null) {
    jwt.verify(token, jwtKey, function (err, decodedToken) {
      if (err) {
        res.sendStatus(401);
      } else {
        const user = {
          email: decodedToken.email,
          role: decodedToken.roleId,
          id: decodedToken.id,
        };
        req.user = user;
        const newToken = getToken(user);
        req.email = decodedToken.email;
        req.roleId = decodedToken.roleId;
        res.header("x-auth-token", newToken);
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
};

export const getUserDetails = async (req, res) => {
  const token = req.headers.token;
  let userDetails;
  if (token && token !== null) {
    jwt.verify(token, jwtKey, function (err, decodedToken) {
      if (err) {
        console.log(err);
      } else {
        if (decodedToken.id) {
          userDetails = decodedToken;
        } else {
          res.sendStatus(401);
        }
      }
    });
    return userDetails;
  }
};