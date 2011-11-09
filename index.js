if (typeof Proxy == "undefined") {
	throw "This module requires node to be run with V8 flags --harmony_proxies --harmony_weakmaps";
}

var patchLegacy = require("./patchLegacy");
var patchMissing = require("./patchMissing");
patchLegacy();
patchMissing();

module.exports = {
	traps: require("./traps"),
	HandlerProxy: require("./HandlerProxy"),
	tracer: require("./tracer")
}