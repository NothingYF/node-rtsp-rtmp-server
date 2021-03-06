// Generated by CoffeeScript 1.7.1

/*
 * Usage

    EventEmitterModule = require './event_emitter'

    class MyClass

     * Apply EventEmitterModule to MyClass
    EventEmitterModule.mixin MyClass

    obj = new MyClass
    obj.on 'testevent', (a, b, c) ->
      console.log "received testevent a=#{a} b=#{b} c=#{c}"

    obj.onAny (eventName, data...) ->
      console.log "received eventName=#{eventName} data=#{data}"

    obj.emit 'testevent', 111, 222, 333
    obj.emit 'anotherevent', 'hello'

Or EventEmitterModule can be injected dynamically into an object
(with slightly worse performance):

    class MyClass
      constructor: ->
        EventEmitterModule.inject this

    obj = new MyClass
    obj.on 'testevent', ->
      console.log "received testevent"

    obj.emit 'testevent'
 */

(function() {
  var EventEmitterModule,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  EventEmitterModule = (function() {
    function EventEmitterModule() {}

    EventEmitterModule.mixin = function(cls) {
      var e, name, value, _ref;
      _ref = EventEmitterModule.prototype;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        value = _ref[name];
        try {
          cls.prototype[name] = value;
        } catch (_error) {
          e = _error;
          throw new Error("Call EventEmitterModule.mixin() after the class definition");
        }
      }
    };

    EventEmitterModule.inject = function(obj) {
      var name, value, _ref;
      _ref = EventEmitterModule.prototype;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        value = _ref[name];
        obj[name] = value;
      }
      obj.eventListeners = {};
      obj.catchAllEventListeners = [];
    };

    EventEmitterModule.prototype.emit = function() {
      var data, listener, name, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      name = arguments[0], data = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (((_ref = this.eventListeners) != null ? _ref[name] : void 0) != null) {
        _ref1 = this.eventListeners[name];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          listener = _ref1[_i];
          listener.apply(null, data);
        }
      }
      if (this.catchAllEventListeners != null) {
        _ref2 = this.catchAllEventListeners;
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          listener = _ref2[_j];
          listener.apply(null, [name].concat(__slice.call(data)));
        }
      }
    };

    EventEmitterModule.prototype.onAny = function(listener) {
      if (this.catchAllEventListeners != null) {
        return this.catchAllEventListeners.push(listener);
      } else {
        return this.catchAllEventListeners = [listener];
      }
    };

    EventEmitterModule.prototype.offAny = function(listener) {
      var i, _i, _len, _listener, _ref, _ref1;
      if (this.catchAllEventListeners != null) {
        _ref = this.catchAllEventListeners;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          _listener = _ref[i];
          if (_listener === listener) {
            [].splice.apply(this.catchAllEventListeners, [i, i - i + 1].concat(_ref1 = [])), _ref1;
          }
        }
      }
    };

    EventEmitterModule.prototype.on = function(name, listener) {
      if (this.eventListeners == null) {
        this.eventListeners = {};
      }
      if (this.eventListeners[name] != null) {
        return this.eventListeners[name].push(listener);
      } else {
        return this.eventListeners[name] = [listener];
      }
    };

    EventEmitterModule.prototype.removeListener = function(name, listener) {
      var i, _i, _len, _listener, _ref, _ref1, _ref2;
      if (((_ref = this.eventListeners) != null ? _ref[name] : void 0) != null) {
        _ref1 = this.eventListeners[name];
        for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
          _listener = _ref1[i];
          if (_listener === listener) {
            [].splice.apply(this.eventListeners, [i, i - i + 1].concat(_ref2 = [])), _ref2;
          }
        }
      }
    };

    EventEmitterModule.prototype.off = function(name, listener) {
      return this.removeListener.apply(this, arguments);
    };

    return EventEmitterModule;

  })();

  module.exports = EventEmitterModule;

}).call(this);
