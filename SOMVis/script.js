
//////////////////////////////////////////////////////
////////////// Load pattern files ////////////////////
//////////////////////////////////////////////////////

$(document).ready(function(){

$("#loadbutton").click(function(e){$("#outputfileinput").trigger("click");});

});
function LoadOutputFiles(files) {
var file = files[0];

if (file.type.match("text/csv")||file.type.match("application/vnd.ms-excel")) {
     reader = new FileReader();
     reader.onload = (function (file){
   
   return function(e){
 
   
     var csvRows = e.target.result.split("\n");
    
     console.log(csvRows);
     var color = [];
     for (var i=1;i<csvRows.length-1;i++){
       color[i-1] = csvRows[i];
      } //end for
      MapRows = parseInt(document.getElementById("RowInput").value);
      MapColumns = parseInt(document.getElementById("ColInput").value);
      DrawMap(MapColumns, MapRows, color,false);
      //make the control visible

      document.getElementById("description").style.visibility = "visible";
      document.getElementById("control").style.visibility = "visible";
      alert("successfully loaded!");
      console.log(color);
    
  }
   })(file);
  reader.readAsText(file,"utf-8");  
  

}
else {
   alert("File type not supported!");  
 }

}





///////////////////////////////////////////////////////////////////////////
////////////// Initiate SVG and create hexagon centers ////////////////////
///////////////////////////////////////////////////////////////////////////

//Function to call when you mouseover a node
function mover(d) {
  var el = d3.select(this)
		.transition()
		.duration(10)		  
		.style("fill-opacity", 0.3)
		;
}

//Mouseout function
function mout(d) { 
	var el = d3.select(this)
	   .transition()
	   .duration(1000)
	   .style("fill-opacity", 1)
	   ;
};


//The next lines should be run, but this seems to go wrong on the first load in bl.ocks.org
//var width = $(window).width() - margin.left - margin.right - 40;
//var height = $(window).height() - margin.top - margin.bottom - 80;
//So I set it fixed to
var width = 400;
var height = 500;
//svg sizes and margins
var margin = { top: 20, right: 280, bottom: 0, left: 60 };

///////////////////////////////////////////////////////////
////////////////////// Handle clicks///////////////////////
///////////////////////////////////////////////////////////

//The number of columns and rows of the heatmap
var MapColumns = 15;
var MapRows = 30;
var color = [];

