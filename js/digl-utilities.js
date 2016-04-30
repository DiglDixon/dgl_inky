
/* Utilities */

function remap(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function remapClamped(value, low1, high1, low2, high2) {
	var result = low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    return clamp(result, low2, high2);;
}

function remapClampedSigned(value, low1, high1, low2, high2) {
	var result = low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    return clamp(result, Math.min(-high2, high2), Math.max(-high2, high2));
}

function slackDist(x1, y1, x2, y2){ // This is a more efficient distance calculation, very inaccurate.
	return Math.max(-(x1-x2 + y1-y2), (x1-x2 + y1-y2));
}

function distSq(x1, y1, x2, y2){ // True distance formula but returns the value squared - saves a heavy computation.
	return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}

function dist(x1, y1, x2, y2){ // This is the true distance formula, but is a bit more expensive.
	return Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2));
}

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
};


function nameCall(functionName, context /*, args */) {
  var args = [].slice.call(arguments).splice(2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for(var i = 0; i  < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(this, args);
}
// Use like this: nameCall("My.Namespace.functionName", window, arguments);


function lerpTo(div, cssArray, valueArray, cssSuffices, lerpTime, postFunction){
	// This may not work. 
	if(cssArray.length != valueArray.length != cssSuffices.length) console.log("Breaking invalid lerp: css and value arrays not parallel"); return;
	var nonExisting = cssArray.join();
	div.css(nonExisting, 0); // We want to avoid clashes between lerps, but will catch an identical lerp this way.
	var startingValues = [];
	for(var i = 0; i<valueArray.length;i++){
		startingValues.push(parseFloat(div.css(cssArray[i]))); // We'll work with floats.
	}
	div.animate({ nonExisting: 1}, // Don't think this will work :/
		{
			duration: lerpTime, queue:false, // Will probably need a passable for queue
			step: function(now, fx){
				for(var k = 0; k<cssArray.length;k++){
					var position = remap(now, fx.start, fx.end, startingValues[k], valueArray[k]);
					div.css(cssArray[k], position+cssSuffices[k]); // No suffixes and prefixes - we may nee to incorperate these.
				}
			},
			specialEasing:{nonExisting:"easeOutCubic"},
			complete: function(){
				if(postFunction) postFunction();
				//console.log("complete angle lerp");
				// blurgh
			}
		});
}

/*

function lerpRotation(div, lerpTime, postFunction){
	div.css("nonExisting", 0);
	div.animate({ nonExisting: 1},
		{
			duration: lerpTime, queue:false,
			step: function(now, fx){
				var position = map(now, fx.start, fx.end, window[sideString+"JandalRotate"], jandalStorageRotation);
				//console.log(position);
				div.css("-ms-transform", "rotate("+position+"deg)");
				div.css("-webkit-transform", "rotate("+position+"deg)");
				div.css("transform", "rotate("+position+"deg)");
	    		$(this).css("overflow", "visible");
			},
			specialEasing:{nonExisting:"easeOutCubic"},
			complete: function(){
				//console.log("complete angle lerp");
				// blurgh
			}
		});
} */