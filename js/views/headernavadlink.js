define([
    'jquery',
    'underscore',
    'backbone',
    'models/user',
    'collections/stores',
    'localStorage'
], 
function($, _, Backbone, User, Stores){
  var HeaderNavAdLink = Backbone.View.extend({

    initialize: function(){

      this.onUserChange();

      User.on('change:store_number', this.onUserChange, this);
    },

    onUserChange : function(){
      var store_number = User.get('store_number');
      this.$el.addClass('hidden');

      if(store_number){ //if store_number is set...
        this.$el.removeClass('hidden');
        var selectedStore = Stores.findWhere({ "store_number" : store_number });
        if(selectedStore){
          this.$el.attr('href', selectedStore.get('guid'));
        }
      }
    }


  });

  return HeaderNavAdLink;
});