
///////////////////////////////////////////////////////////////////////////
////////////// Initiate SVG and create hexagon centers ////////////////////
///////////////////////////////////////////////////////////////////////////
var option = "color";

//svg sizes and margins
var margin = {
    top: 30,
    right: 20,
    bottom: 20,
    left: 50
};

//The next lines should be run, but this seems to go wrong on the first load in bl.ocks.org
//var width = $(window).width() - margin.left - margin.right - 40;
//var height = $(window).height() - margin.top - margin.bottom - 80;
//So I set it fixed to
var somwidth = 300;
var somheight = 480;
var cpwidth = 220;
var cpheight = 220;

//The number of columns and rows of the heatmap
var MapColumns = 15,
	MapRows = 30;
	
//Create SVG element
var som = d3.select("#som")
    .attr("width", somwidth + margin.left + margin.right)
    .attr("height", somheight + margin.top + margin.bottom)
    .append("g")
	.attr("id","somgroup")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
var scatterwidth = 350;
var scatterheight = 470;
//scatterplots X Y range
var x = d3.scale.linear()
    .range([0, scatterwidth*1.5]);

var y = d3.scale.linear()
    .range([scatterheight*0.9, 0]);

var scatter = d3.select("#scatterplot").append("g")
                .attr("width", scatterwidth + margin.left + margin.right)
				.attr("height", scatterheight + margin.top + margin.bottom)
				.append("g")
				.attr("id","scattergroup")
				.attr("transform", "translate(" + margin.left*0.1 + "," + margin.top + ")");
				
// the array of all the hexbinned points results for component planes
var hexcps_points = [];
var cps_text = ["DomPorColor", "MaxPorColor", "VoidFracgtioColor", "Surface_graColor", "Surface_voColor"];
// hexbinned points for the main view
var hexbinpoints;
var cpdiv = d3.select("#cps"); 
$(function() {
    $( "#cps" ).draggable();
  });
  
//color for different categories in the data, i.e. blue and red
var color = d3.scale.ordinal().range(['steelblue','orangered']);


d3.select("#Color").attr("selected","selected");

