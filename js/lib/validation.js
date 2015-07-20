define([
  'jquery',
  'underscore'
],
function($, _) {

  var validation = {
    valid: function ($inputs) {
      var that = this;
      var errors = [];
      $inputs.each(function (i, input) {
        var $input = $(input);
        var val = $input.val();
        $input.val(val.trim());
        if ($input.data('validations')) {
          var validations = $input.data('validations').split(' ');
          _.each(validations, function (methodName) {
            var response;
            var value = $input[0].type === "checkbox" ? $input.prop('checked') : $input.val();
            if (methodName.indexOf(':') !== -1) {
              var matchingFieldValue = that.$el.find("input[name='" + methodName.split(':')[1] + "']").val();
              methodName = methodName.split(':')[0];
              response = that.validate[methodName](value, matchingFieldValue);
            }
            else if (methodName.indexOf('-') !== -1) {
              var maxlength = methodName.split('-')[1];
              methodName = methodName.split('-')[0];
              response = that.validate[methodName](value, maxlength);
            }
            else {
              response = that.validate[methodName](value);
            }

            if (!response.valid) {
              errors.push(_.extend({}, response, {$el: $input}));
            }
          });
        }
      });

      if (errors.length === 0) {
        return {valid: true}
      }
      else {
        return {"valid": false, "errors": errors}
      }
    },

    validate: {
      existance: function (value) {
        if (value.length || value) {
          return {valid: true};
        }
        else {
          return {valid: false, msg: "Required."};
        }
      },
      email: function (value) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(value)) {
          return {valid: true};
        }
        else {
          return {valid: false, msg: "Valid email Required."};
        }
      },
      match: function (value, matchingFieldValue) {
        if (value == matchingFieldValue) {
          return {valid: true};
        }
        else {
          return {valid: false, msg: "Email addresses do not match."};
        }
      },
      numerical: function (value) {
        var isnum = /^\d+$/.test(value);
        if (isnum == true) {
          return {valid: true};
        }
        else {
          return {valid: false, msg: "Phone number must only contain numbers."};
        }
      },

      phoneNumber: function (value) {
        if (value.length) {
          var isnum = /^\d+$/.test(value);

          if (isnum == true) // If the phone number is all digits
          {
            if (value.length == 10) // if value is 10 digits
            {
              return {valid: true};
            }
            else {
              return {valid: false, msg: "Phone number must be 10 digits long."};
            }
          }
          else {
            return {valid: false, msg: "Phone number must only contain numbers (e.g. 9995553333)."};
          }
        }
        else {
          return {valid: true};
        }
      },
      length: function (value, maxlength) {
        if (value.length <= maxlength) {
          return {valid: true};
        }
        else {
          var errormsg = "This field has a maximum length of " + maxlength + " characters.";
          return {valid: false, msg: errormsg};
        }
      }
    },

    removeErrors: function ( target ) {
      target.$el.find('.input-group').removeClass('has-error').find('.error__wrapper').remove();
    },

    showErrors: function (errors) {
      _.each(errors, function (error, i) {
        error.$el.closest('.input-group').addClass('has-error');
        if (error.$el.next('span').length) {
          error.$el.next('span').addClass('error-msg error__wrapper').text(error.msg);
        }
        else {
          error.$el.after($("<span>").addClass('error-msg error__wrapper').text(error.msg));
        }
      });
    }
  };

  return validation;

 });
