module.exports = {
  nameArgs: nameArgs,
  filterBy: filterBy,
  groupBy: groupBy
}

/**
 * Tags raw arguments and trap name and converts to named list
 * @param  {String}    trap  Trap name
 * @param  {Arguments} args  Array of params in the order they come in Arguments
 * @return {Object} Named args
 */
function nameArgs(trap, args) {
  return traps[trap].params.reduce(function(ret, arg, i){
    ret[arg] = args[i];
    return ret;
  },{});
}

/**
 * Filter trap list by a property name and match. Useful for retrieving trap filter lists.
 * @param  {String} by      Property to filter on.
 * @param  {String} value   Value to match.
 * @return {Object} Filtered trap map
 */
function filterBy(by, value){
  return Object.keys(traps).reduce(function(ret, name){
    if (traps[name][by] === value) {
      ret[name] = traps[name];
    }
    return ret;
  },{});
}

/**
 * Create a reorganized trap list keyed on a property.
 * @param  {String} by Property to key on.
 * @return {Object} Trap map organized into subsets on key.
 */
function groupBy(by) {
  return Object.keys(traps).reduce(function(ret, name){
    var val = traps[name][by];
    val in ret || (ret[val] = {});
    ret[val][name] = traps[name];
    return ret;
  },{});
}

/**
 * List of traps and detailed descriptions, useful for automating
 * various tasks in proxy building.
 * @type {Object}
 */
var traps = module.exports.traps = {
  getOwnPropertyDescriptor: {
    type: 'fundamental',
    params: ['key'],
    category: 'get',
    own: true
  },
  getPropertyDescriptor: {
    type: 'fundamental',
    params: ['key'],
    action: 'get',
    own: false
  },
  getOwnPropertyNames: {
    type: 'fundamental',
    params: [],
    category: 'list',
    own: true
  },
  getPropertyNames: {
    type: 'fundamental',
    params: [],
    category: 'list',
    own: false
  },
  defineProperty: {
    type: 'fundamental',
    params: ['key', 'descriptor'],
    category: 'set',
    own: true
  },
  delete: {
    type: 'fundamental',
    params: ['key'],
    category: 'set',
    own: true
  },
  fix: {
    type: 'fundamental',
    params: [],
    category: 'get',
    own: true
  },
  enumerate: {
    type: 'derived',
    params: [],
    category: 'list',
    own: false
  },
  keys: {
    type: 'derived',
    params: [],
    category: 'list',
    own: true
  },
  hasOwn: {
    type: 'derived',
    params: ['key'],
    category: 'has',
    own: true
  },
  has: {
    type: 'derived',
    params: ['key'],
    category: 'has',
    own: false
  },
  set: {
    type: 'derived',
    params: ['receiver', 'key', 'value'],
    category: 'set',
    own: true
  },
  get: {
    type: 'derived',
    params: ['receiver', 'key'],
    category: 'get',
    own: false
  },
  call: {
    type: 'function',
    params: ['receiver', 'args'],
    category: 'invoke',
    own: true
  },
  new: {
    type: 'function',
    params: ['args'],
    category: 'invoke',
    own: true
  }
}
/*
var categories = {
  has: ['key', 'own'],
  get: ['key', 'own', 'descriptor'],
  set: ['key', 'value', 'descriptor'],
  list: ['hidden', 'own'],
  invoke: ['binding', 'args']
}
*/