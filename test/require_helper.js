var rewire = require("rewire");
// require_helper.js
module.exports = function (path) {
  return rewire((process.env.APP_DIR_FOR_CODE_COVERAGE || '../lib/') + path);
};