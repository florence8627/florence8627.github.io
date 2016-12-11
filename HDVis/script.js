	var selectedVariable = ["","",""];
  var IsRotating = false;

function LoadFiles(files) {
		var file = files[0];

		if (file.type.match("text/csv")||file.type.match("application/vnd.ms-excel")) {
		     reader = new FileReader();
		     reader.onload = (function (file){
		   
		   return function(e){
		 
		     var csvRows = e.target.result.split("\n");
		     for (var i=0; i<csvRows.length;i++){
		     	var rowstr = "<tr>";
		     	var csvCols = csvRows[i].split(",");
		     	for(var j = 0; j<csvCols.length; j++){
                    if(i==0)
                    {
                     rowstr = rowstr + "<td> <input type='checkbox' class='box' id='"+csvCols[j].replace(/\s/g, '')+"' onclick = PickVariable(this.id,'"+file.name+"')></br>"+csvCols[j].replace(/\s/g, '')+"</td>";
                    }
                    else{
                     rowstr = rowstr + "<td>"+csvCols[j].replace(/\s/g, '')+"</td>";
                    }

		     	}
		     	rowstr = rowstr + "</tr>";
		     	$("#csvtable").append(rowstr);
		     	$("#loadedcsvfile").css("visibility","visible");         
          $("#loadedcsvfile").css("left","30px").css("bottom","20px");

		     }
		    
		    
		  }
		   })(file);
		  reader.readAsText(file,"utf-8");  
		  

		}
		else {
		   alert("File type not supported!");  
		 }

	}
function PickVariable(id,filename){

     // console.log(selectedVariable.length);
    	if(selectedVariable.length<=3){
    		selectedVariable.push(id);         

    	}
    	if(selectedVariable.length == 3){
    	  //console.log("data/"+filename);
          renderViz("data/"+filename,selectedVariable[0],selectedVariable[1],selectedVariable[2]);

        }
        if(selectedVariable.length>3){
          selectedVariable = [];
          $(".box").attr("checked",false);

          //remove all the objects in the scene
          for( var i = scene_scatterplot.children.length - 1; i >= 0; i--){
            obj = scene_scatterplot.children[i];
            if (obj.name == "scatter")
               scene_scatterplot.remove(obj);

          }
                   
          
        }
     
     // console.log(selectedVariable);
      $("#variable").html("<span style='color:red'>Variable X: &nbsp;" + selectedVariable[0] + "</span><br>"+"<span style='color:green'>Variable Y: &nbsp;" + selectedVariable[1] + "</span><br>"+"<span style='color:white'>Variable Z: &nbsp;" + selectedVariable[2] + "</span><br>");

}


function makeTextSprite( message, parameters ){
  if ( parameters === undefined ) parameters = {};
  
  var fontface = parameters.hasOwnProperty("fontface") ? 
    parameters["fontface"] : "Arial";
  
  var fontsize = parameters.hasOwnProperty("fontsize") ? 
    parameters["fontsize"] : 10;
  
  var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
    parameters["borderThickness"] : 4;
  
  var borderColor = parameters.hasOwnProperty("borderColor") ?
    parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
  
  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

  //var spriteAlignment = THREE.SpriteAlignment.topLeft;
    
  var canvas = document.createElement('canvas');


  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;
    
  // get size data (height depends only on font size)
  var metrics = context.measureText( message );
  var textWidth = metrics.width;
  
  // background color
  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                  + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                  + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.
  
  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);
  
  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas) 
  texture.needsUpdate = true;
  texture.minFilter = THREE.LinearFilter;

  var spriteMaterial = new THREE.SpriteMaterial( 
    { map: texture} );
  var sprite = new THREE.Sprite( spriteMaterial );
  //sprite.scale.set(100,50,1.0);
  return sprite;  
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
}


// from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) { 
//TODO rewrite with vector output
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
      } : null;
    }

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

