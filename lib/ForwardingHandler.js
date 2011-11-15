module.exports = ForwardingHandler;

var apply = Function.prototype.apply;

function ForwardingHandler(target){
	return Object.keys(traps).reduce(function(ret, name){
		ret[name] = traps[name].bind(ret);
		ret[name].spread = function() { return ret[name].apply(ret[name], arguments[0]); }
		return ret;
	}, { target: target });
}



// Adapted from http://wiki.ecmascript.org/doku.php?id=harmony:proxy_defaulthandler
var traps = {
	getOwnPropertyDescriptor: function(name){
		var desc = Object.getOwnPropertyDescriptor(this.target, name);
		if (desc) desc.configurable = true;
		return desc;
	},
	getPropertyDescriptor: function(name){
		var desc = Object.getPropertyDescriptor(this.target, name);
		if (desc) desc.configurable = true;
		return desc;
	},
	getOwnPropertyNames: function(){
		return Object.getOwnPropertyNames(this.target);
	},
	getPropertyNames: function(){
		return Object.getPropertyNames(this.target);
	},
	defineProperty: function(name, desc){
		Object.defineProperty(this.target, name, desc);
	},
	delete: function(name){
		return delete this.target[name];
	},
	fix: function() {
		if (Object.isFrozen(this.target)) {
			return Object.getOwnPropertyNames(this.target).reduce(function(result, name) {
				result[name] = Object.getOwnPropertyDescriptor(this.target, name);
			}, {});
		}
	},
	has: function(name){
		return name in this.target;
	},
	hasOwn: function(name){
		return this.target.hasOwnProperty(name);
	},
	get: function(receiver, name){
		var prop = this.target[name];
		return (typeof prop) === 'function' ? prop.bind(this.target) : prop;
	},
	set: function(receiver, name, val){
		return this.target[name] = val, true;
	},
	enumerate: function(){
		var result=[];
		for(result[result.length] in this.target);
		return result;
	},
	keys: function(){
		return Object.keys(this.target);
	},
	call: function(receiver, args) {
		return apply.call(this.target, receiver, args)
	},
	new: function(args) {
		return apply.call(this.target, Object.create(this.target.prototype), args);
	}
};