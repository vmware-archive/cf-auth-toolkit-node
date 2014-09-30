var request = require('request'),
  _ = require('lodash'),
  config = require("config").get("uaa"),
  url = require('url');

var OAuth2Client = (function() {
  'use strict';

  function OAuth2Client(options) {
    if (!(this instanceof OAuth2Client)) {
      return new OAuth2Client(options);
    }
    this.init(options);
  }

  OAuth2Client.prototype.init = function(options) {
    options = options || {};
    
    this.access_token = options.access_token || "";
    this.refresh_token = options.refresh_token || "";
  };

  OAuth2Client.prototype.refreshAccessToken = function(cb) {

    this.getAccessToken("refresh_token", function(err, response, body) {
      if(err) {
        throw err;
      }

      if(!body.error) {
        this.access_token = body.access_token;
        this.refresh_token = body.refresh_token;
        this.expires_in = body.expires_in;
        this.authorized = true;
      } else {
        this.access_token = '';
        this.refresh_token = '';
        this.authorized = false;
        this.expires_in = 0;
      }
      
      if(typeof cb === "function") {
        cb.apply(this, arguments);
      }

    });
  };

  OAuth2Client.prototype.getAccessToken = function(grant_type, grant_code, cb) {
    if(typeof grant_code === "function" && grant_type === "refresh_token"){
      cb = grant_code;
      grant_code = this.refresh_token;
    }
    
    var query = {
      "redirect_uri" : this.config.redirect_uri,
      "grant_type" : grant_type
    };

    if(grant_type === "authorization_code") {
      query['code'] = grant_code;
    } else if (grant_type === "refresh_token") {
      query['refresh_token'] = grant_code;
    }

    this.request("/oauth/token", { auth_type : "basic", query : query }, function(err) {
      if(err){
        throw err;
      }

      if(typeof cb === "function") {
        cb.apply(this, arguments);
      }
    }.bind(this));
  };

  OAuth2Client.prototype.getURI = function(path, query) {
    var urlObj = {
      'protocol' : (this.config.ssl) ? "https" : "http",
      'host' : this.config.host,
      'pathname' : path,
      'query' :  query,
      "headers" : {}
    };

    if (this.config.auth_type === "url" && this.access_token) {
      urlObj.query['access_token'] = this.access_token;
    }

    return url.format(urlObj);
  };

  OAuth2Client.prototype.request = function(path, config, cb) {

    if(typeof config === "function") {
      cb = config;
      config = this.config;
    }
    
    _.defaults(config, this.config);

    var reqConfig = {
      json : true,
      headers : config.headers || {},
      timeout : 2000,
      url : this.getURI(path, config.query || {})
    };
        
    if(config.auth_type === "bearer") {
      reqConfig.headers['Authorization'] = "bearer " + this.access_token;
    } else if (config.auth_type === "basic") {
      reqConfig.auth = {
        'user': config.user || this.config.user,
        'pass': config.password || this.config.password
      };
    } else {
      reqConfig.query.access_token = this.access_token;
    }

    if(this.logRequests || config.VERBOSE ){
      console.log("REQUEST ::::: \n ", reqConfig, "\n ::::: //REQUEST");
      var origCB = cb;
      cb = function(){
        console.log("response ::::: \n ", arguments, "\n  ::::::: ///RESPONSE");
        origCB.apply(this, arguments);
      };
    }


    return request(reqConfig, cb);
  };

  return OAuth2Client;

}());

module.exports = OAuth2Client;
