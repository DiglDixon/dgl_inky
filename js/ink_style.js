
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


////////////////////////////////////////////////////////////////////////////////

function InkSmudgePoint(x, y, colourArray){
	SmudgePoint.call(this, x, y, colourArray)
}
Digl.setInheritance(InkSmudgePoint, SmudgePoint);

InkSmudgePoint.prototype.updatePhysics = function(options){
	this.age -= options.ageDecayRate;
	this.previousPosition.copy(this.position);
	// Find the noise values
	var noiseVector = getNoiseVictorAtPosition(this.position.x, this.position.y, {x:FRAMECOUNT*options.noiseRotation.x, y:FRAMECOUNT*options.noiseRotation.x}, options.noiseScale);
	// Apply exponent
	noiseVector.y = noiseVector.y * noiseVector.y;
	// Adjust to weighting
	noiseVector.multiply(options.noiseVelocity);
	noiseVector.add(options.passiveMotion);
	this.position.add(noiseVector);
}

InkSmudgePoint.prototype.display = function(options){
	// Draw to the main canvas
	options.context.lineCap = "round";
	options.context.lineWidth = 10;
	options.context.strokeStyle = this.adoptedColourString;
	this.drawSimpleLineToContext(options.context);
}