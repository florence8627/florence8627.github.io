
    function createTextCanvas(text, color, font, size) {
        size = size || 13;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var fontStr = (size + 'px ') + (font || 'Arial');
        ctx.font = fontStr;
        var w = ctx.measureText(text).width;
        var h = Math.ceil(size);
        canvas.width = w;
        canvas.height = h;
        ctx.font = fontStr;
        ctx.fillStyle = color || 'white';
        ctx.fillText(text, 0, Math.ceil(size * 0.8));
        return canvas;
    }

    function createText2D(text, color, font, size, segW, segH) {
        var canvas = createTextCanvas(text, color, font, size);
        var plane = new THREE.PlaneBufferGeometry(canvas.width, canvas.height, segW, segH);
        var tex = new THREE.Texture(canvas);
        tex.needsUpdate = true;
        var planeMat = new THREE.MeshBasicMaterial({
            map: tex,
            color: 0xffffff,
            transparent: false,
            opacity:1
        });
        var mesh = new THREE.Mesh(plane, planeMat);
        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.doubleSided = true;
        return mesh;
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

      var spriteMaterial = new THREE.SpriteMaterial( 
        { map: texture, useScreenCoordinates: false } );
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
    function hexToRgb(hex) { //TODO rewrite with vector output
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


   

    // one renderer

    var renderer_scatterplot = new THREE.WebGLRenderer();
    var element = renderer_scatterplot.domElement;
    var container = document.getElementById('3dscatterplot');
        container.appendChild(element);
    
    
    // effect = new THREE.StereoEffect(renderer_scatterplot);
    // effect.separation = 3;
    // effect.focalLength = 15;
    


   
   // one scene
    var scene_scatterplot = new THREE.Scene();
    
    var camera_scatterplot = new THREE.PerspectiveCamera(90, window.innerWidth/ window.innerHeight, 0.001, 1000);
    camera_scatterplot.position.set(0,15,0);
    //camera_scatterplot.position.z = 200;

   scene_scatterplot.add(camera_scatterplot);

   //camera control with mouse
   var camcontrols = new THREE.OrbitControls(camera_scatterplot, element);
       camcontrols.noPan = false;
       camcontrols.noZoom = false;
       
    element.addEventListener('click', fullscreen, false);

   var light = new THREE.PointLight(0xffffff, 1, 1000);
   light.position.set(0,25,0);
   scene_scatterplot.add(light);




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

    var scatterPlot = new THREE.Object3D();
 

    function v(x, y, z) {
        return new THREE.Vector3(x, y, z);
    }

    var dataPoints = [];
    var prototypeV = [];
 

        

    var format = d3.format("+.3f");

    var data = d3.csv("data/Iris-pca-trainstep-lin.csv", function (irisd) {

        d3.csv("data/Color-all-iris-trainstep-lin.csv", function(somd){


         var color =[]; 
        

        
        irisd.forEach(function (d,i) {
            dataPoints[i] = {
                x: parseFloat(d.dataX),
                y: parseFloat(d.dataY),
                z: parseFloat(d.dataZ),
                bmus: parseInt(d.bmus15)
            };
            
        });

        somd.forEach(function(d,i) {
             prototypeV[i] = {};
             for (var j=0; j<=30; j++) {
              prototypeV[i]['prototype'+j]={
                x: parseFloat(d['prototypeX'+j]),
                y: parseFloat(d['prototypeY'+j]),
                z: parseFloat(d['prototypeZ'+j]),
                Color: d['Color'+j] 
               };
           
          }
          color[i] = d['Color50']

        });

     //  var height = window.innerHeight/4;
     //  var width = window.innerHeight/4;
  
     // DrawMap(6, 11, color,false,height,width);
   
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
        opacity:0.5,
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
        size:0.35,
        map:texture2,
        vertexColors: THREE.VertexColors, 
        alphaTest: 0.5,
        opacity:1,
        transparent: true
    

    });



    var pointGeo = new THREE.Geometry();
    for (var i = 0; i <dataPoints.length; i ++) {
        var x = xScale(dataPoints[i].x);
        var y = yScale(dataPoints[i].y);
        var z = zScale(dataPoints[i].z);
        var bmus = dataPoints[i].bmus;
        var colorhex = prototypeV[bmus-1]['prototype15'].Color;
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

         var pointcolor = hexToRgb(colorhex);
         pointGeo.colors.push(new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255));

    }

        var points = new THREE.Points(pointGeo, material2);
        

 
    var pointprotGeo = new THREE.Geometry();
    var prototypeGeo = new THREE.Geometry();
    for (var i =0; i<prototypeV.length; i++){
        var x = xScale(prototypeV[i]['prototype0'].x);
        var y = yScale(prototypeV[i]['prototype0'].y);
        var z = zScale(prototypeV[i]['prototype0'].z);
        var pointcolor = hexToRgb(prototypeV[i]['prototype0'].Color);
        prototypeGeo.vertices.push(new THREE.Vector3(x,y,z));
        prototypeGeo.colors.push(new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255));
       

        //prototype vectors in the scatter plot of the data
        pointprotGeo.vertices.push(new THREE.Vector3(x,y,z));
        pointprotGeo.colors.push(new THREE.Color().setRGB(1,1,1));

    }
      
      var ptpypoints = new THREE.Points(pointprotGeo, material1);
      var pypoints = new THREE.Points(prototypeGeo, material1);
     
      
        scatterPlot.add(points);
        scatterPlot.add(ptpypoints);
      
        scene_scatterplot.add(scatterPlot);
        scatterPlot.rotation.x = (-1)*Math.PI/2;
       
//object control with leap
     //leap object controls
    // var objectControls = new THREE.LeapObjectControls(camera_scatterplot, scatterPlot);

    // objectControls.rotateEnabled  = true;
    // objectControls.rotateSpeed    = 3;
    // objectControls.rotateHands    = 1;
    // objectControls.rotateFingers  = [2, 3];
    
    // objectControls.scaleEnabled   = true;
    // objectControls.scaleSpeed     = 3;
    // objectControls.scaleHands     = 1;
    // objectControls.scaleFingers   = [4, 5];
    
    // objectControls.panEnabled     = true;
    // objectControls.panSpeed       = 3;
    // objectControls.panHands       = 2;
    // objectControls.panFingers     = [6, 12];
    // objectControls.panRightHanded = false; // for left-handed person

  
// ADD LEAP MOTION

  //rays
  var rayCasterManager = new RayCasterManager();

  var rayMaterial = new  THREE.LineBasicMaterial({

    color:0x00ff00,
  })

  var rayDistance = 99;
  
  // Connect to localhost and start getting frames
  Leap.loop({enableGestures:true}, function(frame){
    //console.log(frame);
    var isHit = false;
    var isPointing = false;            
   $("#pointresult").css("background-color","black");
    
    rayCasterManager.removeAllRays(scene_scatterplot);
    $("#pointresult").html("");


    for (var i = 0; i<pointGeo.colors.length; i++){
     // pointGeo.colors[i] = new THREE.Color().setRGB(1,1,0);
      var bmus = dataPoints[i].bmus;
      var colorhex = prototypeV[bmus-1]['prototype15'].Color;
      var pointcolor = hexToRgb(colorhex);
      pointGeo.vertices.push(new THREE.Vector3(x, y, z));
      pointGeo.colors[i] = new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255);
      // //Color based on class #
      // if(i<50){
      // pointGeo.colors[i] = new THREE.Color().setRGB(1,0,0);
      // }
      // if(i>=50&&i<100){
      // pointGeo.colors[i] = new THREE.Color().setRGB(0,1,0);
      // }
      // if(i>=100&&i<150){
      // pointGeo.colors[i] = new THREE.Color().setRGB(0,0,1);
      //  }
     }

    for( var i = scene_scatterplot.children.length - 1; i >= 0; i--){
        obj = scene_scatterplot.children[i];
        if (obj.name == "label")
           scene_scatterplot.remove(obj);

     }
    scene_scatterplot.updateMatrixWorld();
    // objectControls.update(frame);
    // renderer_scatterplot.render(scene_scatterplot, camera_scatterplot)

    for(var i = 0; i<frame.fingers.length; i++){
      var finger = frame.fingers[i];
      if((finger.type!==1 && finger.extended == true) || (finger.type==1 && finger.extended == false)){
        isPointing = false;
      }
      else{
        isPointing = true;
      }

    }

    if(isPointing){
      for (var i = 0; i < frame.hands.length; i++){

        var hand = frame.hands[i];

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
            //console.log(irisd[intersect.index]);
            var positiondata = pointGeo.vertices[intersect.index];
            var hitdata = irisd[intersect.index]
            var color;
            var classtxt;
            var spritey;
            var text;
            //Color based on class #
            if(intersect.index<50){
              color = "red";
              classtext = "Iris Setosa";
              text = classtext+" X: "+hitdata.dataX+", Y: "+hitdata.dataY+", Z: "+hitdata.dataZ;
              spritey = makeTextSprite( text, { fontsize: 10, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255,g:0,b:0,a:1.0} } );
            }
            if(intersect.index>=50&&intersect.index<100){
              color = "green";
              classtext = "Iris Versicolour";
              text = classtext+" X: "+hitdata.dataX +", Y: "+hitdata.dataY+", Z: "+hitdata.dataZ
              spritey = makeTextSprite( text, { fontsize: 10, borderColor: {r:0, g:255, b:0, a:1.0}, backgroundColor: {r:0, g:255, b:0, a:1.0} } );
            }
            if(intersect.index>=100&&intersect.index<150){
              color = "blue";
              classtext = "Iris Virginica";
              text = classtext+" X: "+hitdata.dataX +", Y: "+hitdata.dataY+", Z: "+hitdata.dataZ
              spritey = makeTextSprite( text, { fontsize: 10, borderColor: {r:0, g:0, b:255, a:1.0}, backgroundColor: {r:0, g:0, b:255, a:1.0} } );
            }
            $("#pointresult").html(classtext+"<br>"+"x:&nbsp;"+hitdata.dataX+"&nbsp;y:&nbsp;"+hitdata.dataY+"&nbsp;z:&nbsp;"+hitdata.dataZ);
            $("#pointresult").css("background-color",color);
           
           
             spritey.name = "label";
             spritey.position.set(positiondata.x,positiondata.y,positiondata.z);
             spritey.scale.set(5,5,5);
             scene_scatterplot.add( spritey );
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
    opacity: 0.8

  });

   //GUI-widget from Dat-gui
        // setup the control gui
        var controls = new function () {
        //     // we need the first child, since it's a multimaterial
               this.AutoLoop = true;
               this.LearnEpoch = 0;
               this.LearnSpeed = 1;
               this.Rotation = true;
               this.SOM_nodes = true;
               this.Nodes_color = false;
               this.ShowData = true;
               this.Class_label = false;
               this.Stereo = false;
               this.ParallaxBarrier = false;
               this.EyeSeperation = 3;
               this.FocalLength = 15;
               this.WebVR = false;

               this.redraw = function () {
        
                  updatePosition(controls.LearnSpeed,controls.Rotation,controls.AutoLoop, controls.LearnEpoch);
             };

               this.showhidePT = function(){
                if(controls.SOM_nodes){
                  scatterPlot.add(ptpypoints);
                  scatterPlot.add(pypoints);
                }
                else{
                  scatterPlot.remove(ptpypoints);
                  scatterPlot.remove(pypoints);
                }
                  
                  
                 if(typeof effect !== 'undefined'){
                   effect.render(scene_scatterplot, camera_scatterplot);
                 }
                 else{
                   renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
                 }

                };

              this.showDataLabel = function(){

                //console.log(pointGeo.colors.length);
                
                for(var i = 0; i<pointGeo.colors.length; i++){
                    if(controls.Class_label){
                    //Color based on class #
                      if(i<50){
                      pointGeo.colors[i] = new THREE.Color().setRGB(1,0,0);
                      }
                      if(i>=50&&i<100){
                      pointGeo.colors[i] = new THREE.Color().setRGB(0,1,0);
                      }
                      if(i>=100&&i<150){
                      pointGeo.colors[i] = new THREE.Color().setRGB(0,0,1);
                      }
                   }
                   else{
                    var bmus = dataPoints[i].bmus;
                    var colorhex = prototypeV[bmus-1]['prototype15'].Color;
                    var pointcolor = hexToRgb(colorhex);
                    pointGeo.colors[i] = new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255);
                   }

                }

                  pointGeo.colorsNeedUpdate = true;

                 if(typeof effect !== 'undefined'){
                   effect.render(scene_scatterplot, camera_scatterplot);
                 }
                 else{
                   renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
                 }

              };

              this.ShowDataPoints = function(){
                if(controls.ShowData){
                  scatterPlot.add(points);
                }
                else{
                  scatterPlot.remove(points);
                }
              };
              this.ShowSOMColor = function(){
                if(controls.Nodes_color){
                  scatterPlot.remove(ptpypoints);
                  scatterPlot.add(pypoints);
                }
                else{
                  scatterPlot.remove(pypoints);
                  scatterPlot.add(ptpypoints);

                }
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
         var gui = new dat.GUI();
         var learn = gui.addFolder('SOM Competitive Learning');
         learn.add(controls, 'AutoLoop').onChange(controls.redraw);
         learn.add(controls, 'LearnEpoch', 0, 20).step(1).onChange(controls.redraw);
         learn.add(controls, 'LearnSpeed', 0.1, 3).onChange(controls.redraw).step(0.2);
         var viscontrol = gui.addFolder('3D Visualisation');
         viscontrol.add(controls, 'Rotation').onChange(controls.redraw);
         viscontrol.add(controls, 'SOM_nodes').onChange(controls.showhidePT);
         viscontrol.add(controls, 'Nodes_color').onChange(controls.ShowSOMColor);
         viscontrol.add(controls, 'ShowData').onChange(controls.ShowDataPoints);
         viscontrol.add(controls, 'Class_label').onChange(controls.showDataLabel);
         var stereocontrol = gui.addFolder('Stereo Effect');
         stereocontrol.add(controls, 'Stereo').onChange(controls.EnableStereo);
         stereocontrol.add(controls, 'EyeSeperation',-50,50).onChange(controls.ChangeEyeSeperation);
         stereocontrol.add(controls, 'FocalLength',-20,20).onChange(controls.ChangefocalLength);
         stereocontrol.add(controls, 'ParallaxBarrier').onChange(controls.EnableParallax);
         var vrcontrol = gui.addFolder('VR Effect');
         vrcontrol.add(controls, 'WebVR').onChange(controls.EnableVR);


   
  
    var current = new Date().getTime();

    function updatePosition(speed,rotation,autoLearnFlag,learnEpoch){
      
        var rotationDegree = 0;
        var diff = 0;
        if(rotation){
            rotationDegree = 0.001;        
          }
        scatterPlot.rotation.y+=rotationDegree;
    

        if(autoLearnFlag){
       // if time difference larger than 2 seconds
        var time = new Date().getTime();
        diff = Math.round((time-current)/((1/speed)*1000));
        }
        else{
        diff = Math.round(learnEpoch);
        }
          
        if(diff>=0 && diff<=20){
           
             var ind = 'prototype'+diff.toString(); 
             var nodes = d3.selectAll(".hexagon")[0];
            //console.log(ind);
            for(var i = 0; i < pointprotGeo.vertices.length; i++){

                var x = xScale(prototypeV[i][ind].x);
                var y = yScale(prototypeV[i][ind].y);
                var z = zScale(prototypeV[i][ind].z);  
                var pcolorhex = prototypeV[i][ind].Color;
                var pcolor = hexToRgb(pcolorhex);
               //updating the position of the nodes     
                pointprotGeo.vertices[i] = new THREE.Vector3(x,y,z); 
                prototypeGeo.vertices[i] = new THREE.Vector3(x,y,z);  
                prototypeGeo.colors[i] = new THREE.Color().setRGB(pcolor.r/255, pcolor.g/255, pcolor.b/255)   
             }              

         }
        else{
            current = time;
            }
           pointGeo.verticesNeedUpdate = true;

           pointprotGeo.verticesNeedUpdate = true;
           prototypeGeo.verticesNeedUpdate = true;
           prototypeGeo.colorsNeedUpdate = true;
           
           //camcontrols.update();

           if(typeof effect !== 'undefined'){
             effect.render(scene_scatterplot, camera_scatterplot);
             
            }
           else{
             renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
             
            }
      
             
          
        
    };
   
    function animate() {

        
         updatePosition(controls.LearnSpeed, controls.Rotation, controls.AutoLoop, controls.LearnEpoch);
         
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


   
  var clock = new THREE.Clock();
  animate();
  

  }); //end som data csv

}) // end reading iris data csv
    