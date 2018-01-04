$(() => {
	function getDataForMap(data, name) {
		const mapDataArray = [];
		mapDataArray.push(['State', 'Average Cost of Procedure']);
		$.each(data, (key, value) => {
			// console.log("data :", data, "key: ", key, "value: ", value)
			let state = value.state;
			let cost = parseInt(value.averageCost);
			mapDataArray.push([state, cost]);
			// console.log(mapDataArray);
		});
		// console.log('map data array', mapDataArray, typeof (mapDataArray));
		createRegionMap();
		drawRegionsMap(mapDataArray, name);
	}

	function getRankedStateList(procId, name) {
		$.get(`/api/avg/${procId}`).then((data) => {
			const list = "<ol>{{#each data}}<li><a href ='#stateAnchor' class='state-select' data-state='{{this.state}}' data-id='{{this.procId}}'>{{this.state}}</a></li>{{/each}}</ol>";
			getDataForMap(data, name);
			const compiledTemplate = Handlebars.compile(list);
			const html = compiledTemplate({
				data,
			});
			$('#list-div').empty().append(html);
		});
	}


	function getDataForState(data, name) {
		const stateDataArray = [];
		// stateDataArray.push(["Latitude", "Longitude", {role:'tooltip', label:"Procedure Cost"}, {type:'string', role:'tooltip'}]);
		const regionTemp = data[0].Provider.region;
		const region = `US-${regionTemp.slice(0, 2)}`;
		$.each(data, (key, value) => {
			const lat = parseFloat(value.Provider.latitude);
			const lon = parseFloat(value.Provider.longitude);
			stateDataArray.push([lat, lon, value.Provider.providerName, parseInt(value.hospitalCharges), `$${value.hospitalCharges}`]);
		});
		createStateMap();
		drawMarkersMap(stateDataArray, name, region);
	}

	function getStateCostData(state, procId) {
		$.get(`/api/cost/${ state }/${ procId}`).then((data) => {
			getDataForState(data, name);
		});
	}

	$('.proc-btn').on('click', function () {
		$('#title-for-map').children('h1:first').remove();
		$('#procedure-lead').text('');
		$('state-ranking-title').text('');
		const procId = $(this).data('id');
		const name = $(this).data('name');
		const procDesc = $(this).data('desc');
		getRankedStateList(procId, name);
		$('#title-for-map').append(`<h1>${name}<small> Procedure Cost by State</small></h1>`);
		$('#procedure-lead').text(procDesc);
		$('#state-ranking-title').text('State Ranking');
	});


	$(document).on('click', '.state-select', function () {
		$('#title-for-state').children('h1:first').remove();
		const stateCap = $(this).data('state');
		const state = $(this).data('state').toLowerCase();
		const procId = $(this).data('id');
		$('#title-for-state').append(`<h1>${stateCap}<small> Procedure Cost by Hospital</small></h1>`);
		getStateCostData(state, procId);
	});


	$('.proc-btn').mouseover(function () {
		const id = $(this).data('id');
		const name = $(this).data('name');
		$.get(`/api/mm/${id}`).then((data) => {
			addData(name, data[0].state, data[0].min, data[1].state, data[1].max);
		});
	});

	// disable page scrolling while mouse is in the list-div. prevents page from moving
	$(document).on('mousewheel DOMMouseScroll', '#list-div', function (e) {
		let e0 = e.originalEvent,
			delta = e0.wheelDelta || -e0.detail;

		this.scrollTop += (delta < 0 ? 1 : -1) * 30;
		e.preventDefault();
	});
});