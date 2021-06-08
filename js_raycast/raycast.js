const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180); //"60" degrees in radians

const WALL_STRIPE_WIDTH = 30;
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
		this.moveSpeed = 2.0; //change if too fast/slow
		this.rotationSpeed = 2 * (Math.PI / 180); //rotation angle is "2" in radians
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
		
		console.log('angle ' + this.rotationAngle + ' X and Y ' + this.x + ' ' + this.y);// log the rotationAngle, X and Y coordinates

	}
	render() {
		noStroke();
		fill("red");
		circle(this.x, this.y, this.radius);
		stroke("red");
		line(
			this.x, //x coordinate of the start of the line
			this.y, //y coordinate of the start of the line
			this.x + Math.cos(this.rotationAngle) * 30, //x coodinate of the end of the line, 30 pixels from x-start
			this.y + Math.sin(this.rotationAngle) * 30 //y coordingate of the end of the line, 30 pixels from y-start
		);
	5}
}


class Ray {
	constructor(rayAngle) {
		this.rayAngle = normaliseAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;
	}
	cast(columnid) {
		///////////////////////////////////////////
		// HORIZONTAL RAY-GRID INTERSECTION CODE //
		///////////////////////////////////////////
		//TODO:...
	}

	render() {
		stroke("rgba(255, 0, 0, 0.3)");
		line(
			player.x,
			player.y,
			player.x + Math.cos(this.rayAngle) * 30,
			player.y + Math.sin(this.rayAngle) * 30
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
	//for (var i = 0; i < NUM_RAYS; i++) {
	for (var i = 0; i < 1; i++) {

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
