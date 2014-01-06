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

  getSlide : (id)->
    return @slices[@current]

  goTo : (id)->
    if id < 0 || id >= @count
      return
    @current = id
    pos = id * -100
    @container.style.left = pos + "%"

  next : ()->
    @stop()
    @current++
    @current = @current % @count
    @goTo(@current)
    return

  prev : ()->
    @stop()
    @current--
    if @current <= 0
      @current = 0
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




    
