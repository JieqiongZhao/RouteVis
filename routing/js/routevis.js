//global variables
var mapWidth = 800;
var mapHeight = 800;
var svgMapContainer = d3.select("#mapDiv").append("svg")
						.attr("width", mapWidth)
						.attr("height", mapHeight);

//drawing function for routes						
var lineFunction = d3.svg.line()
                	.x(function(d) { return d.x; })
                  	.y(function(d) { return d.y; })
                  	//.interpolate("basis");
                  	.interpolate("linear")


/****************************************************************************
* function name : geoToPixelConverter
* input: type GeoCoords name geoPoint
* function descripton: this function convert the latitude, longitude to the 
* pixel value on our custimized mapDiv
* latitude is y axies, longitude is x axies
****************************************************************************/
var mapLonLeft = boundingBox[0].lon;
var mapLonRight = boundingBox[1].lon;
var mapLonDelta = mapLonRight - mapLonLeft;

var mapLatBottom = boundingBox[0].lat;
var mapLatBottomDegree = mapLatBottom*Math.PI/180;

function geoToPixelConverter(geoPoint) {
	// global variable mapWidth, mapHeight, mapLonDelta, mapLatBottom, mapLatBottomDegree
	var lat = geoPoint.lat;
	var lon = geoPoint.lon;
	var x = (lon - mapLonLeft)*(mapWidth/mapLonDelta);
	lat = lat*Math.PI/180;
	var worldMapWidth = ((mapWidth/mapLonDelta)*360)/(2*Math.PI);
	var mapOffsetY = (worldMapWidth/2*Math.log( (1+Math.sin(mapLatBottomDegree))/(1-Math.sin(mapLatBottomDegree)) ));
	var y = mapHeight - ( (worldMapWidth/2*Math.log( (1+Math.sin(lat))/(1-Math.sin(lat)) )) - mapOffsetY);
	var resultGeoCoords = new GeoCoords(y, x);
	return resultGeoCoords;
}

//convert all road points from geo coordinates to pixel coordinates

var pathData = []; //the pixel coordinates of road points on all routes

for (var i = 0; i < roadPoints.length; i++) {
	var oneRouteData = [];
	for (var j = 0; j < roadPoints[i].length; j++) {
		var tempGeoPoint = geoToPixelConverter(roadPoints[i][j]);
		oneRouteData.push(tempGeoPoint);
	};
	pathData.push(oneRouteData);
};

/****************MAIN (for all practical purposes)***************************
*
*
/***************************************************************************/
$(document).ready(function() {
	drawOriginalRoutes();
	drawStops();
	//drawCALRoutes();
	
	//testStackLayout();

	//drawHeapMap();
	//drawLostPointsCAL();

}); 

function drawOriginalRoutes() {
	colortable = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"];
	for (var i = 0; i < pathData.length; i++) {

		var lineData = [];
		for (var j = 0; j < pathData[i].length; j++) {
			lineData.push({"x": pathData[i][j].lon, "y": pathData[i][j].lat});
		};

		svgMapContainer.append("g")
		.append("path")
		.attr("id", function() {return "route"+i;})
		.attr("d", lineFunction(lineData))
		.attr("stroke", colortable[i])
		.attr("stroke-width", 5)
		.attr("fill", "none");
	};
}

function drawCALRoutes() {
	colortable = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"];

	for (var i = 0; i < roadPoints_CAL.length; i++) {
		var oneRouteData_CAL = [];
		for (var j = 0; j < roadPoints_CAL[i].length; j++) {
			var tempGeoPoint = geoToPixelConverter(roadPoints_CAL[i][j]);
			oneRouteData_CAL.push({"x": tempGeoPoint.lon, "y": tempGeoPoint.lat});
		};

		svgMapContainer.append("g")
		.append("path")
		.attr("id", function() {return "routeCAL"+i;})
		.attr("d", lineFunction(oneRouteData_CAL))
		.attr("stroke", colortable[i])
		.attr("stroke-width", 5)
		.attr("fill", "none");
	};
}

function drawLostPointsCAL() {
	svgMapContainer.append("g").selectAll(".lostpoint")
	.data(lostPoints_CAL)
	.enter().append("circle")
	.attr("class", "lostpoint")
	.attr("id", function(d, i) {return "lostpoint"+i;})
	.attr("cx", function (d, i) {
		var tempGeoPoint = geoToPixelConverter(lostPoints_CAL[i]);
		return tempGeoPoint.lon;
	})
	.attr("cy", function (d, i) {
		var tempGeoPoint = geoToPixelConverter(lostPoints_CAL[i]);
		return tempGeoPoint.lat;
	})
	.attr("r", 5)
	.attr("fill", "purple");
}

