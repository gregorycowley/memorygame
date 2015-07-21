define([
    'jquery',
    'underscore',
    'backbone',
    'views/gameboard'
],
    function ($, _, Backbone, GameBoardView) {

        var PageView = Backbone.View.extend({

            el: 'body',
            
            inner: null,
            
            gameBoard: null,
            
            template: '<div class="game-board-container"></div>',

            events: {
                'click .btn-begin': 'begin'
            },
            
            initialize: function(){
                this.render();
            },
            
            render: function () {
                this.gameBoard = new GameBoardView();
                return this;
            },
            
            begin: function (){
                this.gameBoard.begin();
                $('.btn-begin').addClass('hidden');
            },

            initGameBoardSubView: function () {
//                this.gameBoard = new GameBoardView({
//                    parent: this
//                });
                //$(this.el).find('.game-board').html(this.gameBoard.render().el);
                // this.gameBoard.render();
                // this.gameBoard.setElement(this.$('.game-board')).render(); 
                // this.gameBoard.render();
            }

        });

        return PageView;
    });


