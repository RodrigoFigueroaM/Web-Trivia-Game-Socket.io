//requirements
var express = require('express'),
    body = require('body-parser'),
    redis = require('redis').createClient(),
    mongo= require('mongodb').MongoClient,
    test = require('assert');
    app = express(),
    server= require ('http').createServer(app).listen(3000);
    url='mongodb://localhost/questionnaire',
    io = require('socket.io').listen(server);

//global variables
var questionnaire;
var answerId=0; //used so taht each question get a different Id
var players=[];
var connections =[];


app.use(express.static(__dirname+'/client'));

/******************************************************
     takes db and empties it outuppon complition displays
     Collection removed.
*******************************************************/
function cleanColection(questionnaire, callback)
{
  	'use strict';
    questionnaire.remove({},function (err, db)
    {
     if(err)
     {
         console.log('Couldn\'t remove collection');
     }
     else
      {
         console.log('Collection removed ');
     }

         questionnaire.count({},function(err, elements)
         {
             if(err)
             {
                 throw err;
             }
              callback(questionnaire);
          });

    });
}

/*****************************************************
 takes current db and loads some pregenerated
    questions
******************************************************/
function defaultQuestions(questionnaire)
{
  	'use strict';
    questionnaire.insert({question:'Who was the first computer programmer?', answer:'Ada Lovelace', answerId:++answerId});
    questionnaire.insert({question:'Who launched GNU?', answer:'Richard Stallman', answerId:++answerId});
    questionnaire.insert({question:'Who founded apple?', answer:'Steve Jobs', answerId:++answerId});
    questionnaire.insert({question:'Who founded Microsoft?', answer:'Bill Gates', answerId:++answerId});
}

/*****************************************************
  start database
******************************************************/
mongo.connect(url, function(err,db)
 {
   		'use strict';
        if(err)
        {
            throw err;
        }
       questionnaire = db.collection('questionnaire');

        cleanColection(questionnaire, defaultQuestions);
        redis.set('right', 0);
        redis.set('wrong',0);

 });

 /*****************************************************
    home route
 ******************************************************/
app.get('/',function(req,res)
    {
      	 'use strict';
          res.send(index.html);
    });

/*****************************************************
   Establish conections
******************************************************/
io.sockets.on('connection',function(socket)
    {
        var incomingdata;
        connections.push(socket);
        console.log('Number of conections: %s', connections.length);
        /*****************************************************
           Store name of every  user that is playing

           returns an array with all the usernames
        ******************************************************/
        socket.on('new user',function(data)
        {
            socket.username= data;
            players.push(socket.username);
            console.dir(socket.username );
            io.sockets.emit('get users', players );
        });

        /*****************************************************
           pick a random question from our database and send
           it for the game

           returns the question piicked at random
        ******************************************************/
        socket.on('getQuestion',function()
        {
            var sendThisQuestion={}; //question to send
            var random;     //randomizes the question for user side

            'use strict';
            random = Math.floor((Math.random() * answerId) + 1);
            questionnaire.findOne({answerId:random},function (err, askQuestion)
            {
                if(err)
                {
                    io.sockets.emit('newQuestion', err);
                }
                else
                 {
                     sendThisQuestion.question = askQuestion.question;
                     sendThisQuestion.answerId = askQuestion.answerId;
                     io.sockets.emit('newQuestion',sendThisQuestion);
                 }
            });
        });

        /*****************************************************
           check when a new round has started
           returns the username of who ever started the round
        ******************************************************/
        socket.on('new round', function (data)
        {
            io.sockets.emit('begin round', {newRound: data.state, starter: socket.username.username});
        })

        /*****************************************************
           check if the answer is right or wrong
           returns true or false accordingly
        ******************************************************/
        socket.on('answer',function (data)
         {
             var checkAnswer={}; // check client Answer will contain answer and id
             checkAnswer.answerer = socket.username.username;
             questionnaire.findOne({answerId:data.answerId},function (err, ans)
                 {
                     if(err)
                     {
                         checkAnswer.correct='DB error';
                         io.sockets.emit('checkAnswer',checkAnswer);
                     }
                      else
                      {
                          if(data.answer===ans.answer)
                          {
                              checkAnswer.correct='true';
                              redis.incr('right',function (err)
                               {
                                   if (err)
                                   {
                                       throw err;
                                   }
                                    io.sockets.emit('checkAnswer',checkAnswer);
                              });
                           }
                           else
                           {
                               checkAnswer.correct='false';
                               redis.incr('wrong',function (err)
                                {
                                    if (err)
                                    {
                                        throw err;
                                    }
                                     io.sockets.emit('checkAnswer',checkAnswer);
                               });
                           }
                        }
                   });
        });

        /*****************************************************
           increment the score according to the answer provided
           returns values on the score
        ******************************************************/
        socket.on('score',function()
        {
            var score={};   // current score for player
            //change to mget
            redis.mget(['right','wrong'],function(err,value)
                {
                    score.right=value[0];
                    score.wrong=value[1];
                    io.sockets.emit('updateScore',score);
                });
        });
        /*****************************************************
           insert a new question to our database
        ******************************************************/
        socket.on("new question",function (data)
         {
             var newQuestion={};

             newQuestion.question = data.question;
             newQuestion.ansnwer = data.answer;
             newQuestion.answerId= ++answerId;
             questionnaire.insert(newQuestion);
        });

        /*****************************************************
           check when a player disconects from game.
           Remove the players connection and username
        ******************************************************/
        socket.on('disconnect', function (data)
        {
            players.splice(players.indexOf(socket.username),1);
            console.log('%s disconnected',socket.username );
            io.sockets.emit('get users',players);
            connections.splice(connections.indexOf(socket),1);
            console.log('Number of conections: %s', connections.length);
        });
    });

console.log('server listening on  3000');
