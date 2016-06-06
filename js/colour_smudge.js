// Ink, grass, roots, vines

var headerElement;
var headerCanvas, bufferCanvas;
var headerContext;
var canvasWidth, canvasHeight;
var ctx; // main context
var bCtx; // bufferContext
var logo;
var HALF_PI = 3.141592 * 0.5;
var TWO_PI = 3.141592*2;
var brushR, brushG, brushB, brushK;

var NOISE_OFFSET = 1000;

var canvasScale = 1;
var inverse_canvasScale = 1; // our inverse

$(document).ready(function(){
	console.log("Script ready");
	headerElement = $(".header-menu");
	headerElement.append("<canvas id='menu-canvas' width=1 height=1></canvas><canvas id='buffer-canvas' width=1 height=1></canvas>");
	headerCanvas = $("#menu-canvas");
	bufferCanvas = $("#buffer-canvas");
	headerContext = headerCanvas[0].getContext("2d");
	ctx = headerContext;
	bCtx = bufferCanvas[0].getContext("2d");
	logo = $(".logo")[0];
	resetCanvasDimensions(2);
	setTimeout(function(){
		redraw();
		startAnimating(FRAMERATE);
	}, 1000);
});


function resetCanvasDimensions(scale){
	resetCanvasScale(headerCanvas[0], ctx, scale);
	resetCanvasScale(bufferCanvas[0], bCtx, scale);
}

function resetCanvasScale(canvas, context, scale){
	canvasScale = scale;
	inverse_canvasScale = 1/scale;
	context.setTransform(1, 0, 0, 1, 0, 0);
	var height = headerElement.height();
	var width = headerElement.width();
	canvas.width = width * scale;
	canvas.height = height * scale;
	canvas.style.width = width+"px";
	canvas.style.height = height+"px";
	canvasWidth = headerCanvas.width();
	canvasHeight = headerCanvas.height();
	context.scale(scale, scale);
}

function atDoubleResolution(){
	return canvasScale==2;
}

/////

var FRAMERATE = 60;
var FRAMECOUNT = 0;
var fpsInterval,startTime,now,then,elapsed;
var paused = false;

function startAnimating(fps){
    fpsInterval=1000/fps;
    then=Date.now();
    startTime=then;
	console.log("Starting animation");
    animate();
    setTimeout(function(){
    	// console.log("Drawing auto-paused");
    	// paused = true;
    }, 100);
}

function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if(paused)
    	return;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        FRAMECOUNT++;

        ///======== DRAWING BEGINS =======///
        // drawInk
        var drawingObjects = {points:livePoints, context:ctx, buffer:bCtx};
        // drawToHeaderCanvas(drawingObjects);
        drawInk(drawingObjects);

        ///======== DRAWING ENDS =======///

    }
}

//////

var livePoints = [];

function resetPoints(){
	ctx.globalCompositeOperation = 'source-over';
	clearCanvas(ctx);

	// Draw all the bits to inherit from
	drawLogo();

	var imageData = ctx.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
	// livePoints = gatherPointsFromEdges(imageData, 3);
	livePoints = gatherRandomPointsFromEverywhere(imageData, 100);
	// livePoints = gatherRandomPointsFromRadius(imageData, 5, {x:imageData.width/2, y:imageData.height/2, radius: 100});
	console.log("Gathered livePoints, total: "+livePoints.length);
}

