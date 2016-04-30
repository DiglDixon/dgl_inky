

var headerElement;
var headerCanvas, bufferCanvas;
var headerContext;
var canvasWidth, canvasHeight;
var ctx; // main context
var bCtx; // bufferContext
var logo;
var texture;
var HALF_PI = 3.141592 * 0.5;
var TWO_PI = 3.141592*2;
var brushR, brushG, brushB, brushK;

var NOISE_OFFSET = 1000;

var canvasScale = 1;
var inverse_canvasScale = 1; // our inverse

var bounceClickDown = false;

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
	texture = $(".data-image")[0];
	brushR = $("#brushr")[0];
	brushG = $("#brushg")[0];
	brushB = $("#brushb")[0];
	// brushK = $("#brushk")[0];
	resetCanvasDimensions(2);
	redraw();
	startAnimating(frameRate);

	headerElement.on("click", function(){
		bounceClickDown = true;
	})
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

var frameRate = 60;
var frameCount = 0;
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
        frameCount++;

        ///======== DRAWING BEGINS =======///

        drawToHeaderCanvas();

        ///======== DRAWING ENDS =======///

    }
}

//////

var livePoints = [];

function gatherPoints(){
	ctx.globalCompositeOperation = 'source-over';
	clearCanvas(ctx);

	// Draw all the bits to inherit from
	drawLogo();

	var imageData = ctx.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
	// livePoints = gatherPointsFromEdges(imageData, 3);
	livePoints = gatherRandomPointsFromEverywhere(imageData, 50);
	console.log("Gathered livePoints, total: "+livePoints.length);
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

// Call this one working within arrays
function getArrayPosition(x, y, w){
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w + x)*4;
}
// Call this one from stuff like mouseX, mouseY
function getArrayPositionFromOutside(x, y, w){
	// if(atDoubleResolution())
	// 	return getArrayPositionDouble(x, y, w);
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w * canvasScale + x * canvasScale)*4;
}
// PRIVATE - This one will get called if is appropriate
// function getArrayPositionDouble(x, y, w){
// 	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
// 	return (y * w * 2 + x * 2)*4;
// }

function redraw(){
	livePoints = [];
	noise.seed(Math.random());

	gatherPoints();
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
		// bCtx.beginPath();
		// bCtx.moveTo(iPoint.position.x,iPoint.position.y);
		// bCtx.lineTo(repulsion.x,repulsion.y);
		// bCtx.stroke();
	}
}

