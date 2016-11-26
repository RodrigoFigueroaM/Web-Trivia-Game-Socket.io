/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
/*****************************************************
    File to control the dinamics of the game
******************************************************/

/*Store the currentQuestion for the game */
var currentQuestion={};
/*Establish connection with server*/
var socket = io.connect('http://localhost:3000');

/*****************************************************
    Updates score HTML field
    takes as parameter socket beign used
******************************************************/
var updateScore = function (socket)
{
  	'use strict';
    socket.on('updateScore', function(data)
    {
        scoreModel.right(data.right);
        scoreModel.wrong(data.wrong);
        scoreModel.update('#correct-score','#incorrect-score');
    });
};

/*****************************************************
    Updates question HTML field
    takes as a parameter socket beign used
******************************************************/
var updateQuestion = function(socket)
{
  	'use strict';
    socket.on('newQuestion',function (data)
    {
        currentQuestion=data;
        questionModel.question(currentQuestion.question);
        questionModel.update('.questionAsked');
    });
};

/*****************************************************
    Updates Player HTML field
    takes as a parameter socket beign used
******************************************************/
function updatePlayers(socket)
{
  	'use strict';
    socket.on('get users',function(data)
    {
        usersModel.user( data);
    });
}

/*****************************************************
    Enables and disables the corresponding buttons that
    will be used in the program
******************************************************/
function beginRound (socket)
{
  	'use strict';
    socket.on('begin round', function(data)
    {
            if(data.newRound===true)
            {
                $('#next').prop( 'disabled', true );
                $('#submit-answer').prop('disabled', false);
                console.log(data.starter);
                newRoundModel.name(data.starter);

            }
            else
            {
                $('#next').prop( 'disabled', false);
                $('#submit-answer').prop('disabled', true);
                $('.ui form .starter').remove();
            }
    });
}

/*****************************************************
    Updates  HTML field of Player who provided the answer
    and if the player answer correctly
******************************************************/
function updateAnswer (socket)
{
  	'use strict';
    socket.on('checkAnswer', function(data)
    {
        answererModel.name(data.answerer);
        if(data.correct==='true')
        {
            answererModel.checkAnswer('correct');
        }
        else
        {
            answererModel.checkAnswer('incorrect');
        }
        socket.emit('score');
    });
}


var main = function()
{
  	'use strict';
    /*Show game menu after log in */
    $('#login').on('click', function (e)
     {
         e.preventDefault();
         if($('#username').val()!=='')
         {
            $('#trivia-login').fadeOut();
            $('#trivia-menu').show();
            $('#trivia-players').show();
            $('#trivia-score').show();
            $('#trivia-game').show();
            $('#trivia-login').off('clicks');
            socket.emit('new user',{username: $('#username').val()});
            socket.emit('score', {correct:false});
            socket.emit('new round',{state: false});
          }
    });



    updateAnswer(socket);
    updateQuestion(socket);
    updateScore(socket);
    updatePlayers(socket);
    beginRound(socket);
};


$(document).ready(main);
