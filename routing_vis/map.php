<?php 
        $nodefile = file_get_contents("nodes.txt");
        $nodes = json_decode($nodefile, true);
        $numofnodes = count($nodes);
        $edgefile = file_get_contents("edges.txt");
        $edges = json_decode($edgefile,true);
        $numofedges = count($edges);
        $lc = 0;
        $listindex = 0;
        $nodeindex = 0;
        
        for($lc = 0; $lc < $numofedges; $lc++){
                $lists[$listindex][$nodeindex] = $edges[$lc][0];
                $nodeindex++;
                if(($lc != $numofedges - 1)){
                        if($edges[$lc][1] != $edges[$lc + 1][0]){
                                $lists[$listindex][$nodeindex] = $edges[$lc][1];
                                $listindex++;
                                $nodeindex = 0;
                        }
                }else{
                        $lists[$listindex][$nodeindex] = $edges[$lc][1];
                }

        }
        $numoflists = count($lists);

        
        $listfile = json_encode($lists);
        file_put_contents("lists.json", $listfile);
        
        echo '
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
   <head>
      <title></title>
      <script type="text/javascript" src="http://code.jquery.com/jquery-2.1.0.min.js"></script>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

      <script type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>

      <script type="text/javascript">
         
         var map = null;
 
         function GetMap()
         {
            // Initialize the map
            map = new Microsoft.Maps.Map(document.getElementById("mapDiv"),{credentials:"AhPfmTui6z1TPa9e96K0FYmZxUsCEfTCkaMAO3c8IlEl1g22leT7oW9x6wYt_wG6", mapTypeId: Microsoft.Maps.MapTypeId.road }); 

  
         }
         /*
         function ClickRoute(credentials)
         {

            map.getCredentials(MakeRouteRequest);
         }
         */


         function MakeRouteRequest(routeRequest)//,credentials)
         {

            CallRestService(routeRequest);

         }


          function RouteCallback(result) {

                          
             if (result &&
                   result.resourceSets &&
                   result.resourceSets.length > 0 &&
                   result.resourceSets[0].resources &&
                   result.resourceSets[0].resources.length > 0) {
                   
                     // Set the map view
                     var bbox = result.resourceSets[0].resources[0].bbox;
                     var viewBoundaries = Microsoft.Maps.LocationRect.fromLocations(new Microsoft.Maps.Location(bbox[0], bbox[1]), new Microsoft.Maps.Location(bbox[2], bbox[3]));
                     map.setView({ bounds: viewBoundaries});


                     // Draw the route
                     var routeline = result.resourceSets[0].resources[0].routePath.line;
                     var routepoints = new Array();
                     
                     for (var i = 0; i < routeline.coordinates.length; i++) {

                         routepoints[i]=new Microsoft.Maps.Location(routeline.coordinates[i][0], routeline.coordinates[i][1]);
                     }

                     
                     // Draw the route on the map
                     var routeshape = new Microsoft.Maps.Polyline(routepoints, {strokeColor:new Microsoft.Maps.Color(255,0,0,0)});
                     //original colo 200,0,0,200
                     map.entities.push(routeshape);
                     
                 }
         }


         function CallRestService(request) 
         {
            var script = document.createElement("script");
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", request);
            document.body.appendChild(script);
         }
      </script>
   </head>
   <body onload="GetMap();LoadFile()">
      <div id="mapDiv" style="position:relative; width:600px; height:600px; opacity:1"></div>
      <script type="text/javascript">

        function LoadFile(){
           $(document).ready(function()
                    {
                        $.getJSON("nodes.json", function(nodes) {
                          $.getJSON("lists.json", function(lists){
                            
                            for(lc = 0; lc < lists.length; lc++){
                              url0 = "http://dev.virtualearth.net/REST/v1/Routes?";

                              url2 = "routePathOutput=Points&output=json&jsonp=RouteCallback&key=AhPfmTui6z1TPa9e96K0FYmZxUsCEfTCkaMAO3c8IlEl1g22leT7oW9x6wYt_wG6&tl=0.01";

                              url1 = "";
                              lc1 = 0;
                              for(lc1 = 0; lc1 < lists[lc].length; lc1++){
                                latlng = nodes[lists[lc][lc1]][1]+","+nodes[lists[lc][lc1]][2];
                                url1 = url1+"wp."+lc1+"="+latlng+"&";
                              }

                              url = url0+url1+url2;
                              MakeRouteRequest(url);
                            }

                          });
                        });
                    });

        }
      </script>
   </body>
</html>
        ';
        


        for($lc = 0; $lc < $numoflists; $lc++){
                // create curl resource

                $ch = curl_init(); 

                $url0 = "http://dev.virtualearth.net/REST/v1/Routes?";

                $url2 = "routePathOutput=Points&output=json&key=AhPfmTui6z1TPa9e96K0FYmZxUsCEfTCkaMAO3c8IlEl1g22leT7oW9x6wYt_wG6&tl=0.1";

                $url1 = "";
                $lc1 = 0;
                for($lc1 = 0; $lc1 < count($lists[$lc]); $lc1++){
                        $latlng = $nodes[$lists[$lc][$lc1]][1].",".$nodes[$lists[$lc][$lc1]][2];
                        $url1 = $url1."wp.".$lc1."=".$latlng."&";
                }

                $url = $url0.$url1.$url2;

                // set url
                curl_setopt($ch, CURLOPT_URL, $url); 

                //return the transfer as a string 
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 

                // $output contains the output string 
                $output = curl_exec($ch);

                $fp = fopen("output".$lc.".txt", "w");
                fwrite($fp, $output);
                fclose($fp);


                // close curl resource to free up system resources 
        curl_close($ch); 
        }      
?>
