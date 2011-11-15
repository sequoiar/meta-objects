
function makeSimpleMembrane(target) {

	function wrap(wrapped) {
		if (Object.isPrimitive(wrapped)) {
			return wrapped;
		}

		function wrapCall(fun, that, args) {
			try {
				return wrap(fun.apply(that, Array.prototype.map.call(args, wrap)));
			} catch (e) {
				throw wrap(e);
			}
		}

		var baseHandler = new Forwarder(wrapped);
		var revokeHandler = Proxy.create(Object.freeze({
			get: function(receiver, name){
				return function(){
					return wrapCall(baseHandler[name], baseHandler, arguments);
				}
			}
		}));

		if (typeof wrapped === "function") {
			function callTrap(){
				return wrapCall(wrapped, wrap(this), arguments);
			}
			function constructTrap(){
				try {
					function forward(args){ return wrapped.apply(this, args); }
					return wrap(new forward(Array.prototype.map.call(arguments, wrap)));
				} catch (e) {
					throw wrap(e);
				}
			}
			return Proxy.createFunction(revokeHandler, callTrap, constructTrap);
		} else {
			return Proxy.create(revokeHandler, wrap(Object.getPrototypeOf(wrapped)));
		}
	}

	return Object.freeze({ wrapper: wrap(target), gate: gate });
}