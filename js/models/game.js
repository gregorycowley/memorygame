define([
  'jquery',
  'underscore',
  'backbone'
],
    function ($, _, Backbone) {

        var GameModel = Backbone.Model.extend({
            
            "tileHistory": [],
            
            defaults: {
                "tiles": []
                
            },

            initialize: function () {
                
            },
            
            select: function ( position ) {
                console.log( this.get('tiles')[position] );
                this.get('tiles')[position].selected = true;
                this.trigger('change');
                
            },

            reset: function () {
                console.log('Model:: Reseting grid');
                _.each(this.get('tiles'), function ( tile ) {
                      tile.selected = false;
                });
                this.trigger('change');
            },
            
            randomize: function (){
                var tileList = _.sample(this.get('tiles'), 9) 
                _.each(tileList, function ( tile ) {
                      tile.selected = true;
                });
                this.trigger('change');
                this.tileHistory.push(tileList);
            },
            
            begin: function (){
                var that = this;
                this.randomize()
                setTimeout(function(){
                    that.reset();
                }, 5000);
            }
            
            

        });

        return GameModel;

    });