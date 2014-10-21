$(document).ready(function() {
	
/*------------------------------------------------------
 * SOCIAL MEDIA LAYER TOGGLE
 ------------------------------------------------------*/
//YOUTUBE
function toggleYT(){
    if ($('#cbYT').hasClass("unchecked")) {
        $('#cbYT').removeClass("unchecked");
        $('#cbYT').addClass("checked");
        map.addLayer(YTLayer);
        yt24Hours();
    }
    else 
        if ($('#cbYT').hasClass("checked")) {
            $('#cbYT').removeClass("checked");
            $('#cbYT').addClass("unchecked");
            map.removeLayer(map.getLayer('YTLayer'));
            dojo.byId('ytCount').innerHTML = "";
            map.infoWindow.hide();
        }
}

//
$('#cbYT').toggle(function() {
     toggleYT();
    }, function() {     
       toggleYT();
});
//
//TWITTER
function toggleTwitter(){
    if ($('#cbTweet').hasClass("unchecked")) {
        $('#cbTweet').removeClass("unchecked");
        $('#cbTweet').addClass("checked");
        map.addLayer(twitterLayer);
        twitter24Hours(); //24 HOUR FILTER
    }
    else if ($('#cbTweet').hasClass("checked")){
        $('#cbTweet').removeClass("checked");
        $('#cbTweet').addClass("unchecked");
        map.removeLayer(map.getLayer('twitterLayer'));
        dojo.byId('twCount').innerHTML = "";
        map.infoWindow.hide();
    }
}
//
    $('#cbTweet').toggle(function() {
       toggleTwitter();
    }, function() {
       toggleTwitter();
    });
// 
//FLICKR  
function toggleFlickr(){
    if ($('#cbFlickr').hasClass("unchecked")) {
        $('#cbFlickr').removeClass("unchecked");
        $('#cbFlickr').addClass("checked");
        map.addLayer(flickrLayer);
        flickr24Hours(); //24 HOUR FILTER
    }
    else if ($('#cbFlickr').hasClass("checked")){
        $('#cbFlickr').removeClass("checked");
        $('#cbFlickr').addClass("unchecked");
        map.removeLayer(map.getLayer('flickrLayer'));
        dojo.byId('flCount').innerHTML = "";
        map.infoWindow.hide();
    }
    
}
//
    $('#cbFlickr').toggle(function() {
       toggleFlickr();
    }, function() {
       toggleFlickr();
    });
//
//USHAHIDI - NO INTERACTIVE SEARCH CAPABILITY
     $('#cbUsh').toggle(function() {
        $('#cbUsh').removeClass("checked");
         $('#cbUsh').addClass("unchecked");
         map.removeLayer(map.getLayer('ushLayer'));
         map.graphics.clear();
         map.infoWindow.hide();
    }, function() {
       $('#cbUsh').removeClass("unchecked");
        $('#cbUsh').addClass("checked");
        ushLayer = new esri.layers.GraphicsLayer({id:'ushLayer'});
        map.addLayer(ushLayer);
        ush24Hours(); //24 HOUR FILTER
        
    });
    
/*------------------------------------------------------
 * SEARCH BUTTON AND KEYSTROKE INTERACTION - SOCIAL MEDIA LAYERS
 ------------------------------------------------------*/
//YOUTUBE
function clickYT(){
    if ($('#cbYT').hasClass("unchecked")) {
        $('#cbYT').removeClass("unchecked");
        $('#cbYT').addClass("checked");
        map.addLayer(YTLayer);
        yt24Hours(); //  24 HOUR FILTER
    }
    else if ($('#cbYT').addClass("checked")){
        YTLayer.clear();
        yt24Hours(); //  24 HOUR FILTER
    }
}

//click function for search
  $('#ytSearchBtn').click(function() {
    clickYT();
});
    
// keystroke function for search
$('#ytSearch').keyup(function(e) {
        if(e.keyCode == 13) {
            clickYT();
        }
});

// TWITTER
function clickTW(){
    if ($('#cbTweet').hasClass("unchecked")) {
        $('#cbTweet').removeClass("unchecked");
        $('#cbTweet').addClass("checked");
        map.addLayer(twitterLayer);
        twitter24Hours(); //  24 HOUR FILTER
    }
    else if ($('#cbTweet').addClass("checked")){
        twitterLayer.clear();
        twitter24Hours(); //  24 HOUR FILTER
    }
}
//click function for search
    $('#twSearchBtn').click(function() {
        clickTW();
    });
// keystroke function for search
       $('#twSearch').keyup(function(e) {
        if(e.keyCode == 13) {
            clickTW();
        }
    });

//FLICKR
function clickFL(){
    if ($('#cbFlickr').hasClass("unchecked")) {
        $('#cbFlickr').removeClass("unchecked");
        $('#cbFlickr').addClass("checked");
        map.addLayer(flickrLayer);
        flickr24Hours(); //  24 HOUR FILTER
    }
    else if ($('#cbYT').addClass("checked")){
        flickrLayer.clear();
        flickr24Hours(); //  24 HOUR FILTER
    }
}
//click function for search
    $('#flSearchBtn').click(function() {
        clickFL();
    });
// keystroke function for search
       $('#flSearch').keyup(function(e) {
        if(e.keyCode == 13) {
            clickFL();
        }
    });
	
/*------------------------------------------------------
 * LAYER TOGGLE
 ------------------------------------------------------*/
   $('#cbTornado').toggle(function() {
        changeMap(['tornadoLayer']);
    }, function() {
        changeMap(['tornadoLayer']);
    });
		//
		 $('#cbpTornado').toggle(function() {
        changeMap(['ptornadoLayer']);
    }, function() {
        changeMap(['ptornadoLayer']);
    });
    //
		   $('#cbPath').toggle(function() {
        changeMap(['pathLayer']);
    }, function() {
        changeMap(['pathLayer']);
    });
	$('#cbImage').toggle(function() {
        changeMap(['imageLayer']);
    }, function() {
        changeMap(['imageLayer']);
    });
    //  
    $('#cbPrecip').toggle(function() {
		changeMap(['precipLayer']);
	}, function() {
		changeMap(['precipLayer']);
	});
	//	
	$('#cbNews').toggle(function() {
		//map.graphics.clear();
		newsLayer = new esri.layers.GraphicsLayer({id:'newsLayer'});
		map.addLayer(newsLayer);
		newsqueryTask = new esri.tasks.QueryTask("http://stormtracker.esri.com/ArcGIS/rest/services/News/News/MapServer/0");
		//build query filter
		newsquery = new esri.tasks.Query();
		newsquery.returnGeometry = true;
		newsquery.outFields = ["Title", "Description", "Link", "Source"];
		//newsquery.geometry = map.extent;
		newsquery.where = "1=1";
		newsquery.outSpatialReference =  new esri.SpatialReference({wkid: 102100});
		newsqueryTask.execute(newsquery, showNewsquery);
		$(this).removeClass("unchecked");
		$(this).addClass("checked");
	}, function() {
		//map.graphics.clear();
		if (map.getLayer('newsLayer')) {
			map.removeLayer(map.getLayer('newsLayer'));
			//map.infoWindow.resize(250,220); 
			map.infoWindow.hide();
		}
		$(this).removeClass("checked");
		$(this).addClass("unchecked");
	});
//
/*------------------------------------------------------
 * 24 HOUR FILTER RADIO BUTTONS
 ------------------------------------------------------*/
    
     //toggle 24 hour filter radio buttons
    $('#radio #rad_option1').click(function(){ //show all
        $('#radio #rad_option2').removeClass('radSelected');
        $('#radio #rad_option2').addClass('radUnselected');
        $(this).removeClass('radUnselected');
        $(this).addClass('radSelected');
        toggle24Hour(); //main.js 
    });
    
    $('#radio #rad_option2').click(function() { //24 hour
        $('#radio #rad_option1').removeClass('radSelected');
        $('#radio #rad_option1').addClass('radUnselected');
        $(this).removeClass('radUnselected');
        $(this).addClass('radSelected');
        toggle24Hour();
    
    });

/*------------------------------------------------------
 * SHOW SHARED CONTENT
 ------------------------------------------------------*/
    function showShared(){
        $("#sharedIndent").hide();
        $("#cbVolunteered").removeClass("checked");
        $("#cbVolunteered").addClass("unchecked");
        opsPointLayer.hide();
        selectLayer.clearSelection();
        map.infoWindow.hide();
        lyrHighlightGLayer2.clear();
        $("#searchTxt").val("");
        $("#searchTxt2").text("");
    }
    
    function hideShared(){ //turn on Shared Content layer
        $("#sharedIndent").show();
        $("#cbVolunteered").removeClass("unchecked");
        $("#cbVolunteered").addClass("checked");
        
        //24 HOUR FILTER
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
    
    $('#cbVolunteered').toggle(function() {
        showShared();
        }, function() {
        hideShared();
         });
    
/*------------------------------------------------------
 * ADD AND SEARCH CONTENT
 ------------------------------------------------------*/   
    
    $('#addcontentbtn').click(function() {
        $("#add_content").show();
    });
    
    $('#searchcontentbtn').click(function() {
        $("#search_box").show();
    });
    
    $('#searchTxt').keyup(function(e) {
        if(e.keyCode == 13 && $(this).val() !== "") {
            searchKeywords();
        }
    });
    
    $('#searchBtn').click(function() {
        if($("#searchTxt").val() !== "") {
            searchKeywords();
        }
    });
    
    $('#searchTxt').bind("keyup blur change",function(event){
        if($(this).val() !== ""){
            $(this).next(".resetsearch").removeClass("resetoff");
            $(this).next(".resetsearch").addClass("reseton");
        }
        else{
            $(this).next(".resetsearch").removeClass("reseton");
            $(this).next(".resetsearch").addClass("resetoff");
        }
    });

        $('#toggle1, #toggle2').toggle(function () {
       if(opsPointLayer!=null)
        opsPointLayer.hide();
        $(this).siblings(".toggleArea").hide();
        $(this).removeClass("collapse");
        $(this).addClass("expand");
        $(this).attr({
            'title':'Expand'     
        });
    }, function(){
        if ($('#cbVolunteered').hasClass("checked tooltip_right")) {
          opsPointLayer.show();
        }
        else {
            //nothing
        }
        $(this).siblings(".toggleArea").show();
        $(this).removeClass("expand");
        $(this).addClass("collapse");
        $(this).attr({
            'title':'Collapse'   
        });
    });
    
    $('.resetsearch').click(function() {
        if($(this).hasClass("reseton")){
            $(this).removeClass("reseton");
            $(this).addClass("resetoff");
            $(this).prev(".fsearchinput").val("");
            clearSearch();
        }
    }); 

/*------------------------------------------------------
 * LOCATE
 ------------------------------------------------------*/
    $('#address').keyup(function(e) {
        if(e.keyCode == 13) {
            locate();
        }
    });
    
    $('#locateBtn').click(function() {
        locate();
    });
    
    $('#address').bind("keyup blur change",function(event){
        if($(this).val() !== ""){
            $(this).next(".resetlocate").removeClass("resetoff");
            $(this).next(".resetlocate").addClass("reseton");
        }
        else{
            $(this).next(".resetlocate").removeClass("reseton");
            $(this).next(".resetlocate").addClass("resetoff");
        }
    }); 
    
    $('.resetlocate').click(function() {
        if($(this).hasClass("reseton")){
            $(this).removeClass("reseton");
            $(this).addClass("resetoff");
            $(this).prev(".fsearchinput").val("");
            clearLocate();
        }
    });
    
    
    $('#fbImage').click(function() {
        shareLink('fb');
    });
    
    $('#twImage').click(function() {
        shareLink('tw');
    });
        
}); 	