$(document).ready(function () {

    $('#search-slider').draggable({
        containment: '.search-area',
        axis: 'x',
        revert: 'invalid',
        drag: function(event, ui) {
            $('.search-area').css("color", "rgba(255,255,255, " +  ( $('.search-area').width() - $('#search-slider').position().left ) / $('.search-area').width() +")");
        },
        stop: function(event, ui) {
            $('.search-area').css("color", "rgba(255,255,255, " +  ( $('.search-area').width() - $('#search-slider').position().left ) / $('.search-area').width() +")");
        }
    });

    $( "#search-drop" ).droppable({
        accept: '#search-slider',
        drop: function(event, ui) {
            $( "#search-slider" ).draggable( "disable" ).animate({
                "right" : "0px",
                "left": $(".search-area").width() - $("#search-slider").width() }, 200);
            $('.search-area').css("color", "rgba(255,255,255, 0)");

            //PUT STUFF HERE FOR WHEN USER SUCCESSFULLY SEARCHES

        }
    });

    navigator.geolocation.getCurrentPosition(gpsPermissionGranted);
});

function gpsPermissionGranted(position) {
  $('#gpsApproval h1').html('<i class="fa fa-thumbs-o-up"></i>');
  $('#gpsApproval').animate({
    backgroundColor: '#27ae60'
  }, 100).delay(500).animate({
    opacity: 0
  }, 200, function(){
    $('#gpsApproval').css('zIndex', '-1')
  });
  console.log(position.coords.latitude + ', ' + position.coords.longitude);
  navigator.geolocation.watchPosition(printPosition);
}

function printPosition(position) {
  console.log(position.coords.latitude + ', ' + position.coords.longitude);
}
