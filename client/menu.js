
$('#ask').on('click', function (e)
 {
     e.preventDefault();
     $('#trivia-game').fadeOut(function () {
         $('#trivia-questions').show();
         $('#trivia-game').off('clicks');
     });


});

//play button for menu
$('#play').on('click', function (e)
 {
      e.preventDefault();
      $('#trivia-questions').fadeOut(function()
  {
      $('#trivia-game').show();
      $('#trivia-questions').off('clicks');
  });

});
