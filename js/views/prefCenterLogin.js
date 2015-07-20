define([
  'jquery', 
  'underscore', 
  'backbone',
  'lib/validation'
], 
function($, _, Backbone, validation){
  
  var PrefCenterLogin = Backbone.View.extend({

    events: {
      'submit' : 'submitLoginForm'
    },

    initialize: function(options){
      _.extend(this, options);
      this.cache = new (Backbone.Model.extend({}));

      _.bindAll(this, 'successLogin');
    },

    submitLoginForm: function(event){
      event.preventDefault();

      var good2Go = validation.valid( this.$el.find('input') );
      if ( good2Go.valid ){
        var model = {
          "EmailAddress":this.$el.find('input').filter('[name="EmailAddress"]').val()
        };

        $.ajax({
          type: 'GET',
          url : '/api/subscribers/index.php',
          dataType: 'json',
          data: model
        })
            .done(this.successLogin)
            .fail(function(response){
              console.log(response);
              this.showMessage(response)
              // $('.error-message').html("Fail");
              //alert('fail');
            });
      }
      else{
        validation.removeErrors(this);
        validation.showErrors(good2Go.errors);
        return false;
      }

    },

    successLogin: function(response){
      if(response.OverallStatus === "OK" && response.ID != false){
        this.setCachedID(response.ID);
        window.location = this.$el.data('next');
      }
      else{
        // replace this with propper messaging.
        this.showMessage('Email address not found');
      }
    },

    setCachedID: function(id){
      return window.localStorage.setItem('subscriberID', id);
    }

  });

  return PrefCenterLogin;

});