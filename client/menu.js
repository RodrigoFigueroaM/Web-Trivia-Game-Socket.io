/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
/*****************************************************
    File to take care of all the menu events
******************************************************/
var menu = function()
{
  	'use strict';
    /*toggle to Ask tab*/
    $('#ask').on('click', function (e)
     {
         e.preventDefault();
         $('#trivia-game').fadeOut(function ()
         {
             $('#trivia-questions').show();
             $('#trivia-score').hide();
             $('#trivia-players').hide();
             $('#trivia-game').off('clicks');
         });
    });

    /*toggle to Play tab*/
    $('#play').on('click', function (e)
     {
          e.preventDefault();
          $('#trivia-questions').fadeOut(function()
          {
              $('#trivia-game').show();
              $('#trivia-score').show();
              $('#trivia-players').show();
              $('#trivia-questions').off('clicks');
          });
  });
};

$(document).ready(menu);
