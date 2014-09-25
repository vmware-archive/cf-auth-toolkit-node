//Dependenies
var url = require("url"),
  config = require("../config"),
  UAAClient = require("../cfAuthClient");

function authenticate (req, res, next, fail) {

  var user = new UAAClient(req.session);

  if(!config.UAA_ENABLED) {
    next();
  }
  else if (user.access_token || user.refresh_token) {
    user.checkAuth(res , function (valid, newTokens) {
      if(valid){
        if(newTokens) {
          req.session.access_token = newTokens.access_token;
          req.session.refresh_token = newTokens.refresh_token;
        }
        next();
      } else {
        fail("checkAuth failed");
      }
    });
  }
  else {
    fail("access token not present");
  }
}

module.exports.redirect = function (req, res, next) {

  var auth_uri = url.format({
    "protocol" : "https",
    "host" : config.LOGIN_URL,
    "pathname" : config.LOGIN_PATH_NAME,
    "query" : {
      "client_id" : config.UAA_CLIENT_ID,
      "scope" : config.SCOPES,
      "response_type" : "code"
    }
  });

  authenticate(req,res,next, function (reason) {
    console.error("auth check failed because :", reason ," ... redirecting");
    res.redirect(auth_uri);
  });

};

module.exports.error = function(req,res,next) {
  authenticate(req,res,next, function () {
    res.json({ error : "Not Authorized" }, 401);
  });
};
