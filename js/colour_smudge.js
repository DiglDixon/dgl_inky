

var headerElement;
var headerCanvas;
var headerContext;
var canvasWidth, canvasHeight;
var borderWidth = 1;
var ctx;
var logo;
var texture;

$(document).ready(function(){
	console.log("Script ready");
	headerElement = $(".header-menu");
	headerElement.append("<canvas id='menu-canvas' width=1 height=1></canvas>");
	headerCanvas = $("#menu-canvas");
	headerContext = headerCanvas[0].getContext("2d");
	ctx = headerContext;
	
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
}

var frameRate = 60;
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

        ///======== DRAWING BEGINS =======///

        // console.log("Drawing..");

        drawToHeaderCanvas();

        ///======== DRAWING ENDS =======///
    }
}

var livePoints = [];

var pointsGathered = false;

function gatherPoints(){
	ctx.globalCompositeOperation = 'source-over';
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvasWidth*2, canvasHeight*2);

	drawLogo();

	var imageData = ctx.getImageData(0, 0, canvasWidth*2, canvasHeight*2);
	var pixels = imageData.data;

	var imageDataWidth = imageData.width;
	var imageDataHeight = imageData.height;
	var cX, cY;
	var idx;
	for(var x = 0; x<imageDataWidth; x+=5){
		for(var y = 0; y<imageDataHeight; y+=5){
			idx = getArrayPosition(x, y, imageDataWidth);
			if(pixels[idx] < 10){
				livePoints.push({x: x*0.5, y:y*0.5});
			}
			pixels[idx] = 255;
			pixels[idx+1] = 0;
			pixels[idx+2] = 0;
			pixels[idx+3] = 255;
		}
	}
	// ctx.putImageData(imageData, 0, 0);
	console.log("livePoints: "+livePoints.length);
	ctx.fillStyle = "green";
	for(var k = 0; k<livePoints.length;k++){
		ctx.fillRect(livePoints[k].x, livePoints[k].y, 4, 4);
	}

}

function getArrayPosition(x, y, w, h){
	return (y * w + x)*4;
}

function drawToHeaderCanvas(){

	if(!pointsGathered){
		gatherPoints();
		pointsGathered = true;
	}

	return;
	// Reset
	ctx.globalCompositeOperation = 'source-over';
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvasWidth*2, canvasHeight*2);

	drawLogo();

	var imageData = ctx.getImageData(0, 0, canvasWidth*2, canvasHeight*2);
	var pixels = imageData.data;
	var imageDataWidth = imageData.width;
	var imageDataHeight = imageData.height;
	var pixelAboveIndex;
	for(var k = imageDataWidth; k<pixels.length; k+=4){
		pixelAboveIndex = [k-imageDataWidth];
		if(k==imageDataWidth){
			console.log(k+" :: "+pixelAboveIndex);
		}
		if(pixels[pixelAboveIndex] < 10){
			pixels[k] = pixels[k] * 0.5 + pixels[pixelAboveIndex] * 0.5;
			pixels[k+1] = pixels[k+1] * 0.5 + pixels[pixelAboveIndex+1] * 0.5;
			pixels[k+2] = pixels[k+2] * 0.5 + pixels[pixelAboveIndex+2] * 0.5;
			pixels[k+3] = pixels[k+3] * 0.5 + pixels[pixelAboveIndex+3] * 0.5;
		}
	}

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.putImageData(imageData, 0, 0);
	
	// Mask
	var grd2=ctx.createRadialGradient(0,0,20,0,0,500);
	grd2.addColorStop(0,"rgba(255, 255, 255, 0)");
	grd2.addColorStop(0.7,"rgba(255, 255, 255, 0.5)");
	grd2.addColorStop(0.4,"rgba(255, 255, 255, 0.5)");
	ctx.fillStyle = grd2;
	ctx.fillRect(canvasWidth-borderWidth, 0, borderWidth, canvasHeight);

	// ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
	// ctx.fillRect(canvasWidth-borderWidth*2, 0, borderWidth, canvasHeight);

	// Mask Image
	drawLogo();
	// ctx.drawImage(texture, 0, 0);

	// Colour
	ctx.globalCompositeOperation = 'source-in';
	var grd=ctx.createRadialGradient(0,0,20,0,0,canvasHeight);
	for(var k = 0; k<stopArray.length; k++){
		stopArray[k]  = (stopArray[k] + stopRotationSpeed) % 1;
		grd.addColorStop(stopArray[k], colourArray[k]);
	}
	ctx.fillStyle = grd;
	ctx.fillRect(0, -offscreen, canvasWidth, canvasHeight+offscreen);

	ctx.globalCompositeOperation = 'source-over';
	ctx.globalAlpha = 0.1;
	drawLogo();
	ctx.globalAlpha = 1;
}

function drawLogo(){
	var scale = 0.6;
	var width = 83*scale, height = 50*scale, x = canvasWidth*0.5, y = canvasHeight*0.5;
	var angleInRadians = -3.141592 * 0.5;
	ctx.translate(x, y);
	ctx.rotate(angleInRadians);
	ctx.drawImage(logo, -width / 2, -height / 2, width, height);
	ctx.rotate(-angleInRadians);
	ctx.translate(-x, -y);
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
    if(c=='q'){
    	borderWidth = 1;
    	console.log(borderWidth);
    }
    if(c=='w'){
    	borderWidth = 0.1;
    	console.log(borderWidth);
    }

};