function drawToHeaderCanvas(){

	var bufferImage = bCtx.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
	var bufferData = bufferImage.data;
	var bufferWidth = bufferImage.width;

	// Load o' controls.
	// smaller = tighter correlation.
	var noiseScale = 0.01;
	var noiseRotation = 0.01;
	var ageDecayRate = 0.01;
	var noiseVelocity = new Victor(2, 2);
	var horzPow = 1, vertPow = 2;
	var randomShiftHorz = 0, randomShiftVert = 0;
	var colourRotation = 0.1;
	var noiseOffset = 100;
	var noiseWeight = new Victor(0, 0);
	var velocityDecay = 0.95;

	var inv255 = 1.0/255.0;
	var invLength = 1/livePoints.length;

	var bufferValue;
	var friendsDrawn = 0;

	var iPoint;

	var noiseVector = new Victor();

	// ctx.save();
	// ctx.globalCompositeOperation = "source-over";
	// ctx.drawImage(brush, 20, 20, 50, 50);
	// ctx.globalCompositeOperation = "source-in";
	// ctx.fillStyle = "rgba(255, 0, 0, 1)";
	// ctx.fillRect(20, 20, 50, 50);
	// // THIS NUKES THE ENTIRE CANVAS. We need to do a colour pass and a shapes pass if we want to do this.
	// // Maybe using the buffer and putImageData.
	// // Blurgh.
	// ctx.restore();


	// ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
	// ctx.fillRect(0, 0, canvasWidth, canvasHeight);


	if(bounceClickDown){
		addRepulsionForce(mouseX, mouseY);
		console.log("CLICK: mouseX: "+mouseX+", mouseY: "+mouseY+", sample: "+bufferData[getArrayPositionFromOutside(mouseX, mouseY, bufferWidth)+3]);
		bounceClickDown = false;
	}

	for(var k = 0; k<livePoints.length;k++){
		iPoint = livePoints[k];
		if(!iPoint.alive)
			continue;
		// Calcs

		bufferValue = bufferData[getArrayPositionFromOutside(iPoint.position.x, iPoint.position.y, bufferWidth)+3]*inv255;
		
		iPoint.age -= ageDecayRate;
		iPoint.previousPosition.copy(iPoint.position);

		iPoint.velocity.add(iPoint.acceleration);

		// Find the noise values	
		noiseVector.x = (noise.perlin3(iPoint.position.x*noiseScale+NOISE_OFFSET, iPoint.position.y*noiseScale+NOISE_OFFSET, frameCount*noiseRotation));// + 1) * 0.5; // 0 to 1
		noiseVector.y = (noise.perlin3(iPoint.position.x*noiseScale, iPoint.position.y*noiseScale, frameCount*noiseRotation));// + 1 ) * 0.5; // 0 to 1
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
		// bCtx.strokeStyle = "rgba(0, 0, 0, 0.02)";
		// drawSmudgePixelToContext(bCtx, iPoint);
		// clearCanvas(bCtx);
		// Draw to the main canvas
		ctx.lineCap = "round";
		// Math.seedrandom(iPoint.seed);
		ctx.lineWidth = iPoint.randomSize * iPoint.age;
		ctx.strokeStyle = iPoint.getColourStringWithAlpha(Math.random());
		
		// drawSmudgePixelToContext(ctx, iPoint);
		drawImageFromSmudgePixel(ctx, iPoint);
		// finish up

		if(iPoint.position.y > canvasHeight){
			iPoint.alive = false;
		}
		if(iPoint.age <= 0){
			iPoint.alive = false;
		}

		iPoint.resetAcceleration();

		friendsDrawn++;
	}

}

function drawImageFromSmudgePixel(context, sp){
	// context.globalCompositeOperation = "source-over";
	// context.globalCompositeOperation = "overlay";
	// context.fillStyle = sp.getColourStringWithAlpha(1);
	// context.fillRect(sp.position.x, sp.position.y, 10, 10);

	ctx.globalCompositeOperation = "lighten";

	var angleInRadians = Math.random()*TWO_PI;
	context.translate(sp.position.x, sp.position.y);
	context.rotate(angleInRadians);
	var col = sp.adoptedColour;
	context.globalAlpha = col[0]/555;
	context.drawImage(brushR, -brushR.width*0.5, -brushR.height*0.5, brushR.width, brushR.width);

	// context.globalAlpha = col[1]/255;
	// context.drawImage(brushG, -brushR.width*0.5, -brushR.height*0.5, brushR.width, brushR.width);

	// context.globalAlpha = col[3]/255;
	// context.drawImage(brushB, -brushR.width*0.5, -brushR.height*0.5, brushR.width, brushR.width);
	// context.drawImage(logo, -logo.width / 2, -logo.height / 2, logo.width, logo.height);
	context.rotate(-angleInRadians);
	context.translate(-sp.position.x, -sp.position.y);

	context.globalAlpha = 1;

	ctx.globalCompositeOperation = "source-over";
	// ctx.drawImage(brush, 20, 20, 50, 50);
	// ctx.globalCompositeOperation = "source-in";
	// ctx.fillStyle = "rgba(255, 0, 0, 1)";
	// ctx.fillRect(20, 20, 50, 50);
}

function drawSmudgePixelToContext(context, sp){
	context.beginPath();
	context.moveTo(sp.position.x,sp.position.y);
	context.lineTo(sp.previousPosition.x,sp.previousPosition.y);
	context.stroke();
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

function clearCanvas(canvas){
	canvas = canvas || ctx;
	canvas.clearRect(0, 0, canvasWidth, canvasHeight);
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
