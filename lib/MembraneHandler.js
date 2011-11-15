var metaHandler = require('./proxy-utils').metaHandler;

module.exports = MembraneHandler;

/**
 * Create a meta handler designed to wrap all non-primitive values in its sphere
 * of influence. Likewise when a value leaves its sphere of influence it is unwrapped.
 * @param {Function}  dispatcher      Gets called on all unfiltered trap lookups.
 * @param {Object}    defaultHandler  Fallback handler with self-bound proxy traps.
 * @param {Function}  wrapper         Function that will do the wrapping. This should return
 *                                    a proxy handled by MembraneHandler, or else it's not
 *                                    really a membrane.
 */
function MembraneHandler(dispatcher, defaultHandler, wrapper) {
	return metaHandler(function(receiver, trap) {
		// Membrane gets the handler results but keeps the control to wrap
		var dispatch = dispatcher(trap, defaultHandler[trap]) || defaultHandler[trap];

		return function(a, b, c) {

			// PRE commit
			if (trap == 'defineProperty') {
				// descriptors can't be proxies but all of their properties can
				b.set = wrap(b.set, wrapper);
				b.get = wrap(b.get, wrapper);
				b.value = wrap(b.value), wrapper;
			}
			if (trap == 'set') {
				c = wrap(c, wrapper);
			}

			var result = dispatch(a, b, c);

			// POST commit
			if (!Object.isPrimitive(result)) {
				if (/get(Own)?PropertyDescriptor/.test(trap)){
					result.set = wrap(result.set, wrapper);
					result.get = wrap(result.get, wrapper);
					result.value = wrap(result.value, wrapper);
				}

				if (/get|call|new/.test(trap)) {
					result = wrap(result, wrapper);
				}
			}
			// result goes back to the accessing site
			return result;
		}
	});
}


// TODO: localize to individual membranes
var wrapmap = new WeakMap;

function wrap(unwrapped, wrapper) {
	// primitives can't be wrapped
	if (Object.isPrimitive(unwrapped)) {
		return unwrapped;
	}
	if (wrapmap.has(unwrapped)) {
		return wrapmap.get(unwrapped);
	} else {
		var wrapped = wrapper(unwrapped);
		wrapmap.set(unwrapped, wrapped);
		// bug in V8 < 3.7 prevents using a proxy as a WeakMap key, need a workaround
		//wrapmap.set(wrapped, unwrapped);
		return wrapped;
	}
}

function unwrap(wrapped) {
	if (Object.isPrimitive(wrapped) || !wrapmap.has(wrapped)) {
		return wrapped;
	} else {
		return wrapmap.get(wrapped);
	}
}
