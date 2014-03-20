event = require('event')
events = require('events')

class Orange
  constructor : (el)->
    @el = el
    @current = 0
    @timer = null
    @transition_animation = "ease-in-out"
    @transition_timer = 1
    @swipe_loop = false
    @container = @el.querySelector('.orange-skin')
    @slices = @el.querySelectorAll('.slice')
    @count = @slices.length
    @container.style.width = (@count * 100) + "%"
    for s in @slices
      s.style.width = (100 / @count) + "%"
    @setTransform("0%")
    @container.style.left = "0%"
    @onNext = ()->
    @onPrev = ()->
    @onChangeSlide = ()->
    @onGoTo = ()->
    @bind()

  setTransitionAnimation : (_t)->
    @transition_animation = _t

  setTransitionTimer : (_s)->
    @transition_timer = _s

  setSwipeLoop : (_b)->
    @swipe_loop = _b

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
      if @swipe_loop
        @prevLoop()
      else
        @prev()
    if (@dx / w * 100) < 10
      if @swipe_loop
        @nextLoop()
      else
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
    type = @transition_animation
    @container.style.transition = "transform #{type} #{time}s"
    @container.style.MozTransition = "-moz-transform #{type} #{time}s"
    @container.style.WebkitTransition = "-webkit-transform #{type} #{time}s"
    @container.style.OTransition = "-o-transform #{type} #{time}s"
    @container.style.MsTransition = "-ms-transform #{type} #{time}s"

  _changeSlide : (id)->
    if id < 0 || id >= @count
      return
    @current = id
    @onChangeSlide()
    transformProp = @hasTransform()
    if transformProp == null
      pos = id * -100
      @container.style.left = pos + "%"
    else
      @setTransition(@transition_timer)
      pos = 100 / @count * @current * -1
      @setTransform(pos+"%")

  goTo : (id)->
    @_changeSlide(id)
    @onGoTo()

  next : ()->
    @stop()
    return if @current + 1 >= @count
    @current++
    @_changeSlide(@current)
    @onNext()
    return

  prev : ()->
    @stop()
    return if @current - 1 < 0
    @current--
    @_changeSlide(@current)
    @onPrev()
    return

  prevLoop : ()->
    @stop()
    @current--
    if @current < 0
      @current = @count - 1
    @_changeSlide(@current)
    @onPrev()
    return

  nextLoop : ()->
    @stop()
    @current++
    @current = @current % @count
    @_changeSlide(@current)
    @onNext()
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




    
