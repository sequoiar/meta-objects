var ForwardingHandler = require('./ForwardingHandler')
  , MembraneHandler = require('./MembraneHandler');

module.exports = MembraneProxy;

/**
 * Create a proxy that wraps every non-primitive value coming into out and unwraps those leaving.
 * One single dispatcher function will be called for all proxies wrapped in a membrane. Be careful with this.
 * @param {Function}         dispatcher  Gets called on all trap lookups in a membrane.
 * @param {Object|Function}  target      Initial base item to trap. All properties and calls on it
 *                                       will be wrapped in proxies.
 */
function MembraneProxy(dispatcher, target) {
	var handler = MembraneHandler(dispatcher, ForwardingHandler(target), function(t){
		return Object.isPrimitive(t) ? t : MembraneProxy(dispatcher, t);
	});
	if (typeof target === 'function') {
		return Proxy.createFunction(handler,
			function(){ return handler.call(this, [].slice.call(arguments)); },
			function(){ return handler.new([].slice.call(arguments)); }
		);
	} else {
		return Proxy.create(handler, Object.getPrototypeOf(target));
	}
}
