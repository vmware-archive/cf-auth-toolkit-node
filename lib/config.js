var packageJSON = require(process.cwd() + "/package.json");
var defaults = {
  "UAA_CLIENT_ID" : "login",
  "UAA_CLIENT_SECRET" : "loginclientsecret",
  "UAA_REDIRECT_URI" : "",
  "UAA_URL" : "uaa.some.env.cf-app.com",
  "UAA_ENABLED" : true,
  "LOGIN_URL" : "/",
  "LOGIN_PATH_NAME" : "/oauth/authorize"
};

var userConfig = packageJSON.CF_OAUTH2_CONFIG || process.env.CF_OAUTH2_CONFIG;
module.exports = userConfig || defaults;