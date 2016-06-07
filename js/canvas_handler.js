

function CanvasHandler(jqSelection){
	this.jqSelection = jqSelection;
	this.canvas = this.jqSelection[0];
	this.context = this.canvas.getContext('2d');
	this.canvasScale = 1;
	this.inverse_canvasScale = 1;
	this.canvasWidth;
	this.canvasHeight;

	

	this.getImageData = function(){
		return context.getImageData(0, 0, this.canvasWidth*this.canvasScale, this.canvasHeight*this.canvasScale);
	}
	
}