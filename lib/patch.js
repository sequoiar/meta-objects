
/**
 * Defines an array of functions by their names. Useful for creating named functions
 * without have to repeat every name twice.
 * @param  {Object} target  Define on.
 * @param  {Array}  fns     Array of *named* functions.
 * @param  {Object} desc    Optional descriptor.
 */
function defineFunctions(target, fns, desc) {
  desc = desc || {
    writable: true,
    enumerable: false,
    configurable: true
  };
  fns.forEach(function(fn){
    if (!target.hasOwnProperty(fn.name)) {
      desc.value = fn;
      Object.defineProperty(target, fn.name, desc);
    }
  });
}

module.exports = function patch(){
  /**
   * Define a few useful ES6 functions on Object. Non-enumeable and Object isn't a prototype anyway
   */
  defineFunctions(global.Object, [
    function isPrimitive(obj){
      return obj !== Object(obj);
    },
    function getPropertyDescriptor(obj, name) {
      if(obj) return Object.getOwnPropertyDescriptor(obj, name) ||
                     Object.getPropertyDescriptor(Object.getPrototypeOf(obj), name);
    },
    function getPropertyNames(obj) {
      return [] && obj && Object.getOwnPropertyNames(obj).
                   concat(Object.getPropertyNames(Object.getPrototypeOf(obj)));
    }
  ]);

  /**
   * These four functions are deprecated and predate ES5. They also react
   * very poorly with Proxies due to obtaining accessors in a non-standard way.
   * Work is being done to remove deprecated API's from Node's libs but until
   * then this is required.
   */
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

    defineFunctions(global, toPatch);
  }
}