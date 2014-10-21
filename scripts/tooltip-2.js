$(document).ready(function(){
	var inFocus = false;
	var $tooltip = $(".tooltip_right").tooltip({
		position: 'top right', 
		effect:'toggle',
		relative: true,
		lazy: true,
		tip:'.tooltip_hidden',
		delay:500,
		onBeforeHide: function() {
			inFocus = false;
			activeObj = document.activeElement;
			if (activeObj.tagName == "INPUT" || activeObj.tagName == "TEXTAREA"){
				inFocus = true;
			}
		},
		onHide: function(){
			if(inFocus){
				this.getTip().show();
			}
		},
		onShow: function(){
			if(inFocus){
				this.getTip().hide();	
			}
		}
	});
	//
	$('#map_layers, .button, a').live('click',function(){
		 $('.tooltip_right').mouseout();
		 $('#address').mouseover();
	});
	//
});