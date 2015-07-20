define([
  'jquery'
],
function($) {
  var Tab = function(){};
  
  Tab.prototype.show = function($el){

    var $ul      = $el.closest('ul');
    var selector = $el.data('target') || $el.attr('href');

    if($el.parent('li').hasClass('active')) return;

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.tab', {
      relatedTarget: previous
    })

    $el.trigger(e);

    if (e.isDefaultPrevented()) return

    var $target = $(selector);

    this.activate($el.parent('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $el.trigger({
        type: 'shown.tab',
        relatedTarget: previous
      });
    });
  };

  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active');

      element.addClass('active');

      callback && callback();
    }

    next();
  };

  Tab.prototype.destroy = function () {
    $(document).off('click', '[data-toggle="tab"]');
    $(document).off('mouseenter', '[data-toggle="tab"]');
  };

  (function(){
    var tab = new Tab();

    $(document).on('mouseenter', '[data-toggle="tab"]', function (e) {
      e.preventDefault();
      tab.show.call(tab, $(this));
    });

    $(document).on('click', '[data-toggle="tab"]', function (e) {
      e.preventDefault();
    });

  })();

});