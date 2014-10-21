//EDITING
function editLyrLoad(){
    //Demos.esri.com FS URL - http://disasterinfo.esri.com/arcgis/rest/services/VGI/FeatureServer/0
    //AMI FS URL - http://ec2-184-73-228-169.compute-1.amazonaws.com/ArcGIS/rest/services/VGI/FeatureServer/0
    //AMI Alias URL - http://disreschile/ArcGIS/rest/services/VGI/FeatureServer/0
    //New Oil Spill URL - http://tmapps.esri.com/ArcGIS/rest/services/Deepwater_Horizon/Deepwater_Horizon_VGI/FeatureServer/0
    //TM Testing layer - http://tmapps.esri.com/ArcGIS/rest/services/Deepwater_Horizon/VGI-TESTING-ONLY/FeatureServer/0
    //New Oil Spill URL w/Dates - http://tmapps.esri.com/ArcGIS/rest/services/Deepwater_Horizon/Deepwater_Horizon_VGI_v2/FeatureServer/0
    //Secure FS - http://tmapps1.esri.com/ArcGIS/rest/services/Deepwater_Horizon/Deepwater_Horizon_VGI/FeatureServer/0
    //http://bulli Token - vCva8ZalgBd3RxJ-z8BoDQ2KLAMHSZKpGFebkDrxaHKjeQSOcNUcslHDr2u24lqj
    //http://webapps.esri.com Token - ahjRM4KPhDOxkS7m9IGtc3M8ykHIQ6PqUNdIToyDX0mFIG3j01zHE1vL7_F--Q0TRS99uvmI7uT-Q2zZhxAw9g..
    //http://webappsdev.esri.com Token - am1TGsrhWmTbZ5q2xHpRrBbTIvCTJ-jgKqb83iHeLS2dxaa0xfolbTW98EdgsvAB3z-SyAqhi-jV42eyCF-xyQ..
    //esri.com Token - ahjRM4KPhDOxkS7m9IGtc0tT4c54VSzwVmE_9_aQ3WhzYT8mYRyJYVRgGQBwEbar
    //bulli Token - rGcKxmLy5F0i3Jiztf4YMems-oPQ38ESjSCZ4iMHs-hsjexY5YKE9ztVU2FKeTiZ
    opsPointLayer = new esri.layers.FeatureLayer("http://tmapps.esri.com/ArcGIS/rest/services/Fire/Fire_VGI/FeatureServer/0", {
        id: opsPointLayer,
        visible: true,
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ['*']
    });
	
    
    selectLayer = new esri.layers.FeatureLayer("http://tmapps.esri.com/ArcGIS/rest/services/Fire/Fire_VGI/FeatureServer/0", {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: ['*']
    });
    
    map.infoWindow.setTitle('<div>&nbsp;</div>');
    map.infoWindow.setContent('<div id="attrInspector"></div><div id="infoWindowContents"></div>');
    map.infoWindow.resize(300, 270);
    
    lyrHighlightGLayer = new esri.layers.GraphicsLayer();
    map.addLayer(lyrHighlightGLayer);
    
    lyrHighlightGLayer2 = new esri.layers.GraphicsLayer();
    map.addLayer(lyrHighlightGLayer2);
	
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

    dojo.connect(opsPointLayer, "onLoad", initEditing);
    map.addLayer(opsPointLayer);

    dojo.connect(opsPointLayer, "onMouseOver", function(evt){
        var highlightSymbol = new esri.symbol.PictureMarkerSymbol("images/map/selected.jpg", 24, 24);
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry, highlightSymbol);
        lyrHighlightGLayer.clear();
        lyrHighlightGLayer.add(highlightGraphic);
    });
    
    dojo.connect(opsPointLayer, "onMouseOut", function(evt){
        lyrHighlightGLayer.clear();
    });
    
    dojo.connect(opsPointLayer, "onClick", function(evt){
        var highlightSymbol = new esri.symbol.PictureMarkerSymbol("images/map/selected.jpg", 24, 24);
        var highlightGraphic = new esri.Graphic(evt.graphic.geometry, highlightSymbol);
        lyrHighlightGLayer2.clear();
        lyrHighlightGLayer2.add(highlightGraphic);
    });
    
    dojo.connect(map.infoWindow, "onHide", function(evt){
        lyrHighlightGLayer2.clear();
    });
        
    locateResultLayer = new esri.layers.GraphicsLayer();
    searchResultLayer = new esri.layers.GraphicsLayer();
    editGLayer = new esri.layers.GraphicsLayer({id:'editGLayer'});
    map.addLayer(locateResultLayer);
    map.addLayer(searchResultLayer);
    map.addLayer(editGLayer);
    selectLayer.clearSelection();
    doSpillPtQuery(map);
    
    

}

