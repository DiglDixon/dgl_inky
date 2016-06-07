
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
	console.log(this.cleaupOptions.bounds);
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
		// if(!iPoint.alive){
		// 	continue;
		// }
		this.physicsOptions.special = k==0;
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


function BlackSmudge(options){
	Smudge.call(this, options);

	this.gatherDensity = 8;
	this.PointConstructor = BlackSmudgePoint;

	this.physicsOptions = {
		noiseScale: {x:0.003, y:0.003}, // smaller: tighter point correlation
		noiseRotation: {x: 0.005, y: 0.035}, // ~~ smaller: larger waves
		noiseVelocity: new Victor(0.02, 0.09),
		ageDecayRate: 0.001,
		horzPow: 1,
		vertPow: 2,
		randomShiftHorz: 0,
		randomShiftVert: 0,
		colourRotation: 0.1,
		noiseOffset: 100,
		noiseWeight: new Victor(0, 0),
		velocityDecay: 0.95
	}
}
Digl.setInheritance(BlackSmudge, Smudge);










//

