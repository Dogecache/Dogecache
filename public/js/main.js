$(document).ready(function(){
    /*
    Home page stuff
     */

     $('.home-button.login-button').click(function() {
        notify(
          "Sign in using:", '<div class="home-button-wrapper"><a type="button" class="home-button facebook-login-button" href="/auth/login/facebook"><i class="fa fa-facebook"></i>Facebook</a><a type="button" class="home-button twitter-login-button" href="/auth/login/twitter"><i class="fa fa-twitter"></i>Twitter</a><a type="button" class="home-button google-login-button" href="/auth/login/google"><i class="fa fa-google-plus"></i>Google</a></div>'
        );
     });

    $('.facebook-login-button,.twitter-login-button,.google-login-button').one("click", function() {
        $(this).click(function () { return false; });
    });


    //TODO clean up selectors
    var del=0;
    $('.card').each(function(){
        $(this).css('-webkit-transition-delay', del/1000 + 's').addClass('card-shown');
        del += 200;
    }, function(){
        del=0;
    });

    $('#menu-btn').click(function(){
      $('#menu-panel, #menu-btn').toggleClass('open');
    });

    $(document).click(function(e){
      if( $(e.target).attr('id')!='menu-btn' && $(e.target).parents('#menu-panel').length==0 ) {
        $('#menu-panel, #menu-btn').removeClass('open');
      }
    });

  if (! (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ) {
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
      }, 1000);
  }
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
  $('.notification .pane')
    .unbind()
    .animate({
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