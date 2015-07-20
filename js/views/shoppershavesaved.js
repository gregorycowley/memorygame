define([
  'jquery',
  'underscore',
  'backbone',
  'views/plugins.jquery'
],
function($, _, Backbone ) {

  var ShoppersHaveSaved = Backbone.View.extend({

    flapperOptions : {
      width: 11// default max value
    },

    // savingsURL : "http://groceryoutlet.com/goiwebservices/goi.asmx/SavingsYTD",
    savingsURL: '/api/customers_saved/',

    initialize: function(){
      this.render();
    },

    render: function() {
      this.getDollarAmount();
      return this;
    },

    getDollarAmount: function(){
      var that = this;
      var renderFrapper = function(response){
        var dollars = "$" + Math.round(response);
        that.flapperOptions.width = dollars.length;

        that.$el.flapper(that.flapperOptions).val(dollars).change();
      };

      $.ajax({
        url: that.savingsURL,
        type: "POST",
        data: {'Store':'0'}
      }).done(function(response){
        renderFrapper(response);
      }).fail(function(){
        renderFrapper({"d":"596652609.68"});
      });
    },

    cleanResponse : function(value){
      var dollars = value.split('.')[0]

      this.flapperOptions.width = dollars.length + 1;
      return dollars
    }

  });

  return ShoppersHaveSaved;
});