function initEditing(editLyr){
    var layerInfos = [{
        'featureLayer': editLyr
    }];
    //var attInspector = new esri.dijit.AttributeInspector({
    //    layerInfos: layerInfos
    //}, dojo.byId('attrInspector'));
    var attEditFields = '<div id="TypeLblDiv" style="position:absolute;top:30px;left:40px">Type:</div><select name="ddType" id="ddType" onChange="typeChanged()" style="position:absolute;top:30px;left:150px"><option value="Web Link">Web Link</option><option value="Photo">Photo</option><option value="Video">Video</option><option value="Notes">Notes</option></select>' +
        '<div id="URLLblDiv" style="position:absolute;top:55px;left:40px">URL:</div><input type="text" id="txtURL" name="URL" onChange="typeChanged()" style="position:absolute;top:55px;left:150px"/>'+
        '<div id="DescLblDiv" style="position:absolute;top:80px;left:40px">Description:</div><input type="text" id="txtDesc" name="Description" onChange="typeChanged()" style="position:absolute;top:80px;left:150px"/>'+
        '<div id="DescLblDiv" style="position:absolute;top:105px;left:40px">Keywords:</div><input type="text" id="txtKey" name="Keywords" onChange="typeChanged()" style="position:absolute;top:105px;left:150px"/>' +
        '<div id="CatLblDiv" style="position:absolute;top:130px;left:40px">Category:</div><select name="ddCat" id="ddCat" onChange="typeChanged()" style="position:absolute;top:130px;left:150px"><option value="Fire Sighted">Fire Sighted</option><option value="Smell Smoke">Smell Smoke</option><option value="Damaged infrastructure">Damaged infrastructure</option><option value="People affected">People affected</option><option value="Wildlife">Wildlife</option><option value="General Information">General Information</option></select>' +
        '<div id="OtherLblDiv" style="position:absolute;top:155px;left:40px">Other (Explain):</div><input type="text" id="txtOther" name="Other" onChange="typeChanged()" style="position:absolute;top:155px;left:150px"/>' +
        '<button class="dijitReset dijitInline dijitButtonNode" style="top:195px;position:absolute;height:24px;width:55px;left:75px" id="btnSave" onClick="checkIsValid()">Save</button><button class="dijitReset dijitInline dijitButtonNode" style="top:195px;height:24px;width:55px;position:absolute;right:75px" id="btnDelete" onClick="deleteFeat()">Delete</button>';
    dojo.byId('attrInspector').innerHTML = attEditFields;
    var query = new esri.tasks.Query();
    esri.hide(dojo.byId('txtOther'));
    esri.hide(dojo.byId('OtherLblDiv'));
    //hide the attribute inspector div onClick and show the infoWindowContents
    dojo.connect(editLyr, "onClick", function(evt){
        query.objectIds = [evt.graphic.attributes.objectid];
        editLyr.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features){
            hideStuff();
            var content;
            var itemType;
            if (evt.graphic.attributes.type == 1) {
                itemType = "Web Link";
            }
            else 
                if (evt.graphic.attributes.type == 2) {
                    itemType = "Photo";
                }
                else 
                    if (evt.graphic.attributes.type == 3) {
                        itemType = "Video";
                    }
                    else {
                        itemType = "Note";
                    }
            
            var itemURL;
            if (evt.graphic.attributes.url === null) {
                content = 'Type: ' + itemType +
                '<br><br />Description: ' +
                evt.graphic.attributes.description +
                '<br><br />URL: No Link' +
                '<br><br />Keywords: ' +
                evt.graphic.attributes.keywords;
                if (evt.graphic.attributes.category){
                    content += '<br><br />Category: ' + evt.graphic.attributes.category;  
                }
                if (evt.graphic.attributes.category === 'Other'){
                    content += '<br><br />Other (more): ' + evt.graphic.attributes.other;
                }               
                content += '<br><br/><a class="inappropriate" href="mailto:disaster_maps@esri.com&amp;subject=ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is inappropriate&amp;body=This ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is showing inappropriate content on the Hurricane and Cyclone application.">Flag as inappropriate content</a>';
                
            }
            else {
                content = "Type: " + itemType +
                "<br><br />Description: " +
                evt.graphic.attributes.description +
                "<br><br />URL: <a href='" +
                evt.graphic.attributes.url +
                "' target = '_blank'>" +
                evt.graphic.attributes.url +
                "</a> " +
                "<br><br />Keywords: " +
                evt.graphic.attributes.keywords;
                if (evt.graphic.attributes.category){
                    content += '<br><br />Category: ' + evt.graphic.attributes.category;  
                }
                if (evt.graphic.attributes.other){
                    content += '<br><br />Other (more): ' + evt.graphic.attributes.other;
                }               
                content += '<br><br/><a class="inappropriate" href="mailto:disaster_maps@esri.com&amp;subject=ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is inappropriate&amp;body=This ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is showing inappropriate content on the wildfire application.">Flag as inappropriate content</a>';
            }
            
            dojo.byId('infoWindowContents').innerHTML = content;
            map.infoWindow.resize(300, 250);
            map.infoWindow.setTitle("");
            esri.show(dojo.byId("infoWindowContents"));
            var screenPoint = evt.screenPoint;
            map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
            
        });
    });
    
    //setup renderer for opsPointLayer
    var defaultSymbol = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([255, 0, 0]));
    var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, "Type");
    //add symbol for each possible value
    var webSymbol = new esri.symbol.PictureMarkerSymbol("images/map/web-button.bmp", 20, 20);
    var photoSymbol = new esri.symbol.PictureMarkerSymbol("images/map/photo-button.bmp", 20, 20);
    var videoSymbol = new esri.symbol.PictureMarkerSymbol("images/map/video-button.bmp", 20, 20);
    var notesSymbol = new esri.symbol.PictureMarkerSymbol("images/map/notes-button.bmp", 20, 20);
    renderer.addValue("1", webSymbol);
    renderer.addValue("2", photoSymbol);
    renderer.addValue("3", videoSymbol);
    renderer.addValue("4", notesSymbol);
    editLyr.setRenderer(renderer);
    editGLayer.setRenderer(renderer);
    var items = [{
        label: "Web Link",
        symbol: webSymbol,
        description: "none1"
    }, {
        label: "Photo",
        symbol: photoSymbol,
        description: "none2"
    }, {
        label: "Video",
        symbol: videoSymbol,
        description: "none3"
    }, {
        label: "Notes",
        symbol: notesSymbol,
        description: "none4"
    }];
    
    templatePicker = new esri.dijit.editing.TemplatePicker({
        featureLayers: [editLyr],
        items: [items],
        grouping: true,
        rows: 'auto',
        columns: 2
    }, 'templatePicker');
    templatePicker.startup();
    //use the draw toolbar to handle template picker becuase no using editor widget
    var drawToolbar = new esri.toolbars.Draw(map);
    //handle the selection change of the template		
    dojo.connect(templatePicker, "onSelectionChange", function(){
        selectedTemplate = templatePicker.getSelected();
		if (selectedTemplate) {
		  if (editFeat && selectedTemplate){
			//clean up the place before adding new feature.
		    //opsPointLayer.applyEdits(null, null, [editFeat]);
		    editFeat = null;
            resetEditForm();
		    map.infoWindow.hide();
		    hideStuff();
		    lyrHighlightGLayer.clear();
		    lyrHighlightGLayer2.clear();
            editGLayer.clear();
		  }
            switch (selectedTemplate.featureLayer.geometryType) {
                case "esriGeometryPoint":
                    drawToolbar.activate(esri.toolbars.Draw.POINT);
                    break;
                case "esriGeometryPolyline":
                    drawToolbar.activate(esri.toolbars.Draw.POLYLINE);
                    break;
                case "esriGeometryPolygon":
                    drawToolbar.activate(esri.toolbars.Draw.POLYGON);
                    break;
            }
        }
    });
    
    
    //when the draw ends deactivate the toolbar and handle the infoWindow content.
    dojo.connect(drawToolbar, "onDrawEnd", function(geometry){
        drawToolbar.deactivate();
        var currentTime = new Date();
        var newAttributes = dojo.mixin({}, selectedTemplate.template.prototype.attributes); //
        var newGraphic = new esri.Graphic(geometry, null, newAttributes);
        var UTCDate = currentTime.getTime();
        var PaulDate = currentTime.getFullYear() + '-' + (currentTime.getUTCMonth()+1) + '-' + currentTime.getUTCDate() + ' ' + currentTime.getUTCHours() + ':' + currentTime.getUTCMinutes() + ':' + currentTime.getUTCSeconds();
        newGraphic.attributes.created_on = UTCDate;// currentTime.getTime();
        newGraphic.attributes.utc_datetime = PaulDate;
        editFeat = newGraphic;
        editGLayer.add(newGraphic);
        var selected = templatePicker.getSelected();      
        if (selected) {
        var eType = selected.type;
        switch (eType.name)
        {
            case 'Web Link':
                dojo.byId('ddType').selectedIndex = 0;
                break;
            case 'Photo':
                dojo.byId('ddType').selectedIndex = 1;
                break;
            case 'Video':
                dojo.byId('ddType').selectedIndex = 2;
                break;
            case 'Notes':
                dojo.byId('ddType').selectedIndex = 3;
                break;
            default:
                dojo.byId('ddType').selectedIndex = 0;
                break;
      }
              
          console.log(", type = ", eType && eType.name);
        }

        //templatePicker.clearSelection();
        //Add logic here to NOT apply edits when the map is clicked, but instead add just a graphic.
        /*selectedTemplate.featureLayer.applyEdits([newGraphic], null, null, function(adds){
            console.log(adds);
            query.objectIds = [adds[0].objectId];
            selectedTemplate.featureLayer.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features){
                var screenPoint = map.toScreen(getInfoWindowPositionPoint(newGraphic));
                hideStuff();
                map.infoWindow.setTitle("Edit Attributes");
                map.infoWindow.resize(320, 250);
                map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
                templatePicker.clearSelection();
            });
        });*/
       
    });

    if (locateString){
        console.log('executing locate....');
        locate(); 
    }
    if (searchString){
        console.log('executing search....');
        searchKeywords();
        $(".tab_layout").tabs("option","selected",1);
    }
    dojo.connect(editGLayer, "onGraphicAdd", function(adds){
            //debugger;
            //console.log(adds);
            //query.objectIds = [adds[0].objectId];
            //selectedTemplate.featureLayer.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function(features){
            var screenPoint = map.toScreen(adds.geometry);
            esri.hide(dojo.byId("infoWindowContents"));
            esri.show(dojo.byId("attrInspector"));
            esri.show(dojo.byId("txtURL"));
            esri.show(dojo.byId("txtDesc"));
            esri.show(dojo.byId("txtKey"));
            esri.show(dojo.byId("ddType"));
            esri.show(dojo.byId("ddCat"));
            esri.show(dojo.byId('btnSave'));
            esri.show(dojo.byId("btnDelete"));
            map.infoWindow.setTitle("Edit Attributes");
            map.infoWindow.resize(320, 250);
            map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
            //templatePicker.clearSelection();
            //});
        });
    //$('#cbFlickr').addClass("checked");
    //flickr24hours();
    //runFirePerimeterQuery();
    //runFireQuery();
    console.log("initialization complete.");
    setTimeout(function(){isLoadedFromURL = false;console.log('Load from URL Flag re-set.'); addSM();}, 2000);
}

