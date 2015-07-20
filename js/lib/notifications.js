define([
  'jquery',
  'underscore'
],
function($, _) {

  var notifications = {

    $action: $('.action'),
    $menulink: $('.menu-link'),
    $menuTrigger: $('.has-subnav > a'),
    $n: null,
    nHeight: null,

    init: function(){
      var that = this;
      _.bindAll(this, 'addMessage', 'showNotification', 'hideNotification');

      $('#page').delegate(".dismiss-btn", "click", function(e) {
        that.hideNotification();
        return false;
      });

      $(window).resize(function() {
        that.nHeight = that.$n.outerHeight();
      });

    },

    addMessage: function( msg ) {
      if ( $('#notification') ) $('#notification').remove();
      var that = this;
      $(msg).prependTo('#page');
       this.$n = $('#notification'),
      this.nHeight = this.$n.outerHeight();
      this.showNotification();
      setTimeout(that.hideNotification,8000);
    },

    showNotification: function() {
      this.$n.css('top',-this.nHeight).addClass('anim').css('top',0);
    },

    hideNotification: function() {
      var that = this;
      this.$n.css('top',-(this.nHeight));
      setTimeout(function() { that.$n.removeClass('anim'); }, 1000);
    }


  };

  return notifications;

});
