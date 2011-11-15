var util = require('util')
  , forwarder = require('./forwarder')
  , traps = require('./traps');

module.exports = tracer;

function inspect(obj) {
	return util.inspect(obj, false, 1, true)
}

function tracer(target){
	var pause = false;
	return forwarder(target, function(trap, receiver, defaultHandler){
		if (pause) return;
		var caller = arguments.callee.caller.caller;
		if (caller.name == 'formatValue') {
			pause = true;
			process.nextTick(function(){ pause = false; });
			return;
		}
		if (caller.name == 'STRING_ADD_LEFT') {
			return;
		}
		var max = 0;
		var callers = [];
		while (caller && !~callers.indexOf(caller)) {
			if (caller.arguments && ({}).toString.call(caller.arguments[1]) == '[object Context]') {
				callers.push('REPL');
				break;
			}
			callers.push(caller);
			caller = caller.caller;
			if (max++ == 10) break;
		}
		callers = callers.reverse().map(function(fn){
			if(Object[fn.name] === fn) {
				return 'Object.' + fn.name;
			}
			if(Array[fn.name] === fn) {
				return 'Array.' + fn.name;
			}
			if (typeof fn == 'string') {
				return colorize(fn, 'byellow');
			} else {
				var params = parseParams(fn);
				if ('arguments' in fn && fn.arguments && fn.arguments.length) {
					var args = [].map.call(fn.arguments, function mapping(s, i){
						if (i < params.length) {
							return params[i] + ':' + s;
						} else {
							return s;
						}
					});
				}
			}
			return colorize(fn.name, 'cyan') + ' (' + colorize((args || params), 'bgreen') + ')';
		});
		return function(){
			var args = traps.nameArgs(trap, arguments);
			delete args.receiver;
			console.log(callers.join('\n') + ': ' + colorize(trap, 'bmagenta') + ' (' + inspect(args).slice(2,-2) + ')');
			return defaultHandler.spread(arguments);
		}
	});
}

function parseParams(fn){
	if(typeof fn != "function") return [];
	var code = fn + '';
	return code.slice(code.indexOf('(') + 1, code.indexOf(')')).
		split(',').
		map(function trim(s){return s.trim()}).
		filter(function filter(s){return s.length});
}


var colors = {
  black:     [30, 39],
  red:       [31, 39],
  green:     [32, 39],
  yellow:    [33, 39],
  blue:      [34, 39],
  magenta:   [35, 39],
  cyan:      [36, 39],
  white:     [37, 39],
  bblack:    ['1;30', '22;39'],
  bred:      ['1;31', '22;39'],
  bgreen:    ['1;32', '22;39'],
  byellow:   ['1;33', '22;39'],
  bblue:     ['1;34', '22;39'],
  bmagenta:  ['1;35', '22;39'],
  bcyan:     ['1;36', '22;39'],
  bwhite:    ['1;37', '22;39']
};

function colorize(str, color) {
	return '\033[' + colors[color][0] + 'm' + str + '\033[' + colors[color][1] + 'm';
}