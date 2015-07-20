define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/game-board-tile.html'
],
    function ($, _, Backbone, gameBoardTileTemplate) {

        var GameBoardTileView = Backbone.View.extend({

            events: {

            },

            initialize: function () {
            
            },

            render: function () {
                $(this.el).append( _.template( gameBoardTileTemplate ) );
            }
            
        });

        return GameBoardTileView;
    });