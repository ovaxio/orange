
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
require.register("component-event/index.js", function(exports, require, module){
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

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
  el[bind](prefix + type, fn, capture || false);
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
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? {parentNode: element} : element

  root = root || document

  // Make sure `element !== document` and `element != null`
  // otherwise we get an illegal invocation
  while ((element = element.parentNode) && element !== document) {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return  
  }
}
});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("tuxlinuxien-orange/index.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.3
(function() {
  var Orange, event, events;

  event = require('event');

  events = require('events');

  Orange = (function() {
    function Orange(el) {
      var s, _i, _len, _ref;
      this.el = el;
      this.current = 0;
      this.timer = null;
      this.transition_animation = "ease-in-out";
      this.transition_timer = 1;
      this.swipe_loop = false;
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
      this.onNext = function() {};
      this.onPrev = function() {};
      this.onChangeSlide = function() {};
      this.onGoTo = function() {};
      this.bind();
    }

    Orange.prototype.setTransitionAnimation = function(_t) {
      return this.transition_animation = _t;
    };

    Orange.prototype.setTransitionTimer = function(_s) {
      return this.transition_timer = _s;
    };

    Orange.prototype.setSwipeLoop = function(_b) {
      return this.swipe_loop = _b;
    };

    Orange.prototype.getSlide = function(id) {
      return this.slices[this.current];
    };

    Orange.prototype.bind = function() {
      this.events = events(this.el, this);
      this.docEvents = events(document, this);
      this.events.bind('mousedown', 'ontouchstart');
      this.events.bind('mousemove', 'ontouchmove');
      this.events.bind('mouseup', 'ontouchend');
      this.events.bind('touchstart');
      this.events.bind('touchmove');
      this.events.bind('touchend');
      this.events.bind('PointerDown', 'ontouchstart');
      this.events.bind('PointerMove', 'ontouchmove');
      return this.events.bind('PointerUp', 'ontouchstart');
    };

    Orange.prototype.ontouchstart = function(ev) {
      var touch;
      if (ev.touches == null) {
        return;
      }
      this.setTransition(0);
      this.dx_init = this.current * this.el.clientWidth * -1;
      this.dx = 0;
      this.updown = null;
      this.touch_translated = 0;
      touch = ev.touches[0];
      return this.down = {
        x: touch.pageX,
        y: touch.pageY
      };
    };

    Orange.prototype.ontouchmove = function(ev) {
      var down, dy, slope, touch, x, y;
      if (ev.touches == null) {
        return;
      }
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
      return this.setTransform((this.dx + this.dx_init) + "px");
    };

    Orange.prototype.ontouchend = function(ev) {
      var down, last_pos, touch, w;
      if (ev.touches == null) {
        return;
      }
      if (this.updown === true) {
        return;
      }
      touch = ev.touches[0];
      down = this.down;
      w = this.el.clientWidth;
      last_pos = this.current;
      if ((this.dx / w * 100) > -10) {
        if (this.swipe_loop) {
          this.prevLoop();
        } else {
          this.prev();
        }
      }
      if ((this.dx / w * 100) < 10) {
        if (this.swipe_loop) {
          this.nextLoop();
        } else {
          this.next();
        }
      }
      if (last_pos === this.current) {
        return this.goTo(this.current);
      }
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
      type = this.transition_animation;
      this.container.style.transition = "transform " + type + " " + time + "s";
      this.container.style.MozTransition = "-moz-transform " + type + " " + time + "s";
      this.container.style.WebkitTransition = "-webkit-transform " + type + " " + time + "s";
      this.container.style.OTransition = "-o-transform " + type + " " + time + "s";
      return this.container.style.MsTransition = "-ms-transform " + type + " " + time + "s";
    };

    Orange.prototype._changeSlide = function(id) {
      var pos, transformProp;
      if (id < 0 || id >= this.count) {
        return;
      }
      this.current = id;
      this.onChangeSlide();
      transformProp = this.hasTransform();
      if (transformProp === null) {
        pos = id * -100;
        return this.container.style.left = pos + "%";
      } else {
        this.setTransition(this.transition_timer);
        pos = 100 / this.count * this.current * -1;
        return this.setTransform(pos + "%");
      }
    };

    Orange.prototype.goTo = function(id) {
      this._changeSlide(id);
      return this.onGoTo();
    };

    Orange.prototype.next = function() {
      this.stop();
      if (this.current + 1 >= this.count) {
        return;
      }
      this.current++;
      this._changeSlide(this.current);
      this.onNext();
    };

    Orange.prototype.prev = function() {
      this.stop();
      if (this.current - 1 < 0) {
        return;
      }
      this.current--;
      this._changeSlide(this.current);
      this.onPrev();
    };

    Orange.prototype.prevLoop = function() {
      this.stop();
      this.current--;
      if (this.current < 0) {
        this.current = this.count - 1;
      }
      this._changeSlide(this.current);
      this.onPrev();
    };

    Orange.prototype.nextLoop = function() {
      this.stop();
      this.current++;
      this.current = this.current % this.count;
      this._changeSlide(this.current);
      this.onNext();
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
require.alias("component-event/index.js", "tuxlinuxien-orange/deps/event/index.js");

require.alias("component-events/index.js", "tuxlinuxien-orange/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("tuxlinuxien-orange/index.js", "tuxlinuxien-orange/index.js");