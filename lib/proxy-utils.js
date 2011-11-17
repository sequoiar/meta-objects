module.exports = {
  proxyFor: proxyFor,
  metaHandler: metaHandler
};

/**
 * Handles most common needs for creating proxy based on a target
 * @param  {Object|Function}  target   Target dictates type of proxy and its prototype is used.
 * @param  {Object}           handler  Proxy Handler
 * @return {Proxy}   Your new meta object.
 */
function proxyFor(target, handler) {
  if (typeof target === 'function') {
    return Proxy.createFunction(handler,
      function(){ return handler.call(this, [].slice.call(arguments)); },
      function(){ return handler.new([].slice.call(arguments)); }
    );
  } else {
    return Proxy.create(handler, Object.getPrototypeOf(target));
  }
}

/**
 * Simple function to knock off two lines of indenting. Meta-handlers are funneled to get.
 * @param  {Function} dispatcher   Function receives all access.
 * @return {Proxy} Proxy as handler
 */
function metaHandler(dispatcher) {
  return Proxy.create({ get: dispatcher });
}