$( document ).ready(function(){
	    $("#loadedcsvfile").draggable();
  	  $("#loadedcsvfile").draggable('disable');
	    $("#csvtitle").mouseover(function(){$("#loadedcsvfile").draggable("enable");});
	    $("#csvtitle").mouseout(function(){$("#loadedcsvfile").draggable("disable");});
        renderViz("data/runs8-test.csv","x","y","z");
        createGUI();

   }); 


    // one renderer

    var renderer_scatterplot = new THREE.WebGLRenderer();
    var element = renderer_scatterplot.domElement;
    var container = document.getElementById('3dscatterplot');
        container.appendChild(element);
    
    
    // effect = new THREE.StereoEffect(renderer_scatterplot);
    // effect.separation = 3;
    // effect.focalLength = 15;
    


   // renderer_scatterplot.setClearColor(0x000000, 1.0);
   // one scene
   var scene_scatterplot = new THREE.Scene();
    
   
   var camera_scatterplot = new THREE.PerspectiveCamera(90, window.innerWidth/ window.innerHeight, 0.001, 1000);
       camera_scatterplot.position.set(0,15,0);
   //camera_scatterplot.position.z = 200;

   scene_scatterplot.add(camera_scatterplot);

  
   var camcontrols = new THREE.OrbitControls(camera_scatterplot, element);
       camcontrols.noPan = false;
       camcontrols.noZoom = false;
        element.addEventListener('click', fullscreen, false);
   var light = new THREE.PointLight(0xffffff, 1, 1000);
       light.position.set(0,50,0);
       scene_scatterplot.add(light);

//leap camera control - trial
   var  cameraControls = new THREE.LeapCameraControls(camera_scatterplot);

        cameraControls.rotateEnabled  = false;
        cameraControls.rotateSpeed    = 3;
        cameraControls.rotateHands    = 1;
        cameraControls.rotateFingers  = [2, 3];
        
        cameraControls.zoomEnabled    = true;
        cameraControls.zoomSpeed      = 6;
        cameraControls.zoomHands      = 1;
        cameraControls.zoomFingers    = [4, 5];
        cameraControls.zoomMin        = 50;
        cameraControls.zoomMax        = 2000;
        
        cameraControls.panEnabled     = true;
        cameraControls.panSpeed       = 2;
        cameraControls.panHands       = 2;
        cameraControls.panFingers     = [6, 12];
        cameraControls.panRightHanded = false; // for left-handed person

function resize() {

        var width = window.innerWidth;
        var height = window.innerHeight;

        camera_scatterplot.aspect = width / height;
        camera_scatterplot.updateProjectionMatrix();

        renderer_scatterplot.setSize(width, height);
        if(typeof effect !=='undefined'){
          effect.setSize(width, height);
        }
      

      }

function fullscreen() {
        
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      }

   //two plots one for original data points one for SOM

    
 

function v(x, y, z) {
        return new THREE.Vector3(x, y, z);
      }
   

