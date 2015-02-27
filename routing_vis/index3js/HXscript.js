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

function angle(cx,cy,fx,fy){
	if(fx > cx){
		return Math.PI/2 + Math.atan((fy - cy)/(fx - cx));
	}else{
		return Math.PI/2*3 + Math.atan((fy - cy)/(fx - cx));
	}
}

function Load (){
	var svgContainer = d3.select("#figure").append("svg")
	.attr("width", 1000)
	.attr("height", 700);
	//.attr("style", "display: block; margin: auto;");

	//var color = ["#FF0000", "#FF00FF", "#FFFF00", "#00FFFF", "00FF00"];
	//var colorcounter = 0;
	var lineData = [];
	var subPoint = [];
	var circleData = [];
	var textData = [];
	var color = d3.scale.category20();
	
	$.getJSON("lists.json", function(numofroutes){
		if(numofroutes.length > 1){
			alert(numofroutes.length+" routes need to provide");
		}else{
			alert(numofroutes.length+" route need to provide");
		}
		$.getJSON("bbox.txt", function(bbox) {
		var routepoints = new Array();

		for(var j = 0; j < numofroutes.length; j++) {
			$.getJSON("output"+j+".txt", function(result) {
				if (result &&
					result.resourceSets &&
					result.resourceSets.length > 0 &&
					result.resourceSets[0].resources &&
					result.resourceSets[0].resources.length > 0)
				{

					/*switch( j % 5) {
				    case 0:
				        var symcolor = "white";
				        break;
				    case 1:
				        var symcolor = "orange";
				        break;
                    case 2:
				        var symcolor = "purple";
				        break;
				    case 3:
				        var symcolor = "red";
				        break;
				    case 4:
				        var symcolor = "green";
				        
					}*/

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
					.attr("stroke", "grey")
					.attr("stroke-width", 2)
					.attr("fill", "none");

					for(var i = 0; i < (pathIndices.length - 1); i++){
						subindex = pathIndices[i];
						subx = lineData[subindex].x + Math.random() * 10 * (i % 2);
						suby = lineData[subindex].y + Math.random() * 10 * (i % 2);
						subPoint.push({"x": subx, "y": suby});
					}

					var SymbolFunc = d3.svg.symbol()
					.size(50)
					.type(d3.svg.symbolTypes[~~(Math.random() * d3.svg.symbolTypes.length)]);
					
					//.type(function(d){return "cross"});

					var ramd = (Math.random() * 100) % 20;

					var symbolGraph = svgContainer.selectAll("path")
					.data(subPoint)
					.enter().append("path")
					.attr("d", SymbolFunc(subPoint))
					.attr("transform", function(d) { return "translate(" + (d.x) + "," + (d.y) + ")"; })
					.style("stroke", "black")
					.style("fill", function(d) {return color(ramd);})
    				//.style("fill", symcolor);



					/*for(var i = 1; i < pathIndices.length; i++){
						sindex = pathIndices[i - 1]; // start point
						startx = lineData[sindex].x;
						starty = lineData[sindex].y;

						eindex = pathIndices[i];
						endx = lineData[eindex].x;
						endy = lineData[eindex].y;

						dx = endx - startx;
						dy = endy - starty;
						s2edistance = Math.sqrt(dx*dx + dy*dy);

						var mdistance = 0;
						var mindex = sindex;

						
						for(var z = sindex + 1; z < eindex; z++){
							var tempx = lineData[z].x;
							var tempy = lineData[z].y;
							var tempd = Math.abs(dy*tempx - dx*tempy - startx*endy + endx*starty)/s2edistance;
							if(tempd > mdistance){
								mdistance = tempd;
								mindex = z;
							}
						}

						//var sign = mdistance ? (mdistance < 0 ? -1 : 1):0;
						//if sign = -1 left of the line, if sign = 1 right of the line

						midx = (startx + endx)/2;
						midy = (starty + endy)/2;
						s2ek = (endy - starty)/(endx - startx);
						s2ec = starty - s2ek*startx;


						centerk = -1/s2ek;
						centerc = midy - centerk*midx;

						var tempa = centerk*centerk + 1;
						var tempb = -2*midx+2*centerk*(centerc - midy);
						var tempc = midx*midx + Math.pow(centerc - midy,2) - Math.pow(0.866*s2edistance,2);

						c1x = (-tempb + Math.sqrt(tempb*tempb - 4*tempa*tempc))/(2*tempa);
						c1y = centerk * c1x + centerc;


						var signofcenter = c1y - s2ek*c1x - s2ec;
						var signoffar = lineData[mindex].y - s2ek*lineData[mindex].x - s2ec;

						
						if(signofcenter * signoffar > 0){
							c1x = (-tempb - Math.sqrt(tempb*tempb - 4*tempa*tempc))/(2*tempa);
							c1y = centerk * c1x + centerc;
						}
						//the centeroid already find
						
						var startangle = angle(c1x,c1y,startx,starty);
						var endangle = angle(c1x,c1y,endx,endy); */
						/*if ((endangle - Math.PI) > startangle || endangle < startangle){
							var tempangle = startangle;
							startangle = endangle;
							endangle = tempangle;
						}*/
						/*if(Math.abs(endangle - startangle) > Math.PI){
							if(endangle > startangle){
								endangle -= 2*Math.PI;
							}else{
								startangle -= 2*Math.PI;
							}
						}

						red = "#FF0000";

						var arcGraph = svgContainer.append("path")
						.attr("d",d3.svg.arc().innerRadius(s2edistance).outerRadius(s2edistance+ 1).startAngle(startangle).endAngle(endangle))
						.style("fill",red)//color[colorcounter])
						.attr("transform", "translate(" + c1x + "," + c1y + ")");
					} */
					//colorcounter++;

					lineData.length = 0;
					routepoints.length = 0;

					$.getJSON("nodes.txt", function(nodes) {
						for(var k = 0; k < nodes.length; k++){
							latitude = nodes[k][1];
							longitude = nodes[k][2];
							y = (latitude - lat1)/delY + 50;
							x = (longitude - long1)/delX + 50;
							circleData.push({"cx": x, "cy": y, "radius": 9, "color" : "blue"});
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
						.attr("fill", "yellow")
						.attr("text-anchor","middle");
					});
				}else {
					alert("Something wrong with the output"+j+".txt file");
				}			
			});
		}});
	});
}