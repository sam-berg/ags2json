dojo.require("esri.map");
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

//Global Variable declarations.
var map, startExtent;
var lyrStreet, lyrImg, lyrTopo, opsPointLayer, selectLayer, loadSearchLyr;
var newsLayer, ushLayer, ushFLayer;
var tornadoLayer, tornadoSymbol, tornadoRenderer;
var ptornadoLayer, ptornadoSymbol, ptornadoRenderer;
var pathLayer, pathSymbol, pathRenderer;
var swathLayer, swathSymbol, swathRenderer;
var imageLayer;
var twarningLayer, twarningSymbol, twarningRenderer;
var ffwarningLayer, ffwarningSymbol, ffwarningRenderer;
var YTLayer = new esri.layers.GraphicsLayer({
  id: 'YTLayer'
}), twitterLayer = new esri.layers.GraphicsLayer({
  id: 'twitterLayer'
}), flickrLayer = new esri.layers.GraphicsLayer({
  id: 'flickrLayer'
});
var lyrHighlightGLayer, lyrHighlightGLayer2;
var ushSymbol, twitterSymbol, youTubeSymbol, flickrSymbol;
var queryTask, query, featureSet, infoTemplate;
var zoomPt, centerPt;
var templatePicker, selectedTemplate, totalSelect = 0;
var proxyurl;
var WMRef;
var mapclickhandle, geonames = [], geomService, featService, editFeatureLayers;
var levelPointTileSpace = [];
var searchResultLayer, locateResultLayer;
var isLoadedFromURL;
var cType;
var selectSym;
var attValidation = [], attJSONObject, editFeat;
var searchString = '';
var locateString = '';
var twLink = '';
var loading;
var lat = 39.3491, lon = -105.3823, radiusYT = 1000, radiusTW = 600; //used by twitter and youtube apis
var initytSearch, inittwSearch, initflSearch; //variables holding social media search terms
var leftouttweets = [], gs = [], gs2 = [];//variable for left out tweets
var intDay_1day, intMonth_1day, intYear_1day;


