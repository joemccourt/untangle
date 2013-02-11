//JFWL vars
var JFWL = {}; //Joe's Fun With Lines

var kongregate = parent.kongregate;

JFWL.startTime = (new Date()).getTime();
JFWL.clockTime = 0;
JFWL.refreshRate = 30;
JFWL.iterations = 0;
JFWL.mouse = "up";
JFWL.hoverNode  = -1;
JFWL.dragNode   = -1;
JFWL.dragNodeMoved = false;
JFWL.clickOffset = {x:0,y:0};
JFWL.renderBox = [0,0,0,0];
JFWL.numIntersections = 0;
JFWL.dirtyCanvas = true;  //Keep track of when state has changed and need to update canvas
JFWL.paused = false;
JFWL.menu = false;
JFWL.onCreditsScreen = false;
JFWL.gameInProgress = false;
JFWL.wonGame = false;
JFWL.pauseBoxHeight = 400;
JFWL.pauseOptionOverIndex = -1;
JFWL.menuOptionOverIndex = -1;
JFWL.creditsOptionOverIndex = -1;
JFWL.inGameButtonOverIndex = -1;
JFWL.checkWon = false;
JFWL.toSaveGame = true;

JFWL.maxLevel = 4;
JFWL.level = JFWL.maxLevel;

JFWL.font = 'Verdana';

// State Colors
JFWL.lineHoverColor      = [0,0,0];
JFWL.lineDragColor       = [0,0,0];
JFWL.lineIntersectsColor = [255,0,0];
JFWL.lineDefaultColor    = [0,0,0];

// In Game Buttons
JFWL.inGameButtons = [
						{
							text:"Pause",
							operation:"pause"
						},
						{
							text:"Level: ",
							operation:"displaylevel"
						}
					];

//Credit Options
JFWL.creditOptions = [
						{
							text:"Untangle",
							operation:"none",
							fontSize:"48pt"
						},
						{
							text:"Created by Joe McCourt",
							operation:"none",
							fontSize:"24pt"
						},
						{
							text:"Based on John Tantalo's Planarity",
							operation:"none",
							fontSize:"18pt"
						},
						{
							text:"Close Credits",
							operation:"menu",
							fontSize:"24pt"
						}
					];

//Menu Options
JFWL.menuOptions = [
						{
							text:"Untangle",
							operation:"title",
							fontSize:"48pt"
						},
						{
							text:"Move circles so there are no crossing lines",
							operation:"none",
							fontSize:"14pt"
						},
						{
							text:"Credits",
							operation:"credits",
							fontSize:"24pt"
						},
						{
							text:"Select Level:",
							operation:"none",
							fontSize:"24pt"
						},
						{
							text:"1",
							operation:"picklevel",
							value:4,
							fontSize:"18pt"
						},
						{
							text:"2",
							operation:"picklevel",
							value:5,
							fontSize:"18pt"
						},
						{
							text:"3",
							operation:"picklevel",
							value:6,
							fontSize:"18pt"
						},
						{
							text:"4",
							operation:"picklevel",
							value:7,
							fontSize:"18pt"
						},
						{
							text:"5",
							operation:"picklevel",
							value:8,
							fontSize:"18pt"
						},
						{
							text:"6",
							operation:"picklevel",
							value:9,
							fontSize:"18pt"
						},
						{
							text:"7",
							operation:"picklevel",
							value:10,
							fontSize:"18pt"
						},
						{
							text:"8",
							operation:"picklevel",
							value:11,
							fontSize:"18pt"
						},
						{
							text:"9",
							operation:"picklevel",
							value:12,
							fontSize:"18pt"
						},
						{
							text:"10",
							operation:"picklevel",
							value:13,
							fontSize:"18pt"
						}
					];

JFWL.pauseOptions = [
						{
							text:"Resume",
							operation:"resume"
						},
						{
							text:"Restart Level",
							operation:"restart"
						},
						{
							text:"Main Menu (quit game)",
							operation:"menu"
						}
					];

JFWL.winOptions = [
						{
							text:"Next Level",
							operation:"nextlevel"
						},
						{
							text:"Resume Level",
							operation:"resume"
						},
						{
							text:"Main Menu (exit)",
							operation:"menu"
						}
					];

//Draw sizes
JFWL.lineWidth = 3;
JFWL.nodeRadius = 15;

window.onload = function(){

	JFWL.startSession();

	//Main loop
	//TODO: use request animation frame
	window.setInterval(function(){
		var start = JFWL.clockTime;
		// while(JFWL.clockTime - start < JFWL.refreshRate / 1000){
		// 	JFWL.iterations++;
		// };

		if(JFWL.dirtyCanvas){

			JFWL.dirtyCanvas = false;

			JFWL.drawBackground();		

			if(JFWL.onMenuScreen){
				JFWL.drawMenuScreen();
			}else if(JFWL.onCreditsScreen){
				JFWL.drawCreditsScreen();
			}else if(JFWL.paused){
				JFWL.reDraw();
				JFWL.pauseScreen();
			}else{
				JFWL.reDraw();

				if(JFWL.checkWon && !JFWL.wonGame){
					JFWL.checkWon = false;
					if(JFWL.numIntersections){
						// console.log("Playing...");
					}else{
						// console.log("You Win!");
						JFWL.winGame();
					}
				}
			}

			//Save game
			if(JFWL.toSaveGame){
				JFWL.saveGameState();
				JFWL.toSaveGame = false;
			}
		}
	},0);
};


