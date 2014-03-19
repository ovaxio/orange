
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-event-manager/index.js", function(exports, require, module){


/**
 * Expose `EventManager`.
 */

module.exports = EventManager;

/**
 * Initialize an `EventManager` with the given
 * `target` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} target
 * @param {Object} obj
 * @api public
 */

function EventManager(target, obj) {
  this.target = target;
  this.obj = obj;
  this._bindings = {};
}

/**
 * Register bind function.
 *
 * @param {Function} fn
 * @return {EventManager} self
 * @api public
 */

EventManager.prototype.onbind = function(fn){
  this._bind = fn;
  return this;
};

/**
 * Register unbind function.
 *
 * @param {Function} fn
 * @return {EventManager} self
 * @api public
 */

EventManager.prototype.onunbind = function(fn){
  this._unbind = fn;
  return this;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 *    events.bind('login') // implies "onlogin"
 *    events.bind('login', 'onLogin')
 *
 * @param {String} event
 * @param {String} [method]
 * @return {Function} callback
 * @api public
 */

EventManager.prototype.bind = function(event, method){
  var fn = this.addBinding.apply(this, arguments);
  if (this._onbind) this._onbind(event, method, fn);
  this._bind(event, fn);
  return fn;
};

/**
 * Add event binding.
 *
 * @param {String} event
 * @param {String} method
 * @return {Function} callback
 * @api private
 */

EventManager.prototype.addBinding = function(event, method){
  var obj = this.obj;
  var method = method || 'on' + event;
  var args = [].slice.call(arguments, 2);

  // callback
  function callback() {
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // subscription
  this._bindings[event] = this._bindings[event] || {};
  this._bindings[event][method] = callback;

  return callback;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 *     evennts.unbind('login', 'onLogin')
 *     evennts.unbind('login')
 *     evennts.unbind()
 *
 * @param {String} [event]
 * @param {String} [method]
 * @return {Function} callback
 * @api public
 */

EventManager.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);
  var fn = this._bindings[event][method];
  if (this._onunbind) this._onunbind(event, method, fn);
  this._unbind(event, fn);
  return fn;
};

/**
 * Unbind all events.
 *
 * @api private
 */

EventManager.prototype.unbindAll = function(){
  for (var event in this._bindings) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

EventManager.prototype.unbindAllOf = function(event){
  var bindings = this._bindings[event];
  if (!bindings) return;
  for (var method in bindings) {
    this.unbind(event, method);
  }
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Manager = require('event-manager')
  , event = require('event');

/**
 * Return a new event manager.
 */

module.exports = function(target, obj){
  var manager = new Manager(target, obj);

  manager.onbind(function(name, fn){
    event.bind(target, name, fn);
  });

  manager.onunbind(function(name, fn){
    event.unbind(target, name, fn);
  });

  return manager;
};

});
require.register("component-has-translate3d/index.js", function(exports, require, module){

var prop = require('transform-property');
if (!prop) return module.exports = false;

var map = {
  webkitTransform: '-webkit-transform',
  OTransform: '-o-transform',
  msTransform: '-ms-transform',
  MozTransform: '-moz-transform',
  transform: 'transform'
};

// from: https://gist.github.com/lorenzopolidori/3794226
var el = document.createElement('div');
el.style[prop] = 'translate3d(1px,1px,1px)';
document.body.insertBefore(el, null);
var val = window.getComputedStyle(el).getPropertyValue(map[prop]);
document.body.removeChild(el);
module.exports = null != val && val.length && 'none' != val;

});
require.register("component-touchaction-property/index.js", function(exports, require, module){

/**
 * Module exports.
 */

module.exports = touchActionProperty();

/**
 * Returns "touchAction", "msTouchAction", or null.
 */

function touchActionProperty(doc) {
  if (!doc) doc = document;
  var div = doc.createElement('div');
  var prop = null;
  if ('touchAction' in div.style) prop = 'touchAction';
  else if ('msTouchAction' in div.style) prop = 'msTouchAction';
  div = null;
  return prop;
}

});
require.register("component-transform-property/index.js", function(exports, require, module){

var styles = [
  'webkitTransform',
  'MozTransform',
  'msTransform',
  'OTransform',
  'transform'
];

var el = document.createElement('p');
var style;

for (var i = 0; i < styles.length; i++) {
  if (null != el.style[styles[i]]) {
    style = styles[i];
    break;
  }
}

module.exports = style;
});
require.register("component-transitionend-property/index.js", function(exports, require, module){
/**
 * Transition-end mapping
 */

var map = {
  'WebkitTransition' : 'webkitTransitionEnd',
  'MozTransition' : 'transitionend',
  'OTransition' : 'oTransitionEnd',
  'msTransition' : 'MSTransitionEnd',
  'transition' : 'transitionend'
};

/**
 * Expose `transitionend`
 */

var el = document.createElement('p');

for (var transition in map) {
  if (null != el.style[transition]) {
    module.exports = map[transition];
    break;
  }
}

});
require.register("jkroso-computed-style/index.js", function(exports, require, module){

/**
 * Get the computed style of a DOM element
 * 
 *   style(document.body) // => {width:'500px', ...}
 * 
 * @param {Element} element
 * @return {Object}
 */

// Accessing via window for jsDOM support
module.exports = window.getComputedStyle

// Fallback to elem.currentStyle for IE < 9
if (!module.exports) {
	module.exports = function (elem) {
		return elem.currentStyle
	}
}

});
require.register("tuxlinuxien-orange/index.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.3
(function() {
  var Emitter, Orange, event, events, has3d, style, touchAction, transform, transitionend;

  transitionend = require('transitionend-property');

  transform = require('transform-property');

  touchAction = require('touchaction-property');

  has3d = require('has-translate3d');

  style = require('computed-style');

  Emitter = require('emitter');

  event = require('event');

  events = require('events');

  Orange = (function() {
    function Orange(el) {
      var s, _i, _len, _ref;
      this.el = el;
      this.current = 0;
      this.timer = null;
      this.container = this.el.querySelector('.orange-skin');
      this.slices = this.el.querySelectorAll('.slice');
      this.count = this.slices.length;
      this.container.style.width = (this.count * 100) + "%";
      _ref = this.slices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        s.style.width = (100 / this.count) + "%";
      }
      this.setTransform("0%");
      this.container.style.left = "0%";
      this.bind();
    }

    Orange.prototype.getSlide = function(id) {
      return this.slices[this.current];
    };

    Orange.prototype.bind = function() {
      this.events = events(this.el, this);
      this.docEvents = events(document, this);
      this.events.bind('mousedown', 'ontouchstart');
      this.events.bind('mousemove', 'ontouchmove');
      this.docEvents.bind('mouseup', 'ontouchend');
      this.events.bind('touchstart');
      this.events.bind('touchmove');
      this.docEvents.bind('touchend');
      this.events.bind('PointerDown', 'ontouchstart');
      this.events.bind('PointerMove', 'ontouchmove');
      return this.docEvents.bind('PointerUp', 'ontouchstart');
    };

    Orange.prototype.ontouchstart = function(ev) {
      var touch;
      this.setTransition(0);
      this.dx = 0;
      this.updown = null;
      this.touch_translated = 0;
      touch = ev.touches[0];
      return this.down({
        x: touch.pageX,
        y: touch.pageY
      });
    };

    Orange.prototype.ontouchmove = function(ev) {
      var d, down, dy, slope, touch, x, y;
      if (!this.down || this.updown) {
        return;
      }
      touch = ev.touches[0];
      down = this.down;
      x = touch.pageX;
      this.dx = x - down.x;
      if (null === this.updown) {
        y = touch.pageY;
        dy = y - down.y;
        slope = dy / this.dx;
        if (slope > 1 || slope < -1) {
          this.updown = true;
          return;
        } else {
          this.updown = false;
        }
      }
      ev.preventDefault();
      d = down.x - x;
      return console.log(d);
    };

    Orange.prototype.initTouchEvents = function() {
      var parent;
      parent = this;
      this.touchStart = function(e) {
        e.preventDefault();
        parent.touch_init = e.touches[0];
        parent.touch_cur = parent.touch_init;
        return parent.parent.touch_translated = parent.current * parent.el.clientWidth * -1;
      };
      this.touchMove = function(e) {
        var d, scroll_x, scroll_y, x;
        e.preventDefault();
        scroll_y = parent.touch_init.pageY - e.touches[0].pageY;
        if (scroll_y < 0) {
          scroll_y *= -1;
        }
        scroll_x = parent.touch_init.pageX - e.touches[0].pageX;
        if (scroll_x < 0) {
          scroll_x *= -1;
        }
        x = e.touches[0].pageX;
        d = parent.touch_cur.pageX - x;
        parent.touch_translated += -1 * d;
        parent.setTransform(parent.touch_translated + "px");
        return parent.touch_cur = e.touches[0];
      };
      return this.touchEnd = function(e) {
        var diff, last_pos, w;
        e.preventDefault();
        diff = parent.touch_init.pageX - parent.touch_cur.pageX;
        w = parent.el.clientWidth;
        last_pos = parent.current;
        if ((diff / w * 100) < -10) {
          parent.prev();
        }
        if ((diff / w * 100) > 10) {
          parent.next();
        }
        if (last_pos === parent.current) {
          return parent.goTo(parent.current);
        }
      };
    };

    Orange.prototype.hasTransform = function() {
      if (this.container.style.transform !== void 0) {
        return "transform";
      }
      if (this.container.style.MozTransform !== void 0) {
        return "MozTransform";
      }
      if (this.container.style.WebkitTransform !== void 0) {
        return "WebkitTransform";
      }
      if (this.container.style.OTransform !== void 0) {
        return "OTransform";
      }
      if (this.container.style.MsTransform !== void 0) {
        return "MsTransform";
      }
      return null;
    };

    Orange.prototype.setTransform = function(pos) {
      this.container.style.transform = "translateX(" + pos + ")";
      this.container.style.MozTransform = "translateX(" + pos + ")";
      this.container.style.WebkitTransform = "translateX(" + pos + ")";
      this.container.style.OTransform = "translateX(" + pos + ")";
      return this.container.style.MsTransform = "translateX(" + pos + ")";
    };

    Orange.prototype.setTransition = function(time) {
      var type;
      if (time === 0) {
        this.container.style.transition = "";
        this.container.style.MozTransition = "";
        this.container.style.WebkitTransition = "";
        this.container.style.OTransition = "";
        this.container.style.MsTransition = "";
        return;
      }
      type = "ease-in-out";
      this.container.style.transition = "transform " + type + " " + time + "s";
      this.container.style.MozTransition = "-moz-transform " + type + " " + time + "s";
      this.container.style.WebkitTransition = "-webkit-transform " + type + " " + time + "s";
      this.container.style.OTransition = "-o-transform " + type + " " + time + "s";
      return this.container.style.MsTransition = "-ms-transform " + type + " " + time + "s";
    };

    Orange.prototype.goTo = function(id) {
      var pos, transformProp;
      if (this.isTouchable()) {
        this.desactivateTouch();
      }
      if (id < 0 || id >= this.count) {
        return;
      }
      this.current = id;
      transformProp = this.hasTransform();
      if (transformProp === null) {
        pos = id * -100;
        return this.container.style.left = pos + "%";
      } else {
        this.setTransition(1);
        pos = 100 / this.count * this.current * -1;
        return this.setTransform(pos + "%");
      }
    };

    Orange.prototype.next = function() {
      this.stop();
      if (this.current + 1 >= this.count) {
        return;
      }
      this.current++;
      this.goTo(this.current);
    };

    Orange.prototype.prev = function() {
      this.stop();
      if (this.current - 1 < 0) {
        return;
      }
      this.current--;
      this.goTo(this.current);
    };

    Orange.prototype.prevLoop = function() {
      this.stop();
      this.current--;
      if (this.current < 0) {
        this.current = this.count - 1;
      }
      this.goTo(this.current);
    };

    Orange.prototype.nextLoop = function() {
      this.stop();
      this.current++;
      this.current = this.current % this.count;
      this.goTo(this.current);
    };

    Orange.prototype.start = function(t) {
      var _this = this;
      return this.timer = setInterval(function() {
        _this.current++;
        _this.current = _this.current % _this.count;
        return _this.goTo(_this.current);
      }, t);
    };

    Orange.prototype.stop = function() {
      if (this.timer) {
        return clearInterval(this.timer);
      }
    };

    return Orange;

  })();

  module.exports = Orange;

}).call(this);

});
















