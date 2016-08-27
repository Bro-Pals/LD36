
/*
	An arcade like game about defending your pyramid
*/

//Empty function 
function noFunc() { }

var TYPE_BRICK = 0; //Bricks that fall and count towards the pyramid
var TYPE_METEOR = 1; //Fall and shash into bricks to blow them up 
var TYPE_STRONG_MAN = 2; //Walk towards the pyramid and punch blocks
var TYPE_PRYAMID_SHAPE = 3; //Defines the pyramid shape (separate array)
var TYPE_DECOR = 4; //No collision and is drawn in the background (separate array)
var TYPE_BACKGROUND = 5;

/* WebGL variables */
var arrayBufferName = 0;
var indexArrayBufferName = 0;
var objectProgram; //Program for drawing game objects on the screen
var objectProgramLocs = {
	vertexPos : null, //(vec2 attribute)
	texCoord : null, //(vec2 attribute)
	worldPosition : null, //(vec2 uniform)
	worldSize : null, //(vec2 uniform)
	tex : null
};
var texturesTex; //Texture object for textures 
var slidesTex; //Texture object for slides 
var SAMPLER_TEXTURES = 0;
var SAMPLER_SLIDES = 1;
var curSampler = 0;


/* Gravity constant */
var GRAVITY_VELOCITY = 5.0;

/* Texture coordinate raw data */
var objectTexCoordData = {
	texture_coords : [
		{ 
			name : "background",
			x : 800,
			y : 842,
			image_width: 800,
			image_height: 600,
			world_width: 800,
			world_height: 600
		},
		{ 
			name : "block",
			x : 0,
			y : 252,
			image_width: 128,
			image_height: 128,
			world_width: 32,
			world_height: 32
		},
		{ 
			name : "continueButton",
			x : 0,
			y : 592,
			image_width: 256,
			image_height: 256,
			world_width: 256,
			world_height: 256
		},
		{ 
			name : "end",
			x : 0,
			y : 1442,
			image_width: 800,
			image_height: 600,
			world_width: 800,
			world_height: 600
		},
		{ 
			name : "gameover",
			x : 800,
			y : 1442,
			image_width: 800,
			image_height: 600,
			world_width: 800,
			world_height: 600
		},
		{ 
			name : "godeye",
			x : 170,
			y : 242,
			image_width: 256,
			image_height: 256,
			world_width: 256,
			world_height: 256
		},
		{ 
			name : "menuButton",
			x : 270,
			y : 592,
			image_width: 256,
			image_height: 128,
			world_width: 256,
			world_height: 128
		},
		{ 
			name : "meteor",
			x : 500,
			y : 252,
			image_width: 256,
			image_height: 256,
			world_width: 256,
			world_height: 256
		},
		{ 
			name : "pauseButton",
			x : 1000,
			y : 592,
			image_width: 128,
			image_height: 128,
			world_width: 128,
			world_height: 128
		},
		{ 
			name : "playButton",
			x : 550,
			y : 592,
			image_width: 256,
			image_height: 128,
			world_width: 256,
			world_height: 128
		},
		{ 
			name : "strongman",
			x : 1300,
			y : 252,
			image_width: 64,
			image_height: 128,
			world_width: 64,
			world_height: 128
		},
		{ 
			name : "title",
			x : 0,
			y : 842,
			image_width: 800,
			image_height: 600,
			world_width: 800,
			world_height: 600
		},
		{ 
			name : "resumeButton",
			x : 1128,
			y : 592,
			image_width: 128,
			image_height: 128,
			world_width: 128,
			world_height: 128
		},
		{
			name : "overlay1",
			x : 1605,
			y : 842,
			image_width : 181,
			image_height : 129,
			world_width : 181,
			world_height : 129
		},
		{
			name : "overlay2",
			x : 1605,
			y : 975,
			image_width : 280,
			image_height : 144,
			world_width : 280,
			world_height : 144
		},
		{
			name : "overlay3",
			x : 1888,
			y : 844,
			image_width : 76,
			image_height : 275,
			world_width : 76,
			world_height : 275
		},
		{
			name : "overlay4",
			x : 1605,
			y : 1122,
			image_width : 336,
			image_height : 250,
			world_width : 336,
			world_height : 250
		}
	],
	imageWidth : 2048.0,
	imageHeight: 2048.0
};

