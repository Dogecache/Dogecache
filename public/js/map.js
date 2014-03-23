(function () {
    var map;

    $(document).ready(function () {
        $('#search-slider').draggable({
            containment: '.search-area',
            axis: 'x',
            revert: 'invalid',
            drag: function (event, ui) {
                $('.search-area').css("color", "rgba(255,255,255, " + ( $('.search-area').width() - $('#search-slider').position().left ) / $('.search-area').width() + ")");
            },
            stop: function (event, ui) {
                $('.search-area').css("color", "rgba(255,255,255, " + ( $('.search-area').width() - $('#search-slider').position().left ) / $('.search-area').width() + ")");
            }
        });

        $("#search-drop").droppable({
            accept: '#search-slider',
            drop: function (event, ui) {
                $("#search-slider").draggable("disable").animate({
                    "right": "0px",
                    "left": $(".search-area").width() - $("#search-slider").width() }, 200);
                $('.search-area').css("color", "rgba(255,255,255, 0)");

                //PUT STUFF HERE FOR WHEN USER SUCCESSFULLY SEARCHES

            }
        });

        map = new Map('map');
        navigator.geolocation.getCurrentPosition(gpsPermissionGranted);

        $("#wager-slider").bind("change", function(e) {
            var value = e.target.value;
            map._updateRadius(value);
        });
    });

    function gpsPermissionGranted(position) {
        $('#gpsApproval h1').html('<i class="fa fa-thumbs-o-up"></i>');
        $('#gpsApproval').animate({
            backgroundColor: '#27ae60'
        }, 100).delay(500).animate({
            opacity: 0
        }, 200, function () {
            $('#gpsApproval').css('zIndex', '-1')
        });
        console.log(position.coords.latitude + ', ' + position.coords.longitude);

        map.init(position);
    }

    var Map = function (id) {
        console.log('Map created');
        this.id = id;
        var that = this;
        this.$container = $("#" + id);
    };
    Map.prototype.init = function (position) {
        var that = this;
        console.log('Map initialized');
        this.center = position;
        var mapOptions = {
            // hide control elements
            disableDefaultUI: true,

            // prevent manual zoom
            zoomControl: false,
            scaleControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true,

            // starting position
            center: that._positionToLatLng(position),
            zoom: 1
        };
        this.gmap = new google.maps.Map(this.$container.find('.map_gmap').get()[0], mapOptions);
        this._updateRadius(10);
        navigator.geolocation.watchPosition(function(position) {
            that._updateCenter(position);
            that._updateRadius(that.radius);
        }, null, {
            enableHighAccuracy: true
        });

    };
    Map.prototype._updateCenter = function(center, animate) {
        this.center = center;
        if (!animate) {
            this.gmap.setCenter(this._positionToLatLng(center));
        } else {
            this.gmap.panTo(this._positionToLatLng(center));
        }
    };
    Map.prototype._updateRadius = function(radius) {
        this.radius = radius;

        // angle: http://www.movable-type.co.uk/scripts/latlong.html
        // "Destination point given distance and bearing from start point"
        var lat1 = this.center.coords.latitude;
        var lon1 = this.center.coords.latitude;
        var brng = Math.PI/2;
        var d = radius/1000;
        var R = 6371; // km
        var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) +
            Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
        var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
                Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

        // Figure out what zoom level should be used
        // https://stackoverflow.com/questions/6048975/google-maps-v3-how-to-calculate-the-zoom-level-for-a-given-bounds
        var GLOBE_WIDTH = 256; // a constant in Google's map projection
        var angle = 2*(lon1-lon2);
        if (angle < 0) {
            angle += 360;
        }
        var pixelWidth = this.$container.width();
        var zoom = Math.floor(Math.log(pixelWidth * 360 / angle / GLOBE_WIDTH) / Math.LN2);

        console.log(zoom);
        this.gmap.setZoom(zoom-10);
    };
    Map.prototype._onResize = function() {
        // immediately recenter the map
        this._updateCenter(this.center, false);
        this._updateRadius(this.radius);
    };
    Map.prototype._positionToLatLng = function(position) {
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
    };
})();