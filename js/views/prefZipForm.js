define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/pref-center/zipForm.html',
], 
function($, _, Backbone, ZipFormTemplate){
  
  var StorePref = Backbone.View.extend({

    events:{
      'submit .js-pref__zipForm': 'updateStoreList'
    },

    initialize : function(options){
      this.showMessage = options.showMessage;
      this.template = _.template(ZipFormTemplate);
      this.model = new (Backbone.Model.extend({}));
      this.eventBus = options.eventBus;

      _.bindAll(this, 'render', 'updateStoreList');

      this.render();
    },

    render: function(){
      var data = {
        data: _.extend({}, this.model.toJSON())
      };

      this.$el.html(this.template(data));

      return this;
    },

    updateStoreList: function(event){
      event.preventDefault();

      this.model.set('Loading', true);

      var zip = this.$el.find('[name="zipCode"]').val();
      if(this.isValidZip(zip)){
        this.eventBus.trigger('pref.search.zipCode', zip);
      }
      else{
        this.showMessage(zip + ' is not a valid zip code.');
      }
    },

    isValidZip: function(zip){
      return /^\d{5}$/.test(zip);
    }

  });

  return StorePref;
});