var slideTexCoordData = {
	texture_coords : [
		{ 
			name : "slide1",
			x : 0,
			y : 0,
			image_width: 800,
			image_height: 600,
			world_width: 800,
			world_height: 600
		}
	],
	imageWidth : 2048.0,
	imageHeight: 2048.0
};

var levelData = {
	level_goal_boxes : [
		{
			level : 1,
			name : "Pyramid",
			boundries : [
				{ x : 313, y : 513, w : 160, h : 46 },
				{ x : 343, y : 479, w :  97, h : 34 },
				{ x : 366, y : 457, w :  50, h : 22 },				
				{ x : 386, y : 438, w :  17, h : 15 }				
			],
			overlay : {
				name : "overlay1",
				x_pos : 301,
				y_pos : 431
			}
		},
		{
			level : 2,
			name : "Tomb",
			boundries : [
				{ x : 244, y : 494, w : 275, h : 66 },
				{ x : 324, y : 433, w : 118, h : 61 },
				{ x : 351, y : 420, w :  65, h : 13 }
			],
			overlay : {
				name : "overlay2",
				x_pos : 244,
				y_pos : 417
			}
		},
		{
			level : 3,
			name : "Monument",
			boundries : [
				{ x : 336, y : 314, w : 72, h : 245 },
				{ x : 353, y : 294, w : 38, h : 20  }
			],
			overlay : {
				name : "overlay3",
				x_pos : 334,
				y_pos : 287
			}
		},
		{
			level : 4,
			name : "Great Pyramid",
			boundries : [
				{ x : 242, y : 498, w : 309, h : 61 },
				{ x : 285, y : 448, w : 222, h : 50 },
				{ x : 323, y : 401, w : 145, h : 48 },
				{ x : 355, y : 362, w : 81, h : 39 },
				{ x : 378, y : 337, w : 37, h : 25 },
				{ x : 391, y : 319, w : 12, h : 18 }
			],
			overlay : {
				name : "overlay4",
				x_pos : 233,
				y_pos : 310
			}
		}
	]

};

/* Container objects */
var storyBoardPictures =  [ ];
var objectData = { 
	namesArray : [ ], //List of names 
	indexBufferOffsetMap : [ ], //names mapped to offsets
	sizesMap : [ ], //names mapped to sizes
	sizesMap : [ ], //names mapped to sizes
	textureCoordsMap : [ ], //names mapped to texture coordinates
};
var slidesData = { 
	namesArray : [ ], //List of names 
	indexBufferOffsetMap : [ ], //names mapped to offsets
	sizesMap : [ ], //names mapped to sizes
	textureCoordsMap : [ ], //names mapped to texture coordinates
};

/* PROGRESSION FUNCTIONS AND VARIABLES */

var onStory = 0;
var onLevel = 0;
var progressionPointer = 0;

//The progression array will determine when it will be a story or
//a level screen. The progression array will be an array of functions.
var progression = null;

//Progression will use the following functions 
function toStoryPicture(_story) {
	onStory = _story;
	GameManager.setState("storyBoard");
	console.log("Story board " + _story);
}

function toLevel(_level) {
	onLevel = _level;
	GameManager.setState("playGame");
	//Build the level
	var levelObject = levelData.level_goal_boxes[onLevel];
	for (var i=0; i<levelObject.boundries.length; i++) {
		addObject(createPyramidShape(
				levelObject.boundries.x,
				levelObject.boundries.y,
				levelObject.boundries.w,
				levelObject.boundries.h
			));
	}
	addObject(createDecor(
			levelObject.overlay.x_pos,
			levelObject.overlay.y_pos,
			objectData.sizesMap[levelObject.overlay.name][0],
			objectData.sizesMap[levelObject.overlay.name][1],
			levelObject.overlay.name
		));
	console.log("Level " + _level);
}

