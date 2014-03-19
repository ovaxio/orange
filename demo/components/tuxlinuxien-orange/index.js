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
      this.setTransition(0);
      this.dx = 0;
      this.updown = null;
      this.touch_translated = 0;
      touch = ev.touches[0];
      console.log(ev);
      return this.down = {
        x: touch.pageX,
        y: touch.pageY
      };
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
