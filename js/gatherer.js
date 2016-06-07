
var Gatherer = function(){};
// Encapsulating our conditions so we can switch to RGB || A
Gatherer.pixelIsEmpty = function(pixels, index){
	return pixels[index+3] == 0;
}
Gatherer.pixelIsOccupied = function(pixels, index){
	return pixels[index+3] > 0;
}

// Helpers
Gatherer.getColourFromPixelData = function(pixels, index){
	return [pixels[index], pixels[index+1], pixels[index+2], pixels[index+3]];
}

Gatherer.getSurroundingIndices = function(x, y, arrayWidth){
	return [getArrayPosition(x-1, y, arrayWidth),
			getArrayPosition(x+1, y, arrayWidth),
			getArrayPosition(x, y-1, arrayWidth),
			getArrayPosition(x, y+1, arrayWidth),
			getArrayPosition(x-1, y-1, arrayWidth),
			getArrayPosition(x+1, y+1, arrayWidth),
			getArrayPosition(x-1, y+1, arrayWidth),
			getArrayPosition(x+1, y-1, arrayWidth)];
}

Gatherer.getPositionFromIndex = function(index, arrayWidth){
	var y = Math.floor(index/arrayWidth);
	var x = index - y*arrayWidth;
	return {x: x/4, y: y/4};
}

// Different methods of gathering points
Gatherer.gatherPointsFromEdges = function(imageData, fidelity){
	var arr = [];
	var pixels = imageData.data;
	var index, surroundingIndices;
	for(var x = 1; x<imageData.width-1; x+=fidelity){
		for(var y = 1; y<imageData.height-1; y+=fidelity){
			index = getArrayPosition(x, y, imageData.width);
			if(Gatherer.pixelIsOccupied(pixels, index)){
				surroundingIndices = getSurroundingIndices(x, y, imageData.width);
				for(var k = 0; k < surroundingIndices.length; k++){
					if(pixelIsEmpty(pixels, surroundingIndices[k])){
						arr.push(new SmudgePixel(x, y, getColourFromPixelData(pixels, index)));
						break;
					}
				}
			}
		}
	}
	return arr;
}

Gatherer.gatherPointsFromEverywhere = function(imageData, fidelity){
	var arr = [];
	var pixels = imageData.data;
	var index;
	for(var x = 0; x<imageData.width; x+=fidelity){
		for(var y = 0; y<imageData.height; y+=fidelity){
			index = getArrayPosition(x, y, imageData.width);
			if(Gatherer.pixelIsOccupied(pixels, index)){
				arr.push(new SmudgePixel(x, y, Gatherer.getColourFromPixelData(pixels, index)));
			}	
		}
	}
	return arr;
}

Gatherer.gatherRandomPointsFromEverywhere = function(imageData, fidelity, Constructor){
	var arr = [];
	var pixels = imageData.data;
	var index;
	var iterationInterval;
	for(var x = 0; x<imageData.width; x+=iterationInterval){
		iterationInterval = Math.ceil(Math.random()*fidelity+0.01);
		for(var y = 0; y<imageData.height; y+=iterationInterval){
			iterationInterval = Math.ceil(Math.random()*fidelity+0.01);
			index = getArrayPosition(x, y, imageData.width);
			if(Gatherer.pixelIsOccupied(pixels, index)){
				arr.push(new Constructor(x, y, Gatherer.getColourFromPixelData(pixels, index)));
			}
		}
	}
	return arr;
}

Gatherer.gatherRandomPointsFromRadius = function(imageData, fidelity, options){
	var radCentreX = options.y || 0;
	var radCentreY = options.x || 0;
	var radius = options.radius || 1;
	var arrayFunction = options.arrayFunction || getArrayPosition;
	var arr = [];
	var pixels = imageData.data;
	var index;
	var iterationInterval;
	var radiusSq = radius * radius;
	for(var x = Math.max(radCentreX-radius, 0); x<Math.min(radCentreX+radius, imageData.width); x+=iterationInterval){
		iterationInterval = Math.ceil(Math.random()*fidelity+0.01);
		for(var y = Math.max(radCentreY-radius, 0); y<Math.min(radCentreY+radius, imageData.height); y+=iterationInterval){
			iterationInterval = Math.ceil(Math.random()*fidelity+0.01);
			if(distSq(x, y, radCentreX, radCentreY) > radiusSq )
				continue;
			index = arrayFunction(x, y, imageData.width);
			if(Gatherer.pixelIsOccupied(pixels, index)){
				arr.push(new SmudgePixel(x, y, getColourFromPixelData(pixels, index)));
			}
		}
	}
	return arr;
}