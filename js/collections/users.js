
define([
  'jquery',
  'underscore',
  'backbone',
  'models/user',
  'localStorage'
],
function($, _, Backbone, User) {

  var Users = Backbone.Collection.extend({

    localStorage: new Backbone.LocalStorage("users"),

    model: User,

    empty: function(){
      _.chain(this.models).clone().each(function(localmodel){
        localmodel.destroy();
      });
      return this;
    }

  });

  return Users;
});