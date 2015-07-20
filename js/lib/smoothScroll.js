define([
  'jquery',
  'underscore'
],
function($, _) {

  var smoothScroll = function(e){
    e.preventDefault();
    var $viewport = $('html, body');
    if (location.pathname.replace(/^\//,'') == e.currentTarget.pathname.replace(/^\//,'') 
        || location.hostname == e.currentTarget.hostname) {

        var target = $(e.currentTarget.hash);
        target = target.length ? target : $('[name=' + e.currentTarget.hash.slice(1) +']');
           if (target.length) {
             $viewport.animate({
                 scrollTop: target.offset().top
            }, 600, "linear");
            return false;
        }
        // Stop the animation if the user scrolls. Defaults on .stop() should be fine
        $viewport.bind("scroll mousedown DOMMouseScroll mousewheel keyup", function(e){
          if ( e.which > 0 || e.type === "mousedown" || e.type === "mousewheel"){
            // This identifies the scroll as a user action, stops the animation, then unbinds the event straight after (optional)
            $viewport.stop().unbind('scroll mousedown DOMMouseScroll mousewheel keyup');
          }
        });
    }
  }
  
  return smoothScroll;
  
});