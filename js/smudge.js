
Smudge = function(options){
	this.name = options.name || "Unnamed Smudge";
	this.points = [];
	this.PointConstructor = SmudgePoint;
	this.gather = Gatherer.gatherRandomPointsFromEverywhere;
	this.gatherDensity = 8;

	this.physicsOptions = {
		noiseScale: {x:0.003, y:0.003}, // smaller: tighter point correlation
		noiseRotation: {x: 0.005, y: 0.035}, // ~~ smaller: larger waves
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
}

Smudge.prototype.loadPoints = function(imageData){
	this.points = this.gather(imageData, this.gatherDensity, this.PointConstructor);
}

Smudge.prototype.clearPoints = function(){
	this.points = [];
}

Smudge.prototype.getPointCount = function(){
	return this.points.length;
}

Smudge.prototype.draw = function(){
	var iPoint;
	var processSegments = 1;
	for(var k = (FRAMECOUNT%processSegments); k<this.points.length;k+=processSegments){
		iPoint = this.points[k];

		iPoint.updatePhysics(this.physicsOptions);
		iPoint.display(this.displayOptions);
		iPoint.cleanup(this.cleaupOptions);
	}
}

Smudge.prototype.addRepulsionForce = function(x, y){
	var repulsion = new Repulsion(x, y);
	var iPoint;
	for (var i = this.points.length - 1; i >= 0; i--) {
		iPoint = this.points[i];
		this.points[i].addRepulsion(repulsion);
	}
}


function InkSmudge(options){
	Smudge.call(this, options);

	this.physicsOptions = {
		noiseScale: {x:0.01, y:0.01}, // smaller: tighter point correlation
		noiseRotation: {x: 0.005, y: 0.005}, // larger: faster change
		noiseVelocity: new Victor(4, 10), // multiplier for noise
		passiveMotion: new Victor(0, 0.5), // moved every frame, regardless
		ageDecayRate: 0.01,
		horzPow: 1,
		vertPow: 1,
		randomShiftHorz: 0,
		randomShiftVert: 0,
		colourRotation: 0.1,
		noiseOffset: 100,
		noiseWeight: new Victor(0, 0),
		velocityDecay: 0.95
	}
	this.PointConstructor = InkSmudgePoint;
	this.gather = Gatherer.gatherRandomPointsFromEverywhere;
	this.gatherDensity = 12;
}

Digl.setInheritance(InkSmudge, Smudge);











//

