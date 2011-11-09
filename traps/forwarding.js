
// Adapted from http://wiki.ecmascript.org/doku.php?id=harmony:proxy_defaulthandler

var apply = Function.prototype.apply;

module.exports = {
	// fundamental
	getOwnPropertyDescriptor: function(target, name) {
		var desc = Object.getOwnPropertyDescriptor(target, name);
		desc && (desc.configurable = true);
		return desc;
	},
	getPropertyDescriptor: function(target, name) {
		var desc = Object.getPropertyDescriptor(target, name);
		desc && (desc.configurable = true);
		return desc;
	},
	getOwnPropertyNames: function(target){
		return Object.getOwnPropertyNames(target);
	},
	getPropertyNames: function(target){
		return Object.getPropertyNames(target);
	},
	defineProperty: function(target, name, desc) {
		Object.defineProperty(target, name, desc);
	},
	delete: function(target, name){
		return delete target[name];
	},
	fix: function(target) {
		var handler = this;
		if (Object.isFrozen(target)) {
			return Object.getOwnPropertyNames(target).reduce(function(props, name) {
				var desc = Object.getOwnPropertyDescriptor(target, name);
				props[name] = {
					get: function( ) { return handler.get(this, name); },
					set: function(v) { return handler.set(this, name, v); },
					enumerable: desc.enumerable,
					configurable: desc.configurable
				};
				return props;
			}, {});
		}
	},
	// derived
	enumerate: function(target){
		var r = [];
		for (var name in target) { r.push(name); };
		return r;
	},
	hasOwn: function(target, name){
		return ({}).hasOwnProperty.call(target, name);
	},
	keys: function(target){
		return Object.keys(target);
	},
	get: function(target, receiver, name){
		return target[name];
	},
	set: function(target, receiver, name, val) {
		target[name] = val;
		return true;
	},
	has: function(target, name){
		return name in target;
	},
	// function
  call: function(target, receiver, args) {
    return apply.call(target, receiver, args)
  },
  new: function(target, args) {
    var receiver = Object.create(target.prototype);
    return apply.call(target, receiver, args);
  }
};