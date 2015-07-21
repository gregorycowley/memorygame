requirejs.config({

    // Base path used to load scripts
    baseUrl: 'js/',

    /*  urlArgs: "bust=" + (new Date()).getTime(), // drop this later..*/
    paths: {
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min',
        backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/backbone-min',
        underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min',
        bootstrap: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min',
        // Require.js plugins
        text: 'vendor/requirejs-text/text',
        // Just a short cut so we can put our html outside the js dir
        // When you have HTML/CSS designers this aids in keeping them out of the js directory
        templates: '../templates',
        page: 'views/page'

    },

    shim: {
        jquery: {
            exports: '$'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery']
        },
        page: {
            deps: ['jquery'],
            exports: 'page'
        }

    }

});


/*
  Console Shim
*/
if (typeof (console) === 'undefined') {
    var console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function () {};
}


/*
  Bootstrap the application
*/

//
require(['jquery', 'underscore', 'backbone', 'bootstrap', 'page'], function ($, _, Backbone, Bootstrap, PageView) {
    var page = new PageView({
        el: $('body')
    });
    //page.render();
});