require.alias("tuxlinuxien-orange/index.js", "undefined/deps/orange/index.js");
require.alias("tuxlinuxien-orange/index.js", "undefined/deps/orange/index.js");
require.alias("tuxlinuxien-orange/index.js", "orange/index.js");
require.alias("component-emitter/index.js", "tuxlinuxien-orange/deps/emitter/index.js");

require.alias("component-event/index.js", "tuxlinuxien-orange/deps/event/index.js");

require.alias("component-events/index.js", "tuxlinuxien-orange/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-event-manager/index.js", "component-events/deps/event-manager/index.js");

require.alias("component-has-translate3d/index.js", "tuxlinuxien-orange/deps/has-translate3d/index.js");
require.alias("component-transform-property/index.js", "component-has-translate3d/deps/transform-property/index.js");

require.alias("component-touchaction-property/index.js", "tuxlinuxien-orange/deps/touchaction-property/index.js");
require.alias("component-touchaction-property/index.js", "tuxlinuxien-orange/deps/touchaction-property/index.js");
require.alias("component-touchaction-property/index.js", "component-touchaction-property/index.js");
require.alias("component-transform-property/index.js", "tuxlinuxien-orange/deps/transform-property/index.js");

require.alias("component-transitionend-property/index.js", "tuxlinuxien-orange/deps/transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "tuxlinuxien-orange/deps/transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "component-transitionend-property/index.js");
require.alias("jkroso-computed-style/index.js", "tuxlinuxien-orange/deps/computed-style/index.js");

require.alias("tuxlinuxien-orange/index.js", "tuxlinuxien-orange/index.js");