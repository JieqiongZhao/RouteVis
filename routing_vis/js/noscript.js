var routeGeoInfo = [];
var routeGeoPoints = [];
var boundingBox = [];
var routeNum; 

function Location (latitude,longitude) {
	this.latitude=latitude;
	this.longitude=longitude;
}

function Arrow (startx, starty, endx, endy){
	this.startx=startx;
	this.starty=starty;
	this.endx=endx;
	this.endy=endy;
}

function Load (){
	var svgContainer = d3.select("#figure").append("svg")
	.attr("width", 1000)
	.attr("height", 700);
	//.attr("style", "display: block; margin: auto;");

	$.getJSON("lists.json", function(numofroutes){
		if(numofroutes.length > 1){
			alert(numofroutes.length+" routes need to provide");
		}else{
			alert(numofroutes.length+" route need to provide");
		}
		$.getJSON("bbox.txt", function(bbox) {
		var routepoints = new Array();
		for(j = 0; j < numofroutes.length; j++) {
			$.getJSON("output"+j+".txt", function(result) {
				routeGeoInfo.push(result);
				if (result &&
					result.resourceSets &&
					result.resourceSets.length > 0 &&
					result.resourceSets[0].resources &&
					result.resourceSets[0].resources.length > 0)
				{
					var routeline = result.resourceSets[0].resources[0].routePath.line;
					var pathIndices = result.resourceSets[0].resources[0].routePath.generalizations[0].pathIndices;

					for (var i = 0; i < routeline.coordinates.length; i++) {
						routepoints[i]=new Location(routeline.coordinates[i][0], routeline.coordinates[i][1]);
					}
					
					long1 = bbox[1];
					long2 = bbox[3];
					delX = (long2 - long1)/800;
					lat1 = bbox[2];
					lat2 = bbox[0];
					
					delY = (lat2 - lat1)/600;
					var lineData = [];
					var circleData = [];
					var textData = [];

					for(var i = 0; i < routepoints.length; i++){
						latitude = routepoints[i].latitude;
						longitude = routepoints[i].longitude;
						y = (latitude - lat1)/delY + 50;
						x = (longitude - long1)/delX + 50;
						lineData.push({ "x": x,  "y": y});
					}

					var lineFunction = d3.svg.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate("linear");

					var lineGraph = svgContainer.append("path")
					.attr("d", lineFunction(lineData))
					.attr("stroke", "blue")
					.attr("stroke-width", 2)
					.attr("fill", "none");



					lineData.length = 0;
					routepoints.length = 0;

					$.getJSON("nodes.txt", function(nodes) {
						for(var k = 0; k < nodes.length; k++){
							latitude = nodes[k][1];
							longitude = nodes[k][2];
							y = (latitude - lat1)/delY + 50;
							x = (longitude - long1)/delX + 50;
							circleData.push({"cx": x, "cy": y, "radius": 9, "color" : "green"});
							textData.push({"cx": x, "cy": y+2, "index": nodes[k][0]});
						}

						var circles = svgContainer.selectAll("circle")
						.data(circleData)
						.enter()
						.append("circle");

						var circleAttributes = circles
						.attr("cx", function (d) { return d.cx; })
						.attr("cy", function (d) { return d.cy; })
						.attr("r", function (d) { return d.radius; })
						.style("fill", function (d) { return d.color; });

						var text = svgContainer.selectAll("text")
						.data(textData)
						.enter()
						.append("text");

						var textLabels = text
						.attr("x", function(d) { return d.cx; })
						.attr("y", function(d) { return d.cy; })
						.text( function (d) { return d.index; })
						.attr("font-family", "sans-serif")
						.attr("font-size", "10px")
						.attr("fill", "red")
						.attr("text-anchor","middle");
					});
				}else {
					alert("Something wrong with the output"+j+".txt file");
				}			
			});
		}});
	});
}