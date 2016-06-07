
function Smudge(options){
	this.name = "Unnamed Smudge";
	this.points = [];

	this.physicsOptions = {
		noiseScale: {x:0.003, y:0.053}, // smaller: tighter point correlation
		noiseRotation: {x: 0.005, y: 0.005}, // ~~ smaller: larger waves
		noiseVelocity: new Victor(0.02, 0.09),
		ageDecayRate: 0.01,
		horzPow: 1,
		vertPow: 2,
		randomShiftHorz: 0,
		randomShiftVert: 0,
		colourRotation: 0.1,
		noiseOffset: 100,
		noiseWeight: new Victor(0, 0),
		velocityDecay: 0.95
	}

	this.displayOptions = {
		context: options.context || ctx,
		buffer: buffer = options.buffer || bCtx
	}

	this.cleaupOptions = {
		bounds: {left:0, top:0, right:canvasWidth, bottom:canvasHeight}
	}

	this.loadPoints = function(imageData){
		this.points = Gatherer.gatherRandomPointsFromEverywhere(imageData, 8, SmudgePoint);
	}

	this.clearPoints = function(){
		this.points = [];
	}

	this.getPointCount = function(){
		return this.points.length;
	}

	this.draw = function(){
		var iPoint;
		var processSegments = 1;
		for(var k = (FRAMECOUNT%processSegments); k<this.points.length;k+=processSegments){
			iPoint = this.points[k];

			iPoint.updatePhysics(this.physicsOptions);
			iPoint.display(this.displayOptions);
			iPoint.cleanup(this.cleaupOptions);
		}
	}

	this.addRepulsionForce = function(x, y){
		var repulsion = new Repulsion(x, y);
		var iPoint;
		for (var i = this.points.length - 1; i >= 0; i--) {
			iPoint = this.points[i];
			this.points[i].addRepulsion(repulsion);
		}
	}
}

function PointData(x, y, col){
	this.x = x;
	this.y = y;
	this.col = col;
}

