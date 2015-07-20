define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {
  Backbone.emulateJSON = true;
  // Backbone.emulateHTTP = true;
  
  var Subscriber = Backbone.Model.extend({
    
    url : '/api/subscribers/index.php',

    idAttribute: 'ID',

    initialize: function(){
      _.bindAll(this, 'fetchWrapper', '_cacheSubscriberID');
      this.once('change:ID', this.fetchWrapper);
      this.on('change:ID', this._cacheSubscriberID);
      this.on('change:ID', this._cacheData);
    },

    setupLocalStorage: function(){
      var cachedID = this._retrieveSubscriberID();
      
      if(cachedID){
        this.set('ID', cachedID);
      }
    },

    fetchWrapper: function(){
      var id = this.get('ID');
      this.fetched = true;
      if(id){
        this.fetch({
          cache: false,
          data: $.param({ "ID": id}),
          success: function(model){
            model.trigger('subscriberDataFetched');
          }
        });
      }
    },

    /**
     * These methods are use to get/set the model
     * to localstorage.
     */
    
    _cacheSubscriberID : function(){
      window.localStorage.setItem('subscriberID', this.get('ID') );
    },

    _cacheData : function(){
      window.localStorage.setItem('FirstName', this.get('FirstName'));
    },

    _retrieveSubscriberID : function(){
      return window.localStorage.getItem('subscriberID');
    }

    // validate: function(attrs, options) {}

  });

  return new Subscriber();

});
