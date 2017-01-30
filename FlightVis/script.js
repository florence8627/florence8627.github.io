//Global variables related to generating the keywordGraph
var color = d3.scale.category20c().domain(d3.range(20));
var SelectedCountries = [];
$(function() {
  //$("#countrycontrol").css("visibility","hidden");
//make panel draggable	
    // $("#flightsSec").draggable();
	// $("#flightsSec").draggable('disable');
    // $("#flightsTitle").mouseover(function(){$("#flightsSec").draggable('enable');});
	// $("#flightsTitle").mouseout(function(){$("#flightsSec").draggable('disable');});
	d3.csv("flights.csv", function(alldata){
	var data = alldata.map(function(d){return{from_city:d.from_city, from_country:d.from_country, to_city:d.to_city, to_country:d.to_country, airline: d.airline, airline_country: d.airline_country};});
	CreateFlightVis(data);
	}); 
});
// buttons on the title bar
$("#loadfile").click(function(){$("#flightfileinput").trigger("click");});
function LoadflightFiles(files){
var file = files[0];
reader = new FileReader();
var data = [];
// 0:from_airport 1:from_city 2:from_country 3:from_long 4:from_lat	5:to_airport 6:to_city 7:to_country	8:to_long 9:to_lat 10:airline 11:airline_country 12:distance		

reader.onload = (function (file){ 
					return function(e){
					var csvRows = e.target.result.split("\n");
					//console.log(csvRows);	
					
					for (var k=1;k<csvRows.length;k++) {	
							var csvCols =csvRows[k].split(",");	
							data[k-1]={from_city:csvCols[1],from_country: csvCols[2], to_city: csvCols[6],to_country: csvCols[7], airline:csvCols[10],airline_country:csvCols[11]};
							}
					
					 
					       CreateFlightVis(data);
					 
                           };					
								   })(file);
					
					reader.readAsText(file,"utf-8");
}

