

function SmudgePixel(x, y, colourArray){
	this.adoptedColour = colourArray;
	this.position = new Victor(x * inverse_canvasScale, y * inverse_canvasScale);
	this.previousPosition = this.position.clone();
	this.velocity = new Victor(0, 0);
	this.acceleration = new Victor(0, 0);
	this.randomSize = Math.random()*50;
	this.age = Math.random();
	this.alive = true;
	this.a = 1;
	this.seed = Math.floor(Math.random()*10000);

	this.addRepulsion = function(repulsion){
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

	this.resetAcceleration = function(){
		this.acceleration.x = 0;
		this.acceleration.y = 0;
	}

	this.getColourStringWithAlpha = function(alpha){
		return "rgba("+this.adoptedColour[0]+", "+this.adoptedColour[1]+", "+this.adoptedColour[2]+", "+alpha+")";
	}

	this.updatePhysics = function(){
		// 
	}

	this.updatePhysicsAsInk = function(options){
		this.age -= options.ageDecayRate;
		this.previousPosition.copy(this.position);
		this.velocity.add(this.acceleration);
		// Find the noise values
		var noiseVector = getNoiseVictorAtPosition(this.position.x, this.position.y, FRAMECOUNT*options.noiseRotation, options.noiseScale);
		// Apply exponent
		noiseVector.y = noiseVector.y * noiseVector.y;
		// Adjust to weighting
		noiseVector.multiply(options.noiseVelocity);
		this.velocity.add(noiseVector);
		this.position.add(this.velocity);
	}

	this.displayAsInk = function(options){
		// Draw to the buffer
		options.buffer.strokeStyle = "rgba(0, 0, 0, 0.02)";
		this.drawSimpleLineToContext(options.buffer);

		// Draw to the main canvas
		options.context.lineCap = "round";
		options.context.lineWidth = 1;
		options.context.strokeStyle = this.getColourStringWithAlpha(options.alpha);
		this.drawSimpleLineToContext(options.context);
	}

	this.drawSimpleLineToContext = function(context){
		context.beginPath();
		context.moveTo(this.position.x,this.position.y);
		context.lineTo(this.previousPosition.x,this.previousPosition.y);
		context.stroke();
	}

	this.cleanupAsInk = function(options){
		if(this.position.y > options.bounds.bottom){
			this.alive = false;
		}
		if(this.age <= 0){
			// this.alive = false;
		}
		this.resetAcceleration();
	}

}

function Repulsion(x, y){
	this.position = new Victor(x, y);
	this.radius = 200;
	this.radiusSquared = this.radius*this.radius;
	this.inverse_radiusSquared = 1/this.radiusSquared;
	this.inverse_radius = 1/this.radius;
	this.force = 2;
}