JFWL.startGame = function(){

	JFWL.hoverNode  = -1;
	JFWL.dragNode   = -1;

	JFWL.graph = {};
	JFWL.dirtyCanvas = true;
	JFWL.wonGame = false;

	JFWL.graph = genGraphPlanarity(JFWL.level);
	markIntersections([]);

	//Check if game already solveds
	var i = 0;
	while(JFWL.numIntersections == 0){
		JFWL.graph = genGraphPlanarity(JFWL.level);
		markIntersections([]);
		i++;
		console.log(i);
	}
	

	JFWL.updateLevelDisplay();

	JFWL.saveGameState();
};

JFWL.updateLevelDisplay = function(){
	var i;
	for(i = 0; i < JFWL.inGameButtons.length; i++){
		var option = JFWL.inGameButtons[i];
		if(option.operation == "displaylevel"){
			option.text = "Level: " + (JFWL.level-3) + " ";
		}
	}
};


JFWL.loadGameState = function() {
	if (!supports_html5_storage()) { return false; }
	JFWL.gameInProgress = (localStorage["JFWL.gameInProgress"] == "true");

	if(JFWL.gameInProgress){
		JFWL.maxLevel = parseInt(localStorage["JFWL.maxLevel"]);
		
		JFWL.paused       = (localStorage["JFWL.paused"] == "true");
		JFWL.onMenuScreen = (localStorage["JFWL.onMenuScreen"] == "true");
		JFWL.onCreditsScreen = (localStorage["JFWL.onCreditsScreen"] == "true");
		JFWL.wonGame      = (localStorage["JFWL.wonGame"] == "true");

		JFWL.level = parseInt(localStorage["JFWL.level"]);
		
		JFWL.graph = JSON.parse(localStorage["JFWL.graph"]);

	}
}

JFWL.saveGameState = function() {
    if (!supports_html5_storage()) { return false; }
    localStorage["JFWL.gameInProgress"] = true;
    
    localStorage["JFWL.maxLevel"] = JFWL.maxLevel;
    localStorage["JFWL.paused"] = JFWL.paused;
    localStorage["JFWL.onMenuScreen"] = JFWL.onMenuScreen;
    localStorage["JFWL.onCreditsScreen"] = JFWL.onCreditsScreen;
    localStorage["JFWL.wonGame"] = JFWL.wonGame;
    localStorage["JFWL.level"] = JFWL.level;

    localStorage["JFWL.graph"] = JSON.stringify(JFWL.graph);
}

JFWL.startSession = function(){

	JFWL.canvas = document.getElementById("demoCanvas");
	JFWL.ctx = JFWL.canvas.getContext("2d");
	
	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;

	JFWL.renderBox = [30,30,w-30,h-30];

	JFWL.loadGameState();

	if(!JFWL.gameInProgress){
		JFWL.onMenuScreen = true;
		JFWL.startGame();
	}else{
		JFWL.hoverNode  = -1;
		JFWL.dragNode   = -1;

	JFWL.pauseOptionOverIndex = -1;
		JFWL.dirtyCanvas = true;
	}

	JFWL.updateLevelDisplay();

	JFWL.initEvents();	
}

JFWL.internalToRenderSpace = function(x,y){
	var xRender = (x + 1) * JFWL.getRenderBoxWidth() / 2  + JFWL.renderBox[0];
	var yRender = (y + 1) * JFWL.getRenderBoxHeight() / 2 + JFWL.renderBox[1];
	return [xRender,yRender];
};

JFWL.renderToInternalSpace = function(x,y){
	var xInternal = 2 * (x - JFWL.renderBox[0]) / JFWL.getRenderBoxWidth()  - 1;
	var yInternal = 2 * (y - JFWL.renderBox[1]) / JFWL.getRenderBoxHeight() - 1;
	return [xInternal,yInternal];
};

JFWL.arrayColorToString = function(color){
	return "rgb("+Math.round(color[0])+","+Math.round(color[1])+","+Math.round(color[2])+")";
};

JFWL.blendColors = function(color1,color2,alpha,mode){
	var newColor = [];

	//Normal mode for now
	newColor[0] = (1-alpha)*color1[0]+alpha*color2[0];
	newColor[1] = (1-alpha)*color1[1]+alpha*color2[1];
	newColor[2] = (1-alpha)*color1[2]+alpha*color2[2];
	return newColor;
};

JFWL.getRenderBoxWidth  = function(){return JFWL.renderBox[2] - JFWL.renderBox[0];};
JFWL.getRenderBoxHeight = function(){return JFWL.renderBox[3] - JFWL.renderBox[1];};
JFWL.mouseDown = function(){return JFWL.mouse === "down";};
JFWL.mouseUp = function(){return JFWL.mouse === "up";};

