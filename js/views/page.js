define([
    'jquery',
    'underscore',
    'backbone',
    'views/gameboard'
],
    function ($, _, Backbone, GameBoardView) {

        var PageView = Backbone.View.extend({

            el: 'body',
            gameBoard: null,

            events: {

            },

            initialize: function () {
                this.initGameBoardSubView();
            },

            initGameBoardSubView: function () {
                this.gameBoard = new GameBoardView({
                    el: '.game-board'
                });
                this.gameBoard.setElement(this.$('.game-tiles')).render(); 
                //this.gameBoard.render();
            }

        });

        return PageView;
    });