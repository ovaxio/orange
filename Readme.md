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
  - `nextLoop()`: resume to first slide when on the last slide
  - `prevLoop()`: move to the last slide when on the first slide
  - `start(<timeout>)`: start auto slide every <timeout> (millisecond)
  - `stop()`: stop auto slide
  - `goTo(<slide_id>)`: go to the slide <slide_id> (Integer)

## Usage

```html
<div class="orange">
  <a href='#' class="nav-prev">&lsaquo;</a>
  <a href='#' class="nav-next">&rsaquo;</a>
  <ol class="orange-skin">
    <li class="slice"> 1 </li>
    <li class="slice"> 2 </li>
    <li class="slice"> 3 </li>
  </ol>
</div>


<script type="text/javascript">

  var Slideshow = require('orange');

  var slideshow_container = document.querySelector('.orange');
  var slideshow = new Slideshow(slideshow_container);
  
  // If you want automatic slide events
  slideshow.start(4000); // 4s time out for each slide
  
  // Initialize events onclick next and prev
  slideshow_container.querySelector('.nav-next').onclick = function () {
    slideshow.next();
    slideshow.stop(); // Stop auto sliding, needed if using .start()
  }

  slideshow_container.querySelector('.nav-prev').onclick = function () {
    slideshow.prev();
    slideshow.stop(); // Stop auto sliding, needed if using .start()
  }
</script>
```

Then customize the appearance as you wish with CSS.
  

## License

  MIT
