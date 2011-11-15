if (typeof Proxy == 'undefined' || typeof WeakMap == 'undefined') {
	throw "This module requires node to be run with V8 flags --harmony_proxies --harmony_weakmaps";
}

var patch = require('./patch');
patch();


module.exports = {
	handlers: {
		Forwarding: require('./ForwardingHandler'),
		Dispatching: require('./DispatchingHandler'),
		Membrane: require('./MembraneHandler')
	},
	proxies: {
		Mirror: require('./MirrorProxy'),
		Tracer: require('./TracerProxy'),
		Membrane: require('./MembraneProxy')
	},
	trapUtils: require('./trap-utils')
};