progression = [ 
	function() {
		toLevel(0);
	},
	function() {
		toLevel(1);
	},
	function() {
		toLevel(2);
	},
	function() {
		toLevel(3);
	},
];

function advanceStory() {
	if (progressionPointer < progression.length) {
		progression[progressionPointer]();
		progressionPointer++;
	}
}

/* PLAY GAME FUNCTIONALITY FUNCTIONS */

/* Objects to render on the screen */
var gameObjects = [ ];
var pyramidShapeObjects = [ ];
var decorObjects = [ ];
var backgroundObjects = [ ];
var mousePos = [ 0.0, 0.0 ];

//Init WebGL variables that will be around for the whole game 
function initWebGLParts() {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	/* Load programs and get shader attribute and uniform locations */
	objectProgram = makeProgramWithShaderIds("vshader", "fshader");
	gl.useProgram(objectProgram);
	objectProgramLocs.vertexPos = gl.getAttribLocation(objectProgram, "vertexPos");
	objectProgramLocs.texCoord = gl.getAttribLocation(objectProgram, "texCoord");
	objectProgramLocs.worldPosition = gl.getUniformLocation(objectProgram, "worldPosition");
	objectProgramLocs.worldSize = gl.getUniformLocation(objectProgram, "worldSize");
	objectProgramLocs.tex = gl.getUniformLocation(objectProgram, "tex");
	
	/* Create the array and index array buffers */
	var arrayArray = new Float32Array((objectData.namesArray.length+slidesData.namesArray.length)*16);
	var indexArray = new Uint16Array((objectData.namesArray.length+slidesData.namesArray.length)*6);
	//Fill the arrays with object data
	for (var i=0; i < objectData.namesArray.length; i++) {
		var onName = objectData.namesArray[i];
		var halfWidth = objectData.sizesMap[onName][0]/2;
		var halfHeight = objectData.sizesMap[onName][1]/2
		
		//Array buffer setting
		arrayArray[(i*16)+0] = -halfWidth;
		arrayArray[(i*16)+1] = -halfHeight;
		arrayArray[(i*16)+2] = objectData.textureCoordsMap[onName][0];
		arrayArray[(i*16)+3] = objectData.textureCoordsMap[onName][1];
	
		arrayArray[(i*16)+4] = -halfWidth;
		arrayArray[(i*16)+5] = halfHeight;
		arrayArray[(i*16)+6] = objectData.textureCoordsMap[onName][2];
		arrayArray[(i*16)+7] = objectData.textureCoordsMap[onName][3];
		
		arrayArray[(i*16)+8] = halfWidth;
		arrayArray[(i*16)+9] = halfHeight;
		arrayArray[(i*16)+10] = objectData.textureCoordsMap[onName][4];
		arrayArray[(i*16)+11] = objectData.textureCoordsMap[onName][5];
		
		arrayArray[(i*16)+12] = halfWidth;
		arrayArray[(i*16)+13] = -halfHeight;
		arrayArray[(i*16)+14] = objectData.textureCoordsMap[onName][6];
		arrayArray[(i*16)+15] = objectData.textureCoordsMap[onName][7];
	
		//Index array buffer setting
		indexArray[(i*6)+0] = (i*4)+0;
		indexArray[(i*6)+1] = (i*4)+1;
		indexArray[(i*6)+2] = (i*4)+2;
		indexArray[(i*6)+3] = (i*4)+0;
		indexArray[(i*6)+4] = (i*4)+3;
		indexArray[(i*6)+5] = (i*4)+2;
	}
	var slidesArrayStart = i*16; 
	var slidesIndexStart = i*6;
	var slidesIndexArrayStart = i*4;
	
	//Fill the arrays with slides data 
	for (var i=0; i < slidesData.namesArray.length; i++) {
		var onName = slidesData.namesArray[i];
		var halfWidth = slidesData.sizesMap[onName][0]/2;
		var halfHeight = slidesData.sizesMap[onName][1]/2
		
		//Array buffer setting
		arrayArray[slidesArrayStart+(i*16)+0] = -halfWidth;
		arrayArray[slidesArrayStart+(i*16)+1] = -halfHeight;
		arrayArray[slidesArrayStart+(i*16)+2] = slidesData.textureCoordsMap[onName][0];
		arrayArray[slidesArrayStart+(i*16)+3] = slidesData.textureCoordsMap[onName][1];
	
		arrayArray[slidesArrayStart+(i*16)+4] = -halfWidth;
		arrayArray[slidesArrayStart+(i*16)+5] = halfHeight;
		arrayArray[slidesArrayStart+(i*16)+6] = slidesData.textureCoordsMap[onName][2];
		arrayArray[slidesArrayStart+(i*16)+7] = slidesData.textureCoordsMap[onName][3];
		
		arrayArray[slidesArrayStart+(i*16)+8] = halfWidth;
		arrayArray[slidesArrayStart+(i*16)+9] = halfHeight;
		arrayArray[slidesArrayStart+(i*16)+10] = slidesData.textureCoordsMap[onName][4];
		arrayArray[slidesArrayStart+(i*16)+11] = slidesData.textureCoordsMap[onName][5];
		
		arrayArray[slidesArrayStart+(i*16)+12] = halfWidth;
		arrayArray[slidesArrayStart+(i*16)+13] = -halfHeight;
		arrayArray[slidesArrayStart+(i*16)+14] = slidesData.textureCoordsMap[onName][6];
		arrayArray[slidesArrayStart+(i*16)+15] = slidesData.textureCoordsMap[onName][7];
	
		//Index array buffer setting
		indexArray[slidesIndexStart+(i*6)+0] = slidesIndexArrayStart+(i*4)+0;
		indexArray[slidesIndexStart+(i*6)+1] = slidesIndexArrayStart+(i*4)+1;
		indexArray[slidesIndexStart+(i*6)+2] = slidesIndexArrayStart+(i*4)+2;
		indexArray[slidesIndexStart+(i*6)+3] = slidesIndexArrayStart+(i*4)+0;
		indexArray[slidesIndexStart+(i*6)+4] = slidesIndexArrayStart+(i*4)+3;
		indexArray[slidesIndexStart+(i*6)+5] = slidesIndexArrayStart+(i*4)+2;
	}
	
	arrayBufferName = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, arrayBufferName);
	gl.bufferData(gl.ARRAY_BUFFER, arrayArray, gl.STATIC_DRAW);
	
	indexArrayBufferName = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexArrayBufferName);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
	
	/* Load textures and set their parameters */
	var texturesImage = document.getElementById("texturesImage");
	gl.activeTexture(gl.TEXTURE0);
	texturesTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texturesTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, 
		texturesImage);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	/* 
	If gl.NEAREST looks bad then use gl.LINEAR
	*/
	/*
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	*/
	
	var slidesImage = document.getElementById("slidesImage");
	gl.activeTexture(gl.TEXTURE1);
	slidesTex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, slidesTex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, 
		slidesImage);
	/*
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	*/
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	/* Enable features */
}

