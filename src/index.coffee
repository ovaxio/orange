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
    @goTo @current
    @touchStart = ()->
    @touchMove = ()->
    @touchEnd = ()->
    @setTransition(1)
    @initTouchEvents()
    @initTouch()
    @initTransitionEnd()

  getSlide : (id)->
    return @slices[@current]

  initTransitionEnd : ()->
    parent = @
    @container.addEventListener 'webkitTransitionEnd', (e)->
      parent.initTouch()

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
      parent.container.removeEventListener "touchstart", parent.touchStart, false
      parent.container.removeEventListener "touchmove", parent.touchMove, false
      parent.container.removeEventListener "touchend", parent.touchEnd, false
      diff = (parent.touch_init - parent.touch_cur)
      w = parent.el.clientWidth
      if (diff / w * 100) < -10
        parent.prev()
        return
      if (diff / w * 100) > 10
        parent.next()
        return
      parent.goTo(parent.current)

  initTouch : ()->
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

#module.exports = Orange




    
