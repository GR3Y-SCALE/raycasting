const TILE_SIZE = 80;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180); // "60" degrees in radians

const WALL_STRIPE_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIPE_WIDTH;




class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }	//checks if there is a wall from the grid at the supplied (x,y) coordinate
	hasWallAt(x, y) {
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
			return true;
		}
		var mapGridIndexX = Math.floor(x / TILE_SIZE);
		var mapGridIndexY = Math.floor(y / TILE_SIZE);
		return this.grid[mapGridIndexY][mapGridIndexX] != 0; //the x and y are flipped, returns true or false if there is a wall or not
	}

    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}


class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2; //middle of the screen
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 3;
		this.turnDirection = 0; // -1 if left, +1 if right
		this.walkDirection = 0; // -1 if back, +1 if front
		this.rotationAngle = Math.PI / 2; //random angle
		this.moveSpeed = 2.5; //change if too fast/slow
		this.rotationSpeed = 1.8 * (Math.PI / 180); //rotation angle is "2" in radians
	}
	update() {
		this.rotationAngle += this.turnDirection * this.rotationSpeed; //plus the rotation angle by the turnDirection and speed
		
		var moveStep = this.walkDirection * this.moveSpeed;

		var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep; //coordinate X = COS(angle) * hypotenuse, next X coordinate for player
		var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep; //coordinate Y = SIN(angle) * hypotenuse, next Y coordinate for player

		//only set new player position if it is not colliding with the map walls
		if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
		//console.log(floor(this.x / TILE_SIZE) + ' ' + floor(this.y / TILE_SIZE)); //shows position on grid (x,y)
		
		// console.log('angle ' + this.rotationAngle + ' X and Y ' + this.x + ' ' + this.y);// log the rotationAngle, X and Y coordinates

	}
	render() {
		noStroke();
		fill("red");
		circle(this.x, this.y, this.radius);
		/*stroke("red");
		line(
			this.x, // x coordinate of the start of the line
			this.y, // y coordinate of the start of the line
			this.x + Math.cos(this.rotationAngle) * 30, // x coodinate of the end of the line, 30 pixels from x-start
			this.y + Math.sin(this.rotationAngle) * 30 // y coordingate of the end of the line, 30 pixels from y-start
		);*/
	5}
}


