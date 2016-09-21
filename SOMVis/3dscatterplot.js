
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
            transparent: true
        });
        var mesh = new THREE.Mesh(plane, planeMat);
        mesh.scale.set(0.5, 0.5, 0.5);
        mesh.doubleSided = true;
        return mesh;
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
            .style("stroke", "black")
            ;
        }

        //Mouseout function
        function mout(d) { 
          var el = d3.select(this)
             .transition()
             .duration(1000)
             .style("stroke", "gray")
             ;
        };


    var containerHeight = window.innerHeight;
    var containerWidth = window.innerWidth/2;

    // one renderer

    var renderer_scatterplot = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer_scatterplot.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("3dscatterplot").style.position = 'absolute';
    document.getElementById("3dscatterplot").style.left ='0px';
    document.getElementById("3dscatterplot").style.top = '0px';
    document.getElementById("3dscatterplot").appendChild(renderer_scatterplot.domElement);
    
   

   // renderer_scatterplot.setClearColor(0x000000, 1.0);
   // one scene
    var scene_scatterplot = new THREE.Scene();
    var scene_prototype = new THREE.Scene();
   // two cameras
    var camera_scatterplot = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 1, 10000);
    camera_scatterplot.position.set(100,100,250);
  
    var camera_prototype = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 1, 10000);
    camera_prototype.position.set(100,100,250);
   //add two cameras to the scene
   scene_scatterplot.add(camera_scatterplot);
   scene_prototype.add(camera_prototype);
    
   //two plots one for original data points one for SOM

    var scatterPlot = new THREE.Object3D();
    var prototypePlot = new THREE.Object3D();



    function v(x, y, z) {
        return new THREE.Vector3(x, y, z);
    }

    var dataPoints = [];
    var prototypeV = [];
    var prototypeGeo ;

        

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
                  .range([-50,50]);
    var yScale = d3.scale.linear()
                  .domain(yExent)
                  .range([-50,50]);                  
    var zScale = d3.scale.linear()
                  .domain(zExent)
                  .range([-50,50]);

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
    var lineMat1 = new THREE.LineBasicMaterial({
        color: 0xEEEEEE,
        linewidth: 1,
        opacity:0.5,
        transparent:true
    });
    var linebox = new THREE.Line(lineBoxGeo, lineMat1);
    linebox.type = THREE.Lines;
    scatterPlot.add(linebox);

    var titleX = createText2D('-X');
    titleX.position.x = xScale(vpts.xMin) - 20,
    titleX.position.y = 5;
    scatterPlot.add(titleX);

    var valueX = createText2D(format(xExent[0]));
    valueX.position.x = xScale(vpts.xMin) - 20,
    valueX.position.y = -5;
    scatterPlot.add(valueX);

    var titleX = createText2D('X');
    titleX.position.x = xScale(vpts.xMax) + 12;
    titleX.position.y = 5;
    scatterPlot.add(titleX);

    var valueX = createText2D(format(xExent[1]));
    valueX.position.x = xScale(vpts.xMax) + 12,
    valueX.position.y = -5;
    scatterPlot.add(valueX);

    var titleY = createText2D('-Y');
    titleY.position.y = yScale(vpts.yMin) - 5;
    scatterPlot.add(titleY);

    var valueY = createText2D(format(yExent[0]));
    valueY.position.y = yScale(vpts.yMin) - 15,
    scatterPlot.add(valueY);

    var titleY = createText2D('Y');
    titleY.position.y = yScale(vpts.yMax) + 15;
    scatterPlot.add(titleY);

    var valueY = createText2D(format(yExent[1]));
    valueY.position.y = yScale(vpts.yMax) + 5,
    scatterPlot.add(valueY);

    var titleZ = createText2D('-Z ' + format(zExent[0]));
    titleZ.position.z = zScale(vpts.zMin) + 2;
    titleZ.position.y = yScale(vpts.yMin) - 15;
    scatterPlot.add(titleZ);

    var titleZ = createText2D('Z ' + format(zExent[1]));
    titleZ.position.z = zScale(vpts.zMax) + 2;
    titleZ.position.y = yScale(vpts.yMin) - 5,
    scatterPlot.add(titleZ);


    var texture1 = new THREE.TextureLoader().load("texture/disc.png");
    texture1.minFilter = THREE.LinearFilter;
    var texture2 = new THREE.TextureLoader().load("texture/ball.png")
    texture2.minFilter = THREE.LinearFilter;
    var material1 = new THREE.PointsMaterial({
        size:9,
        map:texture1,
        vertexColors: THREE.VertexColors, 
        alphaTest: 0.5,
        opacity:0.75,
        transparent: true
    

    });
    var material2 = new THREE.PointsMaterial({
        size:10,
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

         var pointcolor = hexToRgb(colorhex);
         pointGeo.colors.push(new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255));

    }

        var points = new THREE.Points(pointGeo, material1);
        

    var prototypeGeo = new THREE.Geometry();
    var pointprotGeo = new THREE.Geometry();
    for (var i =0; i<prototypeV.length; i++){
        var x = xScale(prototypeV[i]['prototype0'].x);
        var y = yScale(prototypeV[i]['prototype0'].y);
        var z = zScale(prototypeV[i]['prototype0'].z);
        var pointcolor = hexToRgb(prototypeV[i]['prototype0'].Color);
        prototypeGeo.vertices.push(new THREE.Vector3(x,y,z));
        prototypeGeo.colors.push(new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255));

        //prototype vectors in the scatter plot of the data
        pointprotGeo.vertices.push(new THREE.Vector3(x,y,z));
        pointprotGeo.colors.push(new THREE.Color().setRGB(0.5,0.5,0.5));

    }
      
        //initialization
      var lineConnectionGeo = new THREE.Geometry();
     
      var referencept = prototypeGeo.vertices[0];

      for (var i = 0; i<6; i++){        
              lineConnectionGeo.vertices.push(       
                 v(referencept.x, referencept.y, referencept.z), v(referencept.x, referencept.y, referencept.z)   
              );
            
         }
      var lineBMUGeo = new THREE.Geometry();
      console.log(dataPoints);
      for (var i = 0; i<dataPoints.length;i++){
      
           lineBMUGeo.vertices.push(       
                 v(referencept.x, referencept.y, referencept.z),v(referencept.x, referencept.y, referencept.z)  
              );
       
      }

     var lineMat2 = new THREE.LineBasicMaterial({
        color: 0xFF0000,
        linewidth: 3,
        opacity:0.8,
        transparent:true
      });
    var lineMat3 = new THREE.LineBasicMaterial({
        color: 0xFFCC00,
        linewidth: 3,
        opacity:0.8,
        transparent:true
      });
      var SOMconnection = new THREE.Line(lineConnectionGeo, lineMat3);
          SOMconnection.type = THREE.Lines;
      var SOMconnection_sc = new THREE.Line(lineConnectionGeo, lineMat3);
          SOMconnection_sc.type = THREE.Lines;
      console.log(lineBMUGeo);
      var BMUconnection = new THREE.Line(lineBMUGeo,lineMat2);
          BMUconnection.type = THREE.Lines;
      var ptpypoints = new THREE.Points(pointprotGeo, material1);
      var pypoints = new THREE.Points(prototypeGeo, material2);

      var height = window.innerHeight/4;
      var width = window.innerHeight/4;
  
     DrawMap(6, 11, color,false,height,width);
      
        scatterPlot.add(points);
        scatterPlot.add(ptpypoints);
        scatterPlot.add(SOMconnection_sc);
        scatterPlot.add(BMUconnection);
        prototypePlot.add(pypoints);
        prototypePlot.add(SOMconnection); 

        scene_scatterplot.add(scatterPlot);
        scene_prototype.add(prototypePlot);

       
       renderer_scatterplot.setViewport(0,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissor(0,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissorTest(true);
       renderer_scatterplot.render(scene_prototype, camera_prototype);
       

       renderer_scatterplot.setViewport(containerWidth,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissor(containerWidth,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissorTest(true);
       renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);




   //GUI-widget from Dat-gui
        // setup the control gui
    var controls = new function () {
        //     // we need the first child, since it's a multimaterial
               this.AutoLoop = true;
               this.LearnEpoch = 0;
               this.LearnSpeed = 1;
               this.Rotation = true;
               this.Neighbours = false;
               this.DataMapping = false;
               this.referencept_ind = 0;
               this.SOM_nodes = true;
               this.Class_label = false;

               this.redraw = function () {
 
                  updatePosition(controls.LearnSpeed,controls.Rotation,controls.AutoLoop, controls.LearnEpoch);
             };

               this.showhidePT = function(){
                if(controls.SOM_nodes){
                  scatterPlot.add(ptpypoints);
                  scatterPlot.add(SOMconnection_sc);
                }
                else{
                  scatterPlot.remove(ptpypoints);
                  scatterPlot.remove(SOMconnection_sc);
                }

                 renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);

                };

              this.showDataLabel = function(){

                console.log(pointGeo.colors.length);
                
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
                  renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
              };

              this.ShowNeighbours = function(){
                if(controls.Neighbours){
                  d3.selectAll(".hexagon").style("cursor","crosshair");
                  d3.select("#node_0").style("fill-opacity",0.3);
                  prototypePlot.add(SOMconnection);
                  scatterPlot.add(SOMconnection_sc);
                  
                }
                else{
                  d3.selectAll(".hexagon").style("fill-opacity",1).style("cursor","default");

                  prototypePlot.remove(SOMconnection);
                  scatterPlot.remove(SOMconnection_sc);
                 
                }

              };

              this.ShowDataMapping = function(){
               if(controls.DataMapping){
               d3.selectAll(".hexagon").style("cursor","crosshair");
               d3.select("#node_0").style("fill-opacity",0.3);
                scatterPlot.add(BMUconnection);
              }
               else{
                d3.selectAll(".hexagon").style("fill-opacity",1).style("cursor","default");
                scatterPlot.remove(BMUconnection);

              }
            };

         };
         var gui = new dat.GUI();
         var learn = gui.addFolder('SOM Competitive Learning');
         learn.add(controls, 'AutoLoop').onChange(controls.redraw);
         learn.add(controls, 'LearnEpoch', 0, 20).step(1).onChange(controls.redraw);
         learn.add(controls, 'LearnSpeed', 0.1, 3).onChange(controls.redraw).step(0.2);
         var viscontrol = gui.addFolder('3D Visualisation');
         viscontrol.add(controls, 'Rotation').onChange(controls.redraw);
         viscontrol.add(controls, 'Neighbours').onChange(controls.ShowNeighbours);
         viscontrol.add(controls, 'DataMapping').onChange(controls.ShowDataMapping);
         viscontrol.add(controls, 'SOM_nodes').onChange(controls.showhidePT);
         viscontrol.add(controls, 'Class_label').onChange(controls.showDataLabel);
      
    var paused = false;
    var last = new Date().getTime();
    var down = false;
    var sx = 0,
        sy = 0;
        
    window.onmousedown = function(ev) {
        down = true;
        sx = ev.clientX;
        sy = ev.clientY;
    };
    window.onmouseup = function() {
        down = false;
    };
    window.onmousemove = function(ev) {
        if (down) {
            var dx = ev.clientX - sx;
            var dy = ev.clientY - sy;
            scatterPlot.rotation.y += dx * 0.01;
            camera_scatterplot.position.y += dy;
            prototypePlot.rotation.y += dx*0.01;
            camera_prototype.position.y +=dy;
            sx += dx;
            sy += dy;
        }
    }
    var animating = false;
    window.ondblclick = function() {
        animating = !animating;
    };
    //console.log(prototypeV);
    var current = new Date().getTime();

    function updatePosition(speed,rotation,autoLearnFlag,learnEpoch){
      
        var rotationDegree = 0;
        var diff = 0;
        if(rotation){
            rotationDegree = 0.01;        
          }
        scatterPlot.rotation.y+=rotationDegree;
        prototypePlot.rotation.y+=rotationDegree;

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
            for(var i = 0; i < prototypeGeo.vertices.length; i++){

                var x = xScale(prototypeV[i][ind].x);
                var y = yScale(prototypeV[i][ind].y);
                var z = zScale(prototypeV[i][ind].z);  
                var pcolorhex = prototypeV[i][ind].Color;
                var pcolor = hexToRgb(pcolorhex);
               //updating the position of the nodes 
                prototypeGeo.vertices[i] = new THREE.Vector3(x,y,z);     
                pointprotGeo.vertices[i] = new THREE.Vector3(x,y,z); 
                // console.log(prototypeGeo.colors[i]);
                // console.log("("+pcolor.r/255+","+pcolor.g/255+","+pcolor.b/255+")");

                prototypeGeo.colors[i] = new THREE.Color().setRGB(pcolor.r/255, pcolor.g/255, pcolor.b/255)               
                //updating the color of the 2D SOM
                nodes[i].style.fill = pcolorhex
             }

            if (controls.Neighbours){
                  var referencept = prototypeGeo.vertices[controls.referencept_ind];
                  var pt = referencept; 
                  var neighid = GetNeighbours(controls.referencept_ind,11,6,'hexa','torus');
        
                 for (var k = 0; k<neighid.length; k++){
                  if(neighid[i]!= -1){
                    //console.log("neighid: "+neighid[i]);
                    pt = prototypeGeo.vertices[neighid[k]];
                    lineConnectionGeo.vertices[k*2]= new THREE.Vector3(referencept.x, referencept.y, referencept.z);
                    lineConnectionGeo.vertices[k*2+1]= new THREE.Vector3(pt.x, pt.y, pt.z);
                  
                  }
                 }
            }
                
            if (controls.DataMapping){
              var referencept = prototypeGeo.vertices[controls.referencept_ind];
              var count = 0
              for (var i = 0; i<dataPoints.length;i++){
              
               if(dataPoints[i].bmus == controls.referencept_ind+1){
                  count +=1;
                 lineBMUGeo.vertices[2*(count-1)] = new THREE.Vector3(referencept.x, referencept.y, referencept.z);
                 lineBMUGeo.vertices[2*(count-1)+1] = new THREE.Vector3(pointGeo.vertices[i].x, pointGeo.vertices[i].y, pointGeo.vertices[i].z);
                 
                 }


              }
              // console.log(controls.referencept_ind);
              // console.log(count);
              for (var i = 2*(count-1)+2; i<lineBMUGeo.vertices.length; i++){
                lineBMUGeo.vertices[i] = new THREE.Vector3(referencept.x, referencept.y, referencept.z);
              }

              
                
            }            

         }
        else{
            current = time;
            }
           pointGeo.verticesNeedUpdate = true;
           lineConnectionGeo.verticesNeedUpdate = true;
           lineBMUGeo.verticesNeedUpdate = true;
           pointprotGeo.verticesNeedUpdate = true;
           prototypeGeo.verticesNeedUpdate = true;
           prototypeGeo.colorsNeedUpdate = true;
           
           renderer_scatterplot.clear();
          
           renderer_scatterplot.render(scene_prototype, camera_prototype);
        
           renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
          
        
    }

    
    function animate(t) {


        if (!paused) {
            last = t;
            if (animating) {
                var v = pointGeo.vertices;
                for (var i = 0; i < v.length; i++) {
                    var u = v[i];
                    //console.log(u)
                    u.angle += u.speed * 0.01;
                    u.x = Math.cos(u.angle) * u.radius;
                    u.z = Math.sin(u.angle) * u.radius;
                }
                pointGeo.__dirtyVertices = true;
                var vp = prototypeGeo.vertices;
                for (var i = 0; i < vp.length; i++) {
                    var u = vp[i];
                    //console.log(u)
                    u.angle += u.speed * 0.01;
                    u.x = Math.cos(u.angle) * u.radius;
                    u.z = Math.sin(u.angle) * u.radius;
                }
                prototypeGeo.__dirtyVertices = true;
            }
             renderer_scatterplot.clear();
            //  camera_scatterplot.lookAt(scene_scatterplot.position);
            // renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);

           renderer_scatterplot.setViewport(0,0,containerWidth, containerHeight);
           renderer_scatterplot.setScissor(0,0,containerWidth, containerHeight);
           renderer_scatterplot.setScissorTest(true);
           camera_prototype.lookAt(scene_prototype.position);
           renderer_scatterplot.render(scene_prototype, camera_prototype);
           
     
           renderer_scatterplot.setViewport(containerWidth,0,containerWidth, containerHeight);
           renderer_scatterplot.setScissor(containerWidth,0,containerWidth, containerHeight);
           renderer_scatterplot.setScissorTest(true);
           camera_scatterplot.lookAt(scene_scatterplot.position);
           renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
           
        }
        updatePosition(controls.LearnSpeed, controls.Rotation, controls.AutoLoop, controls.LearnEpoch);
        window.requestAnimationFrame(animate, renderer_scatterplot.domElement);
        
        
    };
    animate(new Date().getTime());
    onmessage = function(ev) {
        paused = (ev.data == 'pause');
    };

 //////////////////////////////////////////////////////////////////////////////////////////
////////////////////// Draw hexagons and color them with color data///////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
    function DrawMap(MapColumns, MapRows, color, drawflag,height,width) {


      //svg sizes and margins
      var margin = { top: 20, right: 180, bottom: 0, left: 20 };
      //clear previous svg
      d3.selectAll("#map").remove();

      //The maximum radius the hexagons can have to still fit the screen
      var hexRadius = d3.min([width/((MapColumns + 0.5) * Math.sqrt(3)),
            height/((MapRows + 1/3) * 1.5)]);

      //Set the new height and width of the SVG based on the max possible
      width = MapColumns*hexRadius*Math.sqrt(3)/2;
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
           d3.selectAll(".hexagon").style("fill-opacity",1);
           var thisid = parseInt(d3.select(this).attr("id").substr(5));      
          
          if(controls.Neighbours||controls.DataMapping) {
           d3.select(this).style("fill-opacity",0.3);
           controls.referencept_ind = thisid;
           
        
       }

      }); //end on click
    } 

    function GetNeighbours(index, nrow, ncol, lattice,topology){
         // for the time being only consider each node have six neighbours
        var neighbours = [-1,-1,-1,-1,-1,-1];   
        if(lattice =="hexa" && topology == "torus"){
          //row and column index both starting from 0
           var y = Math.ceil((index+1)/ncol)-1;
           var x = Math.round((index+1)%ncol)-1;
           if(x == -1) x= ncol-1;
          // console.log("y:" + y + ","+ "x:"+x);

            neighbours[0] = (y-1)*ncol + x;

          if(y%2){
            neighbours[1] = (y-1)*ncol + (x+1);
            neighbours[5] = (y+1)*ncol + (x+1);
            }
            else {
            neighbours[1] = (y-1)*ncol + (x-1);
            neighbours[5] = (y+1)*ncol + (x-1);
            }
            neighbours[2] = y*ncol + (x-1);
            neighbours[3] = y*ncol + (x+1);
            neighbours[4] = (y+1)*ncol + x;
                

         // four edges  
           if(y==0 && x>0 && x<ncol){
            neighbours[0] = (nrow-1)*ncol + x;
            neighbours[1] = (nrow-1)*ncol + (x+1);
           }
            if(y==nrow-1 && x>0 && x<ncol){
            neighbours[4] = 0*ncol+ x;
            neighbours[5] = 0*ncol+ (x+1)
           }
            if(x==0 && y>0 && y<nrow){
        
            neighbours[2] = y*ncol + (ncol-1);
      
           }
            if(x==ncol-1 && y>0 && x<nrow){
            neighbours[1] = (y-1)*ncol + 0;
            neighbours[3] = y*ncol + 0;
            neighbours[5] = (y+1)*ncol + 0
           }
         // four corner nodes
            if(y==0 && x==0){
              neighbours[0] = (nrow-1)*ncol + x;
              neighbours[1] = (nrow-1)*ncol + ncol-1;
              neighbours[2] = y*ncol + ncol-1;
              neighbours[3] = y*ncol + (x+1);
              neighbours[4] = (y+1)*ncol + x;
              neighbours[5] = (y+1)*ncol + ncol-1;
           }
            if(y==0 && x==ncol-1){
              neighbours[0] = (nrow-1)*ncol + x;
              neighbours[1] = (nrow-1)*ncol + 0;
              neighbours[2] = y*ncol + (x-1);
              neighbours[3] = y*ncol + 0;
              neighbours[4] = (y+1)*ncol + x;
              neighbours[5] = (y+1)*ncol + (x-1);
            
           }
            if(y==nrow-1 && x==0){
                neighbours[0] = (y-1)*ncol + ncol-1;
                neighbours[1] = (y-1)*ncol + x;
                neighbours[2] = y*ncol + ncol-1;
                neighbours[3] = y*ncol + (x+1);
                neighbours[4] = 0*ncol + x;
                neighbours[5] = 0*ncol + ncol-1;      
      
           }
            if(y==nrow-1 && x==ncol-1){
                neighbours[0] = (y-1)*ncol + x;
                neighbours[1] = (y-1)*ncol + (x-1);
                neighbours[2] = y*ncol + (x-1);
                neighbours[3] = y*ncol + 0;
                neighbours[4] = 0*ncol + x;
                neighbours[5] = 0*ncol + (x-1);

           }


        }
       // console.log(neighbours);
        return neighbours;
    }

  }); //end som data csv

}) // end reading iris data csv
    