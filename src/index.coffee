class SlideLoop
  constructor : (el)->
    @el = el
    @current = 0
    @count = @el.getElementsByClassName('slide').length
    console.log @count
    @timer = null
    @el.getElementsByClassName('slider-container')[0].style.width = (@count * 100) + "%"
    for s in @el.getElementsByClassName('slide')
      s.style.width = (100 / @count) + "%"

  getSlide : (id)->
    return @el.getElementsByClassName('slide')[@current]

  goTo : (id)->
    pos = id * -100
    @el.getElementsByClassName('slider-container')[0].style.left = pos + "%"

  next : ()->
    @current++
    @current = @current % @count
    @goTo(@current)
    @stop()

  prev : ()->
    if @current <= 0
      return
    @goTo(@current--)

  start : (t)->
    @timer = setInterval ()=>
        @current++
        @current = @current % @count
        @goTo(@current)
      ,t

  stop : ()->
    if @timer
      clearInterval @timer

module.exports = SlideLoop




    
