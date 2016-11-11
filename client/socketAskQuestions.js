
var main = function()
{
    $('#submit-question').on('click', function (e)
     {
         e.preventDefault();
         if($('#post-question').val()!=''&& ($('#post-answer').val()!='' ))
         {
            socket.emit('new question',{question: $('#post-question').val(), answer:$('#post-answer').val()});
            $('#post-question').val('');
            $('#post-answer').val('');
            //socket.emit('score');
        }
    });
}
$(document).ready(main);
