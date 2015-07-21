define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/game-board-row.html'
],
    function ($, _, Backbone, GameBoardTileView, gameBoardRowTemplate) {

        var GameBoardRowView = Backbone.View.extend({
            
            el: '.game-tiles',
            
//            templateGameBoardRow: _.template( gameBoardRowTemplate ),
            
            columns: 5,
            
            events: {

            },

            initialize: function ( options ) {
                
            },

            render: function () {
//                var that = this;
//                $(this.el).append( templateGameBoardRow() );
            }
            
        });

        return GameBoardRowView;
    });