function Location (latitude,longitude) {
	this.latitude = latitude;
	this.longitude = longitude;
}

function Arrow (startx, starty, endx, endy){
	this.startx = startx;
	this.starty = starty;
	this.endx = endx;
	this.endy = endy;
}

function Load (){
	var svgContainer = d3.select("#figure").append("svg")
	.attr("width", 1000)
	.attr("height", 700);
	//.attr("style", "display: block; margin: auto;");
	var arrayOfNode;
	$.ajax({
		url: 'lists.json', async: false, dataType: 'json', success: function (temp) {
			arrayOfNode = temp;
			if(arrayOfNode.length > 1){ alert(arrayOfNode.length+" routes need to provide");}
			else{ alert(arrayOfNode.length+" route need to provide");}
		}
	});
	var bbox;
	$.ajax({
		url: 'bbox.txt', async: false, dataType: 'json', success: function (temp) { bbox = temp;}
	});
	var long1 = bbox[1];
	var long2 = bbox[3];
	var delX = (long2 - long1)/800;
	var lat1 = bbox[2];
	var lat2 = bbox[0];
	var delY = (lat2 - lat1)/600;
	var routepoints = new Array();
	var total = [];
	for(j = 0; j < arrayOfNode.length; j++) {
		$.ajax({
			url: 'output'+j+'.txt', async: false, dataType: 'json', success: function (result) {	
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
					var lineData = [];
					
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
				}else {
					alert("Something wrong with the output"+j+".txt file");
				}			
				total.push(result);
			}
		});
	}

	$.ajax({
		url: 'nodes.txt', async: false, dataType: 'json', success: function (nodes) {
			var textData = [];
			var circleData = [];
			for(var k = 0; k < nodes.length; k++){
				latitude = nodes[k][1];
				longitude = nodes[k][2];
				y = (latitude - lat1)/delY + 50;
				x = (longitude - long1)/delX + 50;
				circleData.push({"cx": x, "cy": y, "radius": 9, "color" : "#6CB359"});
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
			.attr("fill", "#FFFF47")
			.attr("text-anchor","middle");
		}
	});
	$.ajax({
		url: 'point.txt', async: false; dataType: 'json', success: function (crucialpoints){
			
		}
	})
	//write a ajax function to get the point.txt content
}



