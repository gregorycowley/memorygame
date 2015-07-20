define([
    'jquery',
    'underscore',
    'backbone',
    'views/gameboardrow',
    'views/gameboardtile',
    'text!templates/game-board.html'
],
    function ($, _, Backbone, GameBoardRowView, GameBoardTileView, GameBoardTemplate) {

        var GameBoardView = Backbone.View.extend({

            el: '.game-board',
            rows: 5,
            columns: 5,
            
            gameBoardTemplate: null,

            events: {

            },

            initialize: function () {
//                alert('init game-board');
            },

            render: function () {
                var that = this;
                var gameRow = null;
                $(this.el).append( _.template( GameBoardTemplate ) );
                _(this.rows).times(function(n){ 
                    gameRow = new GameBoardRowView({columns: that.columns});
                    gameRow.setElement(this.$('.game-tiles')).render(); 
                    _(that.columns).times(function(n){ 
                        gameTile = new GameBoardTileView({}); 
                        gameTile.setElement( gameRow.find('.game-tile-row')).render();  
                    });

                });
                
                Backbone.history.start();
            },
            
        });

        return GameBoardView;
    });