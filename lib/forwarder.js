var DispatchingHandler = require('./DispatchingHandler')
  , ForwardingHandler = require('./ForwardingHandler');

module.exports = forwarder;

function forwarder(target, dispatcher) {
	var handler = DispatchingHandler(dispatcher, ForwardingHandler(target));
	if (typeof target === 'function') {
		return Proxy.createFunction(handler, target,
			function(){ return handler.call(this, [].slice.call(arguments)); },
			function(){ return handler.new([].slice.call(arguments)); }
		);
	} else {
		return Proxy.create(handler, Object.getPrototypeOf(target));
	}
}