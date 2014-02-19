class Orange
  constructor : (el)->
    @el = el
    @current = 0
    @timer = null
    @container = @el.querySelector('.orange-skin')
    @slices = @el.querySelectorAll('.slice')
    @count = @slices.length
    @container.style.width = (@count * 100) + "%"
    @touch_init = 0
    @touch_cur = 0
    @touch_transition_pending = false
    @touch_tranlated = 0
    for s in @slices
      s.style.width = (100 / @count) + "%"
    @is_touchable = true
    @goTo @current
    @touchStart = ()->
    @touchMove = ()->
    @touchEnd = ()->
    @transitionEnd = ()->
    @setTransition(1)
    @initTouchEvents()
    @initTransitionEnd()
    @setTouchable(true)

  getSlide : (id)->
    return @slices[@current]

  setTouchable : (b)->
    @is_touchable = b
    @desactivateTransitionEnd()
    @desactivateTouch()
    if b == true
      @activateTouch()
      @activateTransitionEnd()

  isTouchable : ()->
    return @is_touchable

  desactivateTransitionEnd : ()->
    @container.removeEventListener 'webkitTransitionEnd', @transitionEnd
    @container.removeEventListener 'mozTransitionEnd', @transitionEnd
    @container.removeEventListener 'MSTransitionEnd', @transitionEnd
    @container.removeEventListener 'oTransitionEnd', @transitionEnd
    @container.removeEventListener 'transitionend', @transitionEnd

  initTransitionEnd : ()->
    parent = @
    @transitionEnd = (e)->
      parent.activateTouch()

  activateTransitionEnd : ()->
    @container.addEventListener 'webkitTransitionEnd', @transitionEnd
    @container.addEventListener 'mozTransitionEnd', @transitionEnd
    @container.addEventListener 'MSTransitionEnd', @transitionEnd
    @container.addEventListener 'oTransitionEnd', @transitionEnd
    @container.addEventListener 'transitionend', @transitionEnd

  initTouchEvents : ()->
    parent = @
    
    @touchStart = (e)->
      e.preventDefault()
      parent.touch_init = e.touches[0].pageX
      parent.touch_cur = parent.touch_init
      parent.setTransition(0)
      parent.touch_translated = (parent.current * parent.el.clientWidth * -1)

    @touchMove = (e)->
      e.preventDefault()
      x = e.touches[0].pageX
      d = (parent.touch_cur - x)
      parent.touch_translated += -1*d
      parent.setTransform(parent.touch_translated+"px")
      parent.touch_cur = x

    @touchEnd = (e)->
      e.preventDefault()
      diff = (parent.touch_init - parent.touch_cur)
      w = parent.el.clientWidth
      last_pos = parent.current
      if (diff / w * 100) < -10
        parent.prev()
      if (diff / w * 100) > 10
        parent.next()
      if last_pos == parent.current
        parent.goTo(parent.current)

  desactivateTouch : ()->
    @container.removeEventListener "touchstart", @touchStart, false
    @container.removeEventListener "touchmove", @touchMove, false
    @container.removeEventListener "touchend", @touchEnd, false

  activateTouch : ()->
    return if not @el.addEventListener?
    @container.addEventListener "touchstart", @touchStart, false
    @container.addEventListener "touchmove", @touchMove, false
    @container.addEventListener "touchend", @touchEnd, false

    
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
    type = ""
    @container.style.transition = "transform #{type} #{time}s"
    @container.style.MozTransition = "-moz-transform #{type} #{time}s"
    @container.style.WebkitTransition = "-webkit-transform #{type} #{time}s"
    @container.style.OTransition = "-o-transform #{type} #{time}s"
    @container.style.MsTransition = "-ms-transform #{type} #{time}s"

  goTo : (id)->
    if @isTouchable()
      @desactivateTouch()
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




    
