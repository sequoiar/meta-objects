var MirrorProxy = require('./MirrorProxy')
  , trapUtils = require('./trap-utils')
  , util = require('util');

module.exports = TracerProxy;


/**
 * A horrible hackey attempt at a transparent tracer. Much of the code is
 * there to filter out of the noise from other introspection tools
 * (notably util.inspect and console.log) which can easily cause infinite
 * recursion and definitely multiply every action by 5.
 * @param {Function|Object} target    Target to tap. Currently only taps directly on target.
 */
function TracerProxy(target){
	var pause = false;
	return MirrorProxy(target, function(trap, receiver, defaultHandler){
		if (pause) return;
		// ref to first interesting function in the stack
		// none of this caller business will work in ES6
		var caller = arguments.callee.caller.caller;

		// REPL repitition
		if (caller.name == 'STRING_ADD_LEFT') return;

		// filter util.inspect out entirely
		if (caller.name == 'formatValue') {
			pause = true;
			process.nextTick(function(){ pause = false; });
			return;
		}

		var max = 0, callers = [];
		while (caller && !~callers.indexOf(caller)) {
			// Useful REPL
			if (caller.arguments && ({}).toString.call(caller.arguments[1]) == '[object Context]') {
				callers.unshift('REPL');
				break;
			}
			callers.unshift(caller);
			if (max++ == 10) break;
			caller = caller.caller;
		}

		callers = callers.map(function(fn){
			if (typeof fn == 'string') {
				// REPL
				return colorize(fn, 'byellow');
			} else {
				var params = parseParams(fn);
				if (fn.arguments && fn.arguments.length) {
					// map args to parsed param names if possible
					var args = [].map.call(fn.arguments, function(arg, i){
						return i < params.length ? colorize(params[i] + ':', 'bcyan') + arg : arg;
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
	if(typeof fn != 'function') return [];
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

function inspect(obj) {
	return util.inspect(obj, false, 1, true)
}
