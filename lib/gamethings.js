
/*
  Game things will contain all the functions and definitions that
  are made to make creating the game easier.

  List of functions:
  * createState(_key, _init, _update, _render, [_eventFuncObj]) - create state with given functions.
  * setState(_key) - set the active state. State must have been created already.
  * loop() - begin game loop.
  * setCanvas(_id, [_contextType]) - Set the canvas for event handling
  *       the setCanvas() method should be called during initialization.
  * loadAudio(_key, _urlStr) - Load audio located at a url with a given key.
  * playAudio(_key) - Play the audio of the given key. Should already be loaded

  List of event functions to possibly have in the _eventFuncObj argument
  * key(_pressed, _code) - a key event
  * mouse(_pressed, _x, _y) - mouse event with mouse position
  * mouseMove(_x, _y) - mouse event when the mouse movess
*/

// WebGL context.
var gl;

/**
 lthough there is canvas width and height, it is reccomended to use
   gl.drawingBufferWidth and  gl.drawingBufferHeight.
   https://www.khronos.org/registry/webgl/specs/latest/1.0/ Section 5.14.1
*/

var GameManager = (function() {
  // frames per second of the loop
  var fps = 30;
  // difference between frames.
  var diff = 1000 / fps;

  // reference to a state that is running
  var running = null;
  // mapping of all the states created "string"=>{state}
  var states = [];
  // the reference to a canvas
  var canvas;
  // whether or not the canvas is set.
  var isCanvasSet = false;

  // an array of all the sound files
  var sounds = [];


  /**
   * Load an audio file into the game manager's internal array
   * _key - The key of the string that it will be reference.
   * _urlStr - The url of the string, relative to the .js file calling this function.
   */
  function loadAudio(_key, _urlStr) {
    sounds[_key] = new Audio(_urlStr);
    sounds[_key].load();
    sounds[_key].volume = 0.0;
    sounds[_key].play();
  }

  /**
   *  Play an audio file starting from the beginning
   *  _key - the key of the audio file being played
   */
  function playAudio(_key) {
    sounds[_key].volume = 1.0;
    sounds[_key].currentTime = 0;
    sounds[_key].play();
  }

  // Event function called when a key is pressed
  function handleKeyDown(_e) {
    if (running.s_eventFuncObj.key) {
      var e = _e ? _e : window.event;
      running.s_eventFuncObj.key(true, e.keyCode);
    }
  }

  // Event function called when a key is released
  function handleKeyUp(_e) {
    if (running.s_eventFuncObj.key) {
      var e = _e ? _e : window.event;
      running.s_eventFuncObj.key(false, e.keyCode);
    }
  }

  // Event function called when the mouse is pressed
  function handleMouseDown(_e) {
    if (running.s_eventFuncObj.mouse) {
      running.s_eventFuncObj.mouse(true, _e.clientX, _e.clientY);
    }
  }

  // Event function called when the mouse is released
  function handleMouseUp(_e) {
    if (running.s_eventFuncObj.mouse) {
      running.s_eventFuncObj.mouse(false, _e.clientX, _e.clientY);
    }
  }

  // Event function called when the mouse is moved
  function handleMouseMove(_e) {
    if (running.s_eventFuncObj.mouseMove) {
      running.s_eventFuncObj.mouseMove(_e.clientX, _e.clientY);
    }
  }

  /**
   *  Set the canvas for the WebGL object and events handling.
   */
  function setCanvas(_id, _contextType) {
    var contextType;
		if (!_contextType) {
			contextType = "2d"; // default context
		} else {
			contextType = _contextType;
		}
		var canvas = document.getElementById(_id);
		context = canvas.getContext(contextType);

    // setup WebGL if the context type is webgl.
    if (contextType == "webgl") {
      // WebGL setup with canvas
      // https://www.khronos.org/webgl/wiki/FAQ
      if (!window.WebGLRenderingContext) {
        document.write("Error: Browser does not have WebGL; get WebGL " +
          "<a href=\"http://get.webgl.org\">here</a>.");
      } else {
        if (!context) {
          // browser supports WebGL but initialization failed.
          document.write("browser supports WebGL but initialization failed. " +
            "<a href=\"http://get.webgl.org/troubleshooting\">troublshooting</a>.");
        } else {
          gl = context; // set the global gl variable.
        }
      }
    }

		if (isCanvasSet) {
			// remove all events from the old canvas
			canvas.removeEventListener('mousedown',handleMouseDown, false);
			canvas.removeEventListener('mouseup',handleMouseUp, false);
			canvas.removeEventListener('keydown',handleKeyDown, false);
			canvas.removeEventListener('keyup',handleKeyUp, false);
			canvas.removeEventListener('mousemove',handleMouseMove, false);
		}

		canvas.addEventListener('mousedown',handleMouseDown, false);
		canvas.addEventListener('mouseup',handleMouseUp, false);
		canvas.addEventListener('keydown',handleKeyDown, false);
		canvas.addEventListener('keyup',handleKeyUp, false);
		canvas.addEventListener('mousemove',handleMouseMove, false);

		/* canvas focus http://www.dbp-consulting.com/tutorials/canvas/CanvasKeyEvents.html */
		canvas.setAttribute('tabindex','0');
		canvas.focus();
		isCanvasSet = true;
  }

  /** the function to create a state in the GameState object
   *  _key is the key that the state will be refered to
   *  _init is the initialization function
   *  _update is the update function. Takes one argument, a number that is the
   *          number of milliseconds that the frame took
   *  _render is the render function. Takes one argument, a number that is the
   *          number of milliseconds that the frame took
   *  _eventFuncObj is an optional object containing any event listeners
   *          the user may want to have.
   */
  function createState(_key, _init, _update, _render, _eventFuncObj) {
    if (states[_key]) {
      console.error("Error: A state with the key " + _key + " already exists.");
      return;
    }
    if (!_eventFuncObj) {
      _eventFuncObj = {}; // empty object
    }
    // create a state with the proper key.
    states[_key] = { s_init : _init,  s_update : _update,
      s_render : _render, s_eventFuncObj : _eventFuncObj};
  }
  /** Set the running state.
   *  _key is the key of the state to switch to.
   */
  function setState(_key) {
    running = states[_key];
    running.s_init();
  }

  // helper function to loop.
  function loop_aux() {
    //console.log("Running state: " + (running));
    if (running == undefined || running == null) {
      console.error("Error: Could not begin loop(); there is no active state.");
      return;
    }
    var frameActiveScreen = running; // in case it changes mid-frame
    var waitBetweenFrames = 1000 / fps;
    start = (new Date()).getTime();
    frameActiveScreen.s_update(diff);
    frameActiveScreen.s_render(diff);
    // https://www.khronos.org/webgl/wiki/FAQ
    window.requestAnimationFrame(loop_aux);
    // get the length of that frame.
    diff = (new Date()).getTime() - start;
  }

  /**
   * Begin the game loop.
   */
  function loop() {
     // begin loop after a brief delay
     setTimeout(function() { window.requestAnimationFrame(loop_aux); }, 200);

  }

  function getCanvasWidth() {
    return canvas.width;
  }

  function getCanvasHeight() {
    return canvas.height;
  }

  return {
    setCanvas : setCanvas,
    setState : setState,
    createState : createState,
    loop : loop,
    getCanvasWidth : getCanvasWidth,
    getCanvasHeight : getCanvasHeight,
    loadAudio : loadAudio,
    playAudio : playAudio
  };
})();

