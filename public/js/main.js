$(document).ready(function(){
  /*$('.card').css('opacity', 0).css('top', $(window).height());
  var del=0;
  $('.card').each(function(){
    $(this).delay(del).animate({
      opacity: 1,
      top: 0
    }, 500)
    del += 200;
  }, function(){
    del=0;
  })

  $('.logo').css('opacity', 0).css('margin-top', $(window).height());
  $('.splash-page h1').css('opacity', 0).css('margin-top', $(window).height());
  $('.home-button-wrapper').css('opacity', 0)
  $('.logo').animate({
      opacity: 1,
      'margin-top': 0
    }, 1000);

  $('.splash-page h1').delay(700).animate({
      opacity: 1,
      'margin-top': 10
    }, 1000);
  $('.home-button-wrapper').delay(1500).animate({
      opacity: 1,
    }, 1000);*/

});

function notify(title, body) {
  $('.notification .pane h1').html(title);
  $('.notification .content').html(body);
  $('.notification .pane').css('top', -1*$(window).height())
  $('.notification').css('zIndex',1000)
  .animate({
    opacity: 1
  }, 300)
  .on('click', function(){closeNotify()});
  $('.notification .pane').animate({
    top: 0
  }, 300)
  .on('click', function(e){e.stopPropagation();});

}

function closeNotify() {
  $('.notification .pane').unbind();
  $('.notification .pane').animate({
    top: -1*$(window).height()
  }, 300);
  $('.notification').animate({
    opacity: 0
  }, 300, function() {
    $('.notification').css('zIndex',-1);
    $('.notification .pane h1').html('');
    $('.notification .content').html('');
  }).unbind();
}