function drawStops() {
	var circleData = [];
	var textData= [];
	for (var i = 0; i < stopLocations.length; i++) {
		var tempGeoPoint = geoToPixelConverter(stopLocations[i]);
		circleData.push({"cx":tempGeoPoint.lon, "cy":tempGeoPoint.lat, "radius": 8, "color":"#e41a1c", "id": i});
		textData.push({"x":tempGeoPoint.lon, "y":tempGeoPoint.lat, "index": i});
	};
	//draw the stops based on their geo locations
	svgMapContainer.append("g").selectAll(".node")
		.data(circleData)
		.enter().append("circle")
		.attr("class", "node")
		.attr("id", function(d) {return "node"+d.id;})
		.attr("cx", function (d) {return d.cx;})
		.attr("cy", function (d) {return d.cy;})
		.attr("r", function (d) {return d.radius;});

	//draw the stops ID numbers on their geo locations
	svgMapContainer.append("g").selectAll(".nodeText")
		.data(textData)
		.enter().append("text")
		.attr("class", "nodeText")
		.attr("id", function(d) {return "nodeText"+d.index;})
		.attr("x", function(d) {return d.x;})
		.attr("y", function(d) {return d.y + 4;})
		.text( function (d) {return d.index;});

}

function drawHeapMap() {
	var colortable = ["rgba(254, 240, 217, 0.5)", "rgba(253, 212, 158, 0.5)", "rgba(254, 187, 132, 0.5)", 
	"rgba(252, 141, 89, 0.5)", "rgba(227, 74, 51, 0.5)", "rgba(179, 0, 0, 0.5)"];
	var worldMapWidth = ((mapWidth/mapLonDelta)*360)/(2*Math.PI);
	var rectWidth = worldMapWidth/kde_rowNum;
	svgMapContainer.append("g").selectAll(".heatmap")
		.data(kdeResult)
		.enter().append("rect")
		.attr("class", "heatmap")
		.attr("id", function(d, i){return "heatmap"+i;})
		.attr("x", function(d, i){
			var tempGeoPoint = geoToPixelConverter(kdeResult[i].pos);
			return tempGeoPoint.lon;
		})
		.attr("y", function(d, i){
			var tempGeoPoint = geoToPixelConverter(kdeResult[i].pos);
			return tempGeoPoint.lat;
		})
		.attr("fill", function(d, i){
			return colortable[kdeResult[i].color];
		})
		.attr("width", function(){return rectWidth;})
		.attr("height", function(){return rectWidth;});
}

function testStackLayout() {
	var layers = [
	  {
	    "name": "apples",
	    "values": [
	      { "x": 0, "y":  91},
	      { "x": 1, "y": 290}
	    ]
	  },
	  {  
	    "name": "oranges",
	    "values": [
	      { "x": 0, "y":  9},
	      { "x": 1, "y": 49}
	    ]
	  }
	];

	var n = 2, // number of layers
	    m = 200, // number of samples per layer
	    stack = d3.layout.stack().offset("wiggle"),
	    layers0 = stack(d3.range(n).map(function() { return bumpLayer(m); })),
	    layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); }));

	var width = 960,
	    height = 500;

	var x = d3.scale.linear()
	    .domain([0, m - 1])
	    .range([0, width]);

	var y = d3.scale.linear()
	    .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
	    .range([height, 0]);

	var color = d3.scale.linear()
	    .range(["#aad", "#556"]);

	var area = d3.svg.area()
	    .x(function(d) { return x(d.x); })
	    .y0(function(d) { return y(d.y0); })
	    .y1(function(d) { return y(d.y0 + d.y); });

	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	svg.selectAll("path")
	    .data(layers0)
	  .enter().append("path")
	    .attr("d", area)
	    .style("fill", function() { return color(Math.random()); });

	function transition() {
	  d3.selectAll("path")
	      .data(function() {
	        var d = layers1;
	        layers1 = layers0;
	        return layers0 = d;
	      })
	    .transition()
	      .duration(2500)
	      .attr("d", area);
	}

	// Inspired by Lee Byron's test data generator.
	function bumpLayer(n) {

	  function bump(a) {
	    var x = 1 / (.1 + Math.random()),
	        y = 2 * Math.random() - .5,
	        z = 10 / (.1 + Math.random());
	    for (var i = 0; i < n; i++) {
	      var w = (i / n - y) * z;
	      a[i] += x * Math.exp(-w * w);
	    }
	  }

	  var a = [], i;
	  for (i = 0; i < n; ++i) a[i] = 0;
	  for (i = 0; i < 5; ++i) bump(a);
	  return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
	}
}