/*
	Global functions to help work with WebGL
*/

/**
	Checks to see if global variable "gl" is set, and
	if it isn't logs an error message and returns false.
	If the globabl variable is set, this function returns
	true.
	_funcName is the name of the function that is
		trying to be called
*/
function webGLContextExists(_funcName) {
	if (!gl) {
		console.log("No WebGL context, cannot call " + _funcName);
		return false;
	} else {
		return true;
	}
}

/**
	Breaks a string into tokens with the separator "sep"
	and returns an array of those tokens.
	_str the string to break into tokens
	_sep the separator to separate the tokens. For this
		implementation, it cannot be the newline character.
*/
function breakIntoTokens(_str, _sep) {
	if (_sep == '\n') {
		console.log("Cannot use newline as separator.");
		return 0;
	}
	var tokens = new Array();
	var i = 0; //Our character pointer variable
	var buf = "";
	var c;
	while ( i < _str.length ) {
		c = _str.charAt(i);
		if ( c == _sep ) {
			//Don't add another token if the separator is
			//simply repeating itself
			if (buf.length > 0) {
				tokens.push(buf);
				buf = "";
			}
		}
		else if ( c == '\n' ) {
			//Add the new line character as a token
			if (buf.length > 0) {
				tokens.push(buf);
			}
			tokens.push("\n");
			buf = "";
		} else if ( c != '\t' ) {
			buf += c;
		}
		i++; //Advance the character pointer
	}
	if ( buf.length != 0 ) {
		tokens.push(buf);
	}
	return tokens;
}

