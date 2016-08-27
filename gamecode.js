
/*
	An arcade like game about defending your pyramid
*/

var TYPE_BRICK = 0; //Bricks that fall and count towards the pyramid
var TYPE_METEOR = 1; //Fall and shash into bricks to blow them up 
var TYPE_STRONG_MAN = 2; //Walk towards the pyramid and punch blocks
var TYPE_PRYAMID_SHAPE = 3; //Defines the pyramid shape (separate array)
var TYPE_DECOR = 4; //No collision and is drawn in the background (separate array)

var arrayBufferName = 0;
var indexArrayBufferName = 0;
var program;

var onStory = 0;
var onLevel = 0;
var progressionPointer = 0;

/* Container objects */
var storyBoardPictures =  [ ];
var levelParams = [ ];

/* PROGRESSION FUNCTIONS AND VARIABLES */

//The progression array will determine when it will be a story or
//a level screen. The progression array will be an array of functions.
var progression = null;

//Progression will use the following functions 
function toStoryPicture(_story) {
	onStory = _story;
	GameManager.setState("storyBoard");
}

function toLevel(_level) {
	onLevel = _level;
	GameManager.setState("playGame");
}

progression = { 
	function() {
		
	}
};

function advanceStory() {
	if (progressionPointer < progression.length-1) {
		progression[progressionPointer]();
		progressionPointer++;
	}
}

/* PLAY GAME FUNCTIONALITY FUNCTIONS */

/* Objects to render on the screen */
var gameObjects = new Array();
var pyramidShapeObjects = new Array();
var decorObjects = new Array();

function initWebGLParts() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	program = makeProgramWithShaderIds("vshader", "fshader");
	
}

/* 
	Objects have the following properties
	x, y (Array is pos )
	w, h  (Array is size )
	velX, velY (Array is vel)
	updateFunc (function)
	onDeleteFunc (function)
	bufferOffset (int)
	type (int)
*/

/* Use these functions when adding and removing objects */

function createBrick(_x, _y) {
	return {
		pos : [ _x, _y ],
		size : [ 64, 64 ],
		vel : [ 0, 5 ], //Small downward velocity
		updateFunc : updateBrick,
		onDeleteFunc : onDeleteBrick,
		bufferOffset : 0, //TBA
		type : TYPE_BRICK
	};
}

function createMeteor(_x, _y, _velX, _velY) {
	return {
		pos : [ _x, _y ],
		size : [ 64, 64 ],
		vel : [ velX, velY ], //Small downward velocity
		updateFunc : updateMeteor,
		onDeleteFunc : onDeleteMeteor,
		bufferOffset : 0, //TBA
		type : TYPE_METEOR
	};
}

function createStrongMan(_x) {
	return {
		pos : [ _x, 436 /* 500 - 64 */ ],
		size : [ 32, 64 ],
		vel : [ 0, 0 ], //Velocity set in updateStrongMan
		updateFunc : updateStrongMan,
		onDeleteFunc : onDeleteStrongMan,
		bufferOffset : 0, //TBA
		type : TYPE_STRONG_MAN
	};
}

function createPyramidShape(_x, _y, _w, _h) {
	return {
		pos : [ _x, _y ],
		size : [ _w, _h ],
		vel : [ 0, 0 ],
		updateFunc : noFunc,
		onDeleteFunc : noFunc,
		bufferOffset : 0, //TBA
		type : TYPE_PRYAMID_SHAPE
	};
}

function createDecor(_x, _y, _w, _h, _texture) {
	return {
		pos : [ _x, _y ],
		size : [ _w, _h ],
		vel : [ 0, 0 ],
		updateFunc : noFunc,
		onDeleteFunc : noFunc,
		bufferOffset : 0, //TBA
		type : TYPE_DECOR
	};
}

function removeFromArray(_obj, arr) {
	arr.splice(arr.indexOf(_obj), 1);
}

function addObject(_obj) {
	if (_obj.type == TYPE_DECOR) {
		
	} else if (_obj.type == TYPE_PRYAMID_SHAPE) {
		
	} else {
		
	}
}

function removeObject(_obj) {
	if (_obj.type == TYPE_DECOR) {
		removeFromArray(_obj, decorObjects);
	} else if (_obj.type == TYPE_PRYAMID_SHAPE) {
		removeFromArray(_obj, pyramidShapeObjects);
	} else {
		removeFromArray(_obj, gameObjects);
	}
}

/* Specific per-type functions */

function updateBrick(_brick) {
	
}

function updateMeteor(_meteor) {
	
}

function updateStrongMan(_strongMan) {
	
}

/* Specific per-type functions */

function onDeleteBrick(_brick) {
	
}

function onDeleteMeteor(_meteor) {
	
}

function onDeleteStrongMan(_strongMan) {
	
}

//Empty function 
function noFunc() { }

function checkCollision(_obj1, _obj2) {
	
}

/* MAIN MENU STATE FUNCTIONS */

function initMainMenu() {
	
}

function updateMainMenu(_diff) {
	
}

function renderMainMenu(_diff) {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function keyMainMenu(_pressed, _code) {
	
}

function mouseMainMenu(_pressed, _x, _y) {
	if (_pressed) { //Get started!
		advanceStory();
	}
}

function mouseMoveMainMenu(_x, _y) {
	
}

/* STORY BOARD STATE FUNCTIONS */

function initStoryBoard() {
	
}

function updateStoryBoard(_diff) {
	
}

function renderStoryBoard(_diff) {
	
}

function keyStoryBoard(_pressed, _code) {
	
}

function mouseStoryBoard(_pressed, _x, _y) {
	
}

function mouseMoveStoryBoard(_x, _y) {
	
}

/* PLAYING THE GAME STATE FUNCTIONS */

function initPlayGame() {
	
}

function updatePlayGame(_diff) {
	
}

function renderPlayGame(_diff) {
	
}

function keyPlayGame(_pressed, _code) {
	
}

function mousePlayGame(_pressed, _x, _y) {
	
}

function mouseMovePlayGame(_x, _y) {
	
}