function init(){
  //proxy page
  esri.config.defaults.io.proxyUrl = "./resources/proxy.ashx";
  esri.config.defaults.io.alwaysUseProxy = false;
  
  //create geocoder for locate functionality
  veGeocoder = new esri.virtualearth.VEGeocoder({
    bingMapsKey: 'AhISYXSwarQBC7E8gtTvoPvRUx_M1JQjvAZihYBP59uLQ_Ox7ers3NfcFmtUp05_'
  });
  
  //create geocoder for geocoding tweets
  veTwitterGeocoder = new esri.virtualearth.VEGeocoder({
    bingMapsKey: 'AhISYXSwarQBC7E8gtTvoPvRUx_M1JQjvAZihYBP59uLQ_Ox7ers3NfcFmtUp05_'
  });
  
  
  //Set up search share capability - see if any URL parameters were passed for search, locate, or map extent.
  searchString = decodeURI(URLLookup("search"));
  locateString = decodeURI(URLLookup("locate"));
  sXmin = parseFloat(URLLookup("xmin"));
  sYmin = parseFloat(URLLookup("ymin"));
  sXmax = parseFloat(URLLookup("xmax"));
  sYmax = parseFloat(URLLookup("ymax"));
  
  if (searchString) {
    dojo.byId("searchTxt").value = searchString;
    isLoadedFromURL = true;
  }
  if (locateString) {
    dojo.byId("address").value = locateString;
    isLoadedFromURL = true;
  }
  
  WMRef = new esri.SpatialReference({
    wkid: 102100
  });

	startExtent= new esri.geometry.Extent({ xmin:-9755746, ymin: 3916259, xmax: -9734497, ymax:3930496, spatialReference: WMRef});
  
  dojo.connect(veGeocoder, "onAddressToLocationsComplete", showResults);
  dojo.connect(window, "onresize", function(){
    //clear any existing resize timer
    clearTimeout(timer);
    //create new resize timer with delay of 500 milliseconds
    timer = setTimeout(function(){
      map.resize();
    }, 500);
  });
  
  //set the map levels of detail
  var lods = [{
    "level": 0,
    "resolution": 156543.033928,
    "scale": 591657527.591555
  }, {
    "level": 1,
    "resolution": 78271.5169639999,
    "scale": 295828763.795777
  }, {
    "level": 2,
    "resolution": 39135.7584820001,
    "scale": 147914381.897889
  }, {
    "level": 3,
    "resolution": 19567.8792409999,
    "scale": 73957190.948944
  }, {
    "level": 4,
    "resolution": 9783.93962049996,
    "scale": 36978595.474472
  }, {
    "level": 5,
    "resolution": 4891.96981024998,
    "scale": 18489297.737236
  }, {
    "level": 6,
    "resolution": 2445.98490512499,
    "scale": 9244648.868618
  }, {
    "level": 7,
    "resolution": 1222.99245256249,
    "scale": 4622324.434309
  }, {
    "level": 8,
    "resolution": 611.49622628138,
    "scale": 2311162.217155
  }, {
    "level": 9,
    "resolution": 305.748113140558,
    "scale": 1155581.108577
  }, {
    "level": 10,
    "resolution": 152.874056570411,
    "scale": 577790.554289
  }, {
    "level": 11,
    "resolution": 76.4370282850732,
    "scale": 288895.277144
  }, {
    "level": 12,
    "resolution": 38.2185141425366,
    "scale": 144447.638572
  }, {
    "level": 13,
    "resolution": 19.1092570712683,
    "scale": 72223.819286
  }, {
    "level": 14,
    "resolution": 9.55462853563415,
    "scale": 36111.909643
  }, {
    "level": 15,
    "resolution": 4.77731426794937,
    "scale": 18055.954822
  }, {
    "level": 16,
    "resolution": 2.38865713397468,
    "scale": 9027.977411
  }, {
    "level": 17,
    "resolution": 1.19432856685505,
    "scale": 4513.988705
  }];
	
  map = new esri.Map("map", {
    extent: startExtent,
    lods: lods,
    logo: false,
		wrapAround180: true,
    spatialReference: WMRef
  });
  map.infoWindow.resize(300, 270);
  
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
  
  //set time extent on social media layers
  setTimeExtent();
  
  dojo.connect(map, "onLayersAddResult", editLyrLoad);
  map.addLayers([lyrImg, lyrStreet, lyrTopo]);
  
  var timer;
  var toggleImg = dojo.byId("imagery_btn");
  
  selectSym = new esri.symbol.SimpleMarkerSymbol();
  selectSym.setColor(new dojo.Color([255, 0, 0, 0.5]));
  
  dojo.connect(map, "onClick", checkGraphic);
  dojo.connect(map.infoWindow, "onHide", iwHide);
  
  dojo.connect(map, "onExtentChange", function(extent){
    //Set the new extent variables
    sXmin = extent.xmin;
    sXmax = extent.xmax;
    sYmin = extent.ymin;
    sYmax = extent.ymax;
  });
  
  hideLoading();
  
  //set the social media search terms to the value in the text box
  initytSearch = $("#ytSearch").val();
  inittwSearch = $("#twSearch").val();
  initflSearch = $("#flSearch").val();
  
}

function addSM () {
  setMapLayers();
	addYT();
  //addTW();
  //addFL();
	addUsh();

}

function addYT(){

   if($('#cbYT').hasClass("checked")){
        map.addLayer(YTLayer);
        yt24Hours();
    }
}

function addTW(){

  if ($('#cbTweet').hasClass("checked")) {
    map.addLayer(twitterLayer);
    twitter24Hours(); //24 HOUR FILTER
  }
}

function addFL(){

  if ($('#cbFlickr').hasClass("checked")) {
    map.addLayer(flickrLayer);
    flickr24Hours(); //24 HOUR FILTER
  }
}

function addUsh(){

  if ($('#cbUsh').hasClass("checked")) {
    ushLayer = new esri.layers.GraphicsLayer({
      id: 'ushLayer'
    });
    map.addLayer(ushLayer);
    ush24Hours(); //24 HOUR FILTER
  }
}