JFWL.reDraw = function(){
	var context = JFWL.ctx;
	var ctx = context; //alias

	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;

	// var newCanvasData = context.createImageData(w, h); // blank
	// var dst = newCanvasData.data;
	
	// var n;
	// for(n = 0; n < w*h; n++){
	// 	dst[4*n  ] = 255;
	// 	dst[4*n+1] = 255;
	// 	dst[4*n+2] = 255;
	// 	dst[4*n+3] = 255;
	// }

	// context.putImageData(newCanvasData, 0, 0);

	var intersects = [];

	var numLines = JFWL.graph.lines.length;
	var lines = genLinesArray();
	
	markIntersections(intersects);

	//console.log(graph,lines);
	//countLineIntersections(lines,intersects);

	var color;
	for(i = 0; i < numLines; i++){
		if(JFWL.graph.lines[i][0] == JFWL.hoverNode || JFWL.graph.lines[i][1] == JFWL.hoverNode){
			color = JFWL.lineHoverColor;
			if(intersects[i]){
				color = JFWL.blendColors(JFWL.lineIntersectsColor,JFWL.lineHoverColor,0);
			}else{
				color = JFWL.blendColors(JFWL.lineDefaultColor,JFWL.lineHoverColor,0);
			}
		}else if(JFWL.graph.lines[i][0] == JFWL.dragNode || JFWL.graph.lines[i][1] == JFWL.dragNode){
			color = JFWL.lineDragColor;
			if(intersects[i]){
				color = JFWL.blendColors(JFWL.lineIntersectsColor,JFWL.lineDragColor,0);
			}else{
				color = JFWL.blendColors(JFWL.lineDefaultColor,JFWL.lineDragColor,0);
			}
		}else if(intersects[i]){
			color = JFWL.lineIntersectsColor;
		}else{
			color = JFWL.lineDefaultColor;
		}

		drawLine(lines[i],JFWL.arrayColorToString(color));
	}

	drawNodes();
	JFWL.drawButtons();
};


JFWL.drawButtons = function(){
	var ctx = JFWL.ctx;

	ctx.save();

	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';

	var x1 = JFWL.renderBox[0];
	var y1 = JFWL.renderBox[1];
	var x2 = JFWL.renderBox[2];
	var y2 = JFWL.renderBox[3];

	var i;
	var totalWidth = 0;
	var spacing = (x2 - x1) * 0.04;
	for(i = 0; i < JFWL.inGameButtons.length; i++){
		var option = JFWL.inGameButtons[i];
		ctx.font = "12pt " + JFWL.font;

		var textLength = ctx.measureText(option.text).width;
		var textHeight = 1.1 * ctx.measureText("m").width;

		option.width = textLength;
		option.height = textHeight;

		totalWidth += option.width + spacing;
	}

	totalWidth -= spacing;

	var xLast = x2 - totalWidth;
	for(i = 0; i < JFWL.inGameButtons.length; i++){
		var option = JFWL.inGameButtons[i];
		option.left = xLast;
		option.top  = y1 + option.height * 0.3;	
		xLast += option.width + spacing;
	}

	for(i = 0; i < JFWL.inGameButtons.length; i++){
		var option = JFWL.inGameButtons[i];

		var textLength = ctx.measureText(option.text).width;
		var textHeight = 1.1 * ctx.measureText("m").width;

		if(JFWL.inGameButtonOverIndex == i){
			ctx.shadowColor = 'rgba(0,0,0,0.7)';
			ctx.shadowBlur = 4;

			ctx.shadowOffsetX = 0.01*JFWL.getRenderBoxWidth();
			ctx.shadowOffsetY = 0.01*JFWL.getRenderBoxHeight();
		}else{
			ctx.shadowColor = 'rgba(0,0,0,0.3)';
			ctx.shadowBlur = 1;
			ctx.shadowOffsetX = 0.003*JFWL.getRenderBoxWidth();
			ctx.shadowOffsetY = 0.003*JFWL.getRenderBoxHeight();
		}


		ctx.font = "12pt " + JFWL.font;
		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.fillText(option.text,option.left,option.top);
	}

	ctx.restore();
};

