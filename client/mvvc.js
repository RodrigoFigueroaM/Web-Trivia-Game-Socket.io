/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
var eventsModel={
                clickNext:function ()
                    {
                        'use strict';
                        socket.emit('new round',{state: true});
                        socket.emit('getQuestion');
                    },
                clickSubmit:function ()
                    {
                        'use strict';
                        var currentAnswer={};
                        currentAnswer.answer=$('#answer').val();
                        currentAnswer.answerId=currentQuestion.answerId;
                        socket.emit('answer',(currentAnswer));
                        $('#answer').val('');
                        socket.emit('getQuestion');
                    }
                };


var questionModel = {
                question :ko.observable(),
                update: function(element)
                    {
                        'use strict';
                        $(element).hide();
                        $(element).fadeIn(1200,function(){});
                    },

                };

var scoreModel = {
                right :ko.observable(0),
                wrong :ko.observable(0),
                update: function(elementOne, elementTwo)
                    {
                        'use strict';
                        $(elementOne).transition('jiggle');
                        $(elementTwo).transition('jiggle');
                    }
                };

var usersModel = {
                user: ko.observableArray(),
                };

var answererModel = {
                name: ko.observable(),
                checkAnswer: ko.observable(),
                };

var newRoundModel={
                name: ko.observable()
                };

var masterVM = {
                events:eventsModel,
                question :questionModel,
                score : scoreModel,
                usersOnline: usersModel,
                newRound:newRoundModel,
                answerer:answererModel
                };
/*bindng multiple models seen in
    http://www.knockmeout.net/2012/05/quick-tip-skip-binding.html*/
ko.applyBindings(masterVM);
