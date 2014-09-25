var should = require("should"),
	sinon = require("sinon"),
	requireHelper = require('../../require_helper.js');

var ouath_middleware = requireHelper('middleware/oauth2.js');
var assert;

describe('Oauth2 Middleware', function() {
	
	it("should export redirect / error", function() {
		assert = (ouath_middleware.redirect).should.be.a.Function;
		assert = (ouath_middleware.error).should.be.a.Function;
	});

	describe('Oauth2 Redirect Middleware', function() {
		var next, req, res, req_mock, res_mock;

		beforeEach(function() {
			next = sinon.spy();
			
			req = {
				param : function() { return "1"; }
			};
			req_mock = sinon.mock(req);
			
			res = {
				redirect : function() {}
			};
			res_mock = sinon.mock(res);
		});

		it("should redirect on fail",function() {
			
			res_mock.expects("redirect").once();

			ouath_middleware.redirect(req,res,next);

			res_mock.verify();

		});

		it("should call next on success",function() {
			var UAAClient = ouath_middleware.__get__("UAAClient");
			
			sinon.mock(UAAClient);

			var authCheckStub = sinon.stub(UAAClient.prototype, "checkAuth");
			
			ouath_middleware.__set__("UAAClient", UAAClient);

			next = sinon.spy();
			
			req = {
				session : {
					access_token : "123"
				},
				param : function() { return "1"; }
			};
			req_mock = sinon.mock();
			
			res = {
				redirect : function() {}
			};
			res_mock = sinon.mock(res);
			
			ouath_middleware.redirect(req,res,next);

			authCheckStub.callArgWith(1, true);

			assert = (next.called).should.be.true;

		});

	});


	
});
