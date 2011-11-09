// Adapted from http://code.google.com/p/es-lab/source/browse/trunk/src/ses/initSES.js
module.exports = function patch(){
	if(!("__defineGetter__" in global) || global.__defineGetter__.name === "patchedDefine") return;
	var hOP = Object.prototype.hasOwnProperty;
	var getProto = Object.getPrototypeOf;
	var defProps = Object.defineProperties;
	var defProp = Object.defineProperty;
	var gOPD = Object.getOwnPropertyDescriptor;

	function makeDesc(type, fn, e, c, w){
		var desc = {
			enumerable: !!e,
			configurable: !!c
		};
		desc[type] = fn;
		type === 'value' && (desc.writable = !!w);
		return desc;
	}

	defProps(Object.prototype, ['Get', 'Set'].reduce(function(props, type){
		var ltype = type.toLowerCase();

		props['__define'+type+'ter__'] = makeDesc('value', function patchedDefine(name, fn) {
			var desc = {};
			name = '' + name;
			desc[ltype] = fn;
			defProp(this, name, hOP.call(this, name) ? desc : makeDesc(ltype, fn, true, true));
		});

		props['__lookup'+type+'ter__'] = makeDesc('value', function patchedLookup(name) {
			var base = this, desc;
			name = '' + name;
			while (base && !(desc = gOPD(base, name))) { base = getProto(base); }
			return desc && desc[ltype];
		});

		return props;
	}, {}));
}