/*
	Used to fill the objectData and slideData object arrays with
	information derived from objectTexCoordData and slideTexCoordData
	
	Texture coords and verticies are in the order:
	   1        4
		*------*
		|      |
		|      |        (counter-clockwise)
		|      |
		*------*
       2        3
*/
function initObjectData(_dataObject, _rawObject) {
	var i;
	var theName = null;
	var theImageWidth = null;
	var theImageHeight = null;
	var theWorldWidth = null;
	var theWorldHeight = null;
	var theX = null;
	var theY = null;
	/*
	console.log("Image width: " + _rawObject.imageWidth);
	console.log("Image height: " + _rawObject.imageHeight);
	*/
	for (i = 0; i < _rawObject.texture_coords.length; i++) {
		theName = _rawObject.texture_coords[i].name;
		theImageWidth = _rawObject.texture_coords[i].image_width;
		theImageHeight = _rawObject.texture_coords[i].image_height;
		theWorldWidth = _rawObject.texture_coords[i].world_width;
		theWorldHeight = _rawObject.texture_coords[i].world_height;
		theX = _rawObject.texture_coords[i].x;
		theY = _rawObject.texture_coords[i].y;
		
		/*
		console.log("Got values { ");
		console.log("     name : " + theName);
		console.log("     x : " + theX);
		console.log("     y : " + theY);
		console.log("     width : " + theWidth);
		console.log("     height : " + theHeight);
		console.log("}");
		*/
		
		//Push name into names array 
		_dataObject.namesArray.push(theName);
		//Calculare the texture coordinates on [0.0, 1.0] with the 
		//image coordinate information (x, y) and (width, height)
		_dataObject.textureCoordsMap[theName] = [
			theX/_rawObject.imageWidth, theY/_rawObject.imageHeight,
			theX/_rawObject.imageWidth, (theY+theImageHeight)/_rawObject.imageHeight,
			(theX+theImageWidth)/_rawObject.imageWidth, (theY+theImageHeight)/_rawObject.imageHeight,
			(theX+theImageWidth)/_rawObject.imageWidth, theY/_rawObject.imageHeight,
		];
		//Set the data for the sizes array
		_dataObject.sizesMap[theName] = [ theWorldWidth, theWorldHeight ];
		//Calculate the byte offset to get to the first index in
		//the (not yet created) index array.
		//6 indicies per 4 texture coordinates (4 verticies per shape).
		//Using a Uint16Array to store indicies (gl.UNSIGNED_INT)
		_dataObject.indexBufferOffsetMap[theName] = 6 * i * Uint16Array.BYTES_PER_ELEMENT;
	
		//console.log("Initialized data for " + theName + "; block offset is " + _dataObject.indexBufferOffsetMap[theName] );
	}
	
	/*
	Print texture coordinates 
	*/
	/*
	for (i=0; i < _dataObject.namesArray.length; i++) {
		theName = _dataObject.namesArray[i];
		console.log("Texture coordinates for " +  theName);
		console.log(_dataObject.textureCoordsMap[theName][0] + ", " + _dataObject.textureCoordsMap[theName][1]);
		console.log(_dataObject.textureCoordsMap[theName][2] + ", " + _dataObject.textureCoordsMap[theName][3]);
		console.log(_dataObject.textureCoordsMap[theName][4] + ", " + _dataObject.textureCoordsMap[theName][5]);
		console.log(_dataObject.textureCoordsMap[theName][6] + ", " + _dataObject.textureCoordsMap[theName][7]);
		console.log("");
	}
	*/
}

