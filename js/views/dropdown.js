define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {
 
  var DropdownView = Backbone.View.extend({

    events: {
      "click [data-toggle='dropdown']": "toggleMenu" 
    },

    initialize : function(){
      if( !$(document).data("dropdowns-init") ){
        $(document).on('click', this.closeDropdown);
        // $(document).on('touchend', alert('touch'));
        $(document).data("dropdowns-init", true);
      }
    },
    
    toggleMenu: function(){
      this.$el.closest('ul').find('li.open').not(this.$el).removeClass('open');
      this.$el.closest('ul').find('li.is-open').not(this.$el).removeClass('is-open');
      this.$el.toggleClass('open');

      this.$el.toggleClass('is-open');
    },

    closeDropdown : function(event){
      if(
        $('.is-open').length && 
        !$(event.target).parents('.header-nav').length &&
        !$(event.target).parents('.shopping-list__items').length
      ){
        $('li.has-dropdown').removeClass('is-open');
        $('li.has-dropdown').removeClass('open');
      }
    }

  });

  return DropdownView;
});
