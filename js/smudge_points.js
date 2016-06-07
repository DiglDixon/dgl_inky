
// Default style is an inky thing.
function SmudgePoint(x, y, colourArray){
	this.adoptedColour = colourArray;
	this.adoptedColourString = "rgba("+colourArray[0]+", "+colourArray[1]+", "+colourArray[2]+", "+1+")";
	this.position = new Victor(x * inverse_canvasScale, y * inverse_canvasScale);
	this.previousPosition = this.position.clone();
	this.velocity = new Victor(0, 0);
	this.acceleration = new Victor(0, 0);
	this.randomSize = Math.random()*50;
	this.age = 1;
	this.alive = true;
	this.seed = Math.floor(Math.random()*10000);
}

SmudgePoint.prototype.addRepulsion = function(repulsion){
	var posVector = this.position.clone();
	var rVector = repulsion.position.clone();
	posVector.subtract(rVector);
	var dist = posVector.lengthSq();
	dist = clamp(dist, 0, repulsion.radiusSquared);
	dist = repulsion.radiusSquared-dist;
	var strength = dist / (repulsion.radiusSquared);
	posVector = posVector.normalize();
	this.acceleration.x = posVector.x * repulsion.force * strength;
	this.acceleration.y = posVector.y * repulsion.force * strength;
}

SmudgePoint.prototype.resetAcceleration = function(){
	this.acceleration.x = 0;
	this.acceleration.y = 0;
}

SmudgePoint.prototype.resetVelocity = function(){
	this.velocity.x = 0;
	this.velocity.y = 0;
}

SmudgePoint.prototype.drawSimpleLineToContext = function(context){
	context.beginPath();
	// context.moveTo(this.position.x,this.position.y);
	context.moveTo(this.previousPosition.x,this.previousPosition.y);
	context.lineTo(this.position.x,this.position.y);
	context.stroke();
}

SmudgePoint.prototype.isOutOfBounds = function(bounds){
	console.log(bounds);
	console.log(this.position);
	console.log((this.position.x < bounds.left || this.position.x > bounds.right || this.position.y < bounds.top || this.position.y > bounds.top));
	return (this.position.x < bounds.left || this.position.x > bounds.right || this.position.y < bounds.top || this.position.y > bounds.top);
}

SmudgePoint.prototype.kill = function(){
	this.alive = false;
}

SmudgePoint.prototype.updatePhysics = function(options){
	this.previousPosition.copy(this.position);
	this.velocity.add(this.acceleration);
	// Find the noise values
	var noiseVector = getNoiseVictorAtPosition(this.position.x, this.position.y, {x:FRAMECOUNT*options.noiseRotation.x, y:FRAMECOUNT*options.noiseRotation.x}, options.noiseScale);
	// Apply exponent
	noiseVector.y = noiseVector.y * noiseVector.y;
	// Adjust to weighting
	noiseVector.multiply(options.noiseVelocity);
	this.velocity.add(noiseVector);
	this.position.add(this.velocity);
}

SmudgePoint.prototype.display = function(options){
	// Draw to the buffer
	// options.buffer.strokeStyle = "rgba(0, 0, 0, 0.02)";
	// this.drawSimpleLineToContext(options.buffer);

	// Draw to the main canvas
	options.context.lineCap = "round";
	options.context.lineWidth = 1;
	options.context.strokeStyle = this.adoptedColourString;
	this.drawSimpleLineToContext(options.context);
}

SmudgePoint.prototype.cleanup = function(options){
	if(this.isOutOfBounds(options.bounds)){
		this.kill();
	}
	this.resetAcceleration();
}


function BlackSmudgePoint(x, y, colourArray){
	SmudgePoint.call(this, x, y, colourArray);
}
Digl.setInheritance(BlackSmudgePoint, SmudgePoint);

BlackSmudgePoint.prototype.updatePhysics = function(options){
	if(options.special)
		console.log(this.age);
	this.age -= options.ageDecayRate;
	this.previousPosition.copy(this.position);
	this.velocity.add(this.acceleration);
	// Find the noise values
	var noiseVector = getNoiseVictorAtPosition(this.position.x, this.position.y, {x:FRAMECOUNT*options.noiseRotation.x, y:FRAMECOUNT*options.noiseRotation.x}, options.noiseScale);
	// Apply exponent
	noiseVector.y = noiseVector.y * noiseVector.y;
	// Adjust to weighting
	noiseVector.multiply(options.noiseVelocity);
	this.velocity.add(noiseVector);
	this.position.add(this.velocity);
}

BlackSmudgePoint.prototype.display = function(options){
	// Draw to the buffer
	// options.buffer.strokeStyle = "rgba(0, 0, 0, 0.02)";
	// this.drawSimpleLineToContext(options.buffer);

	// Draw to the main canvas
	options.context.lineCap = "round";
	options.context.lineWidth = 3 * this.age;
	options.context.strokeStyle = this.adoptedColourString;
	this.drawSimpleLineToContext(options.context);
}

BlackSmudgePoint.prototype.cleanup = function(options){
	if(this.isOutOfBounds(options.bounds)){
		this.kill();
	}
	if(this.age <= 0){
		this.kill();
	}
	this.resetAcceleration();
}


