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
        $('#correct-score').remove();
        $('#incorrect-score').remove();
        $('#correct').prepend('<div class="value" id ="correct-score" >'+data.right+ '</div>');
        $('#incorrect').prepend('<div class="value" id ="incorrect-score" >'+data.wrong+ '</div>');
        $('#correct-score').transition('jiggle');
        $('#incorrect-score').transition('jiggle');
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
        $('#question .questionAsked').remove();
        $('#question').append('<span class= "questionAsked">'+data.question+'</span>');
        $('.questionAsked').hide();
        $('.questionAsked').fadeIn(1200,function(){});


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
        var i=0;
        for (i; i <= data.length;i++)
        {
            $('#myUsers').remove();
        }
        data.forEach(function(data)
        {

            $('#users').append('<div class="item" id="myUsers"><div class="content"><div class="header">'+data.username+'</div> </div></div>');
        });
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
                $('.ui form span').remove();
                $('.ui form').append('<span><h3 class= "starter">'+data.starter+'</h3> started a new round</span>');
                $('.starter').hide();
                $('.starter').fadeIn(1000,function(){});
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
        $('#answerer').remove();
        $('#provider').append('<h3 class= "ui text" id="answerer" > '+ data.answerer+' answered </h3>');
        if(data.correct==='true')
        {
          $('#answerer').append('<p class="correct answer">correct</p>');
        }
        else
        {
            $('#answerer').append('<p class="incorrect answer">incorrect</p>');
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

    /*Start a new round after clicking button to get questions*/
    $('#next').on('click',function(e)
    {
        e.preventDefault();
        socket.emit('new round',{state: true});
        socket.emit('getQuestion');
    });

    /*Submit answer for current question */
    $('#submit-answer').on('click',function (e)
    {
        var currentAnswer={};
        e.preventDefault();
        currentAnswer.answer=$('#answer').val();
        currentAnswer.answerId=currentQuestion.answerId;
        socket.emit('answer',(currentAnswer));
        $('#answer').val('');
        $('.incorrect-score').remove();
        $('.correct-score').remove();
        socket.emit('getQuestion');
    });


    updateAnswer(socket);
    updateQuestion(socket);
    updateScore(socket);
    updatePlayers(socket);
    beginRound(socket);
};



$(document).ready(main);
