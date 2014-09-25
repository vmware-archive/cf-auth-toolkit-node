var sinon = require("sinon"),
  nock = require('nock'),
  requireHelper = require('../require_helper.js'),
  oauth_config = require("../../lib/config.js");

var assert;
require("should");

var PREV_ENV = process.env.NODE_ENV;

var UAAClient = requireHelper("cfAuthClient");

describe('UAAClient Resource', function() {
  
  describe('Constructor', function() {

    it("should assign instance attributes based on cookie values", function() {
      var testClient = new UAAClient({
          access_token : "access_1234",
          refresh_token : "refresh_1234"
      });
      (testClient.access_token).should.equal("access_1234");
      (testClient.refresh_token).should.equal("refresh_1234");
    });

  });

  describe("checkAuth", function() {
    var testClient;
    
    beforeEach(function() {
      testClient = new UAAClient({
          access_token : "access_1234",
          refresh_token : "refresh_1234"
      });
    });

    afterEach(function() {
      process.env.NODE_ENV = PREV_ENV;
    });

    it("should apply callback with true in 'dev' env ", function() {
      var callback = sinon.spy();
      process.env.NODE_ENV = 'dev';
      testClient.checkAuth({},callback);
      return callback.calledWith(true).should.be.true;
    });

    it("should apply callback with false if info request returns false", function() {

      var callback = sinon.spy();

      delete testClient.access_token;
      delete testClient.refresh_token;

      sinon.stub(testClient, "getInfo", function(cb) {
        cb.call(testClient ,false, "nope", { error : "yeah" });
      });

      testClient.checkAuth({},callback);
      assert = (callback.calledWith(false)).should.be.true;

    });

    it("should attempt to refresh access token if info request returns false and refresh token is defined", function(done) {
      
      var scope = nock("https://"+ oauth_config.UAA_URL)
        .get('/userinfo')
        .reply(500, { error : true })
        .get("/oauth/token?redirect_uri=&grant_type=refresh_token&refresh_token=refresh_1234")
        .reply(200, { refreshed : "tru"  });
      
      testClient.checkAuth({},function() {
        assert = (arguments[0]).should.be.true;
        (arguments[1]).should.eql({ refreshed : "tru"  });
        scope.done();
        done();
      });
      

    });

  });

});