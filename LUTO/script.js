var width = 800,
    height = 580;



var mapsvg = d3.select("#mapsvg")
    .attr("width", width+"px")
    .attr("height", height+"px")
	.call(d3.behavior.zoom()
    .on("zoom", redraw))
	.append("g");
var legend = d3.select("#mapsvg").append("g").attr("id", "legend");
    legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",20).attr("text-anchor","start").text("Crops");
   legend.append("rect").attr("class","legendrect").attr("id","legend_1").attr("x",width-100).attr("y",5).attr("width",85).attr("height",20).attr("fill",colorcode(1))
   .on("mouseover", function(){ return highlight(1);}).on("mouseout", function(){return unhighlight(1)});
  
  legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",40).attr("text-anchor","start").text("Cattle");
   legend.append("rect").attr("class","legendrect").attr("id","legend_2").attr("x",width-100).attr("y",25).attr("width",85).attr("height",20).attr("fill",colorcode(2))
   .on("mouseover", function(){ return highlight(2);}).on("mouseout", function(){return unhighlight(2)});
   
   legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",60).attr("text-anchor","start").text("Sheep");
   legend.append("rect").attr("class","legendrect").attr("id","legend_3").attr("x",width-100).attr("y",45).attr("width",85).attr("height",20).attr("fill",colorcode(3))
   .on("mouseover", function(){ return highlight(3);}).on("mouseout", function(){return unhighlight(3)});
   
   legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",80).attr("text-anchor","start").text("CarbonPlt");
   legend.append("rect").attr("class","legendrect").attr("id","legend_101").attr("x",width-100).attr("y",65).attr("width",85).attr("height",20).attr("fill",colorcode(101))
   .on("mouseover", function(){ return highlight(101);}).on("mouseout", function(){return unhighlight(101)});
   
   legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",100).attr("text-anchor","start").text("EnvironmentalPlt");
   legend.append("rect").attr("class","legendrect").attr("id","legend_102").attr("x",width-100).attr("y",85).attr("width",85).attr("height",20).attr("fill",colorcode(102))
   .on("mouseover", function(){ return highlight(102);}).on("mouseout", function(){return unhighlight(102)});
   
   legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",120).attr("text-anchor","start").text("WheatBioFuels");
   legend.append("rect").attr("class","legendrect").attr("id","legend_103").attr("x",width-100).attr("y",105).attr("width",85).attr("height",20).attr("fill",colorcode(103))
   .on("mouseover", function(){ return highlight(103);}).on("mouseout", function(){return unhighlight(103)});
  
   legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",140).attr("text-anchor","start").text("WheatFood/Fuels");
   legend.append("rect").attr("class","legendrect").attr("id","legend_104").attr("x",width-100).attr("y",125).attr("width",85).attr("height",20).attr("fill",colorcode(104))
   .on("mouseover", function(){ return highlight(104);}).on("mouseout", function(){return unhighlight(104)}); 
   
  // legend.append("rect").attr("class","legendrect").attr("x",width-100).attr("y",105).attr("width",85).attr("height",20).attr("fill",colorcode(103));
  // legend.append("text").attr("class","legendtext").attr("x",width-95).attr("y",120).attr("text-anchor","start").text("WheatBioFuel");
var projection = d3.geo.mercator()
    .center([135, -28])
 // .parallels([50, 60])
    .scale(850)
    .translate([width / 2, height / 2]);
var path = d3.geo.path().projection(projection);	
//construct the slider	  
var x = d3.scale.linear().domain([12, 50]).range([0, width-50]).clamp(true);
var brush = d3.svg.brush().x(x).extent([0, 0]);
 
var slider = d3.select("#slidersvg").attr("width", width).attr("height", 40).append("g").attr("class", "slider").attr("transform","translate(20,10)");
var classflow = slider.append("g").attr("class","classflow");
slider.append("g").attr("class", "x axis").call(d3.svg.axis().scale(x).orient("bottom")
      .tickFormat(function(d) { return "20"+d; })
	  .ticks(19)
      .tickSize(0)
      .tickPadding(12))
      .select(".domain")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "halo");
var handle = slider.append("circle").attr("class", "handle").attr("r", 9);

queue(2).defer(d3.json, "topojson/aus-states.json")
       .defer(d3.csv, "data/landUse_2012-2050_blsample-5000.csv") 
       .await(function(error, topology, data) {
		if (error) return console.error(error);
        Rendering(topology, data);
  });