function handleClick(event){
  // console.log(document.getElementById("RowInput").value);
  // console.log(document.getElementById("ColInput").value);
  MapRows = parseInt(document.getElementById("RowInput").value);
  MapColumns = parseInt(document.getElementById("ColInput").value);
  //initialize color array based on # of columns and # of rows
  for(var i = 0; i<MapRows*MapColumns; i++){
  color[i] = '#EEEEEE';
  }

  DrawMap(MapColumns, MapRows, color,true);

  //Making the control buttons visible
  document.getElementById("control").style.visibility = "visible";

}


	
//////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Draw hexagons and color them with color data///////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
function DrawMap(MapColumns, MapRows, color, drawflag) {
  //clear previous svg
  d3.selectAll("#map").remove();

  //The maximum radius the hexagons can have to still fit the screen
  var hexRadius = d3.min([width/((MapColumns + 0.5) * Math.sqrt(3)),
  			height/((MapRows + 1/3) * 1.5)]);

  //Set the new height and width of the SVG based on the max possible
  width = MapColumns*hexRadius*Math.sqrt(3);
  heigth = MapRows*1.5*hexRadius+0.5*hexRadius;


  //Set the hexagon radius
  var hexbin = d3.hexbin()
      	       .radius(hexRadius);

  //Calculate the center positions of each hexagon	
  var points = [];
  for (var i = 0; i < MapRows; i++) {
      for (var j = 0; j < MapColumns; j++) {
          points.push([hexRadius * j * 1.75, hexRadius * i * 1.5]);
      }//for j
  }//for i

  //Create SVG element
  var svg = d3.selectAll("#chart").append("svg").attr("id","map")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // console.log(color)
  //Start drawing the hexagons
  svg.append("g")
      .selectAll(".hexagon")
      .data(hexbin(points))
      .enter().append("path")
      .attr("class", "hexagon")
      .attr("id", function (d,i) {return ("node_" + i)})
      .attr("d", function (d) {
  		return "M" + d.x + "," + d.y + hexbin.hexagon();
  	  })
      .attr("stroke", function (d,i) {
  		return "gray";
    	})
      .style("fill", function (d,i) {
      return color[i];
      })
      .attr("stroke-width", "1px")
  	  .on("mouseover", mover)
    	.on("mouseout", mout)
      .on("click", function(d,i){
       if(drawflag){
        d3.select(this).style("fill","#000000");
        var thisid = parseInt(d3.select(this).attr("id").substr(5));
        //console.log(thisid);
        color[thisid] = '#000000';
       }

        })
      .on("contextmenu", function(d,i){
        d3.event.preventDefault();
        if(drawflag){
        d3.select(this).style("fill","#EEEEEE");
        var thisid = parseInt(d3.select(this).attr("id").substr(5));
        //console.log(thisid);
        color[thisid] = '#EEEEEE';
       }

      });
      
  //for repition pattern change the edge to red
  d3.select(".centerchart").selectAll(".hexagon").style("stroke","red");
   

  // panning control for reflow interaction

  d3.select("#leftpan").on("click", function(){
     ShiftOneColLeft(color,MapRows,MapColumns);
      for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }

    
  });

  d3.select("#rightpan").on("click", function(){ 
     ShiftOneColRight(color,MapRows,MapColumns);
      for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }

  });

  d3.select("#uppan").on("click", function(){
    color = ShiftTwoRowToEnd(color, MapRows, 2*MapColumns);
    
    for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }
    
      
  });

  d3.select("#downpan").on("click", function(){
    color = ShiftTwoRowToFront(color, MapRows, 2*MapColumns);
    
    for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }
     
  });

  d3.select("#upright").on("click", function(){
    color = ShiftOneRowUpRight(color, MapRows, MapColumns);
    
    for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }
     
  });

  d3.select("#upleft").on("click", function(){
    color = ShiftOneRowUpLeft(color, MapRows, MapColumns);
    
    for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }
     
  });

  d3.select("#downright").on("click", function(){
    color = ShiftOneRowDownRight(color, MapRows, MapColumns);
    
    for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }
     
  });

  d3.select("#downleft").on("click", function(){
    color = ShiftOneRowDownLeft(color, MapRows, MapColumns);
    
    for (var i = 0; i<color.length;i++){
      d3.select("#node_"+i).style("fill",color[i]);
    }
     
  });

}

// creating hotkeys with jquery
$(document).ready(function(){
  //hotkeys for image  panel
 
  $(document).bind('keydown','t',function(){$("#uppan").trigger("click");});
  $(document).bind('keydown','g',function(){$("#downpan").trigger("click");}); 
  $(document).bind('keydown','f',function(){$("#leftpan").trigger("click");});
  $(document).bind('keydown','h',function(){$("#rightpan").trigger("click");});
  $(document).bind('keydown','r',function(){$("#upleft").trigger("click");});
  $(document).bind('keydown','y',function(){$("#upright").trigger("click");});
  $(document).bind('keydown','v', function(){$("#downleft").trigger("click");});
  $(document).bind('keydown','b', function(){$("#downright").trigger("click");});
});
// $(document).keydown(function(e) {
//     switch(e.which) {
//         case 37: // left
//         $("#leftpan").trigger("click");
//         break;

//         case 39: // right
//         $("#rightpan").trigger("click");
//         break;

//         case 38: // up
//         $("#uppan").trigger("click");
//         break;       

//         case 40: // down
//         $("#downpan").trigger("click");
//         break;

//         default: return; // exit this handler for other keys
//     }
//     e.preventDefault(); // prevent the default action (scroll / move caret)
// });


