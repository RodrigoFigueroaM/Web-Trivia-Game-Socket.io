var currentQuestion={};
var socket = io.connect('http://localhost:3000');

var main = function()
{
    $('#login').on('click', function (e)
     {
         e.preventDefault();
         if($('#username').val()!='')
         {
            $('#trivia-login').fadeOut();
            $('#trivia-menu').show();
            $('#trivia-game').show();
            $('#trivia-login').off('clicks');
            socket.emit('new user',{username: $('#username').val()});
            socket.emit('score', {correct:false});
            socket.emit('new round',{state: false});
          }
    });


    $('#next').on('click',function(e)
    {
        e.preventDefault();
        socket.emit('new round',{state: true});
        socket.emit('getQuestion');
    });


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


/*****************************************************
    Updates score HTML field
    takes as a parameter a JSON object
******************************************************/
var updateScore = function (socket, data)
{
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

var updateQuestion = function(socket)
{
    socket.on('newQuestion',function (data)
    {
        currentQuestion=data;
        $('#question .questionAsked').remove();
        $('#question').append('<span class= "questionAsked">'+data.question+'</span>');
        $(".questionAsked").hide();
        $(".questionAsked").fadeIn(1200,function(){});


    });
};

function updatePlayers(socket)
{
    socket.on('get users',function(data)
    {
        var i=0;
        for (i; i < data.length;i++)
        {
            $('#myUsers').remove();
        }
        data.forEach(function(data)
        {
            $('#users').append('<div class="item" id="myUsers"><div class="content"><div class="header">'+data.username+'</div> </div></div>')
        });
    });
};

function beginRound (socket)
{
    socket.on('begin round', function(data)
    {
            if(data.newRound===true)
            {
                $('#next').prop( 'disabled', true );
                $('#submit-answer').prop('disabled', false);
                $('.ui form .starter').remove();
                $('.ui form').append('<span><h3 class= "starter">'+data.starter+'</h3> started a new round</span>');
                $('.starter').hide();
                $(".starter").fadeIn(1000,function(){});
            }
            else
            {
                $('#next').prop( 'disabled', false);
                $('#submit-answer').prop('disabled', true);
                $('.ui form .starter').remove();
            }
    });
}

function updateAnswer (socket)
{
    socket.on('checkAnswer', function(data)
    {
        $('#answerer').remove();
        $('#provider').append('<h3 class= "ui text" id="answerer" > '+ data.answerer+' answered </h3>')
        if(data.correct==="true")
            $('#answerer').append('<p class="correct answer">correct</p>');
        else
            $('#answerer').append('<p class="incorrect answer">incorrect</p>');

        socket.emit('score');
    });
}


$(document).ready(main);
