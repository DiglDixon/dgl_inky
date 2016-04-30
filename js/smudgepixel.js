

function SmudgePixel(x, y){
	this.x = x * inverse_canvasScale;
	this.y = y * inverse_canvasScale;
	this.pX = this.x;
	this.pY = this.y;
	this.vX = 0;
	this.vY = 0;
	this.acceleration = {x:0, y:0};
	this.age = 1;
	this.alive = true;
	this.a  = 1;

	this.addRepulsion = function(repulsion){
		var posVector = new Victor(this.x, this.y);
		var rVector = new Victor(repulsion.x, repulsion.y);
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
	this.x = x;// * inverse_canvasScale;
	this.y = y;// * inverse_canvasScale;
	this.radius = 50;
	this.radiusSquared = this.radius*this.radius;
	this.inverse_radiusSquared = 1/this.radiusSquared;
	this.inverse_radius = 1/this.radius;
	this.force = 2;
}