//Events
JFWL.initEvents = function(){
	$(document).mouseup(function (e) {
		JFWL.mouse = "up";

		if(JFWL.paused){return;}

		var offset = $("#demoCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		//Convert to internal coord system
		var internalPoint = JFWL.renderToInternalSpace(x,y);
		x = internalPoint[0];
		y = internalPoint[1];

		if(JFWL.dragNodeMoved){

			var graph = JFWL.graph;
			
			var selectRadius = 0.03;

			var dist = Math.sqrt(Math.pow(JFWL.dragNodeStartX - x,2) + Math.pow(JFWL.dragNodeStartY - y,2));
			
			if(dist > selectRadius){
				JFWL.dragNode = -1;
				JFWL.checkWon = true;
			}
		}
		JFWL.toSaveGame = true;
	});

	$(document).mousedown(function (e) {
		JFWL.mouse = "down";

		var offset = $("#demoCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		if(JFWL.paused){JFWL.pausedMouseDown(x,y);return;}
		if(JFWL.onMenuScreen){JFWL.menuMouseDown(x,y);return;}
		if(JFWL.onCreditsScreen){JFWL.creditsMouseDown(x,y);return;}

		if(JFWL.inGameButtonOverIndex >= 0){
			var option = JFWL.inGameButtons[JFWL.inGameButtonOverIndex];

			if(option.operation == "pause"){
				$('body').css('cursor', 'default');
				JFWL.dirtyCanvas = true;
				JFWL.paused = true;
				JFWL.pauseOptionOverIndex = -1;
			}

		}else if(JFWL.dragNode < 0 && JFWL.hoverNode >= 0){
			JFWL.dragNode = JFWL.hoverNode;

			JFWL.hoverNode = -1;
			JFWL.dirtyCanvas = true;

			//Convert to internal coord system
			var internalPoint = JFWL.renderToInternalSpace(x,y);
			x = internalPoint[0];
			y = internalPoint[1];

			JFWL.clickOffset.x = x - JFWL.graph.nodes[JFWL.dragNode].x;
			JFWL.clickOffset.y = y - JFWL.graph.nodes[JFWL.dragNode].y;

			JFWL.dragNodeStartX = x;
			JFWL.dragNodeStartY = y;
		}else{
			JFWL.dragNode = -1;
			JFWL.checkWon = true;
		}

		JFWL.dragNodeMoved = false;
		JFWL.toSaveGame = true;
	});

	$(document).mousemove(function (e) {

		var offset = $("#demoCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		if(JFWL.paused){JFWL.pausedMouseMove(x,y);return;}
		if(JFWL.onMenuScreen){JFWL.menuMouseMove(x,y);return;}
		if(JFWL.onCreditsScreen){JFWL.creditsMouseMove(x,y);return;}

		//Convert to intenal coord system
		var internalPoint = JFWL.renderToInternalSpace(x,y);
		x = internalPoint[0];
		y = internalPoint[1];


		if(JFWL.dragNode < 0){

			//If we're not dragging, we're hovering
			hoverAt(x,y);
		}else{

			//We're dragging
			//Distance dragged
			var dist = Math.sqrt(Math.pow(JFWL.graph.nodes[JFWL.dragNode].x - (x - JFWL.clickOffset.x),2)+Math.pow(JFWL.graph.nodes[JFWL.dragNode].y - (y - JFWL.clickOffset.y),2));

			//Distance needed to start draggin with mousedown
			//This gives slight tolerance for dragging with mouseup
			var popDistance = 0.03;  
			if(JFWL.dragNodeMoved || JFWL.mouseUp || dist > popDistance){
				JFWL.dragNodeMoved = true;
				JFWL.moveNode(JFWL.dragNode, x - JFWL.clickOffset.x, y - JFWL.clickOffset.y);
				JFWL.dirtyCanvas = true;
			}
		}

		//Cursor states
		if(JFWL.dragNode >= 0){
			$('body').css('cursor', 'move');
		}else if(JFWL.hoverNode >= 0 || JFWL.inGameButtonOverIndex >= 0){
			$('body').css('cursor', 'pointer');
		}else{
			$('body').css('cursor', 'default');
		}

		//console.log(2*x/w-1,2*y/h-1);
	});

	$(document).keypress(function (e) {
		// console.log(e.charCode);

		//112 = 'p'
		//114 = 'r'
		//115 = 's'

		if(e.charCode == 112){
			if(!JFWL.paused){
				$('body').css('cursor', 'default');
				JFWL.dirtyCanvas = true;
				JFWL.paused = true;
				JFWL.pauseOptionOverIndex = -1;
			}else{
				JFWL.dirtyCanvas = true;
				JFWL.paused = false;
			}
		}else if(e.charCode == 114){
			// JFWL.dirtyCanvas = true;
			// JFWL.startGame();
			// JFWL.paused = false;
		}else if(e.charCode == 115){
			// JFWL.dirtyCanvas = true;
			// JFWL.shuffleGraph();
			// JFWL.paused = false;
		}
	});
};

function hoverAt(x,y){
	var graph = JFWL.graph;

	var i, dist;
	var minDist = 9999999999;
	var selectRadius = 0.3000;
	var minIndex = -1;
	for(i = 0; i < graph.nodes.length; i++){
		dist = Math.sqrt(Math.pow(graph.nodes[i].x - x, 2) + Math.pow(graph.nodes[i].y - y, 2));
		if(dist < minDist && dist < selectRadius){
			minIndex = i;
			minDist  = dist;
		}
	}

	if(JFWL.hoverNode != minIndex){
		JFWL.dirtyCanvas = true;
		JFWL.hoverNode = minIndex;
	}

	var origOverIndex = JFWL.inGameButtonOverIndex;
	JFWL.inGameButtonOverIndex = -1;
	for(i = 0; i < JFWL.inGameButtons.length; i++){
		var option = JFWL.inGameButtons[i];
		var internalPoint;
		var x1,y1,x2,y2;

		if(option.operation != "pause"){continue;} //only hover for pause for now

		//Convert to intenal coord system
		internalPoint = JFWL.renderToInternalSpace(option.left,option.top);
		x1 = internalPoint[0];
		y1 = internalPoint[1];

		if(x > x1 && y > y1){
			internalPoint = JFWL.renderToInternalSpace(option.left+option.width,option.top+option.height);
			x2 = internalPoint[0];
			y2 = internalPoint[1];

			if(x < x2 && y < y2){
				JFWL.inGameButtonOverIndex = i;
				JFWL.hoverNode = -1;
				break;
			}
		}
	}

	if(origOverIndex != JFWL.inGameButtonOverIndex){
		JFWL.dirtyCanvas = true;
	}

	/*  //Below code is too complex
		for(i = 0; i < graph.nodes.length + JFWL.inGameButtons.length; i++){
			if(i < graph.nodes.length){
				dist = Math.sqrt(Math.pow(graph.nodes[i].x - x, 2) + Math.pow(graph.nodes[i].y - y, 2));
			}else{
				//Todo: make this distance to box
				var b = i - graph.nodes.length;
				dist = Math.sqrt(Math.pow(JFWL.inGameButtons[b].x - x, 2) + Math.pow(JFWL.inGameButtons[b].y - y, 2));
			}

			if(dist < minDist && dist < selectRadius){
				minIndex = i;
				minDist  = dist;
			}
		}

		if(JFWL.hoverNode != minIndex){
			JFWL.dirtyCanvas = true;

			if(minIndex < graph.nodes.length){
				JFWL.hoverNode = minIndex;
			}else{
				JFWL.buttonHover = minIndex - graph.nodes.length;
				console.log(JFWL.inGameButtons[JFWL.buttonHover].text);
				JFWL.hoverNode = -1;
			}
		}
	*/
};

JFWL.pausedMouseMove = function(x,y){
	var i;
	var options;
	if(JFWL.wonGame == true){
		options = JFWL.winOptions;
	}else{
		options = JFWL.pauseOptions;
	}

	var initialIndex = JFWL.pauseOptionOverIndex;
	JFWL.pauseOptionOverIndex = -1;

	for(i = 0; i < options.length; i++){
		var option = options[i];

		if(x > option.left && x < option.left + option.width){
			if(y > option.top && y < option.top + option.height){
				JFWL.pauseOptionOverIndex = i;
				$('body').css('cursor', 'pointer');
			}
		}
	}

	//Check if no longer over option
	if(JFWL.pauseOptionOverIndex != initialIndex){
		JFWL.dirtyCanvas = true;
	}

	if(JFWL.pauseOptionOverIndex == -1){
		$('body').css('cursor', 'default');
	}
};

JFWL.pausedMouseDown = function(x,y){
	JFWL.pausedMouseMove(x,y);
	
	var options;
	if(JFWL.wonGame == true){
		options = JFWL.winOptions;
	}else{
		options = JFWL.pauseOptions;
	}

	if(JFWL.pauseOptionOverIndex != -1){
		var option = options[JFWL.pauseOptionOverIndex];
		//console.log("Do: ", option.operation);
		$('body').css('cursor', 'default');

		if(option.operation == "resume"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
		}else if(option.operation == "nextlevel"){
			if(JFWL.wonGame){
				JFWL.level++;
				JFWL.paused = false;
				JFWL.dirtyCanvas = true;
				JFWL.startGame();
			}
		}else if(option.operation == "restart"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
			JFWL.startGame();
		}else if(option.operation == "menu"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = true;
			JFWL.menuOptionOverIndex = -1;
		}
		JFWL.saveGameState();
	}
};

JFWL.menuMouseMove = function(x,y){
	var i;
	var initialIndex = JFWL.menuOptionOverIndex;
	JFWL.menuOptionOverIndex = -1;

	for(i = 0; i < JFWL.menuOptions.length; i++){
		var option = JFWL.menuOptions[i];

		if(option.operation == "picklevel"){
			if(option.value <= JFWL.maxLevel){
				//Fine to select
			}else{
				//Not allowd to select
				continue;	
			}
		}else if(option.operation == "none" || option.operation == "title"){
			continue;
		}

		if(x > option.left && x < option.left + option.width){
			if(y > option.top && y < option.top + option.height){
				JFWL.menuOptionOverIndex = i;
				$('body').css('cursor', 'pointer');
			}
		}
	}

	//Check if no longer over option
	if(JFWL.menuOptionOverIndex != initialIndex){
		JFWL.dirtyCanvas = true;
	}

	if(JFWL.menuOptionOverIndex == -1){
		$('body').css('cursor', 'default');
	}
};

JFWL.menuMouseDown = function(x,y){
	JFWL.menuMouseMove(x,y);

	if(JFWL.menuOptionOverIndex != -1){
		var option = JFWL.menuOptions[JFWL.menuOptionOverIndex];
		//console.log("Do: ", option.operation);

		if(option.operation == "resume"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
		}else if(option.operation == "start"){
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = false;
			JFWL.startGame();
		}else if(option.operation == "menu"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = true;
		}else if(option.operation == "credits"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = false;
			JFWL.onCreditsScreen = true;
		}else if(option.operation == "picklevel"){
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = false;
			JFWL.level = option.value;
			JFWL.startGame();
		}
		JFWL.saveGameState();
	}
};

JFWL.creditsMouseMove = function(x,y){
	var i;
	var initialIndex = JFWL.creditsOptionOverIndex;
	JFWL.creditsOptionOverIndex = -1;

	for(i = 0; i < JFWL.creditOptions.length; i++){
		var option = JFWL.creditOptions[i];

		if(option.operation == "none" || option.operation == "title"){
			continue;
		}

		if(x > option.left && x < option.left + option.width){
			if(y > option.top && y < option.top + option.height){
				JFWL.creditsOptionOverIndex = i;
				$('body').css('cursor', 'pointer');
			}
		}
	}

	//Check if no longer over option
	if(JFWL.creditsOptionOverIndex != initialIndex){
		JFWL.dirtyCanvas = true;
	}

	if(JFWL.creditsOptionOverIndex == -1){
		$('body').css('cursor', 'default');
	}
};

JFWL.creditsMouseDown = function(x,y){
	JFWL.creditsMouseMove(x,y);

	if(JFWL.creditsOptionOverIndex != -1){
		var option = JFWL.creditOptions[JFWL.creditsOptionOverIndex];
		
		if(option.operation == "menu"){
			JFWL.paused = false;
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = true;
			JFWL.onCreditsScreen = false;
		}

		JFWL.saveGameState();
	}
};

JFWL.drawBackground = function(){
	var ctx = JFWL.ctx;
	ctx.save();

	//ctx.fillStyle = "rgba(255,255,255,1)";
	
	ctx.clearRect(0,0,JFWL.canvas.width,JFWL.canvas.height);

	var level = JFWL.level;
	//if(JFWL.wonGame){bgLevel--;}

	var grd;
	if(level == 4){
		grd = ctx.createLinearGradient(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight()/2);
		grd.addColorStop(0, 'rgb(149,215,236)');
		grd.addColorStop(1, 'rgb(29,141,178)');
	}else if(level == 5){
		var x = (JFWL.renderBox[0] + JFWL.renderBox[2])/2;
		var y = (JFWL.renderBox[1] + JFWL.renderBox[3])/2;
		
		var angle = 45 * Math.PI / 180;
		var x1 = x - JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y1 = y - JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);
		var x2 = x + JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y2 = y + JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);

		grd = ctx.createLinearGradient(x1,y1,x2,y2);
		
		grd.addColorStop(0, 'hsl(0,100%,80%)');
		grd.addColorStop(1, 'hsl(120,100%,80%)');
	}else if(level == 6){
		var x1 = JFWL.renderBox[0] + 0.333 * JFWL.getRenderBoxWidth();
		var y1 = JFWL.renderBox[1] + 0.333 * JFWL.getRenderBoxHeight();

		grd = ctx.createRadialGradient(x1,y1,0,x1,y1,Math.sqrt(2) * JFWL.getRenderBoxWidth());
		
		grd.addColorStop(0, 'hsl(90,40%,75%)');
		grd.addColorStop(1, 'hsl(220,40%,75%)');
	}else if(level == 7){
		var x = (JFWL.renderBox[0] + JFWL.renderBox[2])/2;
		var y = (JFWL.renderBox[1] + JFWL.renderBox[3])/2;
		
		var angle = 220 * Math.PI / 180;
		var x1 = x - JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y1 = y - JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);
		var x2 = x + JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y2 = y + JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);

		grd = ctx.createLinearGradient(x1,y1,x2,y2);
		
		grd.addColorStop(0, 'hsl(70,100%,80%)');
		grd.addColorStop(1, 'hsl(210,100%,80%)');
	}else if(level == 8){
		var x1 = JFWL.renderBox[0] + 0.333 * JFWL.getRenderBoxWidth();
		var y1 = JFWL.renderBox[1] + 1 * JFWL.getRenderBoxHeight();

		grd = ctx.createRadialGradient(x1,y1,0,x1,y1,Math.sqrt(2) * JFWL.getRenderBoxWidth());
		
		grd.addColorStop(0, 'hsl(240,70%,80%)');
		grd.addColorStop(1, 'hsl(270,70%,80%)');
	}else if(level == 9){
		var x = (JFWL.renderBox[0] + JFWL.renderBox[2])/2;
		var y = (JFWL.renderBox[1] + JFWL.renderBox[3])/2;
		
		var angle = 135 * Math.PI / 180;
		var x1 = x - JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y1 = y - JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);
		var x2 = x + JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y2 = y + JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);

		grd = ctx.createLinearGradient(x1,y1,x2,y2);
		
		grd.addColorStop(0, 'hsl(135,100%,80%)');
		grd.addColorStop(1, 'hsl(310,100%,80%)');
	}else if(level == 10){
		
		var x1 = JFWL.renderBox[0] + 0.6666 * JFWL.getRenderBoxWidth();
		var y1 = JFWL.renderBox[1] + 0;

		grd = ctx.createRadialGradient(x1,y1,0,x1,y1,Math.sqrt(2) * JFWL.getRenderBoxWidth());
		
		grd.addColorStop(0, 'hsl(0,40%,60%)');
		grd.addColorStop(0.5, 'hsl(120,40%,60%)');
		grd.addColorStop(1, 'hsl(260,70%,80%)');
	}else if(level == 11){
		var x = (JFWL.renderBox[0] + JFWL.renderBox[2])/2;
		var y = (JFWL.renderBox[1] + JFWL.renderBox[3])/2;
		
		var angle = 30 * Math.PI / 180;
		var x1 = x - JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y1 = y - JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);
		var x2 = x + JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y2 = y + JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);

		grd = ctx.createLinearGradient(x1,y1,x2,y2);
		
		grd.addColorStop(0, 'hsl(0,100%,75%)');
		grd.addColorStop(1, 'hsl(240,100%,75%)');
	}else if(level == 12){

		var x1 = JFWL.renderBox[0] + 1 * JFWL.getRenderBoxWidth();
		var y1 = JFWL.renderBox[1] + 1 * JFWL.getRenderBoxHeight();

		grd = ctx.createRadialGradient(x1,y1,0,x1,y1,Math.sqrt(2) * JFWL.getRenderBoxWidth());
		
		grd.addColorStop(0, 'hsl(240,70%,60%)');
		grd.addColorStop(1, 'hsl(240,70%,80%)');
	}else if(level == 13){
		var x = (JFWL.renderBox[0] + JFWL.renderBox[2])/2;
		var y = (JFWL.renderBox[1] + JFWL.renderBox[3])/2;
		
		var angle = 75 * Math.PI / 180;
		var x1 = x - JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y1 = y - JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);
		var x2 = x + JFWL.getRenderBoxWidth()  * 0.5 * Math.sqrt(2) * Math.cos(angle);
		var y2 = y + JFWL.getRenderBoxHeight() * 0.5 * Math.sqrt(2) * Math.sin(angle);

		grd = ctx.createLinearGradient(x1,y1,x2,y2);
		
		grd.addColorStop(0, 'hsl(60,50%,80%)');
		grd.addColorStop(1, 'hsl(180,50%,80%)');
	}else{

		grd = ctx.createLinearGradient(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),3*JFWL.getRenderBoxHeight()/2);
		grd.addColorStop(0, 'hsl(180,50%,70%)');
		grd.addColorStop(1, 'hsl(320,50%,70%)');
	}
		ctx.fillStyle = grd;
		ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());		

	//Box border
	ctx.beginPath();
    ctx.moveTo(JFWL.renderBox[0]-0.5,JFWL.renderBox[1]-0.5);
    ctx.lineTo(JFWL.renderBox[0]-0.5,JFWL.renderBox[3]+0.5);
    ctx.lineTo(JFWL.renderBox[2]+0.5,JFWL.renderBox[3]+0.5);
    ctx.lineTo(JFWL.renderBox[2]+0.5,JFWL.renderBox[1]-0.5);
    ctx.lineTo(JFWL.renderBox[0]-0.5,JFWL.renderBox[1]-0.5);
    ctx.closePath();
    ctx.strokeStyle = '000';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
};

