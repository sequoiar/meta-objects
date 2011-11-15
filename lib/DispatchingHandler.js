module.exports = DispatchingHandler;

function DispatchingHandler(dispatcher, defaultHandler, trapFilter) {
	if (trapFilter && !Array.isArray(trapFilter)) {
		trapFilter = Object.keys(trapFilter);
	}
	return Proxy.create({
		get: function(receiver, trap) {
			if (!(trapFilter && ~trapFilter.indexOf(trap))) {
				return dispatcher(trap, receiver, defaultHandler[trap]) || defaultHandler[trap];
			}
		}
	});
}