///////////////////////////////////////////////////////////////////////////
////////////////////// Draw hexagons and color them ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Start drawing the hexagons
d3.csv("Color-all-MOF2.csv", function(data){
d3.csv("MOFdata-train.csv", function(error, orgdata) {
	 hexbinpoints = CreateSOMVis(som, MapRows, MapColumns, somwidth, somheight, orgdata,data, "Color","main");
	 som.append("text").attr("id","maintitle")
	   .attr("x", somwidth/2-margin.left/2)
	   .attr("y", somheight)
	   .text("Similarity Color Coding")
	   .style("fill","gray")
	   .style("text-anchor", "middle")
	   .style("font-weight","bold")
	   .style("font-size", "12px");
	 d3.selectAll("#choosecolor").on("change", function() {
		 var properties = d3.select(this).property('value');
		  console.log(properties);
		 if (properties == "Color")
		   {		   
		      option = "color"; 
			  d3.select("#maintitle").text("Similarity Color Coding");
			  d3.selectAll(".hexagon").style("fill", function (d,i) {		    
			  return data[i].Color;
		     }); 
			 
		    }
		  if (properties == "DomPor" || properties == "MaxPor" || properties == "VoidFracgtio"|| properties == "Surface_gra" || properties == "Surface_vo")
		   {
		     option = "bw";		
			 d3.select("#maintitle").text(properties);  
             d3.selectAll(".hexagon").style("fill", function (d,i) {
			 return data[i][properties+"Color"];
		   });
		     
		  }
		  if (properties =="Component"&& !$("#cps_1").length){
	   
		   for (var i =0; i<cps_text.length; i++){
		   		   
			   var cp = cpdiv.append("svg").attr("width", cpwidth+70)
										   .attr("height", cpheight+40)
										   .append("g")
										   .attr("id", "cps_"+i.toString())
										   .attr("transform", "translate(25,25)");
				
					
			   hexcps_points[i]=CreateSOMVis(cp, MapRows, MapColumns, cpwidth, cpheight, orgdata,data, cps_text[i],"cps");
			   cp.append("text").attr("x", cpwidth/2-30)
								 .attr("y", function(){ if((i+1)/3 <=1){return cpheight+10} else{return cpheight+10}})
								 .text(cps_text[i].substr(0,cps_text[i].indexOf("Color")))
								 .style("text-anchor", "middle")
								 .style("font-size", "11px");
		   }
		   
		  }
  
		
	});

	
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


  if (error) throw error;
	  orgdata.forEach(function(d) {
		d.sepalLength = +d.sepalLength;
		d.sepalWidth = +d.sepalWidth;
	  });
  x.domain(d3.extent(orgdata, function(d) { return +d.pca_X; })).nice();
  y.domain(d3.extent(orgdata, function(d) { return +d.pca_Y; })).nice();

  scatter.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + scatterheight*0.9 + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", scatterwidth)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("PCA-X");

  scatter.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("PCA-Y")
	  
  bluepoints = [];
  redpoints = []
  for(var i = 0; i<orgdata.length; i++){
	 if(orgdata[i].CO2_001=="blue")
	  bluepoints.push([x(orgdata[i].pca_X),y(orgdata[i].pca_Y)]);
     if(orgdata[i].CO2_001=="red")
	  redpoints.push([x(orgdata[i].pca_X),y(orgdata[i].pca_Y)]);
  }
  var agghexbin1 = d3.hexbin().radius(2);
  var agghexbin2 = d3.hexbin().radius(1.5);

//hexbined blue dots
  scatter.selectAll(".dot")
      .data(agghexbin1(bluepoints))
    .enter().append("circle")
      .attr("class", "dot")
	  .attr("class", function(d){ return "blue"})
	  .attr("id", function(d,i){ return "bluepca_"+i.toString()})
      .attr("r", 2)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
	  .style("fill", color("blue"))
	  .style("fill-opacity", function(d){return d.length*1300/bluepoints.length})
	
//hexbined red dots
  scatter.selectAll(".dot")
      .data(agghexbin2(redpoints))
    .enter().append("circle")
      .attr("class", "dot")
	  .attr("class", function(d){ return "red"})
	  .attr("id", function(d,i){ return "redpca_"+i.toString()})
      .attr("r", 1.5)
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
	  .style("fill", color("red"))
	  .style("fill-opacity", function(d){return d.length*500/redpoints.length})
	  
/* scatter.selectAll(".dot")
      .data(orgdata)
    .enter().append("circle")
      .attr("class", "dot")
	  .attr("class", function(d){ if(d.CO2_001=="blue")return "blue"; else return "red";})
	  .attr("id", function(d,i){ return "pca_"+i.toString()})
      .attr("r", 2)
      .attr("cx", function(d) { return x(+d.pca_X); })
      .attr("cy", function(d) { return y(+d.pca_Y); })
	  .style("fill", function(d){return color(d.CO2_001);})
	  .style("fill-opacity", 0.5); */
	  
//move romefull to the back to avoid overdrawing
 d3.selectAll(".blue").moveToBack();  
 
var legend = scatter.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" +somwidth/1.2+","+ i * 20 + ")"; });

  legend.append("rect")
      .attr("x", somwidth - 80)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color)
	  .on("mouseover", function(thisd){
		  d3.select(this).style("fill-opacity","0.5").style("stroke","red");
		  d3.selectAll("."+ thisd).style("stroke",thisd);
		  var sum = d3.sum(data, function(d) { return +d['Hit'+thisd]; });
		  var max = d3.max(data, function(d) { return +d['Hit'+thisd]; });
		  var min = d3.min(data, function(d) { return +d['Hit'+thisd]; });
		  var mean = sum/150;
		  d3.select("#somgroup").append("g")
			.selectAll(".hits")
			.data(hexbinpoints)
			.enter().append("circle")
			.attr("class", "hits")
			.attr("cx", function (d) {
				return  d.x ;
			})
			.attr("cy", function (d) {
			   return   d.y;
			})
			.attr("r", function(d,i){ 
				 var hit = parseFloat(data[i]['Hit'+thisd]);
				 var eq = 6+3*Math.log(hit/mean);
				 if (eq<=0 && eq>-2)
				 return 0.5;			 
				 if(eq>0 && eq<20)
				 return eq;
				 if(eq>=20)
				 return 20;
				 if(eq<=-2 && hit!=0)
				 return 0;
				 if(hit==0)
				 return 10;
			})
			.style("fill", function(d,i){
				var hit = parseFloat(data[i]['Hit'+thisd]);
				if(option=="color"&&hit!=0) 
					return "black"; 
				if(option=="bw"&&hit!=0) 
					return color(thisd);
				if(hit==0) 
					return "white";
				})
			.style("fill-opacity", 0.7)

			
		   d3.select("#somgroup").append("g")
			.selectAll(".hitstext")
			.data(hexbinpoints)
			.enter().append("text")
			.attr("class", "hits")
			.attr("x", function (d) {
				return  d.x ;
			})
			.attr("y", function (d) {
			   return   d.y;
			})
			.style("text-anchor", "middle")
			.style("stroke","white")
			.style("font-size","9.5px")
			.text(function(d,i)	{
				var hit = parseFloat(data[i]['Hit'+thisd]);
				if (hit/sum*100<1){
				return "";
				}
				else{
				return (hit/sum*100).toFixed(0)+"%";
				}
			});
			//if component plane exists, highlight them as well
		   if($("#cps_1").length){
				 
				 for(var k = 0 ; k<hexcps_points.length; k++){
					d3.select("#cps_"+k).append("g")
						.selectAll(".hits")
						.data(hexcps_points[k])
						.enter().append("circle")
						.attr("class", "hits")
						.attr("cx", function (d) {
							return  d.x;
						})
						.attr("cy", function (d) {
							return  d.y;
						})
						.attr("r", function(d,i){ 
							 var hit = parseFloat(data[i]['Hit'+thisd]);	
							 var size;			 
							 if(hit==0)
							 size = 0;
							 else{
								 hexRadius = d3.min([somwidth/((MapColumns + 0.5) * Math.sqrt(3)), somheight/((MapRows + 1/3) * 1.5)]);
								 eq = hexRadius/4+2*Math.log(hit/mean);
								 if (eq<=0 && eq>-2)
								 return 0.5;			 
								 if(eq>0 && eq<20)
								 return eq;
								 if(eq>=20)
								 return 20;
								 if(eq<=-2 && hit!=0)
								 return 0;
								 if(hit==0)
								 return 10;					 
							 }					 
							return size;
						})
						.style("fill", color(thisd))
						.style("fill-opacity", 0.7);
				 }
			 }
	  })
	  .on("mouseout", function(thisd){
	  d3.select(this).style("fill-opacity","1").style("stroke","none");
	  d3.selectAll("."+ thisd).style("stroke","none");
	  d3.selectAll(".hits").remove();
	  });
 
  legend.append("text")
      .attr("x", somwidth - 86)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
	  

 });
 });
 
 function CreateSOMVis(parent, mrows, mcols, mwidth, mheight, orgdata, data,Component,id_label)  {
	//The maximum radius the hexagons can have to still fit the screen
	var hexRadius = d3.min([mwidth/((mcols + 0.5) * Math.sqrt(3)),
				mheight/((mrows + 1/3) * 1.5)]);

	//Set the new height and width of the SVG based on the max possible
	width = mcols*hexRadius*Math.sqrt(3);
	heigth = mrows*1.5*hexRadius+0.5*hexRadius;

	//Set the hexagon radius
	var hexbin = d3.hexbin()
				   .radius(hexRadius);


	//Calculate the center positions of each hexagon	
	var points = [];
	for (var i = 0; i < mrows; i++) {
		for (var j = 0; j < mcols; j++) {
			points.push([hexRadius * j * 1.75, hexRadius * i * 1.5]);
		}//for j
	}//for i 
	
	// function for drawing SOM hexagon nodes
	  // create tooltips if this main SOM view
	  if(id_label == "main"){
		 var somtip = d3.tip()
		  .attr('class', 'd3-tip')
		  .html(function(d,i) {
			return "<strong>Data Hits:</strong> <span style='color:red'>" + data[i].Label + "</span>";
		  });
		parent.call(somtip);
     }
	parent.append("g")
    .selectAll(".hexagon")
    .data(hexbin(points))
    .enter().append("path")
    .attr("class", "hexagon")
	.attr("id", function(d,i){
		return id_label+"_node_"+i;
	})
    .attr("d", function (d) {
		return "M" + d.x + "," + d.y + hexbin.hexagon();
	})
    .attr("stroke", function (d,i) {
		return "gray";
	})
    .attr("stroke-width", "1px")
    .style("fill", function (d,i) {
		return data[i][Component];
	})
	.on('mouseover', function(d,i){
	  
	  var id = d3.select(this).attr("id");
	  var nodeind = id.substr(id.indexOf("node_")+5);
			 
	  d3.selectAll("#main_node_"+nodeind).transition().duration(100).style("fill-opacity", 0.3).style("stroke","black");
	  d3.selectAll("#cps_node_"+nodeind).transition().duration(100).style("fill-opacity", 0.3).style("stroke","black");

	  $(".d3-tip").html("<strong>Data Hits:</strong> <span style='color:red; '>" + data[i].Label + "</span>")
	  .css("opacity",1)
      .css("left", (d.x)+"px")
	  .css("top", (d.y+margin.top*2.5)+"px");
	  //highlight the linked data
	  var labeltext = data[i].DataLabel
	  var regExp = /\(([^)]+)\)/g;
      var match = regExp.exec(labeltext);
	  var matches = [];
	  count = 0;
	  while (match !=null && count<500
	  ){

	      //console.log(match);
	     //matches.push(parseInt(match[1]));
		 var ind = parseInt(match[1])-1;
		 var cx = orgdata[ind].pca_X;
		 var cy = orgdata[ind].pca_Y;
		 var classinfo = orgdata[ind].CO2_001;
		 //console.log(classinfo);
		 d3.select("#scattergroup").append("circle")
		 .attr("class","selected"+classinfo)
		 .attr("cx", x(cx))
		 .attr("cy", y(cy))
		 .attr("r", 2)
		 .style("stroke","none")
		 .style("fill-opacity", 0.5)
		 .style("fill", classinfo)
		 match = regExp.exec(labeltext);
		 count = count + 1;
		 
		 
		
	  }
  
	  d3.selectAll(".selectedred").moveToFront();
	
	})
    .on('mouseout', function(d,i){
	   var id = d3.select(this).attr("id");
	   var nodeind = id.substr(id.indexOf("node_")+5);
	   d3.selectAll("#main_node_"+nodeind).transition().duration(10).style("fill-opacity", 1).style("stroke","gray");
	   d3.selectAll("#cps_node_"+nodeind).transition().duration(10).style("fill-opacity", 1).style("stroke","gray");
	   $(".d3-tip").css("opacity",0);
	   d3.selectAll(".selectedred").remove();
	   d3.selectAll(".selectedblue").remove();
  
	});
	
	return hexbin(points);

 }    
 
  // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}