function createGUI(){

   //GUI-widget from Dat-gui
      var gui = new dat.GUI();
      var viscontrol = gui.addFolder('3D Visualisation');
      var stereocontrol = gui.addFolder('Stereo Effect');
      var vrcontrol = gui.addFolder('VR Effect');
      var loaddata = gui.addFolder("Load Data");
      var loadcsv
        // setup the control gui
        var controls = new function () {
        //     // we need the first child, since it's a multimaterial
             
               this.Rotation = false;
               this.Stereo = false;
               this.ParallaxBarrier = false;
               this.EyeSeperation = 3;
               this.FocalLength = 15;
               this.WebVR = false;

            this.EnableRotate = function () {
                  IsRotating = !IsRotating;
          
             };

            
            this.EnableStereo = function(){
             if(controls.Stereo){
                 effect = new THREE.StereoEffect(renderer_scatterplot);
                 effect.separation = 3;
                 effect.focalLength = 15;
             }
             else{
              delete effect
             }

             }

             this.ChangeEyeSeperation = function(){
              if(!controls.ParallaxBarrier && typeof effect !== 'undefined'){
        
               effect.separation = controls.EyeSeperation;
              // effect.render(scene_scatterplot,camera_scatterplot);
               }
             };
             this.ChangefocalLength = function(){
              if(!controls.ParallaxBarrier && typeof effect !== 'undefined'){
        
               effect.focalLength = controls.FocalLength;
               //effect.render(scene_scatterplot,camera_scatterplot);
               }
             };
             this.EnableParallax = function(){
              if(controls.ParallaxBarrier){
               fullscreen();
               effect = new THREE.ParallaxBarrierEffect(renderer_scatterplot);
                
             
              }
              else{
               
               delete effect
              
              
              }

             };

            this.EnableVR = function(){
              if(controls.WebVR){
                    dummy = new THREE.Camera();
                    dummy.position.set(0,13,0);
                    dummy.lookAt(scene_scatterplot.position);
                    scene_scatterplot.add(dummy);
                    dummy.add(camera_scatterplot)
                  camcontrols = new THREE.VRControls(camera_scatterplot);
                  effect = new THREE.VREffect(renderer_scatterplot);
                if ( WEBVR.isAvailable() === true ) {

                  document.body.appendChild( WEBVR.getButton( effect ) );
            
                 }

              }
              else{
               
                
                 location.reload();
              }

             }


         };
       

           viscontrol.add(controls, 'Rotation').onChange(controls.EnableRotate);         
           stereocontrol.add(controls, 'Stereo').onChange(controls.EnableStereo);
           stereocontrol.add(controls, 'EyeSeperation',-50,50).onChange(controls.ChangeEyeSeperation);
           stereocontrol.add(controls, 'FocalLength',-20,20).onChange(controls.ChangefocalLength);
           stereocontrol.add(controls, 'ParallaxBarrier').onChange(controls.EnableParallax);
         
           vrcontrol.add(controls, 'WebVR').onChange(controls.EnableVR);
          
           var params = {
            loadFile: function(){
              $("#fileinput").click();
               }
            };
           loadcsv = loaddata.add(params, 'loadFile').name('Load CSV');
         
}

 function renderViz(filename, variableX, variableY, variableZ){
 	  var dataPoints = [];
    var prototypeV = [];
    var format = d3.format("+.3f");
    var scatterPlot = new THREE.Object3D();
    scatterPlot.name = "scatter";
   

    d3.csv(filename, function (irisd) {


         var color =[]; 
               
        irisd.forEach(function (d,i) {
            dataPoints[i] = {
                x: parseFloat(d[variableX]),
                y: parseFloat(d[variableY]),
                z: parseFloat(d[variableZ]),
               
            };
            
        });

    console.log(dataPoints);
   
    var xExent = d3.extent(dataPoints, function (d) {return d.x; }),
        yExent = d3.extent(dataPoints, function (d) {return d.y; }),
        zExent = d3.extent(dataPoints, function (d) {return d.z; });

   

    var vpts = {
        xMax: xExent[1],
        xCen: (xExent[1] + xExent[0]) / 2,
        xMin: xExent[0],
        yMax: yExent[1],
        yCen: (yExent[1] + yExent[0]) / 2,
        yMin: yExent[0],
        zMax: zExent[1],
        zCen: (zExent[1] + zExent[0]) / 2,
        zMin: zExent[0]
    }

    
    var xScale = d3.scale.linear()
                  .domain(xExent)
                  .range([-5,5]);
    var yScale = d3.scale.linear()
                  .domain(yExent)
                  .range([-5,5]);                  
    var zScale = d3.scale.linear()
                  .domain(zExent)
                  .range([-5,5]);

    var lineBoxGeo = new THREE.Geometry();
    lineBoxGeo.vertices.push(
        

         v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
         v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
         v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)),
         v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)),

         v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)),
         v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
         v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
         v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)),

         v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)),
         v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
         v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
         v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
         v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
         v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax))

  
    );
    var lineMat = new THREE.LineBasicMaterial({
        color: 0xEEEEEE,
        linewidth: 1,
        opacity:0.2,
        transparent:true
    });
    var linebox = new THREE.Line(lineBoxGeo, lineMat);
    linebox.type = THREE.Lines;
    scatterPlot.add(linebox);



    var texture1 = new THREE.TextureLoader().load("texture/disc.png");
    texture1.minFilter = THREE.LinearFilter;
    var texture2 = new THREE.TextureLoader().load("texture/ball.png")
    texture2.minFilter = THREE.LinearFilter;
    var material1 = new THREE.PointsMaterial({
        size:0.45,
        map:texture2,
        vertexColors: THREE.VertexColors, 
        alphaTest: 0.5,
        opacity:1,
        transparent: true
    

    });
   var material2 = new THREE.PointsMaterial({
        size:0.25,
        map:texture2,
        vertexColors: THREE.VertexColors, 
        alphaTest: 0.5,
        opacity:0.7,
        transparent: true
    

    });



    var pointGeo = new THREE.Geometry();
    for (var i = 0; i <dataPoints.length; i++) {
        var x = xScale(dataPoints[i].x);
        var y = yScale(dataPoints[i].y);
        var z = zScale(dataPoints[i].z);
       
        //prototypeV[bmus-1]['prototype15'].Color;
        pointGeo.vertices.push(new THREE.Vector3(x, y, z));
       
        // //Color based on class #
        // if(i<50){
        // pointGeo.colors.push(new THREE.Color().setRGB(1,0,0));
        // }
        // if(i>=50&&i<100){
        // pointGeo.colors.push(new THREE.Color().setRGB(0,1,0));
        // }
        // if(i>=100&&i<150){
        // pointGeo.colors.push(new THREE.Color().setRGB(0,0,1));
        //  }


         pointGeo.colors.push(new THREE.Color().setRGB(1,1,0));

    }

        var points = new THREE.Points(pointGeo, material2);
     
        points.name = "points"
        scatterPlot.add(points);
        var axes = new THREE.AxisHelper(2);
        scatterPlot.add(axes);
      
        scene_scatterplot.add(scatterPlot);
        scatterPlot.rotation.y = Math.PI;
       
 
        
         var clock = new THREE.Clock();
         animate();


      
  
    var current = new Date().getTime();

