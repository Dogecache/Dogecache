$(document).ready(function () {
    $('#search-slider').draggable({
        containment: '.search-area'
    });

    navigator.geolocation.getCurrentPosition(gpsPermissionGranted);
});

function gpsPermissionGranted(position) {
  $('#gpsApproval h1').html(':)');
  $('#gpsApproval').animate({
    backgroundColor: '#27ae60'
  }, 100).delay(400).animate({
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