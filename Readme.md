# Orange

  Simple carousel

## Installation

  Install with [component(1)](http://component.io):

    $ component install tuxlinuxien/orange
    
    
## Browser compatibility

  - IE8+
  - Chrome
  - FireFox
  - Safari
  - Android

## API

  - `next()`: show the next slide
  - `prev()`: show the previous slide
  - `nextLoop()`: show the and slide loop to the first one
  - `prevLoop()`: show the previous slide and loop to the last one
  - `start(<timeout>)`: start auto slide every <timeout> (millisecond)
  - `stop()`: stop auto slide
  - `goTo(<slide_id>)`: go to the slide <slide_id> (Integer)

## Usage

```html
<div class="orange">
  <div class="nav-next"></div>
  <div class="nav-prev"></div>
  <div class="orange-skin">
    <div class="slice"> 1 </div>
    <div class="slice"> 2 </div>
    <div class="slice"> 3 </div>
  </div>
</div>


<script type="text/javascript">
  var orange = require('orange')
  
  o.start(4000) // 4s time out for each slide
  
  
  // initialize events onclick next and prev
  document.querySelectorAll('.orange .nav-next')[0].onclick = function () {
    o.next();
    o.stop() // Stop auto sliding
  }
  document.querySelectorAll('.orange .nav-prev')[0].onclick = function () {
    o.prev();
    o.stop() // Stop auto sliding
  }
</script>

```
  

## License

  MIT
