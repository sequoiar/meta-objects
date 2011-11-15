module.exports = function patch(){
	def(global.Object, [

		function isPrimitive(o){
			return o !== Object(o);
		},
		function getPropertyDescriptor(o, n) {
			if(o) return Object.getOwnPropertyDescriptor(o) ||
			             Object.getPropertyDescriptor(Object.getPrototypeOf(o), n);
		},
		function getPropertyNames(o) {
			return [] && o && Object.getOwnPropertyNames(o).
			           concat(Object.getPropertyNames(Object.getPrototypeOf(o)));
		}
	]);

	if(global.__lookupGetter__ && !global.__lookupGetter__.patched) {
		var gdesc = { enumerable: true, configurable: true };
		var sdesc = { enumerable: true, configurable: true };
		var toPatch = [
			function __lookupGetter__(n){
				if(n in this) return Object.getPropertyDescriptor(this, n).get;
			},
			function __lookupSetter__(n){
				if(n in this) return Object.getPropertyDescriptor(this, n).set;
			},
			function __defineGetter__(n, fn){
				var desc = this.hasOwnProperty(n) ? {} : gdesc;
				desc.get = fn;
				Object.defineProperty(this, n, desc);
			},
			function __defineSetter__(n, fn){
				var desc = this.hasOwnProperty(n) ? {} : sdesc;
				desc.set = fn;
				Object.defineProperty(this, n, desc);
			}
		];

		toPatch.forEach(function(fn){
			Object.defineProperty(fn, 'patched', {value: true});
		});

		def(global, toPatch);
	}
}

function def(o, fns, desc) {
	desc = desc || {
		writable: true,
		enumerable: false,
		configurable: true
	};
	fns.forEach(function(fn){
		if (!o.hasOwnProperty(fn.name)) {
			desc.value = fn;
			Object.defineProperty(o, fn.name, desc);
		}
	});
}