JFWL.pauseScreen = function(){
	var ctx = JFWL.ctx;
	ctx.save();

	//Gray out renderBox
	ctx.fillStyle = "rgba(0,0,0,0.3)";
	ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());

	//Menu Box
	ctx.font = '36px ' + JFWL.font;

	var minWidth = 40;
	var maxWidth = 0;

	var roughHeight = 1.4*ctx.measureText("m").width;

	var i;
	var options, option0;
	if(JFWL.wonGame == true){
		options = JFWL.winOptions;
		option0 = {text:"You Win!"}
	}else{
		options = JFWL.pauseOptions;
		option0 = {text:"==Paused=="}
	}

	var length = ctx.measureText(option0.text).width;
	option0.width = length;
	option0.height = roughHeight;
	if(length > maxWidth){maxWidth = length;}

	for(i = 0; i < options.length; i++){
		var length = ctx.measureText(options[i].text).width;
		options[i].width = length;
		options[i].height = roughHeight;
		if(length > maxWidth){maxWidth = length;}
	}

	var width = (maxWidth + minWidth)+0.5|0;
	var height = JFWL.pauseBoxHeight ;

	var centerX = (JFWL.renderBox[0] + JFWL.renderBox[2]) / 2;
	var centerY = (JFWL.renderBox[1] + JFWL.renderBox[3]) / 2;

	var x1 = centerX-width/2 | 0;
	var y1 = centerY-height/2 | 0;
	var x2 = x1 + width;
	var y2 = y1 + height;
	//ctx.fillRect(x1+0.5, y1+0.5, width, height);

	//Box border
	ctx.beginPath();
	ctx.moveTo(x1-0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y1-0.5);
	//ctx.lineTo(x1-0.5,y1-0.5);
	ctx.closePath();
	ctx.strokeStyle = 'rgba(255,255,255,0.7)';
	ctx.fillStyle = "rgba(0,0,0,0.93)";
	ctx.shadowColor = "rgba(0,0,0,0.7)";
	ctx.shadowOffsetX = 0.03*JFWL.getRenderBoxWidth();
	ctx.shadowOffsetY = 0.03*JFWL.getRenderBoxHeight();
	ctx.shadowBlur = 12;

	ctx.lineWidth = 1;

	ctx.fill();
	ctx.stroke();

	//Draw options
	ctx.shadowColor = undefined;
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;

	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';

	ctx.fillStyle = 'rgb(255,255,255)';
	var yStart = y1+0.5*roughHeight;

	option0.left = x1+(width-option0.width)/2;
	option0.top = yStart+option0.height;
	ctx.fillText(option0.text,option0.left,yStart);
	yStart += option0.height;

	for(i = 0; i < options.length; i++){
		var option = options[i];
		
		if(JFWL.wonGame == true && i == 0 && JFWL.level >= 13){
			continue; //Don't go past level 10
		}

		if(JFWL.pauseOptionOverIndex == i){
			ctx.shadowColor = 'rgba(255,255,255,0.7)';
			ctx.shadowBlur = 12;

			ctx.shadowOffsetX = 0.01*JFWL.getRenderBoxWidth();
			ctx.shadowOffsetY = 0.01*JFWL.getRenderBoxHeight();
		}else{
			ctx.shadowColor = undefined;
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		}

		option.left = x1+(width-option.width)/2;
		option.top = yStart+option.height;
		ctx.fillText(option.text,option.left,option.top);

		yStart += option.height;
	}

	ctx.restore();
};

