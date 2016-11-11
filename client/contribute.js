/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */

/*****************************************************
    Upon click on submit-question. it sends data from
    input fields Answer and question to server.
******************************************************/
var main = function()
{
  	'use strict';
    $('#submit-question').on('click', function()
    {
        var questionnaireUpdate={};
        questionnaireUpdate.question=$('#post-question').val();
        questionnaireUpdate.answer=$('#answer').val();

        ajaxPost('/question',questionnaireUpdate, function()
            {});
            $('#post-question').val('');
            $('#answer').val('');
    });
};


$(document).ready(main);