class Ray {
	constructor(rayAngle) {
		this.rayAngle = normaliseAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
		this.wasHitVertical = false;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI; // if the ray is greater then 0 and below pi, pi is 270 degrees, therefore the ray is facing down
		this.isRayFacingUp = !this.isRayFacingDown; // opposite of rayFacingDown

		this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI; // more then 270 deg (1.5 * PI) but below 90 (PI/2) means ray is facing right
		this.isRayFacingLeft = !this.isRayFacingRight; // opposite of rayFacingRight
	}
	cast(columnid) {
		var xintercept, yintercept;
		var xstep, ystep;
		///////////////////////////////////////////
		// HORIZONTAL RAY-GRID INTERSECTION CODE //
		///////////////////////////////////////////
		
		var foundHorzWallHit = false;
		var horzWallHitX = 0;
		var horzWallHitY = 0;
		
		// console.log("isRayFacingDown?", this.isRayFacingDown);
		// console.log("isRayFacingRight?", this.isRayFacingRight);

		// find the y-coordinate of the closest horizontal grid intersection
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += this.isRayFacingDown ? TILE_SIZE : 0; // IF ray is facing down then add tile_size ELSE do nothing

		// find the x-coordinate of the closest horizontal grid intersection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

		// calculate the increment xStep and yStep (DeltaX and DeltaY)
		ystep = TILE_SIZE;
		ystep *= this.isRayFacingUp ? -1 : 1; // if the ray is facing up, invert ystep

		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
		xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

		var nextHorzTouchX = xintercept;
		var nextHorzTouchY = yintercept;

		// if (this.isRayFacingUp) {
		//	nextHorzTouchY--;
		// }

		// increment xstep and ystep until a wall is found
		while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
			if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
				// a wall is hit
				foundHorzWallHit = true;
				horzWallHitX = nextHorzTouchX;
				horzWallHitY = nextHorzTouchY;

				// testing
				// stroke("red");
				// line(player.x, player.y, horzWallHitX, horzWallHitY); // line from player to the wall hit
				break; // TODO: change the statement so it isnt a break

			} else {
				nextHorzTouchX += xstep; // move to the next intercept (x,...) 
				nextHorzTouchY += ystep; // move to the next intercept (...,y)
			}
		}

		/////////////////////////////////////////
		// VERTICAL RAY-GRID INTERSECTION CODE //
		/////////////////////////////////////////
		
		var foundVertWallHit = false;
		var vertWallHitX = 0;
		var vertWallHitY = 0;
		
		// console.log("isRayFacingDown?", this.isRayFacingDown);
		// console.log("isRayFacingRight?", this.isRayFacingRight);

		// find the x-coordinate of the closest vertical grid intersection
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += this.isRayFacingRight ? TILE_SIZE : 0; // IF ray is facing Right then add tile_size ELSE do nothing

		// find the y-coordinate of the closest vetical grid intersection
		yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

		// calculate the increment xStep and yStep (DeltaX and DeltaY)
		xstep = TILE_SIZE;
		xstep *= this.isRayFacingLeft ? -1 : 1; // if the ray is facing up, invert ystep

		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
		ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

		var nextVertTouchX = xintercept;
		var nextVertTouchY = yintercept;

		// if (this.isRayFacingLeft) {
		//	nextVertTouchX--;
		// }

		// increment xstep and ystep until a wall is found
		while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
			if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
				// a wall is hit
				foundVertWallHit = true;
				vertWallHitX = nextVertTouchX;
				vertWallHitY = nextVertTouchY;

				// testing
				// stroke("red");
				// line(player.x, player.y, vertWallHitX, vertWallHitY); // line from player to the wall hit
				break; // TODO: change the statement so it isnt a break

			} else {
				nextVertTouchX += xstep; // move to the next intercept (x,...) 
				nextVertTouchY += ystep; // move to the next intercept (...,y)
			}
		}

		// Calculate both horizontal and vertical distances and choose the smallest value
		var horzHitDistance = (foundHorzWallHit)  // if true then it will find the distance, otherwise it is assumed that vertHit is smaller
			? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY) 
			: Number.MAX_VALUE;
		var vertHitDistance = (foundVertWallHit) // if true then it will find the distance, otherwise it is assumed that horzHit is smaller
			? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
			: Number.MAX_VALUE;

		// only store the smallest of the distances
		this.wallHitX = (horzHitDistance < vertHitDistance) 
			? horzWallHitX 
			: vertWallHitX;
		this.wallHitY = (horzHitDistance < vertHitDistance) 
			? horzWallHitY 
			: vertWallHitY;
		this.distance = (horzHitDistance < vertHitDistance) 
			? horzHitDistance 
			: vertHitDistance;
		this.wasHitVertical = (vertHitDistance < horzHitDistance); // wasHitVertical is true if vertDistance is smaller
	}

	render() {
		stroke("rgba(255, 0, 0, 0.3)");
		line(
			player.x,
			player.y,
			this.wallHitX,
			this.wallHitY
		);
	}
}	



var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = +1;
	}else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	}else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = +1;
	}else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	}else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	}else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	}else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}


function castAllRays() {
	var columnId = 0;

	// start first ray subtracting half of the FOV
	var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

	rays = [];

	// loop all columns casting the rays
	for (var i = 0; i < NUM_RAYS; i++) {
		var ray = new Ray(rayAngle);
		ray.cast(columnId);
		rays.push(ray);

		rayAngle += FOV_ANGLE / NUM_RAYS;

		columnId++;
	}
}

function normaliseAngle(angle) {
	angle = angle % (2 * Math.PI);
	if (angle < 0) {
		angle = (2 * Math.PI) + angle
	}
	return angle;
}

function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 -x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); // return the length between the two points, hypotenuse. X & Y being A & B
}

function setup() {
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

function update() {
	player.update();
	castAllRays(); 
}

function draw() {
	update();
	grid.render();
	for (ray of rays) {
		ray.render();
	}
	player.render();
}