function initObjectDatas() {
	initObjectData(objectData, objectTexCoordData);
	initObjectData(slidesData, slideTexCoordData);
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
		vel : [ 0, GRAVITY_VELOCITY ], //Small downward velocity
		size : [ 32, 32 ],
		updateFunc : updateBrick,
		onDeleteFunc : onDeleteBrick,
		bufferOffset : objectData.indexBufferOffsetMap["block"],
		type : TYPE_BRICK
	};
}

function createMeteor(_x, _y, _velX, _velY) {
	return {
		pos : [ _x, _y ],
		size : [ 64, 64 ],
		vel : [ velX, velY ], // function set velocity
		updateFunc : updateMeteor,
		onDeleteFunc : onDeleteMeteor,
		bufferOffset : objectData.indexBufferOffsetMap["meteor"],
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
		bufferOffset : objectData.indexBufferOffsetMap["strongman"],
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
		bufferOffset : null, //Don't draw this
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
		bufferOffset : objectData.indexBufferOffsetMap[_texture],
		type : TYPE_DECOR
	};
}

function createBackground(_x, _y, _w, _h, _texture) {
	var bg = createDecor(_x, _y, _w, _h, _texture);
	bg.type = TYPE_BACKGROUND;
	return bg;
}

function clearObjectArrays() {
	gameObjects.length = 0;
	decorObjects.length = 0;
	pyramidShapeObjects.length = 0;
	backgroundObjects.length = 0;
}

