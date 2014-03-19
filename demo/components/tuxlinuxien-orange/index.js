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
        this.prev();
      }
      if ((this.dx / w * 100) < 10) {
        this.next();
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
      type = "ease-in-out";
      this.container.style.transition = "transform " + type + " " + time + "s";
      this.container.style.MozTransition = "-moz-transform " + type + " " + time + "s";
      this.container.style.WebkitTransition = "-webkit-transform " + type + " " + time + "s";
      this.container.style.OTransition = "-o-transform " + type + " " + time + "s";
      return this.container.style.MsTransition = "-ms-transform " + type + " " + time + "s";
    };

    Orange.prototype.goTo = function(id) {
      var pos, transformProp;
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
