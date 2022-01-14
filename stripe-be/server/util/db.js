const env = require("dotenv").config();
import { createPool } from "mysql";
import { promisify } from "util";

const config = {
  db_url: process.env.DB_URL,
  db_connection_limit: process.env.DB_CONNECTION_LIMIT,
  DB_acquire_timeout: process.env.DB_ACQUIRE_TIMEOUT,
  db_connect_timeout: process.env.DB_CONNECT_TIMEOUT,
};

const pool =
  createPool(`${config.db_url}?connectionLimit=${config.db_connection_limit}
&dateStrings=true&multipleStatements=true
&acquireTimeout=${config.db_acquire_timeout}
&connectTimeout=${config.db_connect_timeout}`);

class DB {
  static getConnection() {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        } else resolve(connection);
      });
    });
  }

  static query(connection, sql, args) {
    return promisify(connection.query).call(connection, sql, args);
  }

  static releaseConnection(connection) {
    if (!DB.isReleased(connection)) {
      connection && connection.release();
    }
  }

  static isReleased(connection) {
    return pool._freeConnections.indexOf(connection) !== -1;
  }

  static commitTransaction(connection) {
    return new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) {
          return reject(err);
        }
        if (!DB.isReleased(connection)) {
          connection.release();
        }
        return resolve();
      });
    });
  }

  static rollbackTransaction(connection) {
    return new Promise((resolve, reject) => {
      connection.rollback((err) => {
        if (!DB.isReleased(connection)) {
          connection.release();
        }
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  static beginTransaction(connection) {
    return new Promise((resolve, reject) => {
      try {
        connection.beginTransaction((err) => {
          if (err) {
            throw err;
          }
          return resolve();
        });
      } catch (error) {
        if (!DB.isReleased(connection)) {
          connection.release();
        }
        return reject(error);
      }
    });
  }
}

export default DB;