function clearCanvas(canvas){
	canvas = canvas || ctx;
	canvas.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Encapsulating our conditions so we can switch to RGB || A
function pixelIsEmpty(pixels, index){
	return pixels[index+3] == 0;
}
function pixelIsOccupied(pixels, index){
	return pixels[index+3] > 0;
}

function gatherPointsFromEdges(imageData, fidelity){
	var arr = [];
	var pixels = imageData.data;
	var index, surrounding;
	for(var x = 1; x<imageData.width-1; x+=fidelity){
		for(var y = 1; y<imageData.height-1; y+=fidelity){
			index = getArrayPosition(x, y, imageData.width);
			if(pixelIsOccupied(pixels, index)){
				surrounding = getSurroundingIndices(x, y, imageData.width);
				for(var k = 0; k < surrounding.length; k++){
					if(pixelIsEmpty(pixels, surrounding[k])){
						arr.push(new SmudgePixel(x, y, getColourFromPixelData(pixels, index)));
						break;
					}
				}
			}
		}
	}
	return arr;
}

function getSurroundingIndices(x, y, arrayWidth){
	return [getArrayPosition(x-1, y, arrayWidth),
			getArrayPosition(x+1, y, arrayWidth),
			getArrayPosition(x, y-1, arrayWidth),
			getArrayPosition(x, y+1, arrayWidth),
			getArrayPosition(x-1, y-1, arrayWidth),
			getArrayPosition(x+1, y+1, arrayWidth),
			getArrayPosition(x-1, y+1, arrayWidth),
			getArrayPosition(x+1, y-1, arrayWidth)];
}

function getPositionFromIndex(index, arrayWidth){
	var y = Math.floor(index/arrayWidth);
	var x = index - y*arrayWidth;
	return {x: x/4, y: y/4};
}

function gatherPointsFromEverywhere(imageData, fidelity){
	var arr = [];
	var pixels = imageData.data;
	var index;
	for(var x = 0; x<imageData.width; x+=fidelity){
		for(var y = 0; y<imageData.height; y+=fidelity){
			index = getArrayPosition(x, y, imageData.width);
			if(pixelIsOccupied(pixels, index)){
				arr.push(new SmudgePixel(x, y, getColourFromPixelData(pixels, index)));
			}	
		}
	}
	return arr;
}

function getColourFromPixelData(pixels, index){
	return [pixels[index], pixels[index+1], pixels[index+2], pixels[index+3]];
}

function gatherRandomPointsFromEverywhere(imageData, fidelity){
	var arr = [];
	var pixels = imageData.data;
	var index;
	var iterationInterval;
	for(var x = 0; x<imageData.width; x+=iterationInterval){
		iterationInterval = Math.ceil(Math.random()*fidelity+0.01);
		for(var y = 0; y<imageData.height; y+=iterationInterval){
			iterationInterval = Math.ceil(Math.random()*fidelity+0.01);
			index = getArrayPosition(x, y, imageData.width);
			if(pixelIsOccupied(pixels, index)){
				arr.push(new SmudgePixel(x, y, getColourFromPixelData(pixels, index)));
			}
		}
	}
	return arr;
}

function gatherRandomPointsFromRadius(imageData, fidelity, options){
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
			if(pixelIsOccupied(pixels, index)){
				arr.push(new SmudgePixel(x, y, getColourFromPixelData(pixels, index)));
			}
		}
	}
	return arr;
}

// Call this one working within arrays
function getArrayPosition(x, y, w){
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w + x)*4;
}
// Call this one from stuff like mouseX, mouseY
function getArrayPositionFromOutside(x, y, w){
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w * canvasScale + x * canvasScale)*4;
}

function redraw(){
	livePoints = [];
	NOISE.seed(Math.random());

	resetPoints();
}

function getNoiseVictorAtPosition(x, y, z, scale){
	return new Victor(
		NOISE.perlin3(x*scale+NOISE_OFFSET, y*scale+NOISE_OFFSET, z),
		NOISE.perlin3(x*scale, y*scale, z)
		);
}

////


function addRepulsionForce(x, y){
	var repulsion = new Repulsion(x, y);
	ctx.strokeStyle = "blue";
	ctx.lineWidth = 2;
	var iPoint;
	for (var i = livePoints.length - 1; i >= 0; i--) {
		iPoint = livePoints[i];
		livePoints[i].addRepulsion(repulsion);
	}
}

function drawInk(objects){

	var points = objects.point || livePoints;

	var physicsOptions = {
		noiseScale: 0.005,
		noiseRotation: 0.005,
		ageDecayRate: 0.01,
		noiseVelocity: new Victor(0.5, 0.99),
		horzPow: 1,
		vertPow: 2,
		randomShiftHorz: 0,
		randomShiftVert: 0,
		colourRotation: 0.1,
		noiseOffset: 100,
		noiseWeight: new Victor(0, 0),
		velocityDecay: 0.95
	}

	var displayOptions = {
		context: objects.context || ctx,
		buffer: buffer = objects.buffer || bCtx,
		alpha: 0.5
	}

	var cleaupOptions = {
		bounds: {left:0, top:0, right:canvasWidth, bottom:canvasHeight}
	}

	var iPoint;


	for(var k = 0; k<points.length;k++){
		iPoint = points[k];

		iPoint.updatePhysicsAsInk(physicsOptions);
		iPoint.displayAsInk(displayOptions);
		iPoint.cleanupAsInk(cleaupOptions);
	}
}