/**
	Loads a WebGL shader using the text inside the
	element specified by _id as the shader source.
	If there is an error, then it is logged, and this
	function returns null. If it compiles correctly, then
	this function returns the shader.
	_id is the id of the element with the shader source.
	_type is the type of the shader. This should be
		either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
*/
function loadShader(_id, _type) {
	if (!webGLContextExists("loadShader"))
		return null;
	//Check to see if the element actually exists first
	var elem = document.getElementById(_id);
	if (!elem) {
		console.log("No element with id \"" + _id + "\" for shader source.");
		return null;
	}
	var shader = gl.createShader(_type);
	gl.shaderSource(shader, elem.text); //Give it the element's text as source
	gl.compileShader(shader);
	//Check to see if it compiled correctly
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		//Log error and return 0
		console.log(elem.text);
		console.log(gl.getShaderInfoLog(shader));
		return null;
	}
	//Compiled correctly, return the shader
	return shader;
}

/**
	Creates a program, links the two given
	shaders to it, and then returns it. If
	the link fails, then the error is logged
	and this function returns null.
	_vertex is the name of the vertex shader to use.
	_fragment is the name of the fragment shader to use.
*/
function makeProgram(_vertex, _fragment) {
	if (!webGLContextExists("makeProgram"))
		return null;
	if (!_vertex) {
		console.log("The vertex shader for the program is null");
		return null;
	}
	if (!_fragment) {
		console.log("The fragment shader for the program is null");
		return null;
	}
	var program = gl.createProgram();
	//Attach shaders before linking
	gl.attachShader(program, _vertex);
	gl.attachShader(program, _fragment);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(program));
		return null;
	}
	//Detach shaders after linking
	gl.detachShader(program, _vertex);
	gl.detachShader(program, _fragment);
	return program;
}

/**
  Function to build the program with the vertex and fragment shader ids.

  Maybe later a list of shaders and their types can be passed in instead
  so that it can be more extendable???
*/
function makeProgramWithShaderIds(_vertexShaderId, _fragmentShaderId) {
  var vertexShader = loadShader(_vertexShaderId, gl.VERTEX_SHADER);
  var fragShader = loadShader(_fragmentShaderId, gl.FRAGMENT_SHADER);
  var program = makeProgram(vertexShader, fragShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragShader);
  return program;
}

/**
	Loads the image with the specified id into a WebGL
	texture, and then returns the texture. If an error
	occurs, then it is logged and this function returns
	null. The image must be square, and have a width and
	height that is a power of 2. It is assumed that the
	image is already loaded on the page and that the
	data type of each texel is gl.UNSIGNED_BYTE.
	_id is the id of the image to load as a texture.
	_format is the internal and external format of the
		image, which must be the same anyway.
	_wrap is the wrap parameter for this texture. It
		may be either gl.CLAMP_TO_EDGE, gl.MIRRORED_REPEAT or gl.REPEAT
*/
function loadTexture2D(_id, _format, _wrap) {
	if (!webGLContextExists("loadTexture"))
		return null;

	var imageElement = document.getElementById(_id);
	if (!imageElement) {
		console.log("No element with id " + _id + " for texture loading");
		return null;
	}
	var texture = gl.createTexture(); //Texture object
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, _format, _format, gl.UNSIGNED_BYTE, imageElement);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
		gl.NEAREST_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
		gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _wrap);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _wrap);
	return texture;
}



