//NEWS FEED
function showNewsquery(featureSet){
    //create symbol
    var newsSymbol = new esri.symbol.PictureMarkerSymbol("images/map/rss-2.png", 20, 20);
    dojo.forEach(featureSet.features, function(feature) {
        newsLayer.add(feature.setSymbol(newsSymbol));
        dojo.connect(newsLayer, "onClick", function(evt){
            hideStuff();
            var title = evt.graphic.attributes.Title;
            var iwcontent = evt.graphic.attributes.Description + "<br/>"
                + "<br><a href=" + evt.graphic.attributes.Link + " target = '_blank'><b>Full Story</b><br/>"; 
    
            map.infoWindow.setTitle(title);
            dojo.byId('infoWindowContents').innerHTML = iwcontent;
            map.infoWindow.resize(275,200);
            esri.show(dojo.byId("infoWindowContents"));
            var screenPoint = evt.screenPoint;
            map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
        }); 
        
    });
}

//ACCESS SOCIAL MEDIA APIS DIRECTLY - 24 HOUR FILTER
function getPosition(){ //alternate method to dynamically generate the lat, long, radius based on map view
    //get the center point of the map in Web Mercator
    var mapExtent = map.extent;
    var xmin = mapExtent.xmin;
    var ymin = mapExtent.ymin;
    var xmax = mapExtent.xmax;
    var ymax = mapExtent.ymax;

    //find the mid-point of the line using min/max x and min/max y coordinates.
    var midPtx = ((xmin + xmax) / 2);
    var midPty = ((ymin + ymax) / 2);
        
    //create a new mapPoint at the center of the current map in Web Mercator
    var mapCenterWM = new esri.geometry.Point(midPtx, midPty);
    mapCenterWGS = new esri.geometry.webMercatorToGeographic(mapCenterWM); //social feeds take WGS84 coordinates as input
    lat = mapCenterWGS.y;
    lon = mapCenterWGS.x;
    
    mapExtentWGS = new esri.geometry.webMercatorToGeographic(mapExtent);
    xminWGS = mapExtentWGS.xmin;
    yminWGS = mapExtentWGS.ymin;
    xmaxWGS = mapExtentWGS.xmax;
    ymaxWGS = mapExtentWGS.ymax;

    //buffer that point  - the difference between the x center point and xmax = radius
    var dynamicRadius = (xmax - midPtx);
    dynamicRadiusKM = (dynamicRadius/1000); //convert meters into KM
    //define a static radius value
    radius = 600;   
}

//YouTube - 24hr query
function yt24Hours(){
	
    showLoading();
    getPosition();
    map.infoWindow.hide();

    var ytSearch;
    if ($("#ytSearch").val() !== ""){ //check if the search term is nothing
        ytSearch = $("#ytSearch").val();
        initytSearch = ytSearch; //store the new value in a sperate variable to be used in case the search term is nothing.
    }
    else { //search term does = nothing
    //if the new search is nothing, set the new search value to the old value
        ytSearch = initytSearch;
        $("#ytSearch").val (ytSearch);
    }

    console.log('Search: Keyword = ' + ytSearch );
    console.log('Init Search: Keyword = ' + initytSearch );
    console.log('lat: ' + lat + 'lon: ' + lon )
    
    //%20 = space, %7C = OR, location in dd is required
     if ($('#rad_option2').hasClass("radSelected")) {
        var youtubeURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + ytSearch + '&max-results=50&time=today&v=2&lr=en&location=' + lat + ',' + lon + '&location-radius=' + radius + 'mi&alt=json';
     }
     else if ($('#rad_option1').hasClass("radSelected")) {
       var youtubeURL = 'http://gdata.youtube.com/feeds/api/videos?q=' + ytSearch + '&max-results=50&time=this_month&v=2&lr=en&location=' + lat + ',' + lon + '&location-radius=' + radius + 'mi&alt=json';       
     }
    console.log(youtubeURL);
    
    esri.request({
        url: youtubeURL,
        callbackParamName: "callback",
        load: parseYTGeoRSS,
        error: esriConfig.defaults.io.errorHandler  
    });
}

