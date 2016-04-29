

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
	resetCanvasDimensionsDouble();
	noise.seed(Math.random());
	startAnimating(frameRate);
});

var canvasScale = 1;
var doubled = false;

function resetCanvasDimensionsSingle(){
	canvasScale = 1;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	var cvs = headerCanvas[0];
	var height = headerElement.height();
	var width = headerElement.width();
	cvs.width = width;
	cvs.height = height;
	cvs.style.width = width+"px";
	cvs.style.height = height+"px";
	canvasWidth = headerCanvas.width();
	canvasHeight = headerCanvas.height();
	// buffer
	bCtx.setTransform(1, 0, 0, 1, 0, 0);
	var bCvs = bufferCanvas[0];
	bCvs.width = width;
	bCvs.height = height;
	bCvs.style.width = width+"px";
	bCvs.style.height = height+"px";
	doubled = false;
}

function resetCanvasDimensionsDouble(){
	canvasScale = 2;
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
	doubled = true;
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

	var imageData = ctx.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
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
					livePoints.push({x: x*0.5, y:y*0.5, a:1, age:1, alive:true});
				}
			}else{
				if(pixels[idx+3] > 0){
					livePoints.push({x: x*0.5, y:y*0.5, a:1, age:1, alive:true});
				}
			}
		}
	}
	// ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	// bCtx.fillStyle = "rgba(255, 255, 255, 1)";
	// bCtx.fillRect(0, 0, canvasWidth, canvasHeight);
	// drawLogo(bCtx);
	console.log("livePoints: "+livePoints.length);

}

// Call this one working within arrays
function getArrayPosition(x, y, w){
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w + x)*4;
}
// Call this one from stuff like mouseX, mouseY
function getArrayPositionFromOutside(x, y, w){
	if(doubled)
		return getArrayPositionDouble(x, y, w);
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w + x)*4;
}
// This one will get called if is appropriate
function getArrayPositionDouble(x, y, w){
	x = Math.floor(x); y = Math.floor(y); w = Math.floor(w);
	return (y * w * 2 + x * 2)*4;
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

	// ctx.fillStyle = "rgba(255, 255, 255, 0.01)";
	// ctx.fillRect(0, 0, canvasWidth, canvasHeight);


	var bufferImage = bCtx.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
	var bufferData = bufferImage.data;
	var bufferWidth = bufferImage.width;
	// console.log("Width: "+bufferImage.width+", "+bufferImage.height+", mul: "+bufferImage.width*bufferImage.height+"len: "+bufferData.length);

	// if(true){
	// 	console.log(bufferData[getArrayPositionFromOutside(mouseX, mouseY, bufferWidth)+3]);
	// }


	// smaller = tighter correlation.
	var noiseScale = 0.01;
	var noiseRotation = 0.01;
	var ageDecayRate = 0.00;
	var horzScale = 0, horzPow = 1;
	var vertScale = 5, vertPow = 2;
	var hSign, vSign, vV, vH;
	var colourRotation = 0.1;
	var randomShiftHorz = 1, randomShiftVert = 0;
	var noiseOffset = 100;


	// ctx.beginPath();
	// ctx.moveTo(livePoints[0].x,livePoints[0].y);
	var inv255 = 1.0/255.0;
	var invLength = 1/livePoints.length;
	var bufferValue;
	var friendsDrawn = 0;
	for(var k = 0; k<livePoints.length;k++){
		if(!livePoints[k].alive)
			continue;
		bufferValue = bufferData[getArrayPositionFromOutside(livePoints[k].x, livePoints[k].y, bufferWidth)+3]*inv255;
		

		livePoints[k].age -= ageDecayRate;
		livePoints[k].pX = livePoints[k].x;
		livePoints[k].pY = livePoints[k].y;
		livePoints[k].x += (Math.random()-0.5)*randomShiftHorz;
		livePoints[k].y += (Math.random()-0.5)*randomShiftVert;
		var noiseHorz = ( noise.perlin3(livePoints[k].x*noiseScale-noiseOffset, livePoints[k].y*noiseScale-noiseOffset, frameCount*noiseRotation)); // -1 to 1
		var noiseVert = ( noise.perlin3(livePoints[k].x*noiseScale, livePoints[k].y*noiseScale, frameCount*noiseRotation) +1 )*0.5; // 0 to 1

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
		bCtx.strokeStyle = "rgba(0, 0, 0, 0.02)";
		bCtx.beginPath();
		bCtx.moveTo(livePoints[k].x,livePoints[k].y);
		bCtx.lineTo(livePoints[k].pX,livePoints[k].pY);
		bCtx.stroke();
		bCtx.fillStyle = "black";

		// Draw to the main canvas
		ctx.lineCap = "round";
		ctx.lineWidth = 20*livePoints[k].vY;
		// ctx.strokeStyle = "rgba("+(20+150.0*bufferValue)+", "+(80.0+80*(1-bufferValue))+", 150, 255)";
		ctx.strokeStyle = "rgba(139, 100, 35, "+livePoints[k].vY*0.01+")";
		ctx.beginPath();
		ctx.moveTo(livePoints[k].x,livePoints[k].y);
		ctx.lineTo(livePoints[k].pX,livePoints[k].pY);
		ctx.stroke();

		// round up

		if(livePoints[k].y > canvasHeight){
			livePoints[k].alive = false;
		}

		livePoints[k].vX = livePoints[k].x - livePoints[k].pX;
		livePoints[k].vY = livePoints[k].y - livePoints[k].pY;
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