function deleteFeat(){
    //opsPointLayer.applyEdits(null, null, [editFeat]);
    editGLayer.clear();
    map.infoWindow.hide();
}

function resetEditForm(){
    dojo.byId('ddType').selectedIndex = 0;
    dojo.byId('txtKey').value = '';
    dojo.byId('txtURL').value = '';
    dojo.byId('txtDesc').value = '';
    dojo.byId('ddCat').selectedIndex = 0;
    dojo.byId('txtOther').value = '';
}

function typeChanged(){
    //editFeat.attributes[fieldName] = newFieldValue;
    var AIType = dojo.byId('ddType').selectedIndex + 1;
    var AIKeywords = dojo.byId('txtKey').value;
    var AIURL = dojo.byId('txtURL').value;
    var AIDesc = dojo.byId('txtDesc').value;
    var AICat = dojo.byId('ddCat').value;
    var AIOther = dojo.byId('txtOther').value;
    attValidation = [AIType, AIKeywords, AIURL, AIDesc, AICat, AIOther];
    if (AIType){
        editFeat.attributes.type = AIType;
    }
    if (AIKeywords){
        editFeat.attributes.keywords = AIKeywords;
    }
    if (AIURL){
        editFeat.attributes.url = AIURL;
    }
    if (AIDesc){
        editFeat.attributes.description = AIDesc;
    }
    if (AICat){
        if (AICat === 'Other') {
            esri.show(dojo.byId('txtOther'));
            esri.show(dojo.byId('OtherLblDiv'));
        }
        else{
            esri.hide(dojo.byId('txtOther'));
            esri.hide(dojo.byId('OtherLblDiv'));
        }
        editFeat.attributes.category = AICat;
    }
    if (AIOther){
        editFeat.attributes.other = AIOther;
    }
    editFeat.attributes.url = AIURL;
    console.log('AIType = ' + AIType + ', AIKeywords = ' + AIKeywords + ', AIURL = ' + AIURL + ', AIDesc = ' + AIDesc + ', AICat = ' + AICat + ', AIOther = ' +AIOther);
}

