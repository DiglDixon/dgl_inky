

var headerElement;
var headerCanvas, bufferCanvas;
var headerContext;
var canvasWidth, canvasHeight;
var ctx; // main context
var bCtx; // bufferContext
var logo;
var texture;


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

        bounceClickDown = false;
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
	livePoints = gatherPointsFromEdges(imageData, 1);
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
						arr.push(new SmudgePixel(x, y));
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
				arr.push({x: x*0.5, y:y*0.5, a:1, age:1, alive:true});
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
		bCtx.beginPath();
		bCtx.moveTo(iPoint.x,iPoint.y);
		bCtx.lineTo(repulsion.x,repulsion.y);
		bCtx.stroke();
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
	var ageDecayRate = 0.00;
	var horzScale = 1, horzPow = 1;
	var vertScale = 5, vertPow = 2;
	var hSign, vSign, vV, vH;
	var colourRotation = 0.1;
	var randomShiftHorz = 0, randomShiftVert = 0;
	var noiseOffset = 100;

	var inv255 = 1.0/255.0;
	var invLength = 1/livePoints.length;

	var bufferValue;
	var friendsDrawn = 0;

	var iPoint;


	ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);


	if(bounceClickDown){
		addRepulsionForce(mouseX, mouseY);
		// console.log("mouseX: "+mouseX+", mouseY: "+mouseY+", sample: "+bufferData[getArrayPositionFromOutside(mouseX, mouseY, bufferWidth)+3]);
	}

	for(var k = 0; k<livePoints.length;k++){
		iPoint = livePoints[k];
		if(!iPoint.alive)
			continue;

		// Calcs

		bufferValue = bufferData[getArrayPositionFromOutside(iPoint.x, iPoint.y, bufferWidth)+3]*inv255;
		
		iPoint.age -= ageDecayRate;
		iPoint.pX = iPoint.x;
		iPoint.pY = iPoint.y;
		// iPoint.x += (Math.random()-0.5)*randomShiftHorz;
		// iPoint.y += (Math.random()-0.5)*randomShiftVert;

		var weightHorz = 1;//(noise.perlin3(iPoint.x*noiseScale+noiseOffset, iPoint.y*noiseScale+noiseOffset, frameCount*noiseRotation) + 1) * 0.5; // 0 to 1
		var weightVert = 1;//(noise.perlin3(iPoint.x*noiseScale, iPoint.y*noiseScale, frameCount*noiseRotation) +1 )*0.5; // 0 to 1


		iPoint.vX += iPoint.acceleration.x;
		iPoint.vY += iPoint.acceleration.y;

		var directionHorz = iPoint.vX * 0.8;
		var directionVert = iPoint.vY * 0.8;

		var velocityHorz = weightHorz * directionHorz;
		var velocityVert = weightVert * directionVert;
/*
		hSign = Math.sign(velocityHorz);
		vSign = Math.sign(velocityVert);

		vH = Math.pow(velocityHorz, horzPow) * horzScale * ((horzPow%2)==0? hSign : 1); // We ensure the sign is maintained.
		vV = Math.pow(velocityVert, vertPow) * vertScale * ((vertPow%2)==0? vSign : 1);
*/
		
		iPoint.x += iPoint.vX;//velocityHorz;
		iPoint.y += iPoint.vY;//velocityVert;

		///

		// Draw to the buffer
		bCtx.strokeStyle = "rgba(0, 0, 0, 0.02)";
		bCtx.beginPath();
		bCtx.moveTo(iPoint.x,iPoint.y);
		bCtx.lineTo(iPoint.pX,iPoint.pY);
		bCtx.stroke();
		bCtx.fillStyle = "black";

		// Draw to the main canvas
		ctx.lineCap = "round";
		ctx.lineWidth = 3;
		// ctx.strokeStyle = "rgba("+(20+150.0*bufferValue)+", "+(80.0+80*(1-bufferValue))+", 150, 255)";
		ctx.strokeStyle = "rgba(50, 80, 50, "+0.5+")";
		ctx.beginPath();
		ctx.moveTo(iPoint.x,iPoint.y);
		ctx.lineTo(iPoint.pX,iPoint.pY);
		ctx.stroke();

		// finish up

		if(iPoint.y > canvasHeight){
			iPoint.alive = false;
		}

		// iPoint.vX = iPoint.x - iPoint.pX;
		// iPoint.vY = iPoint.y - iPoint.pY;

		iPoint.updateAcceleration();

		friendsDrawn++;
	}


}

function drawLogo(canvas){
	canvas = canvas || ctx;
	var scale = 0.6;
	var width = 83*scale, height = 50*scale, x = canvasWidth*0.5, y = canvasHeight*0.5;
	var angleInRadians = -3.141592 * 0.5;

	canvas.translate(x, y);
	canvas.rotate(angleInRadians);
	canvas.drawImage(logo, -width / 2, -height / 2, width, height);
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
    	bufferCanvas.toggleClass("hidden");
    }
    if(c=='c'){
    	headerCanvas.toggleClass("hidden");
    }

};
