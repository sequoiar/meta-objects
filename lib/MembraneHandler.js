module.exports = MembraneHandler;

var wrapmap = new WeakMap;

function wrap(unwrapped, wrapper) {
	if (Object.isPrimitive(unwrapped)) {
		return unwrapped;
	}
	if (wrapmap.has(unwrapped)) {
		return wrapmap.get(unwrapped);
	} else {
		var wrapped = wrapper(unwrapped);
		wrapmap.set(unwrapped, wrapped);
		// bug in V8 < 3.7.0 prevents using a proxy as a WeakMap key
		// this ruins our wrap party
		//wrapmap.set(wrapped, unwrapped);
		return wrapped;
	}
}
/*
function unwrap(wrapped) {
	if (Object.isPrimitive(wrapped)) {
		return wrapped;
	}
	if (unwrapmap.has(wrapped)) {
		return unwrapmap.get(wrapped);
	} else {
		return wrapped;
	}
}
*/

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
	return Proxy.create({
		get: function(receiver, trap) {
			var dispatch = dispatcher(trap, defaultHandler[trap]) || defaultHandler[trap];
			return function(a, b, c) {
				/*if (trap == 'set') {
					c = unwrap(c);
				}
				if (trap == 'defineProperty') {
					b.set && (b.set = unwrap(b.set));
					b.get && (b.get = unwrap(b.get));
					b.value && (b.value = unwrap(b.value));
				}*/
				var result = dispatch(a, b, c);
				if (!Object.isPrimitive(result)) {
					if (/get(Own)?PropertyDescriptor/.test(trap)){
						result.set && (result.set = wrap(result.set, wrapper));
						result.get && (result.get = wrap(result.get, wrapper));
						result.value && (result.value = wrap(result.value, wrapper));
					}
					if (/get|call|new/.test(trap)) {
						result && wrap(result, wrapper);
					}
				}
				return result;
			}
		}
	});
}