function checkIsValid(){
    //make sure all the attribute values are valid.
    var msg;
    //debugger;
    if (editFeat !== null){
        var civType = editFeat.attributes.type;
        var civURL = editFeat.attributes.url;
        var civDesc = editFeat.attributes.description;
        var civKey = editFeat.attributes.keywords;
        var civCat = editFeat.attributes.category;
        
        switch (civType) {
            case 1:
                msg = "You must enter valid URL, Keyword, Category, and Description attribute values for web links ";
                break;
            case 2:
                msg = "You must enter valid URL, Keyword, Category, and Description attribute values for photo links ";
                break;
            case 3:
                msg = "You must enter valid URL, Keyword, Category, and Description attribute values for video links ";
                break;
            case 4:
                msg = "You must enter valid Keyword Category, and Description attribute values for notes ";
                break;
        }
        if (civType != "4") { // && civURL == "" || civDesc == "" || civKey == "" || civURL == null || civDesc == null || civKey == null){
            if (civURL === "" || civDesc === "" || civKey === "" || civCat === "" || civURL === null || civDesc === null || civKey === null || civCat === null) {
                dijit.byId('dialog2').setContent(msg);
                dijit.byId('dialog2').show();
                return;
            }
            if (isUrl(civURL)) {
                editFeat.attributes.valid = 'Initial Review';
                resetEditForm();
                opsPointLayer.applyEdits([editFeat], null, null);
				opsPointLayer.clearSelection();
				opsPointLayer.refresh();
                editFeat = null;
                editGLayer.clear();
                map.infoWindow.hide();
                templatePicker.clearSelection();
            }
            else {
                var content = dojo.string.substitute('The value for URL is not in a valid format, please update.');
                dijit.byId('dialog2').setContent(content);
                dijit.byId('dialog2').show();
                return;
            }
        }
        else 
            //debugger;
            if (civType == "4") { // && civDesc == "" || civKey == "" || civDesc == null || civKey == null){
                if (civDesc === "" || civKey === "" || civCat === "" || civDesc === null || civKey === null || civCat === null ) {
                    dijit.byId('dialog2').setContent(msg);
                    dijit.byId('dialog2').show();
                    return;
                }
                if (civURL) {
                    if (isUrl(civURL)) {
                    //do nothing
                    }
                    else {
                        var errContent = dojo.string.substitute('The value for URL is not in a valid format, please update.');
                        dijit.byId('dialog2').setContent(errContent);
                        dijit.byId('dialog2').show();
                        return;
                    }
                }
                
                //alert("Going to save the edit.");
                editFeat.attributes.valid = 'Initial Review';
                resetEditForm();
                opsPointLayer.applyEdits([editFeat], null, null);
				opsPointLayer.clearSelection();
				opsPointLayer.refresh();
                editFeat = null;
                editGLayer.clear();
                map.infoWindow.hide();
                templatePicker.clearSelection();
            }
    }
    
    else {
        alert("There was a problem saving your content.  Please try again.");
        editFeat = null;
        resetEditForm();
        editGLayer.clear();
        map.infoWindow.hide();
    }
}

