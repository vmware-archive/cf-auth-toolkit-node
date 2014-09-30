//Dependenies
var config = require("config").get("uaa"),
  UAAClient = require("../cfAuthClient");

function authenticate (req, res, next, fail) {

  var user = new UAAClient(req.session);

  if (user.access_token || user.refresh_token) {
    user.checkAuth(res , function (valid, newTokens) {
      if(valid){
        if(newTokens) {
          req.session.access_token = newTokens.access_token;
          req.session.refresh_token = newTokens.refresh_token;
        }
        next();
      } else {
        fail("checkAuth request failed");
      }
    });
  }
  else {
    fail("access token not present");
  }
  
}

module.exports.redirect = function (req, res, next) {

  

  authenticate(req,res,next, function () {
    // console.error("auth check failed because :", reason ," ... redirecting");
    res.redirect(UAAClient.login_url);
  });

};

module.exports.error = function(req,res,next) {
  authenticate(req,res,next, function () {
    res.json({ error : "Not Authorized" }, 401);
  });
};
