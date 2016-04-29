

var headerElement;
var headerCanvas, bufferCanvas;
var headerContext;
var canvasWidth, canvasHeight;
var borderWidth = 1;
var ctx;
var bCtx;
var logo;
var texture;

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
	resetCanvasDimensions();

	startAnimating(frameRate);
});

function resetCanvasDimensions(){
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	var cvs = headerCanvas[0];
	var height = headerElement.height();
	var width = headerElement.width();
	cvs.width = width*2;
	cvs.height = height*2;
	cvs.style.width = width+"px";
	cvs.style.height = height+"px";
	ctx.scale(2, 2);
	canvasWidth = headerCanvas.width();
	canvasHeight = headerCanvas.height();
	// buffer
	bCtx.setTransform(1, 0, 0, 1, 0, 0);
	var bCvs = bufferCanvas[0];
	bCvs.width = width*2;
	bCvs.height = height*2;
	bCvs.style.width = width+"px";
	bCvs.style.height = height+"px";
	bCtx.scale(2, 2);
}

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

var livePoints = [];

var pointsGathered = false;

function gatherPoints(){
	ctx.globalCompositeOperation = 'source-over';
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// ctx.fillStyle = "white";
	// ctx.fillRect(0, 0, canvasWidth*2, canvasHeight*2);

	drawLogo();

	var imageData = ctx.getImageData(0, 0, canvasWidth*2, canvasHeight*2);
	var pixels = imageData.data;

	var imageDataWidth = imageData.width;
	var imageDataHeight = imageData.height;
	var cX, cY;
	var idx, nextIdx;
	var pointFidelity = 1;
	var onlyEdges = true;
	for(var x = 0; x<imageDataWidth; x+=pointFidelity){
		for(var y = 0; y<imageDataHeight-1; y+=pointFidelity){
			idx = getArrayPosition(x, y, imageDataWidth);
			nextIdx = getArrayPosition(x, y+1, imageDataWidth);
			if(onlyEdges){
				if(pixels[idx+3] > 0 && pixels[nextIdx+3] == 0){
					livePoints.push({x: x*0.5, y:y*0.5, a:1, age:1});
				}
			}else{
				if(pixels[idx+3] > 0){
					livePoints.push({x: x*0.5, y:y*0.5, a:1, age:1});
				}
			}
			// pixels[idx] = 255;
			// pixels[idx+1] = 0;
			// pixels[idx+2] = 0;
			// pixels[idx+3] = 255;
		}
	}
	// ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	bCtx.fillStyle = "rgba(221, 150, 150, 1)";
	bCtx.fillRect(0, 0, canvasWidth, canvasHeight);
	// drawLogo(bCtx);
	console.log("livePoints: "+livePoints.length);

}

function getArrayPosition(x, y, w){
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	// if(pointsGathered)
	// 	console.log(x+", "+y);
	return (y * w + x)*4;
}

function redraw(){
	livePoints = [];
	pointsGathered = false;
	noise.seed(Math.random());
}


