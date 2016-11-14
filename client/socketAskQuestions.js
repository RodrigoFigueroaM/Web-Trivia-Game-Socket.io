/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
/*****************************************************
    File to control the dinamics of the submitting a
     new question
******************************************************/
var main = function()
{
  	'use strict';
    /*Take action when a submit question button is clicked */
    $('#submit-question').on('click', function (e)
     {
         e.preventDefault();
         if($('#post-question').val()!==''&& ($('#post-answer').val()!=='' ))
         {
            socket.emit('new question',{question: $('#post-question').val(), answer:$('#post-answer').val()});
            $('#post-question').val('');
            $('#post-answer').val('');
        }
    });
};
$(document).ready(main);