function parseYTGeoRSS(results){
    pntSym = new esri.symbol.PictureMarkerSymbol("images/map/youtube25x30-2.png", 25, 30);
    if (results.feed.openSearch$totalResults.$t == 0){
        dojo.byId('ytCount').innerHTML = " (0)"
    }
    else {
            var items = results.feed.entry;
            dojo.byId('ytCount').innerHTML = "";
            var count = 0;
            for (var idx = 0; idx < items.length; idx++) {
            var item = items[idx];
        if (["georss$where"] in item & ["content"] in item) {
            count = count + 1;
            var georsswhere = item.georss$where;
            var geopoint = georsswhere.gml$Point;
            var locpos = geopoint.gml$pos;
            var loc = locpos.$t.split(" ");
            var xVal = loc[1];
            var yVal = loc[0];
            
            var point = new esri.geometry.Point(xVal, yVal, new esri.SpatialReference({
                wkid: 102113
            }));
            var pointWM = new esri.geometry.geographicToWebMercator(point);
            
            var attributes = {
                content: item.content.src,
                title: item.title.$t,
                pubdate: item.published.$t
            };
            var graphic = new esri.Graphic(pointWM, pntSym, attributes);
            YTLayer.add(graphic);
    
            dojo.connect(YTLayer, "onClick", function(evt){
                hideStuff();
                var title = evt.graphic.attributes.title;
                //var iwcontent = "<object width='325' height='244' ><param name='movie' value=" + evt.graphic.attributes.content + "></param><param name='allowFullScreen' value='true'></param><param name='allowscriptaccess' value='always'></param><embed src=" + evt.graphic.attributes.content + "type='application/x-shockwave-flash' allowscriptaccess='always' allowfullscreen='true' width='325' height='244'></embed></object>";
                var iwcontent = '<div style="text-align:center; margin:0 auto;"><object width="325" height="244"><param name="movie" value=' + evt.graphic.attributes.content + '></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src=' + evt.graphic.attributes.content + 'type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="325" height="244"></embed></object></div>';
                map.infoWindow.resize(340, 293);
                map.infoWindow.setTitle(title);
                var iwStyle = dojo.byId('infoWindowContents').style;
                dojo.byId('infoWindowContents').innerHTML = iwcontent;
                esri.show(dojo.byId("infoWindowContents"));
                var screenPoint = evt.screenPoint;
                map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
            });
            
        }
        
    }
    dojo.byId('ytCount').innerHTML = " (" + count + ")";
    }
    hideLoading();
}

function twitter24Hours(){
    showLoading();
    getPosition();
    //Twitter Search API documentation = http://apiwiki.twitter.com/Twitter-Search-API-Method:-search
    
    var twSearch;
    if ($("#twSearch").val() !== ""){ //check if the search term is nothing
        twSearch = $("#twSearch").val();
        inittwSearch = twSearch; //store the new value in a sperate variable to be used in case the search term is nothing.
    }
    else { //search term does = nothing
    //if the new search is nothing, set the new search value to the old value
        twSearch = inittwSearch;
        $("#twSearch").val(twSearch); //fill the text box with a value
    }
    
    if (twSearch.indexOf('#') != -1) {
        twSearch = twSearch.replace("#", "%23")
    }
        
        setTimeExtent();
         if ($('#rad_option2').hasClass("radSelected")) {
            var twitterurl = 'http://search.twitter.com/search.json?q=' + twSearch + '&since=' + timeUTC_24TW + '&geocode=' + lat + '%2C' + lon + '%2C' + radius + 'mi' + '&rpp=100&result_type=mixed';
        }
        else 
            if ($('#rad_option1').hasClass("radSelected")) {
                var twitterurl = 'http://search.twitter.com/search.json?q=' + twSearch + '&since=' + timeUTC_4daysTW + '&geocode=' + lat + '%2C' + lon + '%2C' + radius + 'mi' + '&rpp=100&result_type=mixed';
            }
        //var twitterurl = 'http://search.twitter.com/search.atom?q=twitter&since=2010-02-28'; 
        console.log(twitterurl);
        esri.request({
            url: twitterurl,
            handleAs: "json",
            callbackParamName: "callback",
            load: showTweets,
            error: handleError
        });
        
}