function drawToHeaderCanvas(){

	if(!pointsGathered){
		gatherPoints();
		pointsGathered = true;
	}


	var bufferImage = bCtx.getImageData(0, 0, canvasWidth*2, canvasHeight*2);
	var bufferData = bufferImage.data;
	var bufferWidth = bufferImage.width;

	bCtx.fillStyle = "rgba(131, 150, 150, 1)";
	bCtx.fillRect(0, 0, canvasWidth, canvasHeight);
	bCtx.fillStyle = "rgba(255, 255, 150, 1)";
	bCtx.fillRect(canvasHeight/2, 0, canvasWidth, canvasHeight);
	if(mouseY > 0 && mouseY < canvasHeight && mouseX > 0 && mouseX < canvasWidth){
		console.log(bufferData[getArrayPosition(mouseX, mouseY, bufferWidth)]);
		bCtx.fillRect(mouseX, mouseY, 5, 5);
	}


	// smaller = tighter correlation.
	var noiseScale = 0.05;
	var noiseRotation = 0.01;
	var ageDecayRate = 0.000;
	var horzScale = 2, horzPow = 1;
	var vertScale = 5, vertPow = 2;
	var hSign, vSign, vV, vH;
	var colourRotation = 0.1;
	var randomShiftHorz = 0, randomShiftVert = 0;
	var noiseOffset = 100;


	// ctx.beginPath();
	// ctx.moveTo(livePoints[0].x,livePoints[0].y);
	var inv255 = 1.0/255;
	var nsDecay = livePoints[0].age * noiseScale;
	var bufferValue;
	for(var k = 0; k<livePoints.length;k++){

		// bufferValue = (255-bufferData[getArrayPosition(livePoints[k].x, livePoints[k].y, canvasWidth)])/255;
		

		livePoints[k].age -= ageDecayRate;
		livePoints[k].pX = livePoints[k].x;
		livePoints[k].pY = livePoints[k].y;
		livePoints[k].x += (Math.random()-0.5)*randomShiftHorz;
		livePoints[k].y += (Math.random()-0.5)*randomShiftVert;
		var noiseHorz = ( noise.perlin3(livePoints[k].x*nsDecay-noiseOffset, livePoints[k].y*nsDecay-noiseOffset, frameCount*noiseRotation)); // -1 to 1
		var noiseVert = ( noise.perlin3(livePoints[k].x*nsDecay, livePoints[k].y*nsDecay, frameCount*noiseRotation) +1 )*0.5; // 0 to 1

		hSign = Math.sign(noiseHorz);
		vSign = Math.sign(noiseVert);

		vH = Math.pow(noiseHorz, horzPow) * horzScale * ((horzPow%2)==0? hSign : 1); // We ensure the sign is maintained.
		vV = Math.pow(noiseVert, vertPow) * vertScale * ((vertPow%2)==0? vSign : 1);

		livePoints[k].x += vH;
		livePoints[k].y += vV;
		// livePoints[k].a -= Math.random()*0.02;
		livePoints[k].a += Math.random()*colourRotation;
		// ctx.fillStyle = "rgba(20, 50, 120, "+livePoints[k].a+")";


		if(k>1 && k<livePoints.length-1){
				var xc = (livePoints[k].x + livePoints[k + 1].x) / 2;
				var yc = (livePoints[k].y + livePoints[k + 1].y) / 2;
				
				// ctx.quadraticCurveTo(livePoints[k].x, livePoints[k].y, xc, yc);
		}

		// ctx.fillRect(livePoints[k].x, livePoints[k].y, 1, 1);

		// Draw to the buffer
		// bCtx.strokeStyle = "rgba(0, 0, 0, 0.02)";
		// bCtx.beginPath();
		// bCtx.moveTo(livePoints[k].x,livePoints[k].y);
		// bCtx.lineTo(livePoints[k].pX,livePoints[k].pY);
		// bCtx.stroke();
		// bCtx.fillStyle = "black";

		bCtx.fillStyle = "rgba(255, 150, 150, 1)";
		bCtx.fillRect(livePoints[k].x, livePoints[k].y, 10, 10);

		// bCtx.fillRect(0, 0, canvasWidth, canvasHeight);
		// Draw to the main canvas
		// ctx.strokeStyle = "rgba(30, 255, 10, "+bufferValue+")";
		// ctx.beginPath();
		// ctx.moveTo(livePoints[k].x,livePoints[k].y);
		// ctx.lineTo(livePoints[k].pX,livePoints[k].pY);
		// ctx.stroke();

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


var mouseX, mouseY;
window.addEventListener('mousemove', storeMousePos, false);
function storeMousePos(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}


var offscreen = 200;

var stopRotationSpeed = 0.001;

var stopArray = [
	0,
	0.40,
	0.5,
	0.60,
	1
]

var colourArray = [
	"rgba(111, 21, 108, 1)",
	"rgba(0, 96, 27, 1)",
	"rgba(66, 105, 195, 1)",
	"rgba(61, 29, 83, 1)",
	"rgba(86, 14, 51, 1)",
	"rgba(253, 124, 0, 1)"
]

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
