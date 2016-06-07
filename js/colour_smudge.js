// Ink, grass, roots, vines

var headerElement;
var headerCanvas, bufferCanvas;
var canvasWidth, canvasHeight;
var ctx; // main context
var bCtx; // bufferContext
var logo;

var NOISE_OFFSET = 1000;

var canvasScale = 1;
var inverse_canvasScale = 1; // our inverse

var cSmudge;

$(document).ready(function(){
	console.log("Script ready");
	headerElement = $(".header-menu");
	headerElement.append("<canvas id='menu-canvas' width=1 height=1></canvas><canvas id='buffer-canvas' width=1 height=1></canvas>");
	headerCanvas = $("#menu-canvas");
	bufferCanvas = $("#buffer-canvas");
	ctx = headerCanvas[0].getContext("2d");
	bCtx = bufferCanvas[0].getContext("2d");
	logo = $(".logo")[0];
	resetCanvasDimensions(2);
	cSmudge = new Smudge({context:ctx, buffer:bCtx});
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
        
        cSmudge.draw();

        ///======== DRAWING ENDS =======///

    }
}

//////

function resetPoints(){
	ctx.globalCompositeOperation = 'source-over';
	clearCanvas(ctx);
	cSmudge.clearPoints();

	// Draw all the bits to inherit from
	drawLogo();

	var imageData = ctx.getImageData(0, 0, canvasWidth*canvasScale, canvasHeight*canvasScale);
	
	cSmudge.loadPoints(imageData);
	
	console.log("Gathered livePoints, total: "+cSmudge.getPointCount());
}

function clearCanvas(canvas){
	canvas = canvas || ctx;
	canvas.clearRect(0, 0, canvasWidth, canvasHeight);
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
	NOISE.seed(Math.random());
	resetPoints();
}

function getNoiseVictorAtPosition(x, y, z, scale){
	return new Victor(
		NOISE.perlin3(x*scale+NOISE_OFFSET, y*scale+NOISE_OFFSET, z),
		NOISE.perlin3(x*scale, y*scale, z)
		);
}

function drawLogo(canvas){
	canvas = canvas || ctx;
	var scale = 0.25;
	var x = canvasWidth*0.5, y = canvasHeight*0.5;
	var angleInRadians = Math.PI*0.5;

	canvas.save();
	canvas.translate(x, y);
	canvas.rotate(angleInRadians);
	canvas.scale(scale, scale);
	canvas.drawImage(logo, -logo.width / 2, -logo.height / 2, logo.width, logo.height);
	// canvas.rotate(-angleInRadians);
	// canvas.translate(-x, -y);
	canvas.restore();
}


var MOUSE_X, MOUSE_Y;
var MOUSE_NORM_X, MOUSE_NORM_Y;
window.addEventListener('mousemove', storeMousePos, false);
function storeMousePos(evt) {
    MOUSE_X = evt.clientX;
    MOUSE_Y = evt.clientY;
    MOUSE_NORM_X = canvasWidth/MOUSE_X;
    MOUSE_NORM_Y = canvasHeight/MOUSE_Y;
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
