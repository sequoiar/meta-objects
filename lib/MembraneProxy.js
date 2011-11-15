var ForwardingHandler = require('./ForwardingHandler')
  , MembraneHandler = require('./MembraneHandler')
  , proxyFor = require('./proxy-utils').proxyFor;

module.exports = MembraneProxy;

/**
 * Create a proxy that wraps every non-primitive value coming into out and unwraps those leaving.
 * One single dispatcher function will be called for all proxies wrapped in a membrane. Be careful with this.
 * @param {Function}         dispatcher  Gets called on all trap lookups in a membrane.
 * @param {Object|Function}  target      Initial base item to trap. All properties and calls on it
 *                                       will be wrapped in proxies.
 */
function MembraneProxy(target, dispatcher) {
	// simple reflexive wrapper
	function wrap(newObj){
		return Object.isPrimitive(newObj) ? newObj : MembraneProxy(newObj, dispatcher);
	}

	//TODO: one MembraneHandler for entire membrane, separate out individual forwarders
	var handler = MembraneHandler(dispatcher, ForwardingHandler(target), wrap);
	return proxyFor(target, handler);
}