function removeFromArray(_obj, arr) {
	arr.splice(arr.indexOf(_obj), 1);
}

function addObject(_obj) {
	if (_obj.type == TYPE_DECOR) {
		decorObjects.push(_obj);
	} else if (_obj.type == TYPE_PRYAMID_SHAPE) {
		pyramidShapeObjects.push(_obj);
	} else if (_obj.type == TYPE_BACKGROUND) {
		backgroundObjects.push(_obj);
	} else {
		gameObjects.push(_obj);
	}
}

function removeObject(_obj) {
	if (_obj.type == TYPE_DECOR) {
		removeFromArray(_obj, decorObjects);
	} else if (_obj.type == TYPE_PRYAMID_SHAPE) {
		removeFromArray(_obj, pyramidShapeObjects);
	} else if (_obj.type == TYPE_BACKGROUND) {
		removeFromArray(_obj, backgroundObjects);
	} else {
		removeFromArray(_obj, gameObjects);
	}
}

function drawObject(_obj) {
	//console.log("Drawing:\nx " + _obj.pos[0] + "\ny " + _obj.pos[1] + "\nwidth " + _obj.size[0] + "\nheight " + _obj.size[1] + "\noffset " + _obj.bufferOffset);
	gl.uniform2f(objectProgramLocs.worldPosition, _obj.pos[0], _obj.pos[1]);
	gl.uniform2f(objectProgramLocs.worldSize, _obj.size[0], _obj.size[1]);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, _obj.bufferOffset);
}

/* Draw all of the objects in all of the arrays */
function drawObjectArrays() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(objectProgram);
	//Set texture sampler and screen size uniforms 
	gl.uniform1i(objectProgramLocs.tex, curSampler);
	//Vertex attrib pointer for vertex position and texture coordnates
	gl.vertexAttribPointer(
		objectProgramLocs.vertexPos,
		2,
		gl.FLOAT,
		gl.FALSE,
		Float32Array.BYTES_PER_ELEMENT * 4,
		0
	);
	gl.vertexAttribPointer(
		objectProgramLocs.texCoord,
		2,
		gl.FLOAT,
		gl.FALSE,
		Float32Array.BYTES_PER_ELEMENT * 4,
		Float32Array.BYTES_PER_ELEMENT * 2
	);
	gl.enableVertexAttribArray(objectProgramLocs.vertexPos);
	gl.enableVertexAttribArray(objectProgramLocs.texCoord);
	var i; //iterator
	if (backgroundObjects.length != 0) {
		//Backgrounds first
		for (i=0; i<backgroundObjects.length; i++) {
			drawObject(backgroundObjects[i]);		
		}
	}
	if (decorObjects.length != 0) {
		//Then decorations
		for (i=0; i<decorObjects.length; i++) {
			drawObject(decorObjects[i]);		
		}
	}
	if (gameObjects.length != 0) {
		//Then regular objects
		for (i=0; i<gameObjects.length; i++) {
			drawObject(gameObjects[i]);
		}
	}
}

function drawHoverBrick() {
	gl.uniform2f(objectProgramLocs.worldPosition,
		(mousePos[0]*800.0/GameManager.getCanvasWidth())-32, 
		(mousePos[1]*600.0/GameManager.getCanvasHeight())-32
	);
	//console.log("Mouse position: " + mousePos[0] + ", " + mousePos[1]);
	gl.uniform2f(objectProgramLocs.worldSize, 32, 32);
	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, objectData.indexBufferOffsetMap["block"]);
}

/* Specific per-type functions */


