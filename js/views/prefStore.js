define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/pref-center/prefStoreTemplate.html',
], 
function($, _, Backbone, PrefStoreTemplate){
  
  var PrefStore = Backbone.View.extend({

    events:{
      'click .js-remove-store-btn': 'removeStore',
      'click .js-add-store-btn': 'addStore',
      'click .js-select-home-store' : 'selectHome'
    },

    initialize : function(options){
      this.template = _.template(PrefStoreTemplate);
      this.isFirstAdditional = options.isFirstAdditional;
      this.isAdditional = options.isAdditional;
      this.isAvailable = options.isAvailable;
      this.eventBus = options.eventBus;
      this.loading = options.Loading;
      this.googleMapsAPIKey = options.googleMapsAPIKey;

      _.bindAll(this, 'render', 'addStore', 'removeStore');
    },

    render: function(){
      var options = { data: this.model.toJSON() };
      options.data.isFirstAdditional = this.isFirstAdditional;
      options.data.isAdditional = this.isAdditional;
      options.data.isAvailable = this.isAvailable;
      options.data.Loading = this.loading;
      options.data.googleMapsAPIKey = this.googleMapsAPIKey;

      this.$el.html(this.template(options));

      return this;
    },

    removeStore:function(){
      this.eventBus.trigger('prefStoreRemvoeFromSubscriber', this.model);
    },

    addStore: function(){
      this.eventBus.trigger('prefStoreAddToSubscriber', this.model);
    },

    selectHome: function(){
        this.eventBus.trigger('prefStoreSelectHomeStore', this.model);
    }

  });

  return PrefStore;
});