function CreateFlightVis(data){
d3.selectAll("svg").remove();
SelectedCountries = [];
$("#countrylist").unbind("change");
$("#compareoption").unbind("change");
// clear all the options in the country select
$('#countrylist').find('option').remove().end().append('<option value="-1" selected="selected">List of Countries</option>');

// all the country Names in the file
 var countryNames = data.map(function(d){return d.airline_country}).unique(); 
 countryNames.sort(d3.ascending);
 for (var i = 0; i<countryNames.length; i++){
  if(countryNames[i]!=0&&countryNames[i]!="15.475"&&countryNames[i]!="15.54"&& typeof countryNames[i] !="undefined"){
  $("#countrylist").append("<option value="+i+">"+countryNames[i]+"</option>"); 

   }
 }
 
 if(countryNames.length >=1){
 $("#countrycontrol").css("visibility","visible");
  }
 $("#countrylist").bind("change",function(){
   $( "#countrylist option:selected" ).each(function() {
	  SelectedName = $( this ).text() ;
	  SelectedCountries.push(SelectedName);
	   var option = parseInt($("#compareoption").val());
	  //console.log(SelectedName);
	  Flight2NodeLink(data,SelectedName,option);
	 });	  
 });
  $("#compareoption").bind("change",function(){
   $( "#compareoption option:selected" ).each(function() {
	   var option = parseInt($("#compareoption").val());
	   d3.selectAll("svg").remove();
	  //console.log(SelectedName);
	  for(var i = 0;i<SelectedCountries.length;i++){
	  Flight2NodeLink(data,SelectedCountries[i],option);
	  }
	 });
  
 });
}
function Flight2NodeLink(data,Name,CompareNum){
 //console.log(data);

 var airlineNames;
 var countryData;
 var airlineData=[];
 var domesticCities1=[];
 var domesticCities2=[];
 var domesticCities=[];
 var domesticflightsData=[];
 
 var internationalflightsData1 = [];
 var internationalflightsData2 = [];
 var internationalCities = [];
 var internationalCities1 = [];
 var internationalCities2 = [];
 
 var foreignIntflightsData = [];
 var foreignIntCities1 = [];
 var foreignIntCities2 = [];
 var foreignIntCities = [];
 
 var foreignDocflightsData = [];
 var foreignDocCities1 = [];
  var foreignDocCities2 = [];
 var foreignDocCities = [];

 countryData = data.filter(function(d) {return d.airline_country == Name});
 airlineNames = countryData.map(function(d){return d.airline}).unique();
 var airlineFlightsCountData = [];
 for (var i = 0; i<airlineNames.length; i++){
  airlineFlightsCountData[i]={name:airlineNames[i], count:countryData.filter(function(d){return d.airline==airlineNames[i];}).length};
 }
 var sortedairline = airlineFlightsCountData.sort(CompareAirlines);
 // change airlineNames to sorted names based on flight count
 airlineNames = sortedairline.map(function(d){return d.name;});
   for (var i = 0; i<airlineNames.length; i++){
  
   // get domestic flights inbound/outbound
   airlineData[i] = countryData.filter(function(d) {return d.airline == airlineNames[i];});
   domesticflightsData[i] = airlineData[i].filter(function(d){return (d.from_country == Name) && (d.to_country == Name);});
   domesticCities1[i] = domesticflightsData[i].map(function(d){return d.from_city;}).unique();
   domesticCities2[i] = domesticflightsData[i].map(function(d){return d.to_city;}).unique();
   domesticCities[i] = domesticCities1[i].concat(domesticCities2[i]).unique();
   domesticCities[i].sort(d3.ascending);
   // get international flights inbound
   internationalflightsData1[i] = airlineData[i].filter(function(d){return (d.from_country != Name) && (d.to_country == Name);});
   internationalCities1[i] = internationalflightsData1[i].map(function(d){return d.from_city;}).unique(); 
   // get international flights outbound
   internationalflightsData2[i] = airlineData[i].filter(function(d){return (d.from_country == Name) && (d.to_country != Name);});
   internationalCities2[i] = internationalflightsData2[i].map(function(d){return d.to_city;}).unique();
   
   internationalCities[i] = internationalCities1[i].concat(internationalCities2[i]).unique();
   internationalCities[i].sort(d3.ascending);
   // get foreign international
   foreignIntflightsData[i] = airlineData[i].filter(function(d){return (d.from_country != Name) && (d.to_country != Name) && (d.to_country != d.from_country);});
   foreignIntCities1[i] = foreignIntflightsData[i].map(function(d){return d.from_city;}).unique(); 
   foreignIntCities2[i] = foreignIntflightsData[i].map(function(d){return d.to_city;}).unique(); 
   foreignIntCities[i] = foreignIntCities1[i].concat(foreignIntCities2[i]).unique();
   foreignIntCities[i].sort(d3.ascending);
   // get foreign domestic
   foreignDocflightsData[i] = airlineData[i].filter(function(d){return (d.from_country != Name) && (d.to_country != Name) && (d.to_country == d.from_country);});
   foreignDocCities1[i] = foreignDocflightsData[i].map(function(d){return d.from_city;}).unique(); 
   foreignDocCities2[i] = foreignDocflightsData[i].map(function(d){return d.to_city;}).unique(); 
   foreignDocCities[i] = foreignDocCities1[i].concat(foreignDocCities2[i]).unique();
   foreignDocCities[i].sort(d3.ascending);
 }
  console.log(CompareNum);
 // render the layout
 var maxNum = CompareNum;
 if(airlineNames.length < CompareNum||CompareNum==-1){
    maxNum = airlineNames.length;
	 if(CompareNum==-1){
     CompareNum = airlineNames.length;
 }
	
 }
 var nodesize = 18;
 step = nodesize*3;
 var countrybarlength = CompareNum*step+30;

 var svgheight = countrybarlength+30;
 var svgwidth = 300;
 
 var svg = d3.select("#flightvisdiv").append("svg").attr("id",Name).attr("width",svgwidth).attr("height",svgheight);
 svg.append("line").attr("class", "axis").attr("x1", svgwidth/2).attr("y1", 20).attr("x2", svgwidth/2).attr("y2", svgheight-35);
 
 var cy = -10;
 var cx = svgwidth/2;
 svg.append("rect").attr("x",0).attr("y",0).attr("height",svgheight).attr("width",svgwidth).attr("class","background");
 svg.append("text").attr("id","countrytext_"+i).attr("class","countrytext").attr("x",svgwidth/2).attr("y",svgheight-10).text("Airlines of "+ Name).attr("text-anchor","middle");

 for (var i = 0; i<maxNum; i++){
     
	  cy = cy+step
	   // render foreign domestic
      fdradius = 30;
	  fdangle = 225;
	  foreignD_x = cx - 50;
	  fdangle_step = 90/(foreignDocCities[i].length+1);
	  var foreignDocCityCount = [];
      for (var j=0; j<foreignDocCities[i].length; j++) {
      foreignDocCityCount[j] = foreignDocflightsData[i].filter(function(d){return d.to_city==foreignDocCities[i][j] || d.from_city == foreignDocCities[i][j]}).length;
      }	  

      for (var j=0; j<foreignDocCities[i].length; j++) {
	   fdopacity = foreignDocCityCount[j]/airlineFlightsCountData[i].count*100;
	   interlines = svg.append("line").attr("class","cityline").attr("id","country_"+j).attr("x1",foreignD_x).attr("y1",cy)
																		   .attr("x2",function(d) { return foreignD_x+fdradius*Math.cos(fdangle*Math.PI/180); })
																		   .attr("y2",function(d) { return cy+ fdradius*Math.sin(fdangle*Math.PI/180); })
																		   .attr("opacity",fdopacity);
	   
	   fdangle = fdangle - fdangle_step;
	  }
	  if(foreignDocCities[i].length>0){
	  svg.append("line").attr("class","connectline").attr("x1",cx).attr("y1",cy).attr("x2",foreignD_x).attr("y2",cy).style("stroke", color(1));
	  svg.append("circle").attr("id","connectnode_"+i).attr("class","airlinenode").attr("cx",foreignD_x).attr("cy",cy ).attr("r",4).style("fill",color(1));
	  }
	  
	  // render domestic
	 dradius = 40;
	 dangle = 225;
	 dangle_step = 90/(domesticCities[i].length+1);
	 var domesticCityCount = [];
      for (var j=0; j<domesticCities[i].length; j++) {
      domesticCityCount[j] = domesticflightsData[i].filter(function(d){return d.to_city==domesticCities[i][j] || d.from_city == domesticCities[i][j]}).length;
      }	
	  for (var j=0; j<domesticCities[i].length; j++) { 
	   dopacity = domesticCityCount[j]/airlineFlightsCountData[i].count*100;
	   domesticlines = svg.append("line").attr("class","cityline").attr("id","city_"+j).attr("x1",cx-5).attr("y1",cy)
																		   .attr("x2",function(d) { return cx+ dradius*Math.cos(dangle*Math.PI/180); })
																		   .attr("y2",function(d) { return cy+ dradius*Math.sin(dangle*Math.PI/180); })
																		   .style("opacity",dopacity);
																	   
	   dangle = dangle - dangle_step;
	  }
	 
  // render foreign international
      firadius = 30;
	  fiangle = -45;
	  foreignI_x = cx + 50;
	  fiangle_step = 90/(foreignIntCities[i].length+1);
	  
	  var foreignIntCount = [];
      for (var j=0; j<foreignIntCities[i].length; j++) {
      foreignIntCount[j] = foreignIntflightsData[i].filter(function(d){return d.to_city==foreignIntCities[i][j] || d.from_city == foreignIntCities[i][j]}).length;
      }
      for (var j=0; j<foreignIntCities[i].length; j++) {
	   fiopacity = foreignIntCount[j]/airlineFlightsCountData[i].count*100;
	   interlines = svg.append("line").attr("class","cityline").attr("id","country_"+j).attr("x1",foreignI_x).attr("y1",cy)
																		   .attr("x2",function(d) { return foreignI_x+firadius*Math.cos(fiangle*Math.PI/180); })
																		   .attr("y2",function(d) { return cy+ firadius*Math.sin(fiangle*Math.PI/180); })
																		   .attr("opacity",fiopacity);
	   fiangle = fiangle + fiangle_step;
	  }
	  if(foreignIntCities[i].length>0){
	  svg.append("line").attr("class","connectline").attr("x1",cx).attr("y1",cy).attr("x2",foreignI_x).attr("y2",cy).style("stroke", color(1));
	  svg.append("circle").attr("id","connectnode_"+i).attr("class","airlinenode").attr("cx",foreignI_x).attr("cy",cy ).attr("r",4).style("fill",color(1));
	  }
 // render international
      iradius = 40;
	  iangle = -45;
	  iangle_step = 90/(internationalCities[i].length+1);
	  var internationalCount = [];
      for (var j=0; j<internationalCities[i].length; j++) {
      count1 = internationalflightsData1[i].filter(function(d){return d.from_city==internationalCities[i][j]}).length;
      count2 = internationalflightsData2[i].filter(function(d){return d.to_city==internationalCities[i][j]}).length;
	  internationalCount[j] = count1+count2;
	  //console.log(count1+","+count2);
      }
      for (var j=0; j<internationalCities[i].length; j++) {
	   iopacity = internationalCount[j]/airlineFlightsCountData[i].count*100;
	   interlines = svg.append("line").attr("class","cityline").attr("id","country_"+j).attr("x1",cx+5).attr("y1",cy)
																		   .attr("x2",function(d) { return cx+ iradius*Math.cos(iangle*Math.PI/180); })
																		   .attr("y2",function(d) { return cy+ iradius*Math.sin(iangle*Math.PI/180); })
																		   .attr("opacity",iopacity);
	   iangle = iangle + iangle_step;
	  }

// airline nodes
	 svg.append("circle").attr("id","air_"+i).attr("class","airlinenode").attr("cx",cx).attr("cy",cy ).attr("r",8).style("fill",color(1));
	 svg.append("text").attr("id","airtext_"+i).attr("class","nodetext").attr("x",cx).attr("y",cy+nodesize+7).text(airlineNames[i]).attr("text-anchor","middle");
     
 }


   
// DiseaseNames = data.map(function(d){return d.disease; }).unique();
 // for (var i =0;i<DiseaseNames.length;i++){
  // DiseaseData[i]=data.filter(function(d){return d.disease == DiseaseNames[i]});
 // // get different categories ...over here 3 categories synonym, species and symptom
  // //CategoryNames = DiseaseData[i].map(function(d){return d.category;}).unique();
   // CategoryNames = ["synonym", "sensible species", "clinical signs" ];
   // for (var j=0;j<CategoryNames.length;j++){
    // CategoryData[j]=DiseaseData[i].filter(function(d){return d.category== CategoryNames[j]});
	// if (CategoryData[j].length>MaxNodeNum){
	   // MaxNodeNum = CategoryData[j].length;
	  // }
	// }
 // }




/* svg.selectAll(".link")
    .data(links)
  .enter().append("path")
    .attr("class", "link")
    .attr("d", d3.hive.link().angle(function(d) { return angle(d.x); }).radius(function(d) { return radius(d.y); })) */
    
}


// find unique elements in an array
Array.prototype.unique = function()
{
	var n = {},r=[];
	for(var i = 0; i < this.length; i++) 
	{
		if (!n[this[i]]) 
		{
			n[this[i]] = true; 
			r.push(this[i]); 
		}
	}
	return r;
}

function CompareAirlines(a,b){

  if (a.count < b.count)
     return 1;
  if (a.count > b.count)
    return -1;
  
  return 0;

}