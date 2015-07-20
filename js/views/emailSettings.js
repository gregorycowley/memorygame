define([
  'jquery',
  'underscore',
  'backbone',
  'models/subscriber',
  'lib/validation',
  'text!templates/pref-center/emailSettings.html',
], 
function($, _, Backbone, Subscriber, validation, EmailSettingsTemplate){

  var emailSettings = Backbone.View.extend({

    model: null,

    cache: null,

    events: {
      'change input[name="Status"]': 'updateStatus',
      'change input[name="General"]': 'updateInput',
      'change input[name="WOWPilot"]': 'updateInput',
      'change input[name="Wine_Preference"]': 'updateWinePreference',
      'change input[name="Mail_Frequency"]': 'updateInputFrequency',
      'change select[name="Mail_Frequency_Day"]': 'updateInputFrequency',
      'submit #pref-center-email-settings': 'saveWrapper'
    },

    initialize: function(options){
      _.extend(this, options);
      _.bindAll(this, 'render', 'saveWrapper');

      this.model = Subscriber;

      if(!this.model.fetched){
        this.model.setupLocalStorage();
        if(!this.model.get('ID')){
          window.location = '/preference-center-login'
        }
      }

      this.cache = new (Backbone.Model.extend({}));
      this.cache.set('mailFreqRegex', /[1-7]/);
      this.template = _.template(EmailSettingsTemplate);

      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'change:Status', this.unsubscribeDependantItems);
    },

    render: function() {
      this.$el.html( this.template( { data: _.extend({}, this.model.attributes, this.cache.attributes) } ) );
      return this;
    },

    unsubscribeDependantItems: function(model, status){
      if(status === 'Unsubscribed'){
        model.set({
          'General': 'No',
          'WOWPilot': 'No'
        });
      }
    },

    updateInput: function(event){
      var val;
      var $el = $(event.target);
      var name = $el.attr('name');
      if($el.attr('type') === 'checkbox'){
        val = $el.is(':checked') ? $el.val() : $el.data('anti-value');
      }
      else{
        val = $el.val();
      }
      this.model.set(name, val);
    },

    updateStatus: function(event){
      var val;
      var $el = $(event.target);
      var name = $el.attr('name');
      if($el.attr('type') === 'checkbox'){
        val = $el.is(':checked') ? $el.val() : $el.data('anti-value');
      }
      else{
        val = $el.val();
      }
      this.model.set(name, val);
    },

    updateInputFrequency: function(event){
      event.preventDefault();

      var $el = $(event.target);
      var name = $el.attr('name');
      var val = $el.val();
      if(val != 0){
        val = this.$el.find('[name="Mail_Frequency_Day"]').val();
      }
      this.model.set('Mail_Frequency', val);
      this.setStyledSelectActiveState();
    },
    updateWinePreference: function(event){
        event.preventDefault();

        var $el= $(event.target);
        var val = $el.val();
        if (val == 0){
            this.model.set({"Nosh":"Yes", "Wine":"Yes"});
        }
        else if (val == 1){
            this.model.set({"Nosh":"Yes", "Wine":"No"});
        }
        else {
            this.model.set({"Nosh":"No", "Wine":"Yes"});
        }
        this.setStyledSelectActiveState();
    },

    saveWrapper: function(event){
      var that = this;
      if(event){
        event.preventDefault();
      }
      that.model.set('Loading', 'Submit');
      this.model.save(null, {
        success: function (data, response) {
          that.model.set('Loading', '');
          that.showMessage( response.OverallStatus + ": " + response.message);
          if(response.OverallStatus !== "OK"){
            //that.showMessage( response.OverallStatus + ": " + response.message);
          }
        },
        error: function (request, type, errorThrown) {
          that.model.set('Loading', '')
          that.showMessage("Error -> " + type.statusText + ": " + request.attributes.Status);
        }
      });
    },

    setStyledSelectActiveState: function (){
      var select = this.$el.find('[name="Mail_Frequency_Day"]');
      if( select.val() == "" ||  select.val() == 8 ) {
        select.addClass("empty");
      } else {
        select.removeClass("empty");
      }
    }

  });

  return emailSettings;

});