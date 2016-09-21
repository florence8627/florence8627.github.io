
function tiltup(ol3d){
	var camera = ol3d.getCamera();
	var radian = camera.getTilt();
	radian = radian+0.1;
	if(radian>3.14/2) radian = 3.14/2;
	camera.setTilt(radian);
}
function tiltdown(ol3d){
	var camera = ol3d.getCamera();
	var radian = camera.getTilt();
	radian = radian-0.1;
	if(radian<0) radian = 0;
	camera.setTilt(radian);
	
}

function ViewSwitch(ol3d){
ol3d.setEnabled(!ol3d.getEnabled());
if(ol3d.getEnabled()){
var scene = ol3d.getCesiumScene();
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
});
scene.terrainProvider = terrainProvider;
var camera = ol3d.getCamera();
camera.setAltitude(60000);
camera.setCenter(ol.proj.transform([145, -37.81], 'EPSG:4326', 'EPSG:3857'))
}
}

var vector1 = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'data/kml/HYSPLIT_21599.kml',
    format: new ol.format.KML({
      extractStyles: true
	  

    })
  })
});

var vector2 = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'data/kml/HYSPLITpart_21599.kml',
    format: new ol.format.KML({
      extractStyles: true
	  

    })
  })
});

var vector3 = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'data/kml/HYSPLIT_21599_combine.kml',
    format: new ol.format.KML({
      extractStyles: true
	  

    })
  })
});

var raster =  new ol.layer.Tile({
      source: new ol.source.OSM()
 });


var ol2d = new ol.Map({
  layers: [raster,  vector1, vector2],
        controls: ol.control.defaults().extend([
         
        ]),
  
  target: 'map1',
  view: new ol.View({
    center: ol.proj.transform([145, -37.81], 'EPSG:4326', 'EPSG:3857'),
    zoom:10.5,
	minZoom:10.5,
	maxZoom:16
  })
});
var ol3d1 = new olcs.OLCesium({map: ol2d});

var ol2d2 = new ol.Map({
  layers: [raster, vector1, vector3],
        controls: ol.control.defaults().extend([
         
        ]),
  
  target: 'map2',
  view: new ol.View({
    center: ol.proj.transform([145, -37.81], 'EPSG:4326', 'EPSG:3857'),
    zoom:10.5,
	minZoom:10.5,
	maxZoom:16
  })
});
var ol3d2 = new olcs.OLCesium({map: ol2d2});
