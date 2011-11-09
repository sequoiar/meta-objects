module.exports = function(){
	patchMissingProps(Object, {
		getPropertyDescriptor: function(target, name) {
			var desc;
			while (!desc && target) {
				desc = Object.getOwnPropertyDescriptor(target, name);
				target = Object.getPrototypeOf(target);
			}
			return desc;
		},
		getPropertyNames: function(target) {
			var props = [];
			while (target) {
				props = props.concat(Object.getOwnPropertyNames(target));
				target = Object.getPrototypeOf(target);
			}
			return unique(props);
		},
	});
}

function patchMissingProps(base, fns) {
	var desc = {
		writable: true,
		enumerable: false,
		configurable: true
	};
	for (var name in fns){
		if (!(name in base)) {
			desc.value = fns[name];
			Object.defineProperty(base, name, desc);
		}
	}
}

function unique(arr){
  return Object.keys(arr.reduce(function(r,v){ return r[v]=1, r; },{}));
}