var _ = require('lodash'),
	config = require("../lib/config"),
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

	UAAClient.prototype.checkAuth = function(res, cb) {

		if(process.env.NODE_ENV === "dev") {
			cb(true);
			return;
		}

		this.getInfo(function getInfoCallback(err, response, data) {

			this.authorized = (err || (data && data.error) ) ? false : true;

			if(!this.authorized && this.refresh_token) {
				console.log("!this.authorized && this.refresh_token");
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
		host : config.UAA_URL,
		ssl : true,
		auth_type : "bearer"
	};

	UAAClient.prototype.getInfo = function(cb) {
		return this.request("/userinfo", function handleGetInfoReq (err, response, data) {
			if(data && !data.error) {
				this.attributes = data;
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