function getInfoWindowPositionPoint(feature){
    var point;
    switch (feature.getLayer().geometryType) {
        case "esriGeometryPoint":
            point = feature.geometry;
            break;
        case "esriGeometryPolyline":
            var pathLength = feature.geometry.paths[0].length;
            point = feature.geometry.getPoint(0, Math.ceil(pathLength / 2));
            break;
        case "esriGeometryPolygon":
            point = feature.geometry.getExtent().getCenter();
            break;
    }
    return point;
}

//SEARCH 
function searchKeywords(){
    //To do:  Add search against description.
    selectLayer.clearSelection();
    console.log('Search: All Selections Cleared.');
    totalSelect = 0;
    var tbValues = $("#searchTxt").val();
    console.log('Search: Keyword = ' + tbValues + '.');
    searchString = tbValues;
    var splitChar = tbValues;
    while (splitChar.indexOf(",") != -1) {
        splitChar = splitChar.replace(",", " ");
    }
    while (splitChar.indexOf("+") != -1) {
        splitChar = splitChar.replace("+", " ");
    }
    while (splitChar.indexOf(";") != -1) {
        splitChar = splitChar.replace(";", " ");
    }
    while (splitChar.indexOf("  ") != -1) {
        splitChar = splitChar.replace("  ", " ");
    }
    var splitValues = splitChar.split(" ");
    var searchQuery = new esri.tasks.Query();
    searchQuery.where = ("keywords LIKE " + "'" + "%" + splitChar + "%" + "' OR description LIKE " + "'" + "%" + splitChar + "%" + "' OR category LIKE " + "'" + "%" + splitChar + "%" + "' OR other LIKE " + "'" + "%" + splitChar + "%" + "'");
    selectLayer.selectFeatures(searchQuery, esri.layers.FeatureLayer.SELECTION_NEW, selectionComplete);
    
}