function drawToHeaderCanvas(objects){
	var context = objects.context || ctx;
	var buffer = objects.buffer || bCtx;
	var points = objects.point || livePoints;
	var mainImage = context.getImageData(0, 0, canvasWidth * canvasScale, canvasHeight * canvasScale);
	// var mainData = mainImage.data;
	var bufferImage = buffer.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
	var bufferData = bufferImage.data;
	var bufferWidth = bufferImage.width;

	// Load o' controls.
	
	var noiseScale = 0.005; // smaller = tighter correlation.
	var noiseRotation = 0.005;
	var ageDecayRate = 0.01;
	var noiseVelocity = new Victor(0.5, 0.99);
	var horzPow = 1, vertPow = 2;
	var randomShiftHorz = 0, randomShiftVert = 0;
	var colourRotation = 0.1;
	var noiseOffset = 100;
	var noiseWeight = new Victor(0, 0);
	var velocityDecay = 0.95;

	var inv255 = 1.0/255.0;
	var invLength = 1/points.length;

	var bufferValue;
	var friendsDrawn = 0;

	var iPoint;

	var noiseVector = new Victor();


	for(var k = 0; k<points.length;k++){
		iPoint = points[k];
		if(!iPoint.alive)
			continue;
		// Calcs

		bufferValue = bufferData[getArrayPositionFromOutside(iPoint.position.x, iPoint.position.y, bufferWidth)+3]*inv255;
		
		iPoint.age -= ageDecayRate;
		iPoint.previousPosition.copy(iPoint.position);

		iPoint.velocity.add(iPoint.acceleration);

		// Find the noise values	
		noiseVector.x = (NOISE.perlin3(iPoint.position.x*noiseScale+NOISE_OFFSET, iPoint.position.y*noiseScale+NOISE_OFFSET, FRAMECOUNT*noiseRotation));// + 1) * 0.5; // 0 to 1
		noiseVector.y = (NOISE.perlin3(iPoint.position.x*noiseScale, iPoint.position.y*noiseScale, FRAMECOUNT*noiseRotation));// + 1 ) * 0.5; // 0 to 1
		// Apply exponent
		noiseVector.x = Math.pow(noiseVector.x, horzPow) * ((horzPow%2)==0? Math.sign(noiseVector.x) : 1); // We ensure the sign is maintained.
		noiseVector.y = Math.pow(noiseVector.y, vertPow) * ((vertPow%2)==0? Math.sign(noiseVector.y) : 1);
		// Adjust to weighting
		// noiseVector.x = noiseVector.x * noiseWeight.x + (1-noiseWeight.x);
		// noiseVector.y = noiseVector.y * noiseWeight.y + (1-noiseWeight.y);
		noiseVector.multiply(noiseVelocity);


		iPoint.velocity.add(noiseVector);
		
		iPoint.velocity.multiplyScalar(velocityDecay);

		iPoint.position.add(iPoint.velocity);


		// Draw to the buffer
		buffer.strokeStyle = "rgba(0, 0, 0, 0.02)";
		drawSmudgePixelToContext(buffer, iPoint);

		// Draw to the main canvas
		context.lineCap = "round";

		//
		context.lineWidth = 1;//iPoint.randomSize;
		context.strokeStyle = iPoint.getColourStringWithAlpha(0.5);
		drawSmudgePixelToContext(context, iPoint);
		// finish up

		if(iPoint.position.y > canvasHeight){
			iPoint.alive = false;
		}
		if(iPoint.age <= 0){
			// iPoint.alive = false;
		}

		iPoint.resetAcceleration();

		friendsDrawn++;
	}

}

function drawLogo(canvas){
	canvas = canvas || ctx;
	var scale = 0.6;
	var x = canvasWidth*0.5, y = canvasHeight*0.5;
	var angleInRadians = -HALF_PI;

	canvas.translate(x, y);
	canvas.rotate(angleInRadians);
	canvas.drawImage(logo, -logo.width / 2, -logo.height / 2, logo.width, logo.height);
	canvas.rotate(-angleInRadians);
	canvas.translate(-x, -y);
}


var mouseX, mouseY;
window.addEventListener('mousemove', storeMousePos, false);
function storeMousePos(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}


document.onkeypress = function(evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var c = String.fromCharCode(charCode);
    if(c=='p'){
    	paused = !paused;
    	console.log(paused? "Paused" : "Unpaused");
    }
    if(c=='r'){
    	redraw();
    }
    if(c=='b'){
    	console.log("Showing buffer canvas");
    	headerCanvas.addClass("hidden");
    	bufferCanvas.removeClass("hidden");
    }
    if(c=='c'){
    	console.log("Showing main canvas");
    	bufferCanvas.addClass("hidden");
    	headerCanvas.removeClass("hidden");
    }
    if(c=='v'){
    	console.log("Showing both canvii");
    	bufferCanvas.removeClass("hidden");
    	headerCanvas.removeClass("hidden");
    }

};
