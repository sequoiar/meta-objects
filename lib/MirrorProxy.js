var DispatchingHandler = require('./DispatchingHandler')
  , ForwardingHandler = require('./ForwardingHandler');

module.exports = MirrorProxy;

/**
 * Create a Proxy with a DispatchingHandler using a ForwardingHandler as a default.
 * This Proxy provides you with the default handler on each dispatch, and will
 * automatically use it if you don't return anything.
 * @param  {Object|Function}   target       Source object or function to mirror.
 * @param  {Function}          dispatcher   Function to be notified on all trap handler lookups
 * @return {Proxy}
 */
function MirrorProxy(target, dispatcher) {
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