function Rendering(topology,data){
  //
  var subunits = topojson.feature(topology, topology.objects.states);
  mapsvg.append("g").attr("id","maplayer").selectAll(".subunit")
      .data(subunits.features)
      .enter().append("path")
      .attr("class", "subunit" )
      .attr("d", path); 
	  
	  
  //datalayer	  
  var locationdata = data.map(function(d){return {log:+d.LONG,lat:+d.LAT}});

	
    var yeardata = []; 
    for (var i = 12; i<=50; i++){	 
     	 eval("yeardata.push(data.map(function(d){return +d.LANDUSECODE_20"+i.toString()+"}))");	
	}
       
	
	//console.log(yeardata);
	
	var landuse = mapsvg.append("g").attr("id","datalayer");
	var vpath = mapsvg.append("g").attr("id","voronoi").selectAll("path");
	var voronoi = d3.geom.voronoi().clipExtent([[0, 0], [width, height]]);
	var vertices = [];
	

	for (i=0; i< data.length; i++){
	     vertices.push(projection([locationdata[i].log, locationdata[i].lat]));
	} 
	Vpolygons = voronoi(vertices);
	for (i=0; i< data.length; i++){
		// if polygons are filtered out, display points instead
	   if(voronoiFilter(Vpolygons[i])==false){
	
		 landuse.append("circle").attr("class","landusecode_"+yeardata[0][i].toString())
		                         .attr("id","landuse_"+i.toString())
								 .attr("r",'1px')
								 .attr("x",0)
								 .attr("y",0)
								 .attr("transform", function(){
								   return "translate(" + projection([
								   locationdata[i].log,
								   locationdata[i].lat]) + ")";
								 })
								 .attr("stroke-width","0")
								 .attr("opacity",1)
								 .attr("fill", colorcode(yeardata[0][i]));
	   }						 
	   }
	
	
	
    vpath=vpath.data(voronoi(vertices))
	vpath.enter().append("path")
	             .attr("class","voronoipoly")
				 .attr("class", function(d,i){return "voro-"+yeardata[0][i].toString()} )
				 .attr("id", function(d,i){return "voro-"+i.toString()} )
				 .attr("fill", function(d,i){return colorcode(yeardata[0][i])})
				 .attr("stroke", function(d,i){return colorcode(yeardata[0][i])})
				 .attr("stroke-width", "0.5px")
				 .attr("opacity", function(d){if (voronoiFilter(d)) return 1; else return 0;})
				 .attr("d", function(d){return polygon(d)});
	
    

   //slider action
    brush.on("brush", function(){
		          		var value = brush.extent()[0];

						if (d3.event.sourceEvent) { // not a programmatic event
							value = x.invert(d3.mouse(this)[0]);
							brush.extent([value, value]);
						  }

						handle.attr("cx", x(value));
						var year = Math.round(value);
						 // console.log(year);
						d3.select("#yeartxt").text("20"+year.toString()); 
						for (i=0; i< data.length; i++){
						
						  d3.select("#landuse_"+i).attr("class","landusecode_"+yeardata[year-12][i].toString())
												  .attr("fill", colorcode(yeardata[year-12][i]));
						  d3.select("#voro-"+i).attr("class","voro-"+yeardata[year-12][i].toString())
											   .attr("fill",  colorcode(yeardata[year-12][i]))
											   .attr("stroke", colorcode(yeardata[year-12][i]));
							   
		                  }
	              });
    
	slider.call(brush);
 
}

 
//slider animation introduction
slider.call(brush.event).transition().delay(200).duration(10000).call(brush.extent([50, 50])).call(brush.event);


function redraw() {
    mapsvg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function colorcode(index){
	var color = "";
	switch(index) {
		case 1:
		   color = "rgb(237,209,127)";
			break;
		case 2:
		   color = "rgb(158,173,143)";
			break;
		case 3:
		   color = "rgb(173,125,52)";
			break;
		case 101:
		   color = "rgb(65,182,230)";
			break;
		case 102:
		   color = "rgb(0,122,83)";
			break;
		case 103:
		   color = "rgb(255,184,28)";
		    break;
		case 104:
		   color = "rgb(228,0,43)";
			break;
		case 105:
		   color = "rgb(242,222,0)";
			break;
		case 106:
		   color = "rgb(159,174,229)";
			break;
		case 107:
		   color = "rgb(0,75,135)";
		   break;
		default:
        
   }
  return color; 
}

//functions for highlights the plots
function highlight(landusecode){
 d3.select("#legend_"+landusecode).attr("fill","#FFFFFF");
 d3.selectAll(".landusecode_"+landusecode).attr("fill","#FFFFFF");
 d3.selectAll(".voro-"+landusecode).attr("fill","#FFFFFF");

}
function unhighlight(landusecode){
 d3.select("#legend_"+landusecode).attr("fill",colorcode(landusecode));
 d3.selectAll(".landusecode_"+landusecode).attr("fill",colorcode(landusecode));
 d3.selectAll(".voro-"+landusecode).attr("fill",colorcode(landusecode));

}
function polygon(d) {
  return "M" + d.join("L") + "Z"; 
  
}
function voronoiFilter(SinglePolygon){
//singlePolygon is the array of all the points on the polygonal path (every point contains x, y))
 var dist = [];
 var point = {};
 var next = {};
 for (var i = 0 ; i< SinglePolygon.length-1; i++){
	 point.x = SinglePolygon[i][0];
	 point.y = SinglePolygon[i][1];
	 next.x = SinglePolygon[i+1][0];
	 next.y = SinglePolygon[i+1][1];
	 dist.push(EuclideanDistance(point,next));
	
 }
 var area = Math.abs(d3.geom.polygon(SinglePolygon).area())
   //console.log(area);
  //console.log(d3.mean(dist));
  //if (d3.mean(dist)<3.5 && d3.max(dist)<3.5)
   if(area<=11 && d3.mean(dist)<5 && d3.max(dist)<5)	  
	  return true;
  else
	  return false;
}

function EuclideanDistance(point1,point2){
	
dist = Math.sqrt(Math.pow((point1.x-point2.x),2) + Math.pow((point1.y-point2.y),2));

return dist;
}