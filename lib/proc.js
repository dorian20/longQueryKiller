/**
 * Author @nadir93
 * Date 2018.9.7
 */
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-2'
});
const mysql = require('mysql');
const log = require('./log');

const {
  LIMIT,
  DATABASE,
  PASSWORD,
  USER,
} = process.env;

//log.debug('PASSWORD: ', PASSWORD);

let decrypted;

// const TARGETUSER = process.env.TARGETUSER.split(',');
// let targetUsersString = "";
// for (let i = 0; i < TARGETUSER.length; i++) {
//   targetUsersString += " user = '" + TARGETUSER[i].trim() + "' OR";
// }
// targetUsersString = targetUsersString.substr(0, targetUsersString.length - 2);
// log.debug('targetUsersString:', targetUsersString);

class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err)
          return reject(err);
        resolve(rows);
      });
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err)
          return reject(err);
        resolve();
      });
    });
  }
}

const get = async (host) => {

  let db;

  try {

    if (!decrypted) {
      // Decrypt code should run once and variables stored outside of the function
      // handler so that these are decrypted once per container
      const kms = new AWS.KMS();
      const data = await kms.decrypt({
        CiphertextBlob: new Buffer(PASSWORD, 'base64')
      }).promise();

      decrypted = data.Plaintext.toString('ascii');
      //log.debug('password: ', data.Plaintext.toString('ascii'));
    }

    db = new Database({
      host: host,
      user: USER,
      password: decrypted,
      //database: 'elltgddev'
      database: DATABASE,
    });

    const TARGETUSER = JSON.parse(process.env.TARGETUSER)[host];
    let targetUsersString = "";
    for (let i = 0; i < TARGETUSER.length; i++) {
      targetUsersString += " user = '" + TARGETUSER[i].trim() + "' OR";
    }
    targetUsersString = targetUsersString.substr(0, targetUsersString.length - 2);
    log.debug('targetUsersString:', targetUsersString);

    //const sql = "select * from gd_goods a, gd_goods b, gd_goods c, gd_goods d";
    //const sql = "show tables";
    const sql = "select id, user, host, command, info, state, db, time from information_schema.processlist where time > " +
      LIMIT + " and (" + targetUsersString + ") and command <> 'Sleep'";
    const rows = await db.query(sql);
    return rows;
  } catch (e) {
    log.error(e);
    throw e;
  } finally {
    if (db) {
      await db.close();
    }
  }
}

const kill = async (list, host) => {
  const data = JSON.parse(JSON.stringify(list))
  log.debug('data:', data);

  let db;

  try {

    // [ { id: 1138135,
    //   user: 'b2_dba',
    //   host: '10.125.232.45:53530',
    //   command: 'Query',
    //   info: 'select * from gd_goods a, gd_goods b, gd_goods c, gd_goods d',
    //   state: 'Sending to client',
    //   time: 6 } ]

    db = new Database({
      host: host,
      user: USER,
      password: decrypted,
      database: DATABASE,
    });

    for (let i = 0; i < data.length; i++) {
      //await db.query('kill ' + data[i].id);
      await db.query('CALL mysql.rds_kill(' + data[i].id + ')');
      log.debug('process killed(id): ', data[i].id)
    }

    return data;
  } catch (e) {
    log.error(e);
    throw e;
  } finally {
    if (db) {
      await db.close();
    }
  }
}

module.exports.get = get;
module.exports.kill = kill;