function showLoading(){
  var loading = dojo.byId("loadingImg");
  esri.show(loading);
}

function hideLoading(){
  var loading = dojo.byId("loadingImg");
  esri.hide(loading);
}


// Slider transparency
function SetOpacityPath($){
  pathLayer.setOpacity($);
	swathLayer.setOpacity($);
}

function SetOpacityPrecip($){
  precipLayer.setOpacity($);
}



function setMapLayers(){
	//tuscaloosa swath
    swathLayer = new esri.layers.FeatureLayer("http://ec2-50-19-106-59.compute-1.amazonaws.com/ArcGIS/rest/services/swath/MapServer/0", {
    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
    id: 'swathLayer',
    "opacity": 1.0,
    visible: true,
    outFields: ["*"]
  });
  
   swathSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
       new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
       new dojo.Color([255,216,61]), 2),new dojo.Color([255,216,61,0.5]));
   swathRenderer = new esri.renderer.SimpleRenderer(swathSymbol);
 
   swathLayer.setRenderer(swathRenderer);
  map.addLayer(swathLayer); 
	
	//tuscaloosa path 
  pathLayer = new esri.layers.FeatureLayer("http://ec2-50-19-106-59.compute-1.amazonaws.com/ArcGIS/rest/services/TornadoPath/MapServer/0", {
    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
    id: 'pathLayer',
    "opacity": 1.0,
    visible: true,
    outFields: ["*"]
  });
  
   pathSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
       new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
       new dojo.Color([255,61,100]), 2),new dojo.Color([255,61,100,0.25]));
   pathRenderer = new esri.renderer.SimpleRenderer(pathSymbol);
 
   pathLayer.setRenderer(pathRenderer);
  map.addLayer(pathLayer); 
	
	
		
	//past tornado reports
  ptornadoLayer = new esri.layers.FeatureLayer("http://esrilabs1.esri.com/ArcGIS/rest/services/Tornado/Tornado/MapServer/0", {
    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
    id: 'ptornadoLayer',
    "opacity": 1.0,
    visible: true,
    outFields: ["*"]
  });
  
   ptornadoSymbol = new esri.symbol.PictureMarkerSymbol("images/map/tornado-faded-25x30.png", 25, 30);
   ptornadoRenderer = new esri.renderer.SimpleRenderer(ptornadoSymbol);
 
  ptornadoLayer.setRenderer(ptornadoRenderer);
  
  dojo.connect(ptornadoLayer, "onClick", function(evt){
    hideStuff();
    var fulldateInt = evt.graphic.attributes.Time;
		var fulldateStr = fulldateInt + "";
		var tday = (fulldateStr.substring(6, 8));
    var title = evt.graphic.attributes.Location + ', ' + evt.graphic.attributes.State;
    var iwcontent = evt.graphic.attributes.Comments + "<br/>" +
		'Report time: 4/' + tday + '/2011';
    
    map.infoWindow.setTitle(title);
    dojo.byId('infoWindowContents').innerHTML = iwcontent;
    map.infoWindow.resize(290, 130);
    esri.show(dojo.byId("infoWindowContents"));
    var screenPoint = evt.screenPoint;
    map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
  });
  
  map.addLayer(ptornadoLayer); 
	
	 //tornado reports
  tornadoLayer = new esri.layers.FeatureLayer("http://esrilabs1.esri.com/ArcGIS/rest/services/LiveFeeds/NOAA_storm_reports/MapServer/1", {
    mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
    id: 'tornadoLayer',
    "opacity": 1.0,
    visible: true,
    outFields: ["*"]
  });
  
   tornadoSymbol = new esri.symbol.PictureMarkerSymbol("images/map/tornadoactive25x30.png", 25, 30);
   tornadoRenderer = new esri.renderer.SimpleRenderer(tornadoSymbol);
 
  tornadoLayer.setRenderer(tornadoRenderer);
  
  dojo.connect(tornadoLayer, "onClick", function(evt){
    hideStuff();
    var UTCdate = new Date(evt.graphic.attributes.UTC_DATETIME);
    var title = evt.graphic.attributes.LOCATION + ', ' + evt.graphic.attributes.STATE;
    var iwcontent = evt.graphic.attributes.COMMENTS + "<br/>" +
    "Report time: " + UTCdate.toLocaleDateString() + ' ' + UTCdate.toLocaleTimeString() + ' (your time)';
    
    map.infoWindow.setTitle(title);
    dojo.byId('infoWindowContents').innerHTML = iwcontent;
    map.infoWindow.resize(290, 120);
    esri.show(dojo.byId("infoWindowContents"));
    var screenPoint = evt.screenPoint;
    map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
  });
  
  map.addLayer(tornadoLayer); 
  
	
	//imagery
  imageLayer = new esri.layers.ArcGISImageServiceLayer("http://rasterevents.arcgisonline.com/ArcGIS/rest/services/GeoEye_IKONOS2_TornadoResponse_Optimized/ImageServer", {
    id: 'imageLayer',
    visible: false
  });
	
  map.addLayer(imageLayer); 
  
  //westy token - Xe66f6JX0BbLpnsP3Tftr-zKIXmqO-_WtLiw5FtoSh1CYU83QwmW-B_y2c6yAk71
  //tmapps token - Xe66f6JX0BbLpnsP3Tftrz7fXnDw7AgElDvqXG5D7N41OGZdiL4V_3RfxegPy-HISL1uHI5EGmttE6oCUACPVQ..
  //Precip Layer
 
  precipLayer = new esri.layers.ArcGISDynamicMapServiceLayer("http://tmappsevents.esri.com/ArcGIS/rest/services/Secured/Precip/MapServer?token=DA8_CxEUpNjZsvWmxWwgWfnjvdEUGUaRAU_RJblp28Tu0V8n7NCevIMbSKbEIVdB", {
    "opacity": 0.60,
    id: "precipLayer",
    visible: true
  });
  map.addLayer(precipLayer);
  
}

