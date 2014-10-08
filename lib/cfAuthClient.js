var _ = require('lodash'),
	url = require("url"),
	config = require("config").get("uaa"),
	OAuth2Client = require("./oauth2Client");

var UAAClient = (function() {
	'use strict';

	function UAAClient(options){
		// enforces new
		if (!(this instanceof UAAClient)) {
			return new UAAClient(options);
		}
		
		this.attributes = {
			user_id : "00000000-0000-0000-0000-00000000000",
			user_name : "user"
		};

		this.init(options);
	}

	UAAClient.login_url = url.format({
    "protocol" : "https",
    "host" : config.LOGIN_DOMAIN + "." + config.CF_SYS_DOMAIN,
    "pathname" : config.LOGIN_PATHNAME,
    "query" : {
      "client_id" : config.UAA_CLIENT_ID,
      "scope" : config.UAA_SCOPES,
      "response_type" : "code"
    }
  });

	UAAClient.prototype.checkAuth = function(res, cb) {
		
		if(process.env.NODE_ENV === "dev" && !config.UAA_ENABLED) {
			cb(true);
			return;
		}

		this.getInfo.call(this, function getInfoCallback(err, response, data) {
			
			this.authorized = (err || (data && data.error) ) ? false : true;

			if(!this.authorized && this.refresh_token) {
				this.refreshAccessToken(function refreshAccessTokenCallback(err, response, body) {
					this.authorized = (body.error || err) ? false : true;
					cb(this.authorized,body);
				});
			} else {
				cb(this.authorized);
			}
		});

	};

	UAAClient.prototype.config = {
		redirect_uri : config.UAA_REDIRECT_URI,
		user : config.UAA_CLIENT_ID,
		password : config.UAA_CLIENT_SECRET,
		host : config.UAA_DOMAIN + "." + config.CF_SYS_DOMAIN,
		ssl : true,
		auth_type : "bearer"
	};

	UAAClient.prototype.getInfo = function(cb) {
		return this.request("/userinfo", function handleGetInfoReq (err, response, data) {

			if(data) {
				this.attributes = data;
			} else {
				console.log("GETINFO ", err, response,data);
			}
			
			if(typeof cb === "function") {
				cb.apply(this, arguments);
			}

		}.bind(this));
	};

	return UAAClient;
}());

_.defaults(UAAClient.prototype,OAuth2Client.prototype);

module.exports = UAAClient;
