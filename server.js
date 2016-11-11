/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */

//requirements
var express = require('express'),
//    http = require('http'),
    body = require('body-parser'),
    redis = require('redis').createClient(),
    mongo= require('mongodb').MongoClient,
    test = require('assert');
    app = express(),
    server= require ('http').createServer(app).listen(3000);
    url='mongodb://localhost/questionnaire',
    io = require('socket.io').listen(server);

//global variable
var questionnaire;
var answerId=0; //used so taht each question get a different Id
var players=[];
var connections =[];


//app.use(body.urlencoded({extended:false}));
//app.use(body.json());
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

io.sockets.on('connection',function(socket)
    {
        var incomingdata;
        connections.push(socket);
        console.log('Number of conections: %s', connections.length);

        socket.on('new user',function(data)
        {
            socket.username= data;
            players.push(socket.username);
            console.dir(socket.username );
            io.sockets.emit('get users', players );
        });

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

        socket.on('new round', function (data)
        {
            io.sockets.emit('begin round', {newRound: data.state, starter: socket.username.username});
        })

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

        socket.on("new question",function (data)
         {
             var newQuestion={};

             newQuestion.question = data.question;
             newQuestion.ansnwer = data.answer;
             newQuestion.answerId= ++answerId;
             questionnaire.insert(newQuestion);


        });

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


/*
    server
        should take care of number of questions provided by round
        block and unblock buttons
    client
        animation when a new answer is provided
        when going to ask task. use efect for showing maybe prive a modal form
        send name when sent remove that from list
*/