function firecleanup(){
  fireLayer = null;
  perimeterLayer = null;
  perimeterqueryTask = null;
  perimeterquery = null;
  perimeterquery2 = null;
  perimeterquery3 = null;
}

function hideStuff(){
  esri.hide(dojo.byId("attrInspector"));
  esri.hide(dojo.byId("txtURL"));
  esri.hide(dojo.byId("txtDesc"));
  esri.hide(dojo.byId("txtKey"));
  esri.hide(dojo.byId("txtOther"));
  esri.hide(dojo.byId("ddType"));
  esri.hide(dojo.byId("ddCat"));
  esri.hide(dojo.byId("btnSave"));
  esri.hide(dojo.byId("btnDelete"));
}

function checkGraphic(evt){
  if ($('#cbSH').hasClass("checked")) {
  
    if (evt.graphic) {
      return;
    }
    else 
      if (selectedTemplate) {
        return;
      }
      else {
        executeHabQueryTask(evt);
      }
  }
}

//Use is the social media APIs are active
function toggle24Hour(){ //swtich between 24 hour and all radio button. Check to see which layers are checked on so only run the necessary queries.
     if($('#cbUsh').hasClass("checked")){
      ushLayer.clear();
      ush24Hours();
    }
    if($('#cbYT').hasClass("checked")){
      YTLayer.clear();
      yt24Hours();
    }
    if($('#cbTweet').hasClass("checked")){
      twitterLayer.clear();
      twitter24Hours();
    }
    if($('#cbFlickr').hasClass("checked")){
         flickrLayer.clear();
         flickr24Hours();
        }
    if($('#cbVolunteered').hasClass("checked")){
      shared24Hours();
    } 
}

