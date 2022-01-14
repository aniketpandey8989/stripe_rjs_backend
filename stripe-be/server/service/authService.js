import { CONSTANTS } from "../util/constants";
import db from "../util/db";
import { getEncryptedPassword, getToken, verifyPassword } from "../util/index";
import { APIMessage, APIMessageTypes } from "../util";
const { INVALID_PASSWORD, INVALID_EMAIL, EMAIL_ALREADY_REGISTERED } = CONSTANTS;

class AuthService {
  static async authLoginCheck(payload) {
    let connection;
    try {
      connection = await db.getConnection();
      const users = await db.query(
        connection,
        "Select * from user where email = ? LIMIT 1",
        [payload.email]
      );

      if (users && users.length > 0) {
        const isPasswordMatch = await verifyPassword(
          payload.password,
          users[0].password
        );
        if (isPasswordMatch) {
          const userData = users[0];
          const jwtToken = getToken(userData);
          userData["token"] = jwtToken;
          delete userData.password;
          return userData;
        } else {
          return new APIMessage(INVALID_PASSWORD, APIMessageTypes.ERROR);
        }
      } else {
        return new APIMessage(INVALID_EMAIL, APIMessageTypes.ERROR);
      }
    } catch (error) {
      throw { msg: error.message };
    } finally {
      db.releaseConnection(connection);
    }
  }

  static async authRegister(payload) {
    let connection;
    try {
      connection = await db.getConnection();
      const users = await db.query(
        connection,
        "Select * from user where email = ? ",
        [payload.email]
      );

      if (users && users.length) {
        return new APIMessage(EMAIL_ALREADY_REGISTERED, APIMessageTypes.ERROR);
      } else {
        payload.password = await getEncryptedPassword(payload.password);
        const addUserRes = await AuthService.addUser(payload);
        return addUserRes;
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      db.releaseConnection(connection);
    }
  }

  static async updatePassword(payload, userDetails) {
    let connection = await db.getConnection();
    const users = await db.query(
      connection,
      "Select * from user where email = ? ",
      [userDetails.email]
    );

    db.releaseConnection(connection);

    if (users && users.length > 0) {
      const isPasswordMatch = await verifyPassword(
        payload.currentPassword,
        users[0].password
      );

      if (isPasswordMatch) {
        payload.password = await getEncryptedPassword(payload.password);
        return new Promise((resolve, reject) => {
          db.getConnection()
            .then((conn) => {
              connection = conn;
              return db.beginTransaction(connection);
            })
            .then(() => {
              return new Promise((res, rej) => {
                connection.query(
                  "update user set password = ? where email = ?",
                  [payload.password, userDetails.email],
                  async (err, results) => {
                    if (err) {
                      db.rollbackTransaction(connection);
                      reject({ msg: err.message });
                    } else {
                      db.commitTransaction(connection);
                      resolve({
                        id: Date.now(),
                      });
                    }
                  }
                );
              });
            })
            .catch((err) => {
              db.rollbackTransaction(connection);
              reject({ msg: err.message });
            });
        }).finally(() => {
          db.releaseConnection(connection);
        });
      } else {
        return new APIMessage(INVALID_PASSWORD, APIMessageTypes.ERROR);
      }
    }
  }

  static async addUser(payload) {
    let connection;
    try {
      connection = await db.getConnection();
      const user = {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      };
      await db.beginTransaction(connection);
      const res = await db.query(connection, "insert into user set ? ", [user]);
      await db.commitTransaction(connection);
      return {
        id: res.insertId,
      };
    } catch (error) {
      db.rollbackTransaction(connection);
      throw { msg: error.message };
    } finally {
      db.releaseConnection(connection);
    }
  }
}

export default AuthService;