function showTweets(data) {
    gs = [];
    leftouttweets = [];
    var i;
    geonames = [];
    var results = data.results;
    var timetaken = data.completed_in;
    var perpage = data.results_per_page;
    var point, pointWM;
    for (i = 0; i < results.length; i++) {
        point = null;
        pointWM = null;
        var location = results[i].location;
        var loc;
        var tweetTxt = results[i].text;
        var lcTweetTxt = tweetTxt.toLowerCase();
        //console.log(results[i].location + '    -    ' + results[i].from_user);
        if (lcTweetTxt.indexOf('shit') > -1 || tweetTxt.indexOf('fuck') > -1 || tweetTxt.indexOf('pissed') > -1 || tweetTxt.indexOf('drunk') > -1 || tweetTxt.indexOf('fuked') > -1 || tweetTxt.indexOf('shyt') > -1) {
            point = null;
            pointWM = null;
        }
        else if (location.indexOf("iPhone:") > -1) {
            location = location.slice(7);
            loc = location.split(",");
            point = new esri.geometry.Point(parseFloat(loc[1]), parseFloat(loc[0]));
            pointWM = new esri.geometry.geographicToWebMercator(point);
        }
        else if (location.indexOf(" T:") > -1) {
            location = location.slice(3);
            loc = location.split(",");
            point = new esri.geometry.Point(parseFloat(loc[1]), parseFloat(loc[0]));
            pointWM = new esri.geometry.geographicToWebMercator(point);
        }
        else if (location.indexOf("Pre:") > -1) {
            location = location.slice(4);
            loc = location.split(",");
            point = new esri.geometry.Point(parseFloat(loc[1]), parseFloat(loc[0]));
            pointWM = new esri.geometry.geographicToWebMercator(point);
        }
        else if (location.indexOf("\u00dcT:") > -1) {
            location = location.slice(3);
            loc = location.split(",");
            point = new esri.geometry.Point(parseFloat(loc[1]), parseFloat(loc[0]));
            pointWM = new esri.geometry.geographicToWebMercator(point);
        }
        else if (location.indexOf(", -") > 1 && location.indexOf(":") == -1) {
            loc = location.split(",");
            point = new esri.geometry.Point(parseFloat(loc[1]), parseFloat(loc[0]));
            pointWM = new esri.geometry.geographicToWebMercator(point);
        }
        else if (location.split(",").length == 2) {
            var loc = location.split(",");
            if (loc.length == 2 && parseFloat(loc[1]) && parseFloat(loc[0])) {
                point_g = new esri.geometry.Point(parseFloat(loc[1]), parseFloat(loc[0]));
            } else {
                leftouttweets.push(results[i]);
            }
        }
        else {
            console.info(location);
            leftouttweets.push(results[i]);
        }
        if (pointWM !== null) {
            //console.log(pointWM.toJson());
            //gs.push(new esri.Graphic(pointWM, new esri.symbol.PictureMarkerSymbol(results[i].profile_image_url, 24, 24).setOffset(24, 24), results[i], null));
            gs.push(new esri.Graphic(pointWM, new esri.symbol.PictureMarkerSymbol("images/map/twitter-point-25x30-2.png", 25, 30).setOffset(20, 20), results[i], null));

        }
    }

    //console.log(gs);
    for (i = 0; i < gs.length; i++) {
        twitterLayer.add(gs[i]);
    }

    console.log("Showing " + gs.length + " tweets of " + results.length);

    if (gs.length < 1 && leftouttweets.length < 1 ) { //if all results = 0
        hideLoading();
        dojo.byId('twCount').innerHTML = " (0)";
    }
    else
      if(gs.length > 0 && leftouttweets.length < 1) { //geocoded tweets > 0 but leftouttweets = 0
        dojo.connect(twitterLayer, "onClick", g_mousedown);
        hideLoading();
        dojo.byId('twCount').innerHTML = " (" + gs.length + ")";
    }

    if (leftouttweets.length > 0) handleLeftOutTweets();
}


function handleLeftOutTweets(){
    console.log("Handling " + leftouttweets.length + " left out tweets");
    var def = [];
    gs2 = [];
    dojo.forEach(leftouttweets, function(tweet, index, array){
        console.log("Geocoding: " + tweet.location);
        def.push(veTwitterGeocoder.addressToLocations(tweet.location));
    });
    
    console.log(def);
    var deferredsList = new dojo.DeferredList(def);
        
    setTimeout(function(){
        console.log("Adding callbacks");
        deferredsList.addCallback(function(response){
            console.log("Bing Geocoding results: " + response.length);
            dojo.forEach(response, function(veGeocodeResults, index, array){                
                if (veGeocodeResults[1].length < 1) {
                    console.log("Unable to geocode " + leftouttweets[index].location + "(" + index + ")");
                }
                else {
                    var velocation = veGeocodeResults[1][0].location;
                    var point_wm = esri.geometry.geographicToWebMercator(velocation);
                    gs2.push(new esri.Graphic(point_wm, new esri.symbol.PictureMarkerSymbol("images/map/twitter-point-25x30-2.png", 25, 30).setOffset(20, 20), leftouttweets[index], null));
                }
            });
            
            console.log("Showing " + gs2.length + " tweets of " + response.length);
            var totalTweets = gs.length + gs2.length;
            dojo.byId('twCount').innerHTML = "";
            dojo.byId('twCount').innerHTML = " (" + totalTweets + ")";
            
            for (a = 0; a < gs2.length; a++) {
                twitterLayer.add(gs2[a]);
            }
            if (gs2.length < 1) {
                //do nothing
            }
            else {
                dojo.connect(twitterLayer, "onClick", g_mousedown);
            }
        });
    }, 1000);  
    hideLoading(); 
}