function setTime(){ //function to set time as string for Ushahidi date compare
    curTime = new Date();
    curTimeUTC = curTime.getTime();
    curTimeUTC = curTimeUTC + 64800000; // 64800000 number of milliseconds on 18 hours (time difference between la and brisbane)
    //calculate time
    curTimeLocal = convertDateTW(curTimeUTC);
    time_1day = convertDateTW(curTimeUTC - 86400000); //86400000 = number milliseconds in a day
    time_30days = convertDateTW(curTimeUTC - 2592000000);//2592000000 = number milliseconds in 30 days

    if (time_1day.indexOf("-") != -1) {
        var split_1day = time_1day.split("-");
    }
    var stYear_1day = split_1day[0];
    var stMonth_1day = split_1day[1];
    var stDay_1day = split_1day[2];
    intYear_1day = parseInt(stYear_1day, 10);
    intMonth_1day = parseInt(stMonth_1day, 10);
    intDay_1day = parseInt(stDay_1day, 10);
    
    if (time_30days.indexOf("-") != -1) {
        var split_30days = time_30days.split("-");
    }
    var stYear_30days = split_30days[0];
    var stMonth_30days = split_30days[1];
    var stDay_30days = split_30days[2];
    intYear_30days = parseInt(stYear_30days, 10);
    intMonth_30days = parseInt(stMonth_30days, 10);
    intDay_30days = parseInt(stDay_30days, 10);

}
function setTimeExtent(){
    curTime = new Date();
    curTimeUTC = curTime.getTime();
    curTimeUTC = curTimeUTC + 64800000; // 64800000 number of milliseconds on 18 hours (time difference between la and brisbane)
    
  //calculate time for twitter API
    curTimeLocalTW = convertDateTW(curTimeUTC);
    timeUTC_24TW = convertDateTW(curTimeUTC - 86400000); //86400000 = number milliseconds in a day
    timeUTC_5daysTW = convertDateTW(curTimeUTC - 345600000); //86400000 = number milliseconds in 5 days - Twitter only keeps tweets in DB for 5 days
    timeUTC_4daysTW = convertDateTW(curTimeUTC - 259200000); //86400000 = number milliseconds in 5 days - Twitter only keeps tweets in DB for 5 days
 
  //calculate time for flickr API
    curTimeLocal = convertDate(curTimeUTC);
    timeUTC_24 = convertDate(curTimeUTC - 86400000); //86400000 = number milliseconds in a day
    timeUTC_30days = convertDate(curTimeUTC - 2592000000); //2592000000 = number milliseconds in 30 days
    
  //Shared content   
    curTimeLocalShare = convertDateShare(curTimeUTC);
    timeUTC_24Share = convertDateShare(curTimeUTC - 86400000); //86400000 = number milliseconds in a day
    timeUTC_30daysShare = convertDateShare(curTimeUTC - 2592000000); //2592000000 = number milliseconds in 30 days
}

function convertDateTW(gmtDate){
    var originalDate = new Date(gmtDate);
    var gmtDay, gmtMonth;
    if  (originalDate.getMonth() <= 8){ //getMonth uses a 0 based index for the month where January is "0", Feb is "1"...
        gmtMonth = "0" + (originalDate.getMonth() + 1);
    }
    else {
        gmtMonth = (originalDate.getMonth() + 1);
    }
    if (originalDate.getDate() <= 8){
        gmtDay = "0" + originalDate.getDate();
    }
    else {
        gmtDay = originalDate.getDate();
    }

    //var retStr = (originalDate.getMonth()+1) + "/" + originalDate.getDate() + "/" + originalDate.getFullYear() + " " + originalDate.getHours() + ":" + originalDate.getMinutes() + ":" + originalDate.getSeconds();
    var retStr = originalDate.getFullYear() + "-" + gmtMonth + "-" + gmtDay;
    return retStr;
}

//flickr
function convertDate(gmtDate){
    var originalDate = new Date(gmtDate);
    var retStr = (originalDate.getFullYear() + '-' + (originalDate.getUTCMonth() + 1) + '-' + originalDate.getUTCDate() + ' ' + originalDate.getUTCHours() + ':' + originalDate.getUTCMinutes() + ':' + originalDate.getUTCSeconds()); 
    return retStr;
}

//Shared Content
function convertDateShare(gmtDate){
    var originalDate = new Date(gmtDate);
    var retStr = (originalDate.getMonth()+1) + "/" + originalDate.getDate() + "/" + originalDate.getFullYear() + " " + originalDate.getHours() + ":" + originalDate.getMinutes() + ":" + originalDate.getSeconds();
    return retStr;
}

