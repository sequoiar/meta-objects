module.exports = HandlerProxy;

function toArray(args){
	return Array.apply(null, args);
}

var forwardingTraps = require('./traps/forwarding');

function HandlerProxy(target, dispatcher) {
	var handler = Proxy.create({
		get: function(receiver, trap){
			return function(){
				if (trap === 'get' && arguments[1] === 'toString') {
					return target.toString;
				}
				return dispatcher.call({
					trap: trap,
					target: target,
					forward: function(args){
						return forwardingTraps[this.trap].apply(forwardingTraps, [this.target].concat(args));
					}
				}, toArray(arguments));
			}
		}
	});
	if (typeof target === 'function') {
		var call = function(){ return handler.call(this, toArray(arguments)); };
		var construct = function(){ return handler.new(toArray(arguments)); };
		return Proxy.createFunction(handler, call, construct);
	} else {
		return Proxy.create(handler, Object.getPrototypeOf(target));
	}
}