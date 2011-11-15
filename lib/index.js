if (typeof Proxy == "undefined") {
	throw "This module requires node to be run with V8 flags --harmony_proxies --harmony_weakmaps";
}

var patch = require("./patch");
patch();


module.exports = {
	handlers: {
		Forwarding: require('./ForwardingHandler'),
		Dispatching: require('./DispatchingHandler')
	},
	proxies: {
		forwarder: require('./forwarder'),
		tracer: require('./tracer')
	},
	traps: require('./traps')
};