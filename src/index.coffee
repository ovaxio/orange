class Orange
  constructor : (el)->
    @el = el
    @current = 0
    @timer = null
    @container = @el.querySelectorAll('.orange-skin')[0]
    @slices = @el.querySelectorAll('.slice')
    @count = @slices.length
    @container.style.width = (@count * 100) + "%"
    for s in @slices
      s.style.width = (100 / @count) + "%"
    @goTo @current

  getSlide : (id)->
    return @slices[@current]

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

  goTo : (id)->
    if id < 0 || id >= @count
      return
    @current = id
    transformProp = @hasTransform()
    if transformProp == null
      pos = id * -100
      @container.style.left = pos + "%"
    else
      pos = 100 / @count * @current * -1
      @container.style[transformProp] = "translateX(#{pos}%)"

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




    