function selectionComplete(features){
    totalSelect += features.length;
    console.log('Search: ' + totalSelect + ' features returned from query.');
    dojo.byId('searchTxt2').innerHTML = totalSelect + " result(s)";
    searchResultLayer.clear();
    esri.hide(dojo.byId('dialog3'));
    var symbol = new esri.symbol.SimpleMarkerSymbol();
    symbol.setColor(new dojo.Color([255, 0, 0, 0.5]));
    
    for (var i = 0; i < features.length; i++) {
        var graphic = new esri.Graphic(features[i].geometry, symbol, features[i].attributes);
        searchResultLayer.add(graphic);
        console.log('Search: Returned x=' + features[i].geometry.x + ' Returned y=' + features[i].geometry.y);
        console.log('Search: Feature ' + i + ' URL: ' + features[i].attributes.url);
        console.log('Search: Feature ' + i + ' Keywords: ' + features[i].attributes.keywords);
        console.log('Search: Feature ' + i + ' Description: ' + features[i].attributes.description);
        dojo.connect(searchResultLayer, "onClick", function(evt){
            hideStuff();
            var content;
            var itemType;
            if (evt.graphic.attributes.type == 1) {
                itemType = "Web Link";
            }
            else 
                if (evt.graphic.attributes.type == 2) {
                    itemType = "Video";
                }
                else 
                    if (evt.graphic.attributes.type == 3) {
                        itemType = "Photo";
                    }
                    else {
                        itemType = "Note";
                    }
            
            var itemURL;
            if (evt.graphic.attributes.url === null) {
                content = 'Type: ' + itemType +
                '<br><br />Description: ' +
                evt.graphic.attributes.description +
                '<br><br />URL: No Link' +
                '<br><br />Keywords: ' +
                evt.graphic.attributes.keywords;
                if (evt.graphic.attributes.category){
                    content += '<br><br />Category: ' + evt.graphic.attributes.category;  
                }
                if (evt.graphic.attributes.category === 'Other'){
                    content += '<br><br />Other (more): ' + evt.graphic.attributes.other;
                }               
                content += '<br><br/><a class="inappropriate" href="mailto:disaster_maps@esri.com&amp;subject=ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is inappropriate&amp;body=This ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is showing inappropriate content on the wildfire application.">Flag as inappropriate content</a>';
                
            }
            else {
                content = "Type: " + itemType +
                "<br><br />Description: " +
                evt.graphic.attributes.description +
                "<br><br />URL: <a href='" +
                evt.graphic.attributes.url +
                "' target = '_blank'>" +
                evt.graphic.attributes.url +
                "</a> " +
                "<br><br />Keywords: " +
                evt.graphic.attributes.keywords;
                if (evt.graphic.attributes.category){
                    content += '<br><br />Category: ' + evt.graphic.attributes.category;  
                }
                if (evt.graphic.attributes.other){
                    content += '<br><br />Other (more): ' + evt.graphic.attributes.other;
                }               
                content += '<br><br/><a class="inappropriate" href="mailto:disaster_maps@esri.com&amp;subject=ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is inappropriate&amp;body=This ObjectID ' +
                evt.graphic.attributes.objectid +
                ' is showing inappropriate content on the wildfire application.">Flag as inappropriate content</a>';
            }
            
            dojo.byId('infoWindowContents').innerHTML = content;
            map.infoWindow.setTitle("");
            esri.show(dojo.byId("infoWindowContents"));
            var screenPoint = evt.screenPoint;
            map.infoWindow.show(screenPoint, map.getInfoWindowAnchor(screenPoint));
            map.infoWindow.resize(300, 250);
            
        });
    }
}

function isUrl(s){
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
}


function clearSearch(){
    if (searchResultLayer) {
        searchResultLayer.clear();
    }
    dojo.byId('searchTxt2').innerHTML = "";
    searchString = "";
}
