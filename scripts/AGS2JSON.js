
dojo.require("esri.map");
dojo.require("esri.layers.agstiled");
dojo.require("esri.toolbars.draw");

dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.editing.Editor-all");
dojo.require("esri.tasks.geometry");
dojo.require("esri.tasks.gp");
dojo.require("esri.toolbars.draw");
dojo.require("esri.toolbars.edit");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.Slider");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.Toolbar");
dojo.require("dojo.number");
dojo.require("dojo.io.script");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.functional.lambda");
dojo.require("dojox.lang.functional.curry");
dojo.require("dojox.lang.functional.fold");
dojo.require("dojo.parser");
dojo.require("esri.virtualearth.VEGeocoder");

var map, tb,timer;
var lyrStreet, lyrImg, lyrTopo;
var opsPointLayer;//
var searchResultLayer, locateResultLayer;
var veGeocoder;

function init() {
  var initExtent = new esri.geometry.Extent({ "xmin": -12836528.782095946, "ymin": -939258.2035679615, "xmax": 7200979.560687953, "ymax": 9079495.967823988, "spatialReference": { "wkid": 102100} });
  initExtent = null;
  map = new esri.Map("map", { extent: initExtent });
  dojo.connect(map, "onLoad", initToolbar);

  //basemap layers
  lyrImg = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer", {
    id: "lyrImg",
    visible: false
  });
  // Delorme - http://services.arcgisonline.com/ArcGIS/rest/services/Specialty/DeLorme_World_Base_Map/MapServer
  lyrStreet = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer", {
    id: "lyrStreet",
    visible: false
  });
  lyrTopo = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer", {
    id: "lyrTopo",
    visible: true
  });


  //create geocoder for locate functionality
  veGeocoder = new esri.virtualearth.VEGeocoder({
    bingMapsKey: 'AhISYXSwarQBC7E8gtTvoPvRUx_M1JQjvAZihYBP59uLQ_Ox7ers3NfcFmtUp05_'
  });

  dojo.connect(veGeocoder, "onAddressToLocationsComplete", showResults);
  dojo.connect(window, "onresize", function () {
    //clear any existing resize timer
    clearTimeout(timer);
    //create new resize timer with delay of 500 milliseconds
    timer = setTimeout(function () {
      map.resize();
    }, 500);
  });


  map.addLayers([lyrImg, lyrStreet, lyrTopo]);


  hideLoading();
  
}


//TOGGLE MAP LAYERS      
function changeMap(layerid) //pass in layer id from html
{
  var tmplayer = layerid;
  var curLayer = map.getLayer(layerid);
  toggleLayer(curLayer);

}

function toggleLayer(layer) {

  switch (layer.id) {
    case "lyrImg":
      map.getLayer("lyrImg").show();
      map.getLayer("lyrStreet").hide();
      map.getLayer("lyrTopo").hide();
      //map.getLayer("lyrReference").hide();
      $("#basemap a").removeClass("selected");
      $("#basemap a#imagery_btn").addClass("selected");
      break;
    case "lyrStreet":
      map.getLayer("lyrStreet").show();
      if (layer.visible === true) {
        if (map.getLevel() == 12) {
          map.setLevel(11);
        }
      }
      map.getLayer("lyrTopo").hide();
      //map.getLayer("lyrReference").hide();
      map.getLayer("lyrImg").hide();
      $("#basemap a").removeClass("selected");
      $("#basemap a#streetmap_btn").addClass("selected");
      break;
    case "lyrTopo":
      map.getLayer("lyrTopo").show();
      //map.getLayer("lyrReference").show();
      map.getLayer("lyrImg").hide();
      map.getLayer("lyrStreet").hide();
      $("#basemap a").removeClass("selected");
      $("#basemap a#topographic_btn").addClass("selected");
      break;

  }
}


function editLyrLoad(layers) {


}


function showLoading() {
  var loading = dojo.byId("loadingImg");
  esri.show(loading);
}

function hideLoading() {
  var loading = dojo.byId("loadingImg");
  esri.hide(loading);
}

function initToolbar(map) {
  tb = new esri.toolbars.Draw(map);
  dojo.connect(tb, "onDrawEnd", addGraphic);


}

function doJSON2AGS() {

  var sJson = dojo.byId("txtInputJson").value;
  if (sJson.toString() == "") return;

  clearGraphics();

  var json = eval('(' + sJson + ')');

  var g = esri.geometry.fromJson(json);

  if (g != null) {
    addGraphic(g);

    var env = getGeomExtent(g);
    if (env != null) {
      map.setExtent(env);
    }

  }
  
}

function getGeomExtent(g) {
  try {

    var env = g.getExtent();
    if (env != null) return env;

    var x = g.x;
    var y = g.y;

    env = new esri.geometry.Extent(x-1000, y-1000, x + 1000, y+1000, g.spatialReference);
    return env;
  }
  catch(e)
  {
    var p;
  }
}

function addGraphic(geometry) {
  var symbol = null;//  dojo.byId("symbol").value;
  if (symbol) {
    symbol = eval(symbol);
  }
  else {
    var type = geometry.type;
    if (type === "point" || type === "multipoint") {
      symbol = tb.markerSymbol;
    }
    else if (type === "line" || type === "polyline") {
      symbol = tb.lineSymbol;
    }
    else {
      symbol = tb.fillSymbol;
    }
  }

  map.graphics.add(new esri.Graphic(geometry, symbol));

  reportCurrentGeometry(geometry);
}

function clearGraphics() {
  map.graphics.clear();
}

function reportCurrentGeometry(geometry) {

  var s = geometry.toJson();

  var jsonStr = JSON.stringify(s);
  document.getElementById("txtOutputJson").innerHTML = jsonStr;
  //alert(jsonStr);

}

//LOCATE    
function locate() {
  var query = dojo.byId("address").value;
  locateString = query;
  veGeocoder.addressToLocations(query); //query is the address to locate
}

function showResults(geocodeResults) {
  if (locateResultLayer) {
    locateResultLayer.clear();
  }
  else {
    locateResultLayer = new esri.layers.GraphicsLayer();
    searchResultLayer = new esri.layers.GraphicsLayer();

    map.addLayer(locateResultLayer);
    map.addLayer(searchResultLayer);
  }

  var faddress = geocodeResults[0].address.formattedAddress;
  var bingPoint = geocodeResults[0].location;
  var country = geocodeResults[0].address.countryRegion;
  var pointMeters = esri.geometry.geographicToWebMercator(geocodeResults[0].location);
  var pointSymbol = new esri.symbol.PictureMarkerSymbol("images/map/pushpin-icon-orange.png", 24, 24);
  var locationGraphic = new esri.Graphic(pointMeters, pointSymbol);
  locateResultLayer.add(locationGraphic);
 // esri.hide(dojo.byId('dialog1'));
  
  map.setExtent(esri.geometry.geographicToWebMercator(geocodeResults[0].bestView));
  
}

//clear the locate graphic
function clearLocate() {
  if (locateResultLayer) {
    locateResultLayer.clear();
  }
  dojo.byId('address').value = "";
  locateString = "";
}

dojo.addOnLoad(init);
 