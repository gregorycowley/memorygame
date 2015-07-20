define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {
 
  var AspiringOperatorsForm = Backbone.View.extend({

    events: {
      'submit': 'processForm'
    },

    initialize: function(){

    },

    processForm : function(e){
      // e.preventDefault();
      // $.ajax({
      //   type: "POST",
      //   url: this.$el.attr( 'action' ),
      //   data: this.$el.serialize(),
      //   success: function( response ) {
      //     console.log( response );
      //   }
      // });
      return true;
    }

  });

  return AspiringOperatorsForm;

});