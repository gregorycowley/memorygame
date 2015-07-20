define([
  'jquery',
  'underscore',
  'backbone',
  'models/user',
  'collections/stores',
  'jQueryValidation'
],
function($, _, Backbone, User, Stores) {

  var ContactUsForm = Backbone.View.extend({

    events :{

    },

    initialize : function(){

      $('.form--contact-us').validate({
        errorClass: "has-error",
        errorElement: "p",

        rules : {          
          email: {
            required: true,
            email: true
          },
          message: {
            required: true
          }
        },
        messages: {
          email: {
            required: "We need your email address to contact you"
          },
          message: {
            required: "Please enter your message"
          }
        }
      });     
    }
    
  });
  
  return ContactUsForm;
  
});

