/* googlemap */

var googleMap = (function() {
	
	/*
	* Vars that need used throughout the googleMap object
	*/
	var map,
		mapClick,
		homeMarkerClick,
		api = google.maps, 
		ui = $("#ui"),
		clicks = 0,
		positions = [];
		mapCenter = new api.LatLng(37.29435, -121.931167),
		mapOptions = {
			zoom: 13,
			center: mapCenter,
			mapTypeId: api.MapTypeId.ROADMAP,
			disableDefaultUI: true
		};
	
	/*
	* Function to add start and end details to the side
	*/
	var locationAdd = function(map, e) {
		var journeyEl = $('#journey'),
			outer = (journeyEl.length) ? journeyEl : $('<div>', {
				id: 'journey'
			});
		
		new api.Geocoder().geocode({
			'latLng': e.latLng
		}, function(results) {
			$('<h3 />', {
				text: (clicks === 0) ? 'Start' : 'End'
			}).appendTo(outer);
			$('<p />', {
				text: results[0].formatted_address,
				id: (clicks === 0) ? 'StartPoint' : 'EndPoint',
				'data-latLng': e.latLong
			}).appendTo(outer);
			
			if (!journeyEl.length) {
				outer.appendTo(ui);
			} else {
				$('<button />', {
					id: 'getQuite',
					text: 'Get quote'
				}).prop('disabled', true).appendTo(journeyEl);
			}
			
			clicks++;
		});
	};
	
	/*
	* Function to be executed every time the map is clicked.
	*/
	var addMarker = function(e) {
		
		if (clicks <= 1) {
			
			positions.push(e.latLng);
			
			var marker = new api.Marker({
				map: map,
				position: e.latLng,
				flat: (clicks === 0) ? true : false,
				animation: api.Animation.DROP,
				icon: (clicks === 0) ? 'img/start.png' : '',
				title: (clicks === 0) ? 'Start' : 'End',
				draggable: true,
				id: (clicks === 0) ? 'Start' : 'End'
			});
			
			locationAdd(map, e);
			
		} else {	
			api.event.removeListener(mapClick);
			return false;	
		}
		
	}

	return {
		init: function() {
			/*
			* Setup the map, create a hq/home marker, create an infoWindow
			*/
			map = new api.Map(document.getElementById('map'), mapOptions)
				
			var homeMarker = new api.Marker({
				position: mapCenter,
				map: map,
				icon: 'img/hq.png'
			});
			
			var infoWindow = new api.InfoWindow({
				content: document.getElementById('hqInfo')
			});
			
			/*
			* Add listeners
			*/
			homeMarkerClick = api.event.addListener(homeMarker, 'click', function() {
				infoWindow.open(map, homeMarker);
			});
			mapClick = api.event.addListener(map, 'click', addMarker);
			
		}
	}
}());