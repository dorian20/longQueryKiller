/**
 * Author @nadir93
 * Date 2017.10.31
 */
const isDebugEnabled = () => process.env.DEBUG_LOG === 'true';

function debug(...args) {
  if (isDebugEnabled()) {
    args['0'] = `[DEBUG] ${args['0']}`;
    console.log(...args);
  }
}

function info(...args) {
  args['0'] = `[INFO] ${args['0']}`;
  console.log(...args);
}

function warn(...args) {
  args['0'] = `[WARN] ${args['0']}`;
  console.log(...args);
}

function error(...args) {
  console.log(...args);
}

module.exports.debug = debug;
module.exports.info = info;
module.exports.warn = warn;
module.exports.error = error;