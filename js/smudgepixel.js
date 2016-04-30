

function SmudgePixel(x, y){
	this.position = new Victor(x * inverse_canvasScale, y * inverse_canvasScale);
	this.previousPosition = this.position.clone();
	this.velocity = new Victor(0, 0);
	this.acceleration = new Victor(0, 0);
	this.age = 1;
	this.alive = true;
	this.a = 1;

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

	this.updateAcceleration = function(){
		this.acceleration.x = 0;
		this.acceleration.y = 0;
	}

}

function Repulsion(x, y){
	this.position = new Victor(x, y);
	this.radius = 50;
	this.radiusSquared = this.radius*this.radius;
	this.inverse_radiusSquared = 1/this.radiusSquared;
	this.inverse_radius = 1/this.radius;
	this.force = 2;
}