JFWL.drawMenuScreen = function(){
	var ctx = JFWL.ctx;
	ctx.save();

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	//Menu Box
	var x1 = JFWL.renderBox[0];
	var y1 = JFWL.renderBox[1];
	var x2 = JFWL.renderBox[2];
	var y2 = JFWL.renderBox[3];

	var width = JFWL.getRenderBoxWidth();
	var height = JFWL.getRenderBoxHeight();

	//Positioning
	var lastTop  = y1 + height * 0.1;
	var lastLeft = x1 + width * 0.1;
	var paddingH = height * 0.04;

	var i;
	for(i = 0; i < JFWL.menuOptions.length; i++){
		var option = JFWL.menuOptions[i];

		ctx.font = option.fontSize + " " + JFWL.font;
		if(option.operation == "picklevel"){
			// ctx.font = '24px ' + JFWL.font;

			option.width  = width * 0.1;
			option.height = height * 0.1;

			var borderWidth = option.width * 0.1;

			//tmphack
			if(option.value == 4 || option.value == 3+6){
				lastLeft = x1 + (width - option.width*5)/2;
			}

			option.top    = lastTop;
			option.left   = lastLeft; 
			lastLeft += option.width;

			//TmpHack
			if(option.value == 3+5){
				lastTop += option.height;
				lastLeft = x1 + width * 0.1;
			}
			
			//Edit for border width;
			option.top    +=   borderWidth;
			option.width  -= 2*borderWidth;
			option.left   +=   borderWidth;
			option.height -= 2*borderWidth;

			var textLength = ctx.measureText(option.text).width;
			var textHeight = 1.1 * ctx.measureText("M").width;
			option.textWidth  = textLength;
			option.textHeight = textHeight;

			option.textLeft = option.left + (option.width  - option.textWidth) / 2;
			option.textTop  = option.top  + (option.height - option.textHeight) / 2;

		}else{
			var length = ctx.measureText(option.text).width;
			var roughHeight = 1.3 * ctx.measureText("M").width;
			option.width = length;
			option.height = roughHeight;

			option.left = x1+(width-option.	width)/2;
			option.top = lastTop;
		
			lastTop += option.height;
			if(option.operation !== "title"){
				lastTop += paddingH;
			}
		}

	}

	ctx.fillStyle = "rgba(0,0,0,1)";
	ctx.fillRect(x1+0.5, y1+0.5, width, height);

	//Box border
	ctx.beginPath();
	ctx.moveTo(x1-0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y1-0.5);
	ctx.closePath();
	ctx.strokeStyle = 'rgba(255,255,255,1)';
	ctx.lineWidth = 3;
	ctx.stroke();

	//Draw options
	for(i = 0; i < JFWL.menuOptions.length; i++){
		var option = JFWL.menuOptions[i];
		
		if(JFWL.menuOptionOverIndex == i){
			ctx.shadowColor = 'rgba(255,255,255,0.7)';
			ctx.shadowBlur = 12;
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;
		}else{
			ctx.shadowColor = undefined;
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		}

		if(option.operation == "picklevel"){
			ctx.font = option.fontSize + ' ' + JFWL.font;

			//console.log(ctx.font);
			if(option.value <= JFWL.maxLevel){
				ctx.fillStyle = 'rgb(0,100,0)';
			}else{
				ctx.fillStyle = 'rgb(100,0,0)';	
			}
			

			ctx.fillRect(option.left,option.top,option.width,option.height);
			ctx.fillStyle = 'rgb(255,255,255)';

			ctx.fillText(option.text,option.left+option.width/2,option.top+option.height/2);
		}else{
			ctx.fillStyle = 'rgb(255,255,255)';
			ctx.font = option.fontSize + ' ' + JFWL.font;
			ctx.fillText(option.text,option.left+option.width/2,option.top+option.height/2);
		}
	}

	ctx.restore();
};