// ADD LEAP MOTION

  //rays
  var rayCasterManager = new RayCasterManager();

  var rayMaterial = new  THREE.LineBasicMaterial({

    color:0xff0000,
    transparent: true,
    opacity:0.5
  });

  var rayDistance = 1000;
  var isPointing = false;
  var isHit = false;
  
  // Connect to localhost and start getting frames
  var controller = Leap.loop({enableGestures:true}, function(frame){
    //console.log(frame);
    if( frame.hands.length>1&&frame.hands[0].middleFinger.extended&&frame.hands[0].indexFinger.extended){

            // console.log(frame.hands[0].palmVelocity);
            // console.log(frame.hands[1].palmVelocity);

            if(Math.abs(frame.hands[0].palmVelocity[2])>100||Math.abs(frame.hands[1].palmVelocity[2])>100){
              scatterPlot.rotation.z += (frame.hands[0].roll()+frame.hands[1].roll())/15;
              }
            
             if(frame.hands[0].palmVelocity[1]>200 && frame.hands[1].palmVelocity[1]>200){
              scatterPlot.position.y +=0.5;
              }
             if(frame.hands[0].palmVelocity[1]<-200 && frame.hands[1].palmVelocity[1]<-200){
              scatterPlot.position.y -=0.5;
              }
            }

    renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
   
              
    $("#pointresult").css("background-color","black");
    
    rayCasterManager.removeAllRays(scene_scatterplot);
    $("#pointresult").html("");

    for (var i = 0; i<pointGeo.colors.length; i++){
      pointGeo.colors[i] = new THREE.Color().setRGB(1,1,0);
     }

    for( var i = scene_scatterplot.children.length - 1; i >= 0; i--){
        obj = scene_scatterplot.children[i];
        if (obj.name == "label"||obj.name=="rayline")
           scene_scatterplot.remove(obj);

     }
    scene_scatterplot.updateMatrixWorld();
    

    // for(var i = 0; i<frame.fingers.length; i++){
    //   var finger = frame.fingers[i];
    //   if((finger.type!==1 && finger.extended == true) || (finger.type==1 && finger.extended == false)){
    //     isPointing = false;
    //   }
    //   else{
    //     isPointing = true;
    //   }

    // }

    if(frame.valid && frame.gestures.length > 0){
    frame.gestures.forEach(function(gesture){
        switch (gesture.type){
          case "circle":
              console.log("Circle Gesture");
              isPointing = true;
              break;
          case "keyTap":
              console.log("Key Tap Gesture");
              isPointing = false;
              break;

          case "screenTap":
              console.log("Screen Tap Gesture");
              isPointing = false;
              break;
          case "swipe":
              console.log("Swipe Gesture");
              isPointing = false;
              break;
        }
    });
  }

    if(isPointing){
      var hand;
      for (var i = 0; i < frame.hands.length; i++){

        hand = frame.hands[i];

        rayCasterManager.createRayCasterByFinger(hand.type+i+'index', hand.indexFinger, rayDistance, rayMaterial, scene_scatterplot);
        

       }
      for ( var rayName in rayCasterManager.rays){
          

          var ray_caster = rayCasterManager.rays[rayName];
          var intersect = ray_caster.intersectObject(points)[0];
         

          if (intersect){
           // console.log(intersect);      
            isHit = true ;

          }

          if(isHit == true && typeof intersect !== 'undefined'){
           
            var positiondata = pointGeo.vertices[intersect.index];
            var hitdata = dataPoints[intersect.index]

            // var geometry = new THREE.Geometry();
             var tip_pos = new THREE.Vector3().fromArray(hand.indexFinger.tipPosition);
            // var data_pos = new THREE.Vector3((-1)*positiondata.x, positiondata.y, (-1)*positiondata.z);
            // geometry.vertices.push(tip_pos,data_pos);
            // var rayline = new THREE.Line(geometry,rayMaterial);
            // rayline.name = "rayline";
            // var text = selectedVariable[0]+":"+hitdata.x.toPrecision(2) +","+selectedVariable[1]+":"+hitdata.y.toPrecision(2)+","+selectedVariable[2]+":"+hitdata.z.toPrecision(2)
            var text = "X: "+hitdata.x.toPrecision(2) +", Y: "+hitdata.y.toPrecision(2)+", Z: "+hitdata.z.toPrecision(2)
            $("#pointresult").html("x:&nbsp;"+hitdata.x.toPrecision(2)+"&nbsp;y:&nbsp;"+hitdata.y.toPrecision(2)+"&nbsp;z:&nbsp;"+hitdata.z.toPrecision(2));
              var spritey = makeTextSprite( text, { fontsize: 12, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:1.0} } );
              spritey.name = "label";
              spritey.position.set((-0.2)*positiondata.x,10,(-0.1)*positiondata.z);
             
             
             //spritey.position.set((-0.5)*tip_pos.x,tip_pos.y,(-0.5)*tip_pos.z);
             
              spritey.scale.set(5,5,5);
             scene_scatterplot.add( spritey );
             //scene_scatterplot.add(rayline);
             pointGeo.colors[intersect.index] = new THREE.Color().setRGB(1,0,0);
             pointGeo.colorsNeedUpdate = true;
            
          } 

        }
    }
    
  })
 .use('transform', {
    // This matrix flips the x, y, and z axis, scales to meters, and offsets the hands by -8cm.
    vr: true,
    effectiveParent: camera_scatterplot

  })
 .use('boneHand', {
    targetEl: element,
    arm: true,
    scene: scene_scatterplot,
    opacity: 0.5

  });


  function updatePosition(rotation){

     
        var rotationDegree = 0;

        if(rotation){
            rotationDegree = 0.001;        
          }
         scatterPlot.rotation.z+=rotationDegree;

        if(typeof effect !== 'undefined'){
           effect.render(scene_scatterplot, camera_scatterplot);
           
          }
         else{
           renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
           
          }
          
        
    };
   
  function animate() {

     
         updatePosition(IsRotating);
         resize();
         camera_scatterplot.updateProjectionMatrix();

         camcontrols.update(clock.getDelta());
         if(typeof effect !== 'undefined'){
             effect.render(scene_scatterplot, camera_scatterplot);
             
          }
          else{
             renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
             
          }
        
          window.requestAnimationFrame(animate);
    };



  });// end reading data csv
    

} //end of renderVisualisation();