//TOGGLE MAP LAYERS      
function changeMap(layerid) //pass in layer id from html
{
  var tmplayer = layerid;
  var curLayer = map.getLayer(layerid);
  toggleLayer(curLayer);
  
}

function toggleLayer(layer){

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
    case "tornadoLayer":
      if (layer.visible) {
        layer.hide();
        $('#cbTornado').removeClass("checked");
        $('#cbTornado').addClass("unchecked");
      }
      else {
        layer.show();
        $('#cbTornado').removeClass("unchecked");
        $('#cbTornado').addClass("checked");
      }
		break;
		case "ptornadoLayer":
      if (layer.visible) {
        layer.hide();
        $('#cbpTornado').removeClass("checked");
        $('#cbpTornado').addClass("unchecked");
      }
      else {
        layer.show();
        $('#cbpTornado').removeClass("unchecked");
        $('#cbpTornado').addClass("checked");
      }
    break;
		case "pathLayer":
      if (layer.visible) {
        layer.hide();
				swathLayer.hide();
        $('#cbPath').removeClass("checked");
        $('#cbPath').addClass("unchecked");
      }
      else {
        layer.show();
				swathLayer.show();
        $('#cbPath').removeClass("unchecked");
        $('#cbPath').addClass("checked");
      }
      break;
			case "imageLayer":
      if (layer.visible) {
        layer.hide();
        $('#cbImage').removeClass("checked");
        $('#cbImage').addClass("unchecked");
      }
      else {
        layer.show();
        $('#cbImage').removeClass("unchecked");
        $('#cbImage').addClass("checked");
      }
      break;
    case "precipLayer":
      if (layer.visible) {
        layer.hide();
        $('#cbPrecip').removeClass("checked");
        $('#cbPrecip').addClass("unchecked");
      }
      else {
        layer.show();
        $('#cbPrecip').removeClass("unchecked");
        $('#cbPrecip').addClass("checked");
      }
      break;
  }
}

function graphicClickHandler(evt){
  if (evt.graphic.getLayer().id == "allEQ") {
    eqBuffer = evt.graphic;
  }
}

function replaceURLWithLinks(stuff){
  var reg_exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
  return stuff.replace(reg_exp, "<a href='$1' target='_blank'>$1</a>");
}


//LOCATE    
function locate(){
  var query = dojo.byId("address").value;
  locateString = query;
  veGeocoder.addressToLocations(query); //query is the address to locate
}

function showResults(geocodeResults){
  if (locateResultLayer) {
    locateResultLayer.clear();
  }
  var faddress = geocodeResults[0].address.formattedAddress;
  var bingPoint = geocodeResults[0].location;
  var country = geocodeResults[0].address.countryRegion;
  var pointMeters = esri.geometry.geographicToWebMercator(geocodeResults[0].location);
  var pointSymbol = new esri.symbol.PictureMarkerSymbol("images/map/pushpin-icon-orange.png", 24, 24);
  var locationGraphic = new esri.Graphic(pointMeters, pointSymbol);
  locateResultLayer.add(locationGraphic);
  esri.hide(dojo.byId('dialog1'));
  if (isLoadedFromURL === false) {
    map.setExtent(esri.geometry.geographicToWebMercator(geocodeResults[0].bestView));
  }
}

//clear the locate graphic
function clearLocate(){
  if (locateResultLayer) {
    locateResultLayer.clear();
  }
  dojo.byId('address').innerHTML = "";
  locateString = "";
}

function iwHide(){

  //if (editFeat) {
  //    opsPointLayer.applyEdits(null, null, [editFeat]);
  //}
  map.graphics.clear();
  editGLayer.clear();
  dojo.byId("infoWindowContents").innerHTML = "";
}

function URLLookup(name){
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results === null) {
    return "";
  }
  else {
    return results[1];
  }
}

function lastCall(){

  if (editFeat) {
    opsPointLayer.applyEdits(null, null, [editFeat]);
    editFeat = null;
    resetEditForm();
  }
}

dojo.addOnLoad(init);
dojo.addOnUnload(lastCall);
