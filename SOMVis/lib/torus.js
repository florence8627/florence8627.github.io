   

   // once everything is loaded, we run our Three.js stuff.
    
        var stats = initStats();
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        var scene = new THREE.Scene();
        // create a camera, which defines where we're looking at.
        var camera_torus = new THREE.PerspectiveCamera(45, window.innerWidth*0.5 / window.innerHeight, 0.1, 1000);
        // create a render and set the size
        var renderer_torus = new THREE.WebGLRenderer();
        renderer_torus.setClearColor(0x000000, 1.0);
        renderer_torus.setSize(window.innerHeight/4, window.innerHeight/4);
        renderer_torus.shadowMap.enabled = true;
        var torus = createMesh(new THREE.TorusGeometry(3, 1, 10, 50, Math.PI * 2));
        // add the sphere to the scene
        scene.add(torus);
        // position and point the camera to the center of the scene
        camera_torus.position.x = 0;
        camera_torus.position.y = 0;
        camera_torus.position.z = 15;
        
        var camcontrl = new THREE.OrbitControls( camera_torus, renderer_torus.domElement );
		camcontrl.enableDamping = true;
		camcontrl.dampingFactor = 0.25;
		camcontrl.enableZoom = false;

        // add the output of the renderer to the html element
        document.getElementById("torus").appendChild(renderer_torus.domElement);
        // call the render function
        var step = 0;
        // setup the control gui
        var controls = new function () {
            // we need the first child, since it's a multimaterial
            this.radius = torus.children[0].geometry.parameters.radius;
            this.tube = torus.children[0].geometry.parameters.tube;
            this.radialSegments = torus.children[0].geometry.parameters.radialSegments;
            this.tubularSegments = torus.children[0].geometry.parameters.tubularSegments;
            this.arc = torus.children[0].geometry.parameters.arc;
            this.redraw = function () {
                // remove the old plane
                scene.remove(torus);
                // create a new one
                torus = createMesh(new THREE.TorusGeometry(controls.radius, controls.tube, Math.round(controls.radialSegments), Math.round(controls.tubularSegments), controls.arc));
                // add it to the scene.
                scene.add(torus);
            };
        };
        // var gui = new dat.GUI();
        // gui.add(controls, 'radius', 0, 40).onChange(controls.redraw);
        // gui.add(controls, 'tube', 0, 40).onChange(controls.redraw);
        // gui.add(controls, 'radialSegments', 0, 40).onChange(controls.redraw);
        // gui.add(controls, 'tubularSegments', 1, 20).onChange(controls.redraw);
        // gui.add(controls, 'arc', 0, Math.PI * 2).onChange(controls.redraw);
        render();
        var texture;
        function createMesh(geom) {
            // assign two materials
            var meshMaterial = new THREE.MeshNormalMaterial();
            meshMaterial.side = THREE.DoubleSide;
            texture = new THREE.TextureLoader().load('texture/texture3.jpg');
            var wireFrameMat = new THREE.MeshBasicMaterial({map: texture});
            wireFrameMat.wireframe = false;
            // create a multimaterial
            var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [ wireFrameMat]);
            return mesh;
        }
        function render() {
            stats.update();
            camcontrl.update();
            torus.rotation.y = step += 0.01;
            // render using requestAnimationFrame
            window.requestAnimationFrame(render,renderer_torus.domElement);
            renderer_torus.render(scene, camera_torus);
        }
        function initStats() {
            var stats = new Stats();
            stats.setMode(0); // 0: fps, 1: ms
            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';
            stats.domElement.style.visibility="hidden";
            document.getElementById("Stats-output").appendChild(stats.domElement);
            return stats;
        }
    