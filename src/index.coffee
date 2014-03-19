transitionend = require('transitionend-property')
transform = require('transform-property')
touchAction = require('touchaction-property')
has3d = require('has-translate3d')
style = require('computed-style')
Emitter = require('emitter')
event = require('event')
events = require('events')

class Orange
  constructor : (el)->
    @el = el
    @current = 0
    @timer = null
    @container = @el.querySelector('.orange-skin')
    @slices = @el.querySelectorAll('.slice')
    @count = @slices.length
    @container.style.width = (@count * 100) + "%"
    for s in @slices
      s.style.width = (100 / @count) + "%"
    @setTransform("0%")
    @container.style.left = "0%"
    @bind()

  getSlide : (id)->
    return @slices[@current]

  bind : ()->
    @events = events(@el, @);
    @docEvents = events(document, @);

    #standard mouse click events
    @events.bind('mousedown', 'ontouchstart');
    @events.bind('mousemove', 'ontouchmove');
    @events.bind('mouseup', 'ontouchend');

    #W3C touch events
    @events.bind('touchstart');
    @events.bind('touchmove');
    @events.bind('touchend');

    #MS IE touch events
    @events.bind('PointerDown', 'ontouchstart');
    @events.bind('PointerMove', 'ontouchmove');
    @events.bind('PointerUp', 'ontouchstart');


  ontouchstart : (ev)->
    return if not ev.touches?
    @setTransition(0)
    @dx_init = @current * @el.clientWidth * -1
    @dx = 0
    @updown = null;
    @touch_translated = 0
    touch = ev.touches[0]
    @down = 
      x: touch.pageX
      y: touch.pageY

  ontouchmove : (ev)->
    return if not ev.touches?
    return if !this.down or this.updown
    touch = ev.touches[0]

    down = @down;
    x = touch.pageX;
    @dx = x - down.x;
    if null == @updown
      y = touch.pageY;
      dy = y - down.y;
      slope = dy / @dx;

      if slope > 1 or slope < -1
        @updown = true;
        return;
      else
        @updown = false
    ev.preventDefault()
    @setTransform((@dx + @dx_init)+"px")
    
  ontouchend : (ev)->
    return if not ev.touches?
    return if @updown == true
    touch = ev.touches[0]
    down = @down;
    w = @el.clientWidth
    last_pos = @current
    if (@dx / w * 100) > -10
      @prev()
    if (@dx / w * 100) < 10
      @next()
    if last_pos == @current
      @goTo(@current)


    
  hasTransform : ()->
    if @container.style.transform != undefined
      return "transform"
    if @container.style.MozTransform != undefined
      return "MozTransform"
    if @container.style.WebkitTransform != undefined
      return "WebkitTransform"
    if @container.style.OTransform != undefined
      return "OTransform"
    if @container.style.MsTransform != undefined
      return "MsTransform"
    return null

  setTransform : (pos)->
    @container.style.transform = "translateX(#{pos})"
    @container.style.MozTransform = "translateX(#{pos})"
    @container.style.WebkitTransform = "translateX(#{pos})"
    @container.style.OTransform = "translateX(#{pos})"
    @container.style.MsTransform = "translateX(#{pos})"

  setTransition : (time)->
    if time == 0
      @container.style.transition = ""
      @container.style.MozTransition = ""
      @container.style.WebkitTransition = ""
      @container.style.OTransition = ""
      @container.style.MsTransition = ""
      return 
    type = "ease-in-out"
    @container.style.transition = "transform #{type} #{time}s"
    @container.style.MozTransition = "-moz-transform #{type} #{time}s"
    @container.style.WebkitTransition = "-webkit-transform #{type} #{time}s"
    @container.style.OTransition = "-o-transform #{type} #{time}s"
    @container.style.MsTransition = "-ms-transform #{type} #{time}s"

  goTo : (id)->
    if id < 0 || id >= @count
      return
    @current = id
    transformProp = @hasTransform()
    if transformProp == null
      pos = id * -100
      @container.style.left = pos + "%"
    else
      @setTransition(1)
      pos = 100 / @count * @current * -1
      @setTransform(pos+"%")

  next : ()->
    @stop()
    return if @current + 1 >= @count
    @current++
    @goTo(@current)
    return

  prev : ()->
    @stop()
    return if @current - 1 < 0
    @current--
    @goTo(@current)
    return

  prevLoop : ()->
    @stop()
    @current--
    if @current < 0
      @current = @count - 1
    @goTo(@current)
    return

  nextLoop : ()->
    @stop()
    @current++
    @current = @current % @count
    @goTo(@current)
    return

  start : (t)->
    @timer = setInterval ()=>
        @current++
        @current = @current % @count
        @goTo(@current)
      ,t

  stop : ()->
    if @timer
      clearInterval @timer

module.exports = Orange




    
