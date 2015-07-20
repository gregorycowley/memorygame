define([
    'jquery',
    'underscore',
    'backbone',
    'models/subscriber',
    'models/store',
    'text!templates/pref-center/prefStoreTemplate.html',
], 
function($, _, Backbone, Subscriber, Store, PrefStoreTemplate){
  
  var PrimaryStore = Backbone.View.extend({

    events:{},

    initialize : function(options){
      this.template = _.template(PrefStoreTemplate);
      this.subscriber = Subscriber;
      this.model = new Store({});
      this.googleMapsAPIKey = options.googleMapsAPIKey;

      //this.listenTo(this.subscriber, 'change:StoreA', this.getStoreData);
      //this.listenTo(this.model, 'change', this.render);

      _.bindAll(this, 'render');
    },

    render: function(){
      var options = { data: this.model.toJSON() };
      options.data.isPrimary = true;
      options.data.googleMapsAPIKey = this.googleMapsAPIKey;
      
      this.$el.html(this.template(options));

      return this;
    },

    getStoreData: function(){
      this.model.set( 'StoreNumber', this.subscriber.get('StoreA'), { silent: true});
      this.model.fetchStoreByNumber()
    }

  });

  return PrimaryStore;
});
