define([
  'jquery',
  'underscore',
  'backbone',
  'localStorage'
],
function($, _, Backbone) {
  
  var User = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage("User"),

    fetchStoreDataUrl : "/api/store/",

    defaults: {
        "company":          "",
        "name":             "",
        "phonenumber":      "",
        "email":            "",
        "hearAboutUs":      "",
        "fobpoint":         "",
        "enteredLocation":  "",
        "location":         {},
        "store_number":     "",
        "store_id":         ""
    },

    fetchStoreData: function(){
      var store_id = this.get("store_id");
      if(store_id){
        return $.ajax({
          type: "GET",
          cache: true,
          dataType: "json",
          data: {"id": store_id},
          url: this.fetchStoreDataUrl
        });
      }
      else{
        return false;
      }
    }

  });

  return new User();

});
