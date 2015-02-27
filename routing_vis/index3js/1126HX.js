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
			else{ alert("Exactly "+ arrayOfNode.length +" route need to provide");}
		}
	});

	var bbox;

	$.ajax({
		url: 'bbox.txt', async: false, dataType: 'json', success: function (temp) { bbox = temp;}
	});

	$.ajax({
		url: 'point.txt', async: false, dataType: 'json', success: function (temppoints) {tmpoint = temppoints;}
	});

	var long1 = bbox[1];
	var long2 = bbox[3];
	var delX = (long2 - long1)/800;
	var lat1 = bbox[2];
	var lat2 = bbox[0];
	var delY = (lat2 - lat1)/600;
	var routepoints = new Array();
	var total = []; //all the data in total
	colortable = ["#FFFF00","#00FF00","#FF00FF","#00FFFF","#FF0000"];
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

					/*var lineFunction = d3.svg.line()
					.x(function(d) { return d.x; })
					.y(function(d) { return d.y; })
					.interpolate("linear");

					var lineGraph = svgContainer.append("path")
					.attr("d", lineFunction(lineData))
					.attr("stroke", colortable[j])
					.attr("stroke-width", 5-j)
					.attr("fill", "none");*/
					// var lineFunction = d3.svg.line()
					// .x(function(d) { return d.x; })
					// .y(function(d) { return d.y; })
					// .interpolate("linear");

					// var lineGraph = svgContainer.append("path")
					// .attr("d", lineFunction(lineData))
					// .attr("stroke", "#000000")
					// .attr("stroke-width", 1)
					// .attr("fill", "none");

					lineData.length = 0;
					routepoints.length = 0;
				}else {
					alert("Something wrong with the output"+j+".txt file");
				}			
				total.push(result);
			}
		});
	}

	
	
	//write a ajax function to get the point.txt content
	var points = [];
	$.ajax({
		url: 'point.txt', async: false, dataType: 'json', success: function (temp) {
			points = temp;
		}
	});

	//a ajax function to overlapped line segments
	var overlapsegs = [];
	$.ajax({
		url: 'point_segment_result_2_25.json', async: false, dataType: 'json', success: function(sampl){
			overlapsegs = sampl;
		}
	});

	//alert(total[points[0][0]].resourceSets[0].resources[0].routePath.line.coordinates[points[0][1]][0]);
	var pathinfo = [];
	var shiftedpoint = [];
	var shiftline = [];
	var directions = [];
	colortable = ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"];
	for(var k = 0; k < total.length; k++)
	{
		// if( k == 0 || k == 1 || k == 4)
		// 	continue;
		var tmpindex = [];
		tmpindex.push(total[k].resourceSets[0].resources[0].routePath.generalizations[0].pathIndices);

		for(var l = 1; l < tmpindex[0].length; l++)
		{
			la2 = total[k].resourceSets[0].resources[0].routePath.line.coordinates[tmpindex[0][l]][0];
			lo2 = total[k].resourceSets[0].resources[0].routePath.line.coordinates[tmpindex[0][l]][1];
			la1 = total[k].resourceSets[0].resources[0].routePath.line.coordinates[tmpindex[0][l-1]][0];
			lo1 = total[k].resourceSets[0].resources[0].routePath.line.coordinates[tmpindex[0][l-1]][1];
			v1x = (lo2 - lo1);
			v1y = (la2 - la1);
			lo3 = lo1 - 5;
			v2x = (lo3 - lo1);
			v2y = - (v1x*v2x)/v1y;
			la3 = v2y + la1;
			unitx = v2x/(Math.sqrt(v2x*v2x + v2y*v2y));
			unity = v2y/(Math.sqrt(v2x*v2x + v2y*v2y));
			offsetx = 0;
			offsety = 0;
			pathinfo.push({"id":k, "sinex":tmpindex[0][l-1], "eindex": tmpindex[0][l], "unitx": unitx, "unity": unity, "ofx": offsetx, "ofy": offsety});
			//offsetx = (Math.pow(-1,(k%2))*0.03 + Math.pow(-1,((k+1)%2))*0.05)*Math.pow(-1,(k%3))*unitx;
			//offsety = (Math.pow(-1,(k%2))*0.03 + Math.pow(-1,((k+1)%2))*0.05)*Math.pow(-1,(k%3))*unity;
			
			for(var h = tmpindex[0][l-1] ; h < tmpindex[0][l] -5; h++ ) //every point in this line segment
			{
				newlo = total[k].resourceSets[0].resources[0].routePath.line.coordinates[h][1];
				newla = total[k].resourceSets[0].resources[0].routePath.line.coordinates[h][0];
				offsetx = 0;
				offsety = 0;
				offsetxtmp = 0;
				offsetytmp = 0;
				/////////calculate offset////////
				for(var q = 0; q < overlapsegs.length; q++)  // search through overlapping
				{
					if(overlapsegs[q][0] == k) // if current path has a overlapping
					{
						if((h >= overlapsegs[q][1][0])&&(h <= overlapsegs[q][1][1])) // if current point is in that overlapping
						{
							bilidown = (h - overlapsegs[q][1][0])/(overlapsegs[q][1][1] - overlapsegs[q][1][0]);
							for(var p = 0; p < pathinfo.length; p++) // search for the correspoinding overlapping point
							{
								if(pathinfo[p].id == overlapsegs[q][2])
								{
									coindex = bilidown * (overlapsegs[q][3][1] - overlapsegs[q][3][0]) + overlapsegs[q][3][0];

									if((pathinfo[p].sinex <= coindex) && (pathinfo[p].eindex >= coindex))
									{

										//if((pathinfo[p].ofx == offsetx) && (pathinfo[p].ofy == offsety))
										//{
											if(pathinfo[p].ofx == 0)
											{
												offsetx = 0.05;
												offsety = 0.05;
											}
											else if(pathinfo[p].ofx == 0.05)
											{
												offsetx = -0.05;
												offsety = -0.05;
											}
											else if(pathinfo[p].ofx == -0.05)
											{
												offsetx = 0.10;
												offsety = 0.10;
											}
											else
											{
												offsetx = -0.15;
												offsety = -0.15;
											}
											pathinfo[pathinfo.length-1].ofx = offsetx;
											pathinfo[pathinfo.length-1].ofy = offsety;
											offsetxtmp = offsetx*unitx;
											offsetytmp = offsety*unity;
										//}
									}
								}
							}
						}
					}
					else if(overlapsegs[q][2] == k)
					{
						if((h >= overlapsegs[q][3][0]) && (h <= overlapsegs[q][3][1]))
						{
							bilidown = (h - overlapsegs[q][3][0])/(overlapsegs[q][3][1] - overlapsegs[q][3][0]);
							for(var p = 0; p < pathinfo.length; p++)
							{
								if(pathinfo[p].id == overlapsegs[q][0])
								{
									coindex = bilidown * (overlapsegs[q][1][1] - overlapsegs[q][1][0]) + overlapsegs[q][1][0];

									if((pathinfo[p].sinex <= coindex) && (pathinfo[p].eindex >= coindex))
									{
										//if((pathinfo[p].ofx == offsetx) && (pathinfo[p].ofy == offsety))
										//{
											if(pathinfo[p].ofx == 0)
											{
												offsetx = 0.05;
												offsety = 0.05;
											}
											else if(pathinfo[p].ofx == 0.05)
											{
												offsetx = -0.05;
												offsety = -0.05;
											}
											else if(pathinfo[p].ofx == -0.05)
											{
												offsetx = 0.10;
												offsety = 0.10;
											}
											else
											{
												offsetx = -0.15;
												offsety = -0.15;
											}
											pathinfo[pathinfo.length-1].ofx = offsetx;
											pathinfo[pathinfo.length-1].ofy = offsety;
											offsetxtmp = offsetx*unitx;
											offsetytmp = offsety*unity;
										//}
									}
								}
							}
						}
					}
				}

				if(offsetxtmp != offsetx)
				{
					offsetx = offsetxtmp;
					offsety = offsetytmp;
				}

				lo4 = newlo + offsetx;
				la4 = newla + offsety;
				y1 = (la4 - lat1)/delY + 50;
				x1 = (lo4 - long1)/delX + 50;
				

				shiftline.push({ "x": x1,  "y": y1});
			}	
			y1 = (la2 - lat1)/delY + 50;
			x1 = (lo2 - long1)/delX + 50;
			shiftedpoint.push({"cx": x1, "cy": y1, "radius": 2, "color" : "#000000"});
		}

		var lineFunction = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("linear");

		var lineGraph = svgContainer.append("path")
		.attr("d", lineFunction(shiftline))
		.attr("stroke", colortable[k])
		.attr("stroke-width", 5)
		.attr("fill", "none");

		// if(k == 0)
		// {
		// 	for(var q = 0; q < shiftline.length; q++)
		// 	{
		// 		var linedraw = d3.svg.line()
		// 		.x(function(d) { return d.x; })
		// 		.y(function(d) { return d.y; })
		// 		.interpolate("linear");

		// 		if(q % 50 == 0)
		// 		{
		// 			dirx1 = shiftline[q].x + 3;
		// 			dirx2 = shiftline[q].x - 3;
		// 			diry1 = shiftline[q].y + 3;
		// 			diry2 = shiftline[q].y + 3;

		// 			directions.push({"x":dirx1,"y":diry1});
		// 			directions.push({"x":shiftline[q].x,"y":shiftline[q].y});

		// 			var dirgraph = svgContainer.append("path")
		// 			.attr("d", linedraw(directions))
		// 			.attr("stroke", "#000000")
		// 			.attr("stroke-width", 1)
		// 			.attr("fill", "none");

		// 			directions.length = 0;

		// 			directions.push({"x":shiftline[q].x,"y":shiftline[q].y});
		// 			directions.push({"x":dirx2,"y":diry2});

		// 			var dirgraph = svgContainer.append("path")
		// 			.attr("d", linedraw(directions))
		// 			.attr("stroke", "#000000")
		// 			.attr("stroke-width", 1)
		// 			.attr("fill", "none");

		// 			directions.length = 0;
		// 		}
		// 	}
		// }
		for(var q = 0; q < shiftline.length; q++)
		{
			var linedraw = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("linear");

			if(q % 70 == 0 && q > 0)
			{
				startx = shiftline[q - 1].x;
				starty = shiftline[q -1].y;

				endx = shiftline[q].x;
				endy = shiftline[q].y;
				lengthOfSide = (5)/2
				if(endx > startx && endy < starty){
					alpha = Math.atan((endx - startx)/(starty - endy));
					x = endx - lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					y = endy + lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
					directions.push({"x": endx, "y": endy});
					alpha = Math.atan((starty - endy)/(endx - startx));
					x = endx - lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					y = endy + lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
				}else if(endx < startx && endy < starty){
					alpha = Math.atan((startx - endx)/(starty - endy));
					x = endx + lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					y = endy + lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
					directions.push({"x": endx, "y": endy});
					alpha = Math.atan((- endy + starty)/(startx - endx));
					x = endx + lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					y = endy + lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
				}else if (endx > startx && endy > starty) {
					alpha = Math.atan((endx - startx)/(endy - starty));
					x = endx - lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					y = endy - lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
					directions.push({"x": endx, "y": endy});
					alpha = Math.atan((endy - starty)/(- startx + endx));
					x = endx - lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					y = endy - lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
				}else if (endx < startx && endy > starty) {
					alpha = Math.atan((endy - starty)/(startx - endx));
					x = endx + lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					y = endy - lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
					directions.push({"x": endx, "y": endy});
					alpha = Math.atan((startx - endx)/(endy - starty));
					x = endx + lengthOfSide*Math.sin(alpha - 45/180*Math.PI);
					y = endy - lengthOfSide*Math.cos(alpha - 45/180*Math.PI);
					directions.push({"x": x, "y": y});
				}

				var dirgraph = svgContainer.append("path")
				.attr("d", linedraw(directions))
				.attr("stroke", "#000")
				.attr("stroke-width", 0.5)
				.attr("fill", "none");

				directions.length = 0;
			}
		}

		shiftline.length = 0;
	}

	// var circles = svgContainer.selectAll("circle")
	// .data(shiftedpoint)
	// .enter()
	// .append("circle");

	// var circleAttributes = circles
	// .attr("cx", function (d) { return d.cx; })
	// .attr("cy", function (d) { return d.cy; })
	// .attr("r", function (d) { return d.radius; })
	// .style("fill", function (d) { return d.color; });


	//append the points after the lines been draw
	$.ajax({
		url: 'nodes.txt', async: false, dataType: 'json', success: function (nodes) {
			var textData = [];
			var circleData = [];
			for(var k = 0; k < nodes.length; k++){
				latitude = nodes[k][1];
				longitude = nodes[k][2];
				y = (latitude - lat1)/delY + 50;
				x = (longitude - long1)/delX + 50;
				circleData.push({"cx": x, "cy": y, "radius": 5, "color" : "#e41a1c"});
				textData.push({"cx": x, "cy": y + 2, "index": nodes[k][0]});
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
			.attr("font-size", "8px")
			.attr("fill", "#FFFF47")
			.attr("text-anchor","middle");
		}
	});
	
	var circleData = [];
	//alert(points.length);
	for(var k = 0; k < points.length; k++){
		//把每个point都走一遍
		
		latitude1 = total[points[k][0]].resourceSets[0].resources[0].routePath.line.coordinates[points[k][1]][0];
		longitude1 = total[points[k][0]].resourceSets[0].resources[0].routePath.line.coordinates[points[k][1]][1];
		latitude2 = total[points[k][2]].resourceSets[0].resources[0].routePath.line.coordinates[points[k][3]][0];
		longitude2 = total[points[k][2]].resourceSets[0].resources[0].routePath.line.coordinates[points[k][3]][1];

		if(points[k][0] == 1)
		{
			pointoffsetx = 0;
			pointoffsety = 0;
			if(points[k][1]-3 > 0)
			{
				latpre = total[points[k][0]].resourceSets[0].resources[0].routePath.line.coordinates[points[k][1]-3][0];
				lngpre = total[points[k][0]].resourceSets[0].resources[0].routePath.line.coordinates[points[k][1]-3][1];
				if(latpre == latitude1) //horizon
				{
					pointoffsetx = 0;
					pointoffsety = 3;
				}
				else if(lngpre == longitude1) //perpendicular
				{
					pointoffsetx = 3;
					pointoffsety = 0;
				}
				else
				{
					lineslope = (latpre - latitude1)/(lngpre - longitude1);
					if(lineslope > 0)
					{
						pointoffsetx = -3;
						pointoffsety = -3;
					}
					else
					{
						pointoffsetx = -3;
						pointoffsety = 3;
					}
				}
			}

			y1 = (latitude1 - lat1)/delY + 50 + pointoffsety;
			x1 = (longitude1 - long1)/delX + 50 + pointoffsetx;
			circleData.push({"cx": x1, "cy": y1, "radius": 1, "color" : "#2811F5"});
		}
		y1 = (latitude1 - lat1)/delY + 50;
		x1 = (longitude1 - long1)/delX + 50;
		y2 = (latitude2 - lat1)/delY + 50;
		x2 = (longitude2 - long1)/delX + 50;
		circleData.push({"cx": x1, "cy": y1, "radius": 1, "color" : "#000000"});
		circleData.push({"cx": x2, "cy": y2, "radius": 1, "color" : "#000000"});
	}

	/*var circles = svgContainer.selectAll("circle")
	.data(circleData)
	.enter()
	.append("circle");

	var circleAttributes = circles
	.attr("cx", function (d) { return d.cx; })
	.attr("cy", function (d) { return d.cy; })
	.attr("r", function (d) { return d.radius; })
	.style("fill", function (d) { return d.color; });*/
}



