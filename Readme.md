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
  - `start(<timeout>)`: start auto slide every <timeout> (millisecond)
  - `stop()`: stop auto slide
  - `goTo(<slide_id>)`: go to the slide <slide_id> (Integer)

## Usage

```html

orange = require('orange')

o = new Orange(document.querySelectorAll('.orange')[0])
o.start(4000) // 4s time out for each slide

document.querySelectorAll('.orange .nav-next')[0].onclick = function () {
  o.next();
  o.stop() // Stop auto sliding
}

document.querySelectorAll('.orange .nav-prev')[0].onclick = function () {
  o.prev();
  o.stop() // Stop auto sliding
}

```
  

## License

  MIT