function updateBrick(_brick, _diff) {
	_brick.pos[0] += _brick.vel[0];
	_brick.pos[1] += _brick.vel[1];
	//Check to see if it will collide with something, and if
	//it does, then stop it from moving 
	doCollisionChecking(_brick);
	//Make sure it doesn't fall through the floor
	if (_brick.pos[1] > 560.0-_brick.size[1]) {
		_brick.pos[1] = 560-_brick.size[1];
	}
}

function updateMeteor(_meteor, _diff) {	
	_meteor.pos[0] += _meteor.vel[0];
	_meteor.pos[1] += _meteor.vel[1];
}

function updateStrongMan(_strongMan, _diff) {
	
}

/* Specific per-type functions */

function onDeleteBrick(_brick) {
	
}

function onDeleteMeteor(_meteor) {
	
}

function onDeleteStrongMan(_strongMan) {
	
}

function doCollisionChecking(_obj) {
	for (var i=0; i< gameObjects.length; i++) {
		if (gameObjects[i] != _obj) {
			checkCollision(_obj, gameObjects[i]);
		}
	}
}

//Thanks Stack Overflow!
//http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
function objectsAreColliding(_obj1, _obj2) {
	return !(_obj1.pos[0] > _obj2.pos[0]+_obj2.size[0] || 
           _obj1.pos[0]+_obj1.size[0] < _obj2.pos[0] || 
           _obj1.pos[1] > _obj2.pos[1]+_obj2.size[1] ||
           _obj1.pos[1]+_obj1.size[1] < _obj2.pos[1]);
}

function checkCollision(_obj1, _obj2) {
	
}

function getCompletedPercentage(_bricks, _goalBounds) {
	
}

function intersectArea(_b, _g) {
	var i_w; // intersect width
	var i_h; // intersect height
	if (checkCollision(_b, _g) {
		if (_b.pos[0] >= _g.pos[0]) { // x axis
			i_w = _g.size[0] - (_b.pos[0] - _g.pos[0]);
		} else {
			i_w = _b.size[0] - (_g.pos[0] - _b.pos[0])
		}
		if (_b.pos[1] >= _g.pos[1]) { // y axis
			i_h = _g.size[1] - (_b.pos[1] - _g.pos[1]);
		} else {
			i_h = _b.size[1] - (_g.pos[1] - _b.pos[0])
		}
	} else {  // no intersection
		i_w = 0; 
		i_h = 0;
	}
	
	return i_w * i_h;
}

/* MAIN MENU STATE FUNCTIONS */

function initMainMenu() {
	clearObjectArrays();
	curSampler = SAMPLER_TEXTURES;
	addObject(createBackground(0, 0, 800, 600, "title"));
}

function mouseMainMenu(_pressed, _x, _y) {
	if (_pressed) { //Get started!
		advanceStory();
	}
}

/* STORY BOARD STATE FUNCTIONS */

function initStoryBoard() {
	clearObjectArrays();
	curSampler = SAMPLER_SLIDES;
}

function mouseStoryBoard(_pressed, _x, _y) {
	
}

/* PLAYING THE GAME STATE FUNCTIONS */

function initPlayGame() {
	clearObjectArrays();
	curSampler = SAMPLER_TEXTURES;
	addObject(createBackground(0, 0, 800, 600, "background"));
}

function updatePlayGame(_diff) {
	for (var i=0; i < gameObjects.length; i++) {
		gameObjects[i].updateFunc(gameObjects[i], _diff);
	}
}

function renderPlayGame() {
	drawObjectArrays();
	drawHoverBrick();
}

function mousePlayGame(_pressed, _x, _y) {
	if (_pressed) {
		addObject(createBrick(
			(mousePos[0]*800.0/GameManager.getCanvasWidth())-32, 
			(mousePos[1]*600.0/GameManager.getCanvasHeight())-32
		));
	}
}

function mouseMovePlayGame(_x, _y) {
	mousePos[0] = _x;
	mousePos[1] = _y;
}

/* GRAPHIC EFFECT FUNCTIONS */

function shakeScreen() {
	
}