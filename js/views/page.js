define([
    'jquery',
    'underscore',
    'backbone',
    'views/gameboard',
    'models/game'
],
    function ($, _, Backbone, GameBoardView, GameModel) {

        var PageView = Backbone.View.extend({

            el: 'body',
            
            inner: null,
            
            model: 'null',
            
            gameBoard: null,
            
            template: '<div class="game-board-container"></div>',

            events: {
                'click .btn-begin': 'begin'
            },
            
            initialize: function(){
                this.model = new GameModel();
                this.model.on ('change', this.setMessage, this);
                this.render();
            },
            
            render: function () {
                this.gameBoard = new GameBoardView({
                    model: this.model
                });
                return this;
            },
            
            begin: function (){
                this.gameBoard.begin();
                $('.btn-begin').addClass('hidden');
                this.model.message('Start Memorizing', 'primary');
            },
            
            setMessage: function(){
                var msg = this.model.get('msg');
                var priority = this.model.get('priority');
                if ( msg && priority ) {
                    $('.message-area').html('<h2>' + msg + '</h2>');
                    switch (priority) {
                        case 'primary': 
                            $('.message-area').removeClass('bg-danger');
                            $('.message-area').removeClass('bg-success');
                            $('.message-area').addClass('bg-primary');
                            break;
                        case 'success':   
                            $('.message-area').removeClass('bg-danger');
                            $('.message-area').removeClass('bg-primary');
                            $('.message-area').addClass('bg-success');
                            break;
                        case 'danger':   
                            $('.message-area').removeClass('bg-primary');
                            $('.message-area').removeClass('bg-success');
                            $('.message-area').addClass('bg-danger');
                            break;
                        default:
                    }
                }
            }

        });

        return PageView;
    });


