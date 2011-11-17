# meta-objects

A library of utilities, patterns, and experiments building on top of
the new Harmony Proxy API, part of the ES6.

Built for http://nodejs.org currently, running with the flags '--harmony_proxies --harmony weakmaps'. Most of this should work in Firefox as well but currently is untested.

# What are Proxies? This isn't about HTTP

ES6 is the in-progress draft specification for the next version of ECMAScript. A number of new features are being introduced, chief among them being the powerful new Proxy object. A Proxy is an empty shell object, containing no properties of its own. Instead, a handler is defined which implements a set of predefined _traps_.

Externally the Proxy looks like a regular object, but in fact it is an amorphous thing can look like any arbitrary structure and can change from one access to the next, one operation to the next.


### Fundamental Traps

JS will throw errors if it tries to use one of these and can't.

```javascript
    getOwnPropertyDescriptor: [name]             =>  descriptor
    getPropertyDescriptor:    [name]             =>  descriptor
    getOwnPropertyNames:      []                 =>  [ string ]
    getPropertyNames:         []                 =>  [ string ]
    defineProperty:           [name, descriptor] =>  any
    delete:                   [name]             =>  boolean
    fix:                      []                 =>  { static version }
```

### Derived Traps

JS will use default fallbacks for these which rely on the fundamental traps.

```javascript
    has:       [name]                => boolean    name in proxy
    hasOwn:    [name]                => boolean    ({}).hasOwnProperty.call(proxy, name)
    get:       [receiver, name]      => any        receiver.name
    set:       [receiver, name, val] => boolean    receiver.name = val
    enumerate: []                    => [string]   for (name in proxy)
    keys:      []                    => [string]   Object.keys(proxy)
```

# Managable Patterns for making Proxies

That's a lot of properties to implement. Proxies are something that calls for tools and libraries to enable their use. This project's goal is to create simpler tools for using Proxies and to experiment with what's possible using them.



# API

This will likely change over time.

### Handlers

Handlers are objects which are used in Proxy.create[Function] and don't do anything on their own. Many of these handlers are proxies themselves, known as meta handlers. Due to how the Proxy API works, a meta handler will have all access funneled to one single get trap.

 * **Forwarding(target)** Sends actions to real object, most other things build on this
 * **Dispatching(dispatcher, defaultHandler, trapFilter)** Meta handler which funnels all access through one entry point. Accepts a default handler so action is optional.
 * **Membrane(dispatcher, defaultHandler, wrapper)** Meta handler designed to wrap any non-primitive objects that come under its purview, and unwrap objects as they leave.

### Proxies

Proxy factories which handle most of the work for you and return created proxies.

 * **Mirror(target, dispatcher)** Mirror implements the Forwarding  handler to create a proxy that will handle everything itself, but gives you first dibs to make your own changes.
 * **Membrane(dispatcher, target)** The most basic version of what the Membrane handler requires. A membrane proxy will wrap all properties and return values in membrane proxies. All wrapped objects from a membrane will report to the same dispatcher.
 * **Tracer(target)** Hacky experimentation in making a all-op tracer that doesn't break everything.

### Utilities

*trapUtils*

 *  **nameArgs(trap, args)** Tags raw arguments and trap name and converts to named list.
 *  **filterBy(by, value)** Filter trap list by a property name and match. Useful for retrieving trap filter lists.
 *  **groupBy(by)** Create a reorganized trap list keyed on a property.

*proxyUtils*

 *  **proxyFor(target, handler)** Single interface for creating object and function proxies. Only does the bare minimum, this requires a handler.