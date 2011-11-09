module.exports = {
	params: {
		// fundamental
		getOwnPropertyDescriptor: ['key'],
		getPropertyDescriptor: ['key'],
		getOwnPropertyNames: [],
		getPropertyNames: [],
		defineProperty: ['key', 'descriptor'],
		delete: ['key'],
		fix: [],
		// derived
		enumerate: [],
		hasOwn: ['key'],
		keys: [],
		set: ['receiver', 'key', 'value'],
		get: ['receiver', 'key'],
		has: ['key'],
		// functions
	  call: ['receiver', 'args'],
	  new: ['args']
	},
	types: {
		has: ['key', 'own'],
		get: ['key', 'own', 'descriptor'],
		set: ['key', 'value', 'descriptor'],
		list: ['hidden', 'own'],
		invoke: ['binding', 'args']
	}
}