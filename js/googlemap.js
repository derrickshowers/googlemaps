/*
* googleMap opject contains settings and methods to create a new map. Returns the
* init() function, which is called to setup the map.
*
* Google documentation: https://developers.google.com/maps/documentation/javascript/tutorial
*/

var googleMap = (function() {
	
	/*
	* Vars that need used throughout the googleMap object
	*/
	var map,
		mapClick,
		homeMarkerClick,
		api = google.maps, 
		ui = $('#ui'),
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
			location: e.latLng
		}, function(results) {
			$('<h3 />', {
				text: (clicks === 0) ? 'Start' : 'End'
			}).appendTo(outer);
			$('<p />', {
				text: results[0].formatted_address,
				id: (clicks === 0) ? 'StartPoint' : 'EndPoint',
				'data-latLng': e.latLng
			}).appendTo(outer);
			
			if (!journeyEl.length) {
				outer.appendTo($('#uiContent'));
			} else {
				$('<button />', {
					id: 'getQuote',
					text: 'Get quote'
				}).prop('disabled', true).appendTo(journeyEl);
			}
			
			clicks++;
			checkBrowserHeight();
			
		});
	};
	/*
	* Method to be change address when marker is dragged
	*/
	var markerDrag = function(e) {
		var elId = ['#', this.get('id'), 'Point'].join('');
		
		new api.Geocoder().geocode({
			location: e.latLng
		}, function(results) {
			$(elId).text(results[0].formatted_address);
		});
	}
	
	/*
	* Method to be executed every time the map is clicked.
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
			
			api.event.addListener(marker, "dragend", markerDrag);

			locationAdd(map, e);
			
		} else {	
			api.event.removeListener(mapClick);
			return false;	
		}
		
	}
	
	/*
	* Method to display the cost
	*/
	var displayCost = function(response) {
		var list = $('<dl />', {
				'class': 'clearfix',
				id: 'quote'
			}),
			format = function(number) {
				var rounded = Math.round(number * 100) / 100;
				var fixed = rounded.toFixed(2);
				return fixed;
			},
			term = $('<dt />'),
			desc = $('<dd />'),
			distance = response.rows[0].elements[0].distance,
			weight = $('#weight').val(),
			distanceString = distance.text + 'les',
			distanceNum = parseFloat(distance.text.split(' ')[0]),
			distanceCost = format(distanceNum * 3),
			weightCost = format(distanceNum * 0.25 * distanceNum),
			totalCost = format(+distanceCost + +weightCost);
		
		$('<h3 />', {
			text: 'Your quote',
			id: 'quoteHeading'
		}).appendTo('#uiContent');
		
		term.clone().html('Distance: ').appendTo(list);
		desc.clone().html(distanceString).appendTo(list);
		term.clone().text('Distance Cost: ').appendTo(list);
		desc.clone().text('$' + distanceCost).appendTo(list);
		term.clone().text('Weight cost: ').appendTo(list);
		desc.clone().text('$' + weightCost).appendTo(list);
		term.clone().addClass('total').text('Total: ').appendTo(list);
		desc.clone().addClass('total').text('$' + totalCost).appendTo(list);
		list.appendTo('#uiContent');
	}
	
	/*
	* Itty bitty function to check browser height so content doesn't fall
	* off the bottom.
	*/
	var checkBrowserHeight = function() {
		var winHeight = $(window).height();
		var uiContentHeight = $('#uiContent').height() + 50;
		if (winHeight < uiContentHeight) {
			$('#browserHeightIndicator').fadeIn();
		} else {
			$('#browserHeightIndicator').fadeOut();
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
			
			// Show indicator if browser height is too small
			checkBrowserHeight();
			$(window).resize(checkBrowserHeight);
			
			/*
			* Add listeners
			*/
			homeMarkerClick = api.event.addListener(homeMarker, 'click', function() {
				infoWindow.open(map, homeMarker);
			});
			
			mapClick = api.event.addListener(map, 'click', addMarker);
			
			$('#weight').on('keyup', function() {
			
				if (timeout) {
					clearTimeout(timeout);
				}
				
				var field = $(this),
					enableButton = function() {
						if (field.val()) {
							$('#getQuote').removeProp('disabled');
						} else {
							$('#getQuote').prop('disabled', true);
						}
					},
					timeout = setTimeout(enableButton, 250);
			});
			
			$('body').on('click', '#getQuote', function(e) {
				e.preventDefault();
				$(this).remove();
				
				new api.DistanceMatrixService().getDistanceMatrix({
					origins: [$('#StartPoint').attr('data-latLng')],
					destinations: [$('#EndPoint').attr('data-latLng')],
					travelMode: api.TravelMode.DRIVING,
					unitSystem: api.UnitSystem.METRIC
				}, displayCost);
			});
			
		}
	}
}());