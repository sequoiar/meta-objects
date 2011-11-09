module.exports = tracer;
module.exports.TraceDispatcher = TraceDispatcher;

var util = require('util')
  , HandlerProxy = require('./HandlerProxy')
  , trapParams = require('./traps/definitions').params;

function toArray(args){
	return Array.apply(null, args);
}

function labelArgs(trap, args){
	var params = trapParams[trap];
	return args.reduce(function(ret, val, i){
		ret[params[i]] = val;
		return ret;
	}, {});
}

function inspect(){
	toArray(arguments).forEach(function(item){
		console.log(typeof item == 'string' ? item : util.inspect(item, false, 3, true));
	});
}

function TraceDispatcher(args){
	var labeled = labelArgs(this.trap, args);
	delete labeled.receiver;
	inspect(this.trap, labeled);
	return this.forward(args);
}

function tracer(target){
	return HandlerProxy(target, TraceDispatcher);
}