/**
	Parses a vertex made up of a vertex part and a texture coordinate part.
	For being used in conjunture with the "loadMesh" function only.
	_vertStr the string that represents the vertex
	_vertexArray the array of all vertex positions from the current OBJ file
	_texCoordArray the array of all the texture coordinates from the current OBJ file
*/
function parseVertex(_vertStr, _vertexArray, _texCoordArray) {
	var toks = breakIntoTokens(_vertStr, '/');
	//console.log("Parse vertex length for " + _vertStr + " is " + toks.length);
	if (toks.length == 2) {
		return {
			pos : _vertexArray[parseInt(toks[0])-1],
			texCoord : _texCoordArray[parseInt(toks[1])-1]
		};
	} else if (toks.length == 1) {
		return {
			pos : _vertexArray[parseInt(toks[0])-1]
		};
	}
}

/**
	Loads a mesh that is formatted in the Wavefront OBJ format.
	This function does not load the data into buffers, only into
	a Float32Array and a Uint8Array. The Wavefront OBJ format
	can be found at: http://www.martinreddy.net/gfx/3d/OBJ.spec
	_id the id of the element which contains the text of the
		OBJ mesh to load.

    Returns an object with the following properties:
      array - A Float32Array of all the vertices read in the .obj file.
              Each vertex has three numbers; x, y, z
      index - The index array of the property "array"
      arrayLength - the length of the property "array"
      indexlength - the length of the property "index"
*/
function loadMeshData(_id) {
	var objElement = document.getElementById(_id);
	if (!objElement) {
		console.log("No element exists for loading the model: " + _id);
		return;
	}
	var tokens = breakIntoTokens(objElement.text, " ");

	/*
		To be filled with materials read from the MTL file associated
		with this Wavefront OBJ file. It should be in an element with
		an ID that is the same as it's file name.
	*/
	var materialLibrary = new Array();
	var usingMaterial = null;

	var verticies = new Array();
	var texCoords = new Array();

	var floatArray = new Array();
	var curArrayIndex = 0;
	var indexArray = new Array();

	var curTokIndex = 0;
	var curTok;
	while ( curTokIndex < tokens.length ) {
		curTok = tokens[curTokIndex];
		if ( curTok == "#" ) { //This line is a comment - skip the rest of it
			while ( tokens[curTokIndex] != "\n" ) {
				curTokIndex++;
			}
			curTokIndex++;
		}
		else if ( curTok == "v" ) { //Read a vertex position
			verticies.push(new Array(
				parseFloat(tokens[curTokIndex+1]),
				parseFloat(tokens[curTokIndex+2]),
				parseFloat(tokens[curTokIndex+3])
			));
			curTokIndex += 5;
		} else if ( curTok == "vt" ) { //Read a texture coordinate
			texCoords.push(new Array(
				parseFloat(tokens[curTokIndex+1]),
				parseFloat(tokens[curTokIndex+2])
			));
			curTokIndex += 4;
		} else if ( curTok == "mtllib" ) {
			//Load a material library
			var materialElement = document.getElementById(tokens[curTokIndex+1]);
			if (!materialElement) {
				console.log("No element with id " + tokens[curTokIndex+1] +
					" to load material library from.");
			} else {
				var matTokens = breakIntoTokens(materialElement.text, " ");
				/*
					Do a process similar to what is currently being
					done with the OBJ file. MTL file format can be
					found at: http://paulbourke.net/dataformats/mtl/
				*/
				var curMatTok = null;
				var curMatTokIndex = 0;
				var currentMaterial = null;
				while ( curMatTokIndex < matTokens.length ) {
					curMatTok = matTokens[curMatTokIndex];
					if ( curMatTok == "#" ) {
						while ( matTokens[curMatTokIndex] != "\n" ) {
							curMatTokIndex++;
						}
						curMatTokIndex++;
					} else if ( curMatTok == "newmtl" ) { //New material
						currentMaterial = matTokens[curMatTokIndex+1];
						materialLibrary[currentMaterial] = {
							specularExponent : 1,
							ambientColor : [ 1.0, 1.0, 1.0 ],
							diffuseColor : [ 1.0, 1.0, 1.0 ],
							specularColor : [1.0, 1.0, 1.0 ],
							ambientMap : null,
							diffuseMap : null,
							specularMap : null,
							dissolve : 1.0,
							illumination : 10
						};
						curMatTokIndex += 2;
					} else if ( curMatTok == "Ns" ) { //Specular exponent
						materialLibrary[currentMaterial].specularExponent =
							parseFloat(matTokens[curMatTokIndex+1]);
						curMatTokIndex += 2;
					} else if ( curMatTok == "Ka" ) { //Ambient color
						materialLibrary[currentMaterial].ambientColor[0] =
							parseFloat(matTokens[curMatTokIndex+1]);
						materialLibrary[currentMaterial].ambientColor[1] =
							parseFloat(matTokens[curMatTokIndex+2]);
						materialLibrary[currentMaterial].ambientColor[2] =
							parseFloat(matTokens[curMatTokIndex+3]);
						curMatTokIndex += 4;
					} else if ( curMatTok == "Kd" ) { //Diffuse color
						materialLibrary[currentMaterial].diffuseColor[0] =
							parseFloat(matTokens[curMatTokIndex+1]);
						materialLibrary[currentMaterial].diffuseColor[1] =
							parseFloat(matTokens[curMatTokIndex+2]);
						materialLibrary[currentMaterial].diffuseColor[2] =
							parseFloat(matTokens[curMatTokIndex+3]);
						curMatTokIndex += 4;
					} else if ( curMatTok == "Ks" ) { //Specular color
						materialLibrary[currentMaterial].specularColor[0] =
							parseFloat(matTokens[curMatTokIndex+1]);
						materialLibrary[currentMaterial].specularColor[1] =
							parseFloat(matTokens[curMatTokIndex+2]);
						materialLibrary[currentMaterial].specularColor[2] =
							parseFloat(matTokens[curMatTokIndex+3]);
						curMatTokIndex += 4;
					} else if ( curMatTok == "map_Ka" ) { //Ambient map
						materialLibrary[currentMaterial].ambientMap = loadTexture2D(
							matTokens[curMatTokIndex+1],
							gl.RGBA,
							gl.REPEAT
						);
						curMatTokIndex += 2;
					} else if ( curMatTok == "map_Kd" ) { //Diffuse map
						materialLibrary[currentMaterial].diffuseMap = loadTexture2D(
							matTokens[curMatTokIndex+1],
							gl.RGBA,
							gl.REPEAT
						);
						curMatTokIndex += 2;
					} else if ( curMatTok == "map_Ks" ) { //Specular map
						materialLibrary[currentMaterial].specularMap = loadTexture2D(
							matTokens[curMatTokIndex+1],
							gl.RGBA,
							gl.REPEAT
						);
						curMatTokIndex += 2;
					} else if ( curMatTok == "d" ) { //Dissolve
						materialLibrary[currentMaterial].dissolve =
							parseFloat(matTokens[curMatTokIndex+1]);
						curMatTokIndex += 2;
					} else if ( curMatTok == "illum" ) { //Illumination equation
						materialLibrary[currentMaterial].illumination =
							parseInt(matTokens[curMatTokIndex+1]);
						curMatTokIndex += 2;
					} else {
						curMatTokIndex++;
					}
				}
			}
			curTokIndex += 2;
			/* End material library reading here */
		} else if ( curTok == "usemtl" ) {
			//This model is going to use this material that it read from the material library
			usingMaterial = materialLibrary[tokens[curTokIndex+1]];
			curTokIndex += 2;
		} else if ( curTok == "f" ) { //Face (this algorithm only supports triangles and quads)
			//Count the number of verticies for this face
			var miniCounter = 1;
			/*
				*Used by the developer to count indicies for the face*

				f[<1>1][<2>1][<3>1][<4>1][<5>\n>
				f[<1>1][<2>1][<3>1][<4>\n>]

				While the newline character is not hit..
			*/
			while (tokens[curTokIndex+miniCounter] != "\n") {
				miniCounter++;
			}

			if (miniCounter == 5) { //4 verticies for this face
				var v1 = parseVertex(tokens[curTokIndex+1], verticies, texCoords);
				var v2 = parseVertex(tokens[curTokIndex+2], verticies, texCoords);
				var v3 = parseVertex(tokens[curTokIndex+3], verticies, texCoords);
				var v4 = parseVertex(tokens[curTokIndex+4], verticies, texCoords);

				floatArray.push(v1.pos[0]);
				floatArray.push(v1.pos[1]);
				floatArray.push(v1.pos[2]);
				if (v1.texCoord != undefined) {
					floatArray.push(v1.texCoord[0]);
					floatArray.push(v1.texCoord[1]);
				}

				floatArray.push(v2.pos[0]);
				floatArray.push(v2.pos[1]);
				floatArray.push(v2.pos[2]);
				if (v2.texCoord != undefined) {
					floatArray.push(v2.texCoord[0]);
					floatArray.push(v2.texCoord[1]);
				}

				floatArray.push(v3.pos[0]);
				floatArray.push(v3.pos[1]);
				floatArray.push(v3.pos[2]);
				if (v3.texCoord != undefined) {
					floatArray.push(v3.texCoord[0]);
					floatArray.push(v3.texCoord[1]);
				}

				floatArray.push(v4.pos[0]);
				floatArray.push(v4.pos[1]);
				floatArray.push(v4.pos[2]);
				if (v4.texCoord != undefined) {
					floatArray.push(v4.texCoord[0]);
					floatArray.push(v4.texCoord[1]);
				}

				indexArray.push(curArrayIndex+0);
				indexArray.push(curArrayIndex+1);
				indexArray.push(curArrayIndex+2);
				indexArray.push(curArrayIndex+0);
				indexArray.push(curArrayIndex+3);
				indexArray.push(curArrayIndex+2);

				curArrayIndex += 4; //4 more verticies in the array buffer
				curTokIndex += 6; //Advance the token pointer 6 spaces

			} else if (miniCounter == 4) { //3 verticies per face

				var v1 = parseVertex(tokens[curTokIndex+1], verticies, texCoords);
				var v2 = parseVertex(tokens[curTokIndex+2], verticies, texCoords);
				var v3 = parseVertex(tokens[curTokIndex+3], verticies, texCoords);

				floatArray.push(v1.pos[0]);
				floatArray.push(v1.pos[1]);
				floatArray.push(v1.pos[2]);
				if (v1.texCoord != undefined) {
					floatArray.push(v1.texCoord[0]);
					floatArray.push(v1.texCoord[1]);
				}

				floatArray.push(v2.pos[0]);
				floatArray.push(v2.pos[1]);
				floatArray.push(v2.pos[2]);
				if (v2.texCoord != undefined) {
					floatArray.push(v2.texCoord[0]);
					floatArray.push(v2.texCoord[1]);
				}

				floatArray.push(v3.pos[0]);
				floatArray.push(v3.pos[1]);
				floatArray.push(v3.pos[2]);
				if (v3.texCoord != undefined) {
					floatArray.push(v3.texCoord[0]);
					floatArray.push(v3.texCoord[1]);
				}

				indexArray.push(curArrayIndex+0);
				indexArray.push(curArrayIndex+1);
				indexArray.push(curArrayIndex+2);

				curArrayIndex += 3; //3 more verticies in the array buffer
				curTokIndex += 5; //Advance the token pointer 5 spaces
			} else {
				console.log("Error: found a face that does not have 3 or 4 verticies on it in " + _id);
			}
		} else {
			curTokIndex++;
		}
	}
	//Now formalize it by putting the numbers into more proper arrays
	//Return the completed mesh
	return {
		array : Float32Array.from(floatArray),
		index : Uint8Array.from(indexArray),
		arrayLength : floatArray.length,
		indexLength : indexArray.length,
		material : usingMaterial
	};
} // end token reading while loop