//twitter supporting functions
function g_mousedown(evt){
    var g = evt.graphic;
    var attr = g.attributes;
    if (attr === null || attr === undefined) {
        return;
    }
    hideStuff();
    var content = "";
    if (attr.profile_image_url) {
        content = '<a href="http://twitter.com/' + attr.from_user + '" target="_blank"><img class="shadow" src="' + attr.profile_image_url + '" width="48" height="48" align="left"></a>';
    }
    content += replaceURLWithLinks(attr.text);
    content += '<br/><br/>Location: (' + attr.location + ')<br/><br/>Created: ' + attr.created_at ;
    var title = attr.from_user + " says ";
    map.infoWindow.resize(300,175);
    map.infoWindow.setTitle(title);
    dojo.byId('infoWindowContents').innerHTML = content;
    esri.show(dojo.byId("infoWindowContents"));
    map.infoWindow.show(evt.screenPoint,  map.getInfoWindowAnchor(evt.screenPoint));
}

function handleError(type, data, evt){
    console.error(data);
}

function clearGraphics(){
    trends = null;
    cities = null;
    citiesgs = null;
    tweets = null;
    map.graphics.clear();
}


//Flickr - 24hr query
function flickr24Hours(){
    showLoading();
    getPosition();
    console.log(xminWGS + ',' + yminWGS + ',' + xmaxWGS + ',' + ymaxWGS);
    setTimeExtent();
    
    var flSearch;
    if ($("#flSearch").val() !== ""){ //check if the search term is nothing
        flSearch = $("#flSearch").val();
        initflSearch = flSearch; //store the new value in a sperate variable to be used in case the search term is nothing.
    }
    else { //search term does = nothing
    //if the new search is nothing, set the new search value to the old value
        flSearch = initflSearch;
        $("#flSearch").val(flSearch); //fill the text box with a value
    }
    
    if ($('#rad_option2').hasClass("radSelected")){
        flickrURL = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe7e074f8dad46678841c585f38620b7&tags='+ flSearch +'&min_taken_date=' + timeUTC_24 + '&bbox='+ xminWGS + ',' + yminWGS + ',' + xmaxWGS + ',' + ymaxWGS +'&accuracy=6&has_geo=1&extras=date_taken%2Call_extras%2Cgeo%2Cowner_name%2Clicense%2Co_dims&per_page=500&format=json';
    }
    else {
        flickrURL = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=fe7e074f8dad46678841c585f38620b7&tags='+ flSearch +'&min_taken_date=' + timeUTC_30days + '&bbox='+ xminWGS + ',' + yminWGS + ',' + xmaxWGS + ',' + ymaxWGS +'&accuracy=6&has_geo=1&extras=date_taken%2Call_extras%2Cgeo%2Cowner_name%2Clicense%2Co_dims&per_page=500&format=json';
    }
    
    esri.request({
        url: flickrURL,
        callbackParamName: "jsoncallback", //"_callback"
        load: parseFlickrGeoRSS,
        error: esriConfig.defaults.io.errorHandler
    });
}

function parseFlickrGeoRSS(results){
    map.graphics.clear();
    flickrSymbol = new esri.symbol.PictureMarkerSymbol("images/map/flickr25x30-2.png", 25, 30);
    var count = 0;
    var items = results.photos.photo;

    for (var idx = 0; idx < items.length; idx++) {
        var item = items[idx];
        if (["latitude"] in item) {
            count = count + 1;
            var lat = item.latitude;
            var lon = item.longitude;
            var point = new esri.geometry.Point(lon, lat, new esri.SpatialReference({wkid: 102113}));
            var pointWM = new esri.geometry.geographicToWebMercator(point);
            var picURL = "http://farm" + item.farm + ".static.flickr.com/" + item.server + "/" + item.id + "_" + item.secret+ ".jpg";
            var gcontent = "<img class='shadow' src=" + picURL + ">";
            var attributes = {
                Link: picURL,
                PubDate: item.datetaken,
                content: gcontent,
                title: item.title,
                license: item.license,
                owner: item.ownername
            };
            var graphic = new esri.Graphic(pointWM, flickrSymbol, attributes, infoTemplate);
            if (graphic.attributes.license < 4 && graphic.attributes.owner != 'Steve Rhodes'){
                flickrLayer.add(graphic);
            }

        }
    }

    
    dojo.byId('flCount').innerHTML = " (" + count + ")";
    dojo.connect(flickrLayer, "onClick", function(evt){
        hideStuff();
        var title = evt.graphic.attributes.title;
       //var iwcontent = '<div style="text-align:center; margin:0 auto;"><img style="width:600;height:500" src=' + evt.graphic.attributes.Link + '></div>';
        var iwcontent = '<div style="text-align:center; margin:0 auto;"><img style="width:600;height:500" src=' + evt.graphic.attributes.Link + '><br>Attributed to: ' + evt.graphic.attributes.owner + '</div>';
        map.infoWindow.resize(500,400);
        map.infoWindow.setTitle(title);
        var iwStyle = dojo.byId('infoWindowContents').style;
        dojo.byId('infoWindowContents').innerHTML = iwcontent;
        esri.show(dojo.byId("infoWindowContents"));
        var screenPoint = evt.screenPoint;
        map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
    });
    hideLoading();
}

