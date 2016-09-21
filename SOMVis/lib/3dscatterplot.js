
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

        

    var format = d3.format("+.3f");

    var data = d3.csv("data/Iris-pca-trainstep.csv", function (irisd) {

        d3.csv("data/Color-all-iris-trainstep.csv", function(somd){


        
        irisd.forEach(function (d,i) {
            dataPoints[i] = {
                x: parseFloat(d.dataX),
                y: parseFloat(d.dataY),
                z: parseFloat(d.dataZ),
                bmus: parseInt(d.bmus)
            };
            
        });

        somd.forEach(function(d,i) {
             prototypeV[i] = {};
             for (var j=0; j<=100; j++) {
              prototypeV[i]['prototype'+j]={
                x: parseFloat(d['prototypeX'+j]),
                y: parseFloat(d['prototypeY'+j]),
                z: parseFloat(d['prototypeZ'+j]),
                Color: d.Color 
               };
           
          }

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

    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(
        

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
        linewidth: 1
    });
    var line = new THREE.Line(lineGeo, lineMat);
    line.type = THREE.Lines;
    scatterPlot.add(line);

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
    var texture2 = new THREE.TextureLoader().load("texture/ball.png")
    var material1 = new THREE.PointsMaterial({
        size:9,
        map:texture1,
        vertexColors: THREE.VertexColors, 
        alphaTest: 0.5,
        opacity:0.75,
        transparent: true
    

    });
    var material2 = new THREE.PointsMaterial({
        size:12,
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
        var colorhex = prototypeV[bmus-1]['prototype0'].Color;
        pointGeo.vertices.push(new THREE.Vector3(x, y, z));
       
        //Color based on class #
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

        var points = new THREE.Points(pointGeo, material1);
        

    var prototypeGeo = new THREE.Geometry();
    for (var i =0; i<prototypeV.length; i++){
        var x = xScale(prototypeV[i]['prototype0'].x);
        var y = yScale(prototypeV[i]['prototype0'].y);
        var z = zScale(prototypeV[i]['prototype0'].z);
        var pointcolor = hexToRgb(prototypeV[i]['prototype0'].Color);
        prototypeGeo.vertices.push(new THREE.Vector3(x,y,z));
        prototypeGeo.colors.push(new THREE.Color().setRGB(pointcolor.r/255, pointcolor.g/255, pointcolor.b/255));

         pointGeo.vertices.push(new THREE.Vector3(x,y,z));
         pointGeo.colors.push(new THREE.Color().setRGB(0.5,0.5,0.5));

    }
      

      var pypoints = new THREE.Points(prototypeGeo, material2);
      
        scatterPlot.add(points);
        prototypePlot.add(pypoints);
        scene_scatterplot.add(scatterPlot);
        scene_prototype.add(prototypePlot);

  

    scatterPlot.rotation.y = 0;
       
       renderer_scatterplot.setViewport(0,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissor(0,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissorTest(true);
       renderer_scatterplot.render(scene_prototype, camera_prototype);
       

       renderer_scatterplot.setViewport(containerWidth,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissor(containerWidth,0,containerWidth, containerHeight);
       renderer_scatterplot.setScissorTest(true);
       renderer_scatterplot.render(scene_scatterplot, camera_scatterplot);
    
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
    console.log(prototypeV);
    var current = new Date().getTime();

    function updatePosition(){
       // if time difference larger than 2 seconds
        var time = new Date().getTime();
        var diff = Math.round((time-current)/1000);
        
        if(diff>=0 && diff<=30){
           
             var ind = 'prototype'+diff.toString(); 
            
            console.log(ind);
            for(var i = 0; i < prototypeGeo.vertices.length; i++){

                var x = xScale(prototypeV[i][ind].x);
                var y = yScale(prototypeV[i][ind].y);
                var z = zScale(prototypeV[i][ind].z);  
                prototypeGeo.vertices[i] = new THREE.Vector3(x,y,z);     
                pointGeo.vertices[dataPoints.length+i-1] = new THREE.Vector3(x,y,z);  

           }


        }
        else{
            current = time;
        }
           pointGeo.verticesNeedUpdate = true;
           prototypeGeo.verticesNeedUpdate = true;
           renderer_scatterplot.clear();
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
        updatePosition();
        window.requestAnimationFrame(animate, renderer_scatterplot.domElement);
        
        
    };
    animate(new Date().getTime());
    onmessage = function(ev) {
        paused = (ev.data == 'pause');
    };

  }); //end som data csv

}) // end reading iris data csv
    