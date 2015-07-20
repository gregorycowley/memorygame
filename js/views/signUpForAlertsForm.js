define([
  'jquery',
  'underscore',
  'backbone',
  'lib/smoothScroll',
  'lib/applyToStore',
  'models/user',
  'collections/stores'

],
function($, _, Backbone, smoothScroll, applyToStore, User, Stores) {

  var SignUpForAlertsForm = Backbone.View.extend({

    viewport: null,
    user: null,
    store: null,

    events : {
      'submit': 'captureEmailSignupForm',
      'click .work__location-link' : 'smoothScrollEvent',
      'click .apply-store-btn' : 'applyToStoreEvent'
    },

    initialize : function(){

      Stores.on('reset', this.onUserChange, this);
      User.on('change', this.onUserChange, this);
      this.onUserChange();
    },

    captureEmailSignupForm: function(event){
      var good2Go = this.valid( this.$el.find('input, select') );
      if( good2Go.valid ){
        return true;
      }
      else{
        this.removeErrors();
        this.showErrors(good2Go.errors);
        return false;
      }
    },

    valid: function($inputs){
      var that = this;
      var errors = [];
      $inputs.each(function(i, input){
        var $input = $(input);
        var val = $input.val();
        $input.val(val.trim());
        if($input.data('validations')){
          var validations = $input.data('validations').split(' ');
          _.each(validations, function(methodName){
            var response;
            var value = $input[0].type === "checkbox" ? $input.prop('checked') : $input.val();
            if(methodName.indexOf(':') !== -1){
              var matchingFieldValue = that.$el.find( "input[name='" + methodName.split(':')[1] + "']" ).val();
              methodName = methodName.split(':')[0];
              response = that.validate[methodName]( value, matchingFieldValue );
            }
            else if (methodName.indexOf('-') !== -1)
            {
              var maxlength = methodName.split('-')[1];
              methodName = methodName.split('-')[0];
              response = that.validate[methodName]( value, maxlength);
            }
            else{
              response = that.validate[methodName]( value );
            }
            
            if(!response.valid){
              errors.push( _.extend({}, response, {$el : $input}) );
            }
          });
        }
      });

      if(errors.length === 0){
        return {valid: true}
      }
      else{
        return {"valid": false, "errors": errors}
      }
    },

    validate: {
      existance: function(value){
        if(value.length || value){
          return {valid: true};
        }
        else{
          return {valid: false, msg: "This field is required."};
        }
      },
      email: function(value){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(value)){
          return {valid: true};
        }
        else{
          return {valid: false, msg: "Please enter a valid email address."};
        }
      },
      match: function(value, matchingFieldValue){
        if(value == matchingFieldValue){
          return {valid: true};
        }
        else{
          return {valid: false, msg: "Email addresses do not match."};
        }
      },
      numerical: function(value)
      {
        var isnum = /^\d+$/.test(value);
        if(isnum == true)
        {
          return {valid: true};
        }
        else
        {
          return {valid: false, msg: "Phone number must only contain numbers."};
        }
      },
      phoneNumber: function(value)
      {
        if(value.length)
        {
          var isnum = /^\d+$/.test(value);

          if(isnum == true) // If the phone number is all digits
          {
            if(value.length == 10) // if value is 10 digits
            {
              return {valid: true};
            }
            else
            {
              return {valid: false, msg: "Phone number must be 10 digits long."};
            }
          }
          else
          {
            return {valid: false, msg: "Phone number must only contain numbers (e.g. 9995553333)."};
          }
        }
        else
        {
          return {valid: true};
        }
      },
      length: function(value, maxlength)
      {
        if (value.length <= maxlength)
        {
          return {valid: true};
        }
        else
        {
          var errormsg = "This field has a maximum length of "+maxlength+" characters.";
          return {valid: false, msg: errormsg};
        }
      }
    },

    removeErrors: function(){
      this.$el.find('.input-group').removeClass('has-error').find('.error__wrapper').remove();
    },

    showErrors: function(errors){
      _.each(errors, function(error, i){
        error.$el.closest('.input-group').addClass('has-error');
        if(error.$el.next('span').length){
          error.$el.next('span').addClass('error-msg error__wrapper').text(error.msg);
        }
        else{
          error.$el.after( $("<span>").addClass('error-msg error__wrapper').text(error.msg) );
        }
      });
    },

    onUserChange: function(){
      
      if(!User || !Stores || !Stores.length) { return; }

      var store_number = User.get('store_number');

      if(store_number){ //if store_number is set...
        this.store = Stores.findWhere({ "store_number" : store_number })
        var homeStoreTitle = this.store.get('title');
        var homeStoreAddress = this.store.get('address') + ' ' + this.store.get('city') + ', ' + this.store.get('state') + ' ' + this.store.get('zip');
        var homeStorePhone = this.store.get('phone_number');

        this.$el.find("#selected_store").find('option').each(function() {
          if(store_number == $(this).attr('data-storenumber')){
            $(this).attr('selected', 'selected');
          }
        });
      }
    },

    smoothScrollEvent : function(e){
        smoothScroll(e);
    },

    applyToStoreEvent : function(e){
        applyToStore(this.$el.find("#selected_store").find('option'), e);
        this.smoothScrollEvent(e);
    }

  });
  
  return SignUpForAlertsForm;
  
});

