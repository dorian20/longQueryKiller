/**
 * Author @nadir93
 * Date 2018.9.7
 */
const log = require('./lib/log');
const proc = require('./lib/proc');
const sendToES = require('./lib/sendToES');

const HOSTS = process.env.HOST.split(',');

let callback = null;

function success() {
  callback(null, 'success');
}

function fail(e) {
  log.error(e);
  callback(e);
}

const execute = async (event, context, cb) => {

  log.debug('received event:', JSON.stringify(event, null, 2));
  callback = cb;

  try {
    for (let i = 0; i < HOSTS.length; i++) {
      const list = await proc.get(HOSTS[i]);
      log.debug('process list:', list);
      const doc = await proc.kill(list, HOSTS[i]);
      await sendToES(doc);
    }

    success();
  } catch (e) {
    fail(e)
  }
};

process.on('unhandledRejection', (reason, p) => {
  log.debug('reason: ', reason);
  log.debug('p: ', p);
  throw reason;
});

process.on('uncaughtException', (e) => {
  log.debug('uncaughtException: ', e);
  log.error(e);
});

exports.handler = execute;