///////////////////////////////////////////////////////////////////////////
////////////////////// Functions for panning the Map ///////////////////////
///////////////////////////////////////////////////////////////////////////

function ShiftOneColRight(OrgArray,Nrow,Ncol){
 for (var i = 0; i<Nrow; i++){
    var elementMV = OrgArray.splice((i+1)*Ncol-1, 1);
    OrgArray.splice(i*Ncol, 0 , elementMV[0]);
  }

  return OrgArray;
  
}

function ShiftOneColLeft(OrgArray,Nrow,Ncol){
  for (var i = 0; i<Nrow; i++){
    var elementMV = OrgArray.splice(i*Ncol,1);
    OrgArray.splice((i+1)*Ncol-1,0,elementMV[0]);
  }  

  return OrgArray;  
}

function ShiftTwoRowToEnd(OrgArray,Nrow,Ncol){
    var newArray = [];
   
    var front = OrgArray.splice(0,Ncol);
    newArray = OrgArray.concat(front);
   
    return newArray;
}

function ShiftTwoRowToFront(OrgArray,Nrow,Ncol){
    var newArray = [];
    var end = OrgArray.splice(OrgArray.length-Ncol, OrgArray.length);
    newArray = end.concat(OrgArray);
   

    return newArray;
}

function ShiftOneRowUpRight(OrgArray,Nrow,Ncol){
 var newArray = [];
    //shift everything down by one row
    var front = OrgArray.splice(0,Ncol);
    newArray = OrgArray.concat(front);
    //if the row is even, shift the odd row left
    for (var i=0; i<Nrow; i=i+2){
    var elementMV = newArray.splice((i+1)*Ncol-1, 1);
    newArray.splice(i*Ncol, 0 , elementMV[0]);
    }
   
    return newArray; 
}

function ShiftOneRowUpLeft(OrgArray,Nrow,Ncol){
 var newArray = [];
    //shift everything down by one row
    var front = OrgArray.splice(0,Ncol);
    newArray = OrgArray.concat(front);
    //if the row is even, shift the even row right
    for (var i=1; i<Nrow; i=i+2){
    var elementMV = newArray.splice(i*Ncol,1);
    newArray.splice((i+1)*Ncol-1,0,elementMV[0]);
    }
   
    return newArray; 
}

function ShiftOneRowDownRight(OrgArray,Nrow,Ncol){
  var newArray = [];
    var end = OrgArray.splice(OrgArray.length-Ncol, OrgArray.length);
    newArray = end.concat(OrgArray);
   //if the row is even, shift the odd row left
    for (var i=0; i<Nrow; i=i+2){
    var elementMV = newArray.splice((i+1)*Ncol-1, 1);
    newArray.splice(i*Ncol, 0 , elementMV[0]);
    }

    return newArray;

}

function ShiftOneRowDownLeft(OrgArray,Nrow,Ncol){
    var newArray = [];
    var end = OrgArray.splice(OrgArray.length-Ncol, OrgArray.length);
    newArray = end.concat(OrgArray);
   //if the row is even, shift the even row right
    for (var i=1; i<Nrow; i=i+2){
    var elementMV = newArray.splice(i*Ncol,1);
    newArray.splice((i+1)*Ncol-1,0,elementMV[0]);
    }

    return newArray;

}

///////////////////////////////////////////////////////////////////////////
////////////////////// Saving Color data as CSV ///////////////////////////
///////////////////////////////////////////////////////////////////////////
function SaveAsCSV(){

  var currentdate = new Date();
  var blob; 
  var filename; 

    var TableStr = "Color \r\n";
    for (var i = 0; i<color.length; i++){
      TableStr =TableStr+color[i]+"\n";
      console.log(color[i]);
    }
    blob = new Blob( [TableStr], {type : "text/csv;charset=utf-8"}); 
    filename = "patterncolor-" + currentdate.getHours()+currentdate.getMinutes()+currentdate.getSeconds()+".csv";
    saveAs(blob,filename);
  

}

