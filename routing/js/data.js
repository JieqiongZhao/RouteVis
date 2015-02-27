/**************************** objects ************************************/
function GeoCoords(lat, lon) {
	this.lat = lat;
	this.lon = lon;
}
/****************************read data and parse************************************/

var bingMapRouteInfo = [];		//the query results from bing map
var roadPoints = [];			//the original geo coordinates road points in routes
var tlSamplePoints = [];		//the sample points by bing map api given tolerance
var boundingBox = [];			//input from user for geographial area on US map
var interSectPoints = [];		//intersection points between routes
var routeNum;					//number of routes
var stops = [];					//stops on routes
var stopLocations = [];         //geo locations of stops
var kdeResult = [];         	//linear kde results of current 
var kde_rowNum, kde_colNum;
var roadPoints_CAL = [];        //the calibrated geo coordinates of all routes
var lostPoints_CAL = [];		//the lost geo coordinates after calibration

//read bounding box
$.ajax({
	url: "data/bbox.json",
	async: false,
	dataType: 'json',
	success: function(data) {
		var geoPoint0 = new GeoCoords(data[0], data[1]);
		var geoPoint1 = new GeoCoords(data[2], data[3]);
		boundingBox.push(geoPoint0);
		boundingBox.push(geoPoint1);
	}
});
//get stops on routes
$.ajax({
	url: "data/lists.json",
	async: false,
	dataType: 'json',
	success: function(data) {
		routeNum = data.length;
		stops = data;
	}
});
//get the nodes geo coordinates
$.ajax({
	url: "data/nodes.json",
	async: false,
	dataType: 'json',
	success: function(data) {
		for (var i = 0; i < data.length; i++) {
			var tmpGeoPoint = new GeoCoords(data[i][1], data[i][2]);
			stopLocations.push(tmpGeoPoint); 
		};
	}
});
//read all information about routes and get the geo coordinates
for (var i = 0; i < routeNum; i++) {
	var oneRoutePoints = [];
	tempUrl = "data/route" + i + ".json"; 
	$.ajax({
		url: tempUrl,
		async: false,
		dataType: 'json',
		success: function(data) {
			bingMapRouteInfo.push(data);
			var routeline = data.resourceSets[0].resources[0].routePath.line;
			
			var pathIndices = data.resourceSets[0].resources[0].routePath.generalizations[0].pathIndices;
			
			for (var i = 0; i < routeline.coordinates.length; i++) {
				var tempRoutePoint = new GeoCoords(routeline.coordinates[i][0], routeline.coordinates[i][1]);
				oneRoutePoints.push(tempRoutePoint);
			}
		}
	});
	roadPoints.push(oneRoutePoints);
};

//read the kde information about the routes
$.ajax({
	url: "data/kde_result_1.json",
	async: false,
	dataType: 'json',
	success: function(data) {
		//get the new bounding box based on the calucated results based on the bounding box of all roadpoints
		boundingBox = [];
		var geoPoint0 = new GeoCoords(data.bbox[1], data.bbox[0]);
		var geoPoint1 = new GeoCoords(data.bbox[3], data.bbox[2]);
		boundingBox.push(geoPoint0);
		boundingBox.push(geoPoint1);
		kde_rowNum = data.dim[0];
		kde_colNum = data.dim[1];
		// kde_rowNum = 2048;
		// kde_colNum = 2048;
		var rowStep = Math.abs(geoPoint1.lon - geoPoint0.lon)/kde_rowNum; //lon related to x axie
		var colStep = Math.abs(geoPoint1.lat - geoPoint0.lat)/kde_colNum; //lat realted to y axie
		for (var i = 0; i < data.density.length; i++) {
			var tmplon = data.density[i][0]*rowStep + geoPoint0.lon;
			var tmplat = data.density[i][1]*colStep + geoPoint0.lat;
			var tempGeoPoint = new GeoCoords(tmplat, tmplon);
			var tempRest = {pos: tempGeoPoint, color: data.density[i][2]};
			kdeResult.push(tempRest);
		};
	}
});

//read the calibrated geo coordinates data
$.ajax({
	url: "data/calibrated_geo.json",
	async: false,
	dataType: 'json',
	success: function(data) {
		for (var i = 0; i < data.length; i++) {
			var oneRoutePoints_CAL = [];
			for (var j = 0; j < data[i].length; j++) {
				var tmpLon = parseFloat(data[i][j][0]);
				var tmpLat = parseFloat(data[i][j][1]);

				var tempRoutePoint_CAL = new GeoCoords(tmpLat, tmpLon);
				oneRoutePoints_CAL.push(tempRoutePoint_CAL);
			};
			roadPoints_CAL.push(oneRoutePoints_CAL);
		};
		
	}
});

//read the lost geo coordinates after calibration of KDE
$.ajax({
	url: "data/lost_geo.json",
	async: false,
	dataType: 'json',
	success: function(data) {
		for (var i = 0; i < data.length; i++) {
			var tmpLon = parseFloat(data[i][0]);
			var tmpLat = parseFloat(data[i][1]);
			var tmpRoutePoint = new GeoCoords(tmpLat, tmpLon);

			lostPoints_CAL.push(tmpRoutePoint);
		};
	}
});