JFWL.drawCreditsScreen = function(){
	var ctx = JFWL.ctx;
	ctx.save();

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	//Menu Box
	var x1 = JFWL.renderBox[0];
	var y1 = JFWL.renderBox[1];
	var x2 = JFWL.renderBox[2];
	var y2 = JFWL.renderBox[3];

	var width = JFWL.getRenderBoxWidth();
	var height = JFWL.getRenderBoxHeight();

	//Positioning
	var lastTop  = y1 + height * 0.1;
	var lastLeft = x1 + width * 0.1;
	var paddingH = height * 0.05;

	var i;
	for(i = 0; i < JFWL.creditOptions.length; i++){
		var option = JFWL.creditOptions[i];

		ctx.font = option.fontSize + " " + JFWL.font;
		
		var length = ctx.measureText(option.text).width;
		var roughHeight = 1.3 * ctx.measureText("M").width;
		option.width = length;
		option.height = roughHeight;

		option.left = x1+(width-option.	width)/2;
		option.top = lastTop;
	
		lastTop += option.height;
		lastTop += paddingH;
	
	}

	ctx.fillStyle = "rgba(0,0,0,1)";
	ctx.fillRect(x1+0.5, y1+0.5, width, height);

	//Box border
	ctx.beginPath();
	ctx.moveTo(x1-0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y1-0.5);
	ctx.closePath();
	ctx.strokeStyle = 'rgba(255,255,255,1)';
	ctx.lineWidth = 3;
	ctx.stroke();

	//Draw options
	for(i = 0; i < JFWL.creditOptions.length; i++){
		var option = JFWL.creditOptions[i];
		
		if(JFWL.creditsOptionOverIndex == i){
			ctx.shadowColor = 'rgba(255,255,255,0.7)';
			ctx.shadowBlur = 12;
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;
		}else{
			ctx.shadowColor = undefined;
			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		}

		ctx.fillStyle = 'rgb(255,255,255)';
		ctx.font = option.fontSize + ' ' + JFWL.font;
		ctx.fillText(option.text,option.left+option.width/2,option.top+option.height/2);
	}

	ctx.restore();
};

JFWL.winGame = function(){

	if(JFWL.level == JFWL.maxLevel){
		JFWL.maxLevel++;

		if(typeof kongregate !== "undefined"){
			kongregate.stats.submit("Max Level",JFWL.maxLevel);
		}

	}

	JFWL.wonGame = true;
	JFWL.paused = true;
	JFWL.dirtyCanvas = true;

	JFWL.pauseOptionOverIndex = -1;

	JFWL.hoverNode  = -1;
	JFWL.dragNode   = -1;

	JFWL.dragNodeMoved = false;
	JFWL.dragNode = -1

};

// Fonts
WebFontConfig = {
	google: { families: [ 'Libre+Baskerville::latin' ] },
	active: function() {
		JFWL.font = "Libre Baskerville";
		JFWL.dirtyCanvas = true;
	}
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();

function supports_html5_storage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

//console.log(supports_html5_storage());