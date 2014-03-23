function notify(title, body) {
  $('.notification .pane h1').html(title);
  $('.notification .content').html(body);
  $('.notification .pane').css('top', -1*$(window).height())
  $('.notification').css('zIndex',1000)
  .animate({
    opacity: 1
  }, 300);
  $('.notification .pane').animate({
    top: 0
  }, 300);
}

function closeNotify() {
  $('.notification .pane').animate({
    top: -1*$(window).height()
  }, 300);
  $('.notification').animate({
    opacity: 0
  }, 300, function() {
    $('.notification').css('zIndex',-1);
    $('.notification .pane h1').html('');
    $('.notification .content').html('');
  });
}