//USHAHIDI   - not available until Ushahidi sets up the feed for the event
function ush24Hours(){
    var ushURL = "./resources/proxy.ashx?http://alabamastorm.crowdmap.com/api"; //change to the appropiate URL
    dojo.xhrPost({
        url: ushURL,
        content: {
          task: "incidents",
          by: "all",
          resp: "json",
          limit: 10000,
          orderfield: "incidentdate"
        },
        handleAs: "json",
        load: parseGeoRSS,
        error: esriConfig.defaults.io.errorHandler
    });
}
    
function parseGeoRSS(response, io){
	
      pntSym = new esri.symbol.PictureMarkerSymbol("images/map/ush24-2.png", 24, 21);
      setTimeExtent(); 
      var infoTemplate = new esri.InfoTemplate();
      var items = response.payload.incidents;
      if (items.length === 0) {
            var content = dojo.string.substitute("The Ushahidi GeoRSS feed is currently unavailable, please try again later.");
            dijit.byId('dialog5').setContent(content);
            dijit.byId('dialog5').show();
            $('#cbUsh').click();
      }
      else {
          
          var point = null;
          var pointWM = null;
          for (var idx = 0; idx < items.length; idx++) {
            var item = items[idx];
            var link;
            if(item.media){
                if(item.media[0]){
                    link = item.media[0].medialink;
                }
            }
            point = new esri.geometry.Point(item.incident.locationlongitude, item.incident.locationlatitude, new esri.SpatialReference({ wkid: 4326 }));
            pointWM = new esri.geometry.geographicToWebMercator(point);
            
             var attributes = {
                Title: item.incident.incidenttitle,
                Link: link,
                PubDate: item.incident.incidentdate,
                Description: item.incident.incidentdescription,
                LocationName: item.incident.locationname
            };
            var graphic = new esri.Graphic(pointWM, pntSym, attributes);
						
					//ushahidi dates
          var UshPubDate = attributes.PubDate;
          setTimeUsh(UshPubDate); 
          var ushDate = new Date;
          ushDate.setDate(intDay_Ush);
          ushDate.setMonth(intMonth_Ush - 1);
          ushDate.setFullYear(intYear_Ush);

          //current time as string converted back to date
          var sysDate_1day = new Date;
          sysDate_1day.setDate(intDay_1day);
          sysDate_1day.setMonth(intMonth_1day - 1);
          sysDate_1day.setFullYear(intYear_1day);
            
            if ($('#rad_option2').hasClass("radSelected")) {
                if (ushDate >= sysDate_1day){
                  ushLayer.add(graphic);
                }
           }
           else if ($('#rad_option1').hasClass("radSelected")) {
                    ushLayer.add(graphic);
           }
            
            dojo.connect(ushLayer, "onClick", function(evt){
                hideStuff();
                var title = evt.graphic.attributes.Title;
                var iwcontent = evt.graphic.attributes.Description + '<br/>'
                + '<br>Date Published: ' + evt.graphic.attributes.PubDate + '<br/>';
                map.infoWindow.setTitle(title);
                dojo.byId('infoWindowContents').innerHTML = iwcontent;
                esri.show(dojo.byId("infoWindowContents"));
                var screenPoint = evt.screenPoint;
                map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
                map.infoWindow.resize(340,250);
                
            });
        }
    }
}

function setTimeUsh(UshPubDate){
   if (UshPubDate.indexOf("-") != -1) {
        var splitDate = UshPubDate.split("-");
    }
  
    var stYear_Ush = splitDate[0];
    var stMonth_Ush = splitDate[1];
    var stDay_Ush = splitDate[2];
    intYear_Ush = parseInt(stYear_Ush, 10);
    intMonth_Ush = parseInt(stMonth_Ush, 10);
    intDay_Ush = parseInt(stDay_Ush, 10);
}

//SHARED CONTENT - FEATURE LAYER TIME DEFINITION
function shared24Hours() {
    //get the current time so can see edits made in the last second
        setTimeExtent();
        if ($('#rad_option2').hasClass("radSelected")) {
            initTimeExtent = new esri.TimeExtent(timeUTC_24Share, curTimeUTC);
            opsPointLayer.setTimeDefinition(initTimeExtent);
            opsPointLayer.show();
        }
        else {
            initTimeExtent = new esri.TimeExtent(timeUTC_30daysShare,curTimeUTC);
            opsPointLayer.setTimeDefinition(initTimeExtent);
            opsPointLayer.show();
        }
}



//TURN ON 24 HOUR FILTERS - ACCESS SOCIAL MEDIA THOUGH MAP SERVICE LAYERS (LIVE FEED)- YOU CAN USE THIS MENTHOD IF YOU TAKE 
//ADVANTAGE OF THE AGGREGATED LIVE FEEDS METHODOLOGY -http://resources.esri.com/publicsafety/index.cfm?fa=codeGalleryDetails&scriptID=16421
/*
//USHAHIDI - QUERY TASK
function ush24Hours(){
        //QUERY USHAHIDI LIVE FEED
        //build query task
        ushQueryTask = new esri.tasks.QueryTask("http://esrilabs1.esri.com/ArcGIS/rest/services/LiveFeeds/Ushahidi_OilSpill/MapServer/0");
        
        //build query filter
        ushQuery = new esri.tasks.Query();
        ushQuery.outSpatialReference = {
            "wkid": 102100
        };
        ushQuery.returnGeometry = true;
        ushQuery.geometry = startExtent;
        ushQuery.outFields = ["*"];
        
        if ($('#rad_option2').hasClass("radSelected")){
            timeExtent = new esri.TimeExtent(timeUTC_24,curTimeUTC);
        }
        else {
            timeExtent = new esri.TimeExtent(timeUTC_30days,curTimeUTC);
        }
        
        ushQuery.timeExtent = timeExtent;
        executeUshQueryTask();
}

function executeUshQueryTask() {
        //Execute task and call showResults on completion
        ushQueryTask.execute(ushQuery, function(fset) {
            if (fset.features.length !== 0) {
                showUshFeatureSet(fset);
             }
        });
}

function showUshFeatureSet(featureSet) {
        //ushFLayer.hide();
        ushGraphicsLayer.clear();
        ushGraphicsLayer = new esri.layers.GraphicsLayer();
        map.addLayer(ushGraphicsLayer);
        ushSymbol = new esri.symbol.PictureMarkerSymbol("images/map/ush24.png", 24, 21); 
        
        dojo.forEach(featureSet.features, function(feature) {
          ushGraphicsLayer.add(feature.setSymbol(ushSymbol));
        });     
            
        dojo.connect(ushGraphicsLayer, "onClick", function(evt){
             hideStuff();
            var title = evt.graphic.attributes.TITLE;
            var iwcontent = evt.graphic.attributes.DESCRIPTION + '<br/>'
            + '<br>Date Published: ' + convertDate(evt.graphic.attributes.UTC_DATETIME) + '<br/>';
            map.infoWindow.setTitle(title);
            dojo.byId('infoWindowContents').innerHTML = iwcontent;
            esri.show(dojo.byId("infoWindowContents"));
            var screenPoint = evt.screenPoint;
             map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
            map.infoWindow.resize(340,312);
        
         });    
            
}

//YOU TUBE- QUERY TASK
function yt24Hours(){
        //QUERY YouTube LIVE FEED
        //build query task
        ytQueryTask = new esri.tasks.QueryTask("http://esrilabs1.esri.com/ArcGIS/rest/services/LiveFeeds/YouTube_Oilspill/MapServer/0");
        
        //build query filter
        ytQuery = new esri.tasks.Query();
        ytQuery.outSpatialReference = {
            "wkid": 102100
        };
        ytQuery.returnGeometry = true;
        ytQuery.geometry = startExtent;
        ytQuery.outFields = ["*"];
        
        if ($('#rad_option2').hasClass("radSelected")){
            timeExtent = new esri.TimeExtent(timeUTC_24,curTimeUTC);
        }
        else {
            timeExtent = new esri.TimeExtent(timeUTC_30days,curTimeUTC);
        }
        
        ytQuery.timeExtent = timeExtent;
        executeYTQueryTask();   
}

function executeYTQueryTask() {
        //Execute task and call showResults on completion
        ytQueryTask.execute(ytQuery, function(fset) {
            if (fset.features.length !== 0) {
                showYTFeatureSet(fset);
             }
        });
}

function showYTFeatureSet(featureSet) {
        ytGraphicsLayer.clear();
        ytGraphicsLayer = new esri.layers.GraphicsLayer();
        map.addLayer(ytGraphicsLayer);
        youTubeSymbol = new esri.symbol.PictureMarkerSymbol("images/map/youtube.png", 20, 20);
        
        dojo.forEach(featureSet.features, function(feature) {
          ytGraphicsLayer.add(feature.setSymbol(youTubeSymbol));
        }); 

        
     dojo.connect(ytGraphicsLayer, "onClick", function(evt){
        hideStuff();
        var title = evt.graphic.attributes.TITLE;
        //var iwcontent = "<object width='325' height='244' ><param name='movie' value=" + evt.graphic.attributes.content + "></param><param name='allowFullScreen' value='true'></param><param name='allowscriptaccess' value='always'></param><embed src=" + evt.graphic.attributes.content + "type='application/x-shockwave-flash' allowscriptaccess='always' allowfullscreen='true' width='325' height='244'></embed></object>";
        var iwcontent = '<div style="text-align:center; margin:0 auto;"><object width="325" height="244"><param name="movie" value=' + evt.graphic.attributes.VIDEO_LINK + '></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="' + evt.graphic.attributes.EMBEDDED_LINK + '" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="325" height="244"></embed></object></div>';   //&amp;hl=en_US&amp;fs=1
        map.infoWindow.resize(340,293);
        map.infoWindow.setTitle(title);
        var iwStyle = dojo.byId('infoWindowContents').style;
        dojo.byId('infoWindowContents').innerHTML = iwcontent;
        esri.show(dojo.byId("infoWindowContents"));
        var screenPoint = evt.screenPoint;
        map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
    });    
}

//TWITTER - QUERY TASK FOR 24 HOUR FILTER. IDENTIFY TASK FOR SHOW ALL FILTER BECAUSE TOO MANY FEATURES TO RETURN TO THE MAP AS CLIENT-SIDE
//GRAPHICS AND IDENTIFY MADE IT EASY TO QUERY THE MAP AND GET THE GEOMETRY/ATTRIBUES FOR THE INFOWINDOW
function twitter24Hours(){    
        if ($('#rad_option2').hasClass("radSelected")) {
            //QUERY TWITTER LIVE FEED to draw on screen
            //build query task
            tQueryTask = new esri.tasks.QueryTask("http://esrilabs1.esri.com/ArcGIS/rest/services/LiveFeeds/Twitter_Oilspill/MapServer/0");
        
            //build query filter
            tQuery = new esri.tasks.Query();
            tQuery.outSpatialReference = {"wkid": 102100};
            tQuery.returnGeometry = true;
            tQuery.geometry = startExtent;
            tQuery.outFields = ["*"];
            tQuery.where = "SOURCE_NAME != 'web' or SOURCE_NAME != 'RSS2Twitter'";
            timeExtent = new esri.TimeExtent(timeUTC_24, curTimeUTC);
            tQuery.timeExtent = timeExtent;
            executeTQueryTask();
        }
        else {
            //set the time extent of the map to the past 7 days
            timeExtent = new esri.TimeExtent(timeUTC_7days, curTimeUTC);
            map.setTimeExtent(timeExtent);
            map.getLayer("lyrTweetGulf").show(); //draw the dynamic map service filtered by the map's time extent
            dojo.connect(map, "onClick", doIdentify);

            //identifyTask = new esri.tasks.IdentifyTask("http://robson/ArcGIS/rest/services/oilspill/Twitter_Oilspill/MapServer");
            identifyTask = new esri.tasks.IdentifyTask("http://robson/ArcGIS/rest/services/oilspill/Twitter_Oilspill_live/MapServer"); //wgs84
            //identifyTask = new esri.tasks.IdentifyTask("http://esrilabs1.esri.com/ArcGIS/rest/services/LiveFeeds/Twitter_Oilspill/MapServer");
            identifyParams = new esri.tasks.IdentifyParameters();
            identifyParams.timeExtent = timeExtent;
            identifyParams.tolerance = 6;
            identifyParams.returnGeometry = true;
            identifyParams.layerIds = [0];
            identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_TOP;
            //identifyParams.width  = map.width;
            //identifyParams.height = map.height;

        }   
}

function executeTQueryTask() {      
        //Execute task and call showResults on completion
        tQueryTask.execute(tQuery, function(fset) {
            if (fset.features.length !== 0) {
                showTFeatureSet(fset);
             }
        });
}   

 function showTFeatureSet(featureSet) {
        tGraphicsLayer.clear();
        tGraphicsLayer = new esri.layers.GraphicsLayer();
        map.addLayer(tGraphicsLayer);
        twitterSymbol = new esri.symbol.PictureMarkerSymbol("images/map/twitter.jpg", 20, 20);
        
        dojo.forEach(featureSet.features, function(feature) {
          tGraphicsLayer.add(feature.setSymbol(twitterSymbol));
        });
        
    dojo.connect(tGraphicsLayer, "onClick", function(evt){
        var g = evt.graphic;
        var attr = g.attributes;
        if (attr === null || attr === undefined) {
            return;
        }
        hideStuff();
        var content = "";
        var dateStr = convertDate(attr.UTC_POSTED);
        //debugger;
        if (attr.AUTHOR_THUMBNAIL) {
            content = '<a href="http://twitter.com/' + attr.AUTHOR_NAME + '" target="_blank"><img class="shadow" src="' + attr.AUTHOR_THUMBNAIL + '" width="48" height="48" align="left"></a>';
        }
        content += replaceURLWithLinks(attr.TWEET_TEXT);
        content += '<br/><br/>Location: Lat=' + attr.TWEET_LAT + ', Lon=' + attr.TWEET_LONG + '<br/><br/>Created: ' + dateStr;
        var title = attr.AUTHOR_NAME + " says ";
        map.infoWindow.resize(300,275);
        map.infoWindow.setTitle(title);
        dojo.byId('infoWindowContents').innerHTML = content;
        esri.show(dojo.byId("infoWindowContents"));
        map.infoWindow.show(evt.screenPoint,  map.getInfoWindowAnchor(evt.screenPoint));
    });
            
}

function doIdentify(evt) {
        map.graphics.clear();
        identifyParams.geometry = new esri.geometry.webMercatorToGeographic(evt.mapPoint);
        identifyParams.mapExtent = new esri.geometry.webMercatorToGeographic(map.extent);
        //identifyParams.geometry = evt.mapPoint;
        //identifyParams.mapExtent = map.extent;
        identifyTask.execute(identifyParams, function(idResults) {addToMap(idResults, evt);});
      }

 function addToMap(idResults, evt){
        var firstFeature = idResults[0].feature;
        var attr = firstFeature.attributes;
        if (attr === null || attr === undefined) {
            return;
        }
        hideStuff();
        var content = "";
        var dateStr = convertDate(attr.UTC_POSTED);
        if (attr.AUTHOR_THUMBNAIL) {
            content = '<a href="http://twitter.com/' + attr.AUTHOR_NAME + '" target="_blank"><img class="shadow" src="' + attr.AUTHOR_THUMBNAIL + '" width="48" height="48" align="left"></a>';
        }
        content += replaceURLWithLinks(attr.TWEET_TEXT);
        content += '<br/><br/>Location: Lat=' + attr.TWEET_LAT + ', Lon=' + attr.TWEET_LONG + '<br/><br/>Created: ' + dateStr;
        var title = attr.AUTHOR_NAME + " says ";
        map.infoWindow.resize(300,275);
        map.infoWindow.setTitle(title);
        dojo.byId('infoWindowContents').innerHTML = content;
        esri.show(dojo.byId("infoWindowContents"));
        map.infoWindow.show(evt.screenPoint,  map.getInfoWindowAnchor(evt.screenPoint));

 }

*/


//TWITTER AND FACEBOOK SHARING
function shareLink(site){
    var link;
    var srchStr;
    var configStr;
    var locStr;
    var xminStr;
    var yminStr;
    var xmaxStr;
    var ymaxStr;

    if (site == "fb") {
        //make a valid Facebook link
        configStr = '%3fsearch%3d' + searchString + '%26locate%3d' + locateString + '%26xmin%3d' + sXmin + '%26ymin%3d' + sYmin + '%26xmax%3d' + sXmax + '%26ymax%3d' + sYmax;
        link = 'index-2.html';
        link += configStr;
        var fbBitly = 'http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=' + link + '&format=json';
        esri.request({
            url: fbBitly,
            handleAs: "json",
            callbackParamName: "callback",
            load: setFBLink,
            error: handleError
        });
    }
    if (site == "tw") {
        //make a valid Facebook link
        configStr = '%3fsearch%3d' + searchString + '%26locate%3d' + locateString + '%26xmin%3d' + sXmin + '%26ymin%3d' + sYmin + '%26xmax%3d' + sXmax + '%26ymax%3d' + sYmax;
        link = 'index-2.html';
        link += configStr;
        var twBitly = 'http://api.bit.ly/v3/shorten?login=esri&apiKey=R_65fd9891cd882e2a96b99d4bda1be00e&uri=' + link + '&format=json';
        esri.request({
            url: twBitly,
            handleAs: "json",
            callbackParamName: "callback",
            load: setTWLink,
            error: handleError
        });
    }
}

function setTWLink(response){
    shLink = response.data.url;
    var fullLink;
    if (shLink) {
        fullLink = 'http://twitter.com/home/?status=Adding%20content%20to%20the%20Tuscaloosa%20tornado%20map.%20' + shLink;
        window.open(fullLink);
    }
}

function setFBLink(response){
    fbLink = response.data.url;
    fbLink = fbLink.replace(":", "%3A");
    fbLink = fbLink.replace(/\//g, "%2F");
    var fullLink;
    if (fbLink) {
        fullLink = 'http://www.facebook.com/sharer.php?u=' + fbLink + '&t=Adding%20content%20to%20the%20Tuscaloosa%20tornado%20map.';
        window.open(fullLink);
    }
}

//Handle resize of browser
function resizeMap(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
        map.resize();
        map.reposition();
    }, 800);
}
