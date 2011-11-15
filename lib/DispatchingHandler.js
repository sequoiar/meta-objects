var metaHandler = require('./proxy-utils').metaHandler;

module.exports = DispatchingHandler;

/**
 * The Dispatching Handler is a meta handler that funnel all acess through one function.
 * It helps simplify Proxy usage by using a provided default handler if the main dispatch
 * function does not return a handler. It also provides the function to the dispatcher.
 * @param  {Function}  dispatcher      Gets called on all unfiltered trap lookups.
 * @param  {Object}    defaultHandler  Fallback handler with self-bound proxy traps.
 * @param  {List}      trapFilter      Array or list of keys containing trap names to ignore.
 * @return {Proxy}  A proxy is returned which is to be used as a handler for another Proxy.
 */
function DispatchingHandler(dispatcher, defaultHandler, trapFilter) {
	if (trapFilter && !Array.isArray(trapFilter)) {
		trapFilter = Object.keys(trapFilter);
	}
	return metaHandler(function(receiver, trap) {
		if (!(trapFilter && ~trapFilter.indexOf(trap))) {
			// Pass in the default handler, but if dispatcher is no-op we can still use it
			return dispatcher(trap, defaultHandler[trap]) || defaultHandler[trap];
		}
	});
}