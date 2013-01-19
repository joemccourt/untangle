//JFWL vars
var JFWL = {}; //Joe's Fun With Lines

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
JFWL.wonGame = false;
JFWL.pauseBoxHeight = 400;
JFWL.pauseOptionOverIndex = -1;
JFWL.menuOptionOverIndex = -1;
JFWL.checkWon = false;

JFWL.maxLevel = 4;
JFWL.level = JFWL.maxLevel;

// State Colors
JFWL.lineHoverColor      = [0,0,0];
JFWL.lineDragColor       = [0,0,0];
JFWL.lineIntersectsColor = [255,0,0];
JFWL.lineDefaultColor    = [0,0,0];

// In Game Buttons
JFWL.inGameButtons = [
						{
							text:"hello",
							x:0.2,
							y:1
						},
						{
							text:"restart",
							x:-1,
							y:-1,
							operation:"todo"
						}
					];

//Menu Options

JFWL.menuOptions = [
						{
							text:"Untangle",
							operation:"none"
						},
						{
							text:"Start",
							operation:"start"
						},
						{
							text:"Credits",
							operation:"credits"
						},
						{
							text:"Level: 1",
							operation:"picklevel",
							value:4
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
							text:"Main Menu (exit)",
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

JFWL.startGame = function(){

	JFWL.hoverNode  = -1;
	JFWL.dragNode   = -1;

	JFWL.graph = {};
	JFWL.dirtyCanvas = true;
	JFWL.wonGame = false;

	JFWL.graph = genGraphPlanarity(JFWL.level);

	//TODO: check if game already one after graph generation
};

JFWL.internalToRenderSpace = function(x,y){
	var xRender = (x + 1) * JFWL.getRenderBoxWidth() / 2  + JFWL.renderBox[0];
	var yRender = (y + 1) * JFWL.getRenderBoxHeight() / 2 + JFWL.renderBox[1];
	return [xRender,yRender];
};

JFWL.renderToInternalSpace = function(x,y){
	var xInternal = 2 * (x - JFWL.renderBox[0]) /JFWL.getRenderBoxWidth()  - 1;
	var yInternal = 2 * (y - JFWL.renderBox[1]) /JFWL.getRenderBoxHeight() - 1;
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

window.onload = function(){

	JFWL.canvas = document.getElementById("demoCanvas");
	JFWL.ctx = JFWL.canvas.getContext("2d");

	JFWL.startGame();

	JFWL.initEvents();

	//Main loop
	//TODO: use request animation frame
	window.setInterval(function(){
		var start = JFWL.clockTime;
		// while(JFWL.clockTime - start < JFWL.refreshRate / 1000){
		// 	JFWL.iterations++;
		// };

		if(JFWL.dirtyCanvas){

			if(JFWL.onMenuScreen){
				JFWL.drawMenuScreen();
			}else if(JFWL.paused){
				JFWL.reDraw();
				JFWL.pauseScreen();
				JFWL.dirtyCanvas = false;
			}else{
				JFWL.reDraw();

				if(JFWL.checkWon){
					JFWL.checkWon = false;
					if(JFWL.numIntersections){
						console.log("Playing...");
						JFWL.dirtyCanvas = false;
					}else{
						console.log("You Win!");
						JFWL.winGame();
					}
				}
			}
		}
	},0);
};

JFWL.reDraw = function(){
	var context = JFWL.ctx;
	var ctx = context; //alias

	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;

	JFWL.renderBox = [30,30,w-30,h-30];

	JFWL.drawBackground();		
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


//Events
JFWL.initEvents = function(){
	$(document).mouseup(function (e) {
		if(JFWL.paused){return;}

		JFWL.mouse = "up";
		if(JFWL.dragNodeMoved){
			JFWL.dragNode = -1;
			JFWL.checkWon = true;
		}
	});

	$(document).mousedown(function (e) {
		JFWL.mouse = "down";

		var offset = $("#demoCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		if(JFWL.paused){JFWL.pausedMouseDown(x,y);return;}
		if(JFWL.onMenuScreen){JFWL.menuMouseDown(x,y);return;}

		if(JFWL.dragNode < 0 && JFWL.hoverNode >= 0){
			JFWL.dragNode = JFWL.hoverNode;
			JFWL.hoverNode = -1;
			JFWL.dirtyCanvas = true;

			//Convert to internal coord system
			var internalPoint = JFWL.renderToInternalSpace(x,y);
			x = internalPoint[0];
			y = internalPoint[1];

			JFWL.clickOffset.x = x - JFWL.graph.nodes[JFWL.dragNode].x;
			JFWL.clickOffset.y = y - JFWL.graph.nodes[JFWL.dragNode].y;
		}else{
			JFWL.dragNode = -1;
			JFWL.checkWon = true;
		}

		JFWL.dragNodeMoved = false;
	});

	$(document).mousemove(function (e) {

		var offset = $("#demoCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

		if(JFWL.paused){JFWL.pausedMouseMove(x,y);return;}
		if(JFWL.onMenuScreen){JFWL.menuMouseMove(x,y);return;}

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
			var popDistance = 0.02;  
			if(JFWL.dragNodeMoved || JFWL.mouseUp() || dist > popDistance){
				JFWL.dragNodeMoved = true;
				JFWL.moveNode(JFWL.dragNode, x - JFWL.clickOffset.x, y - JFWL.clickOffset.y);
				JFWL.dirtyCanvas = true;
			}
		}

		//Cursor states
		if(JFWL.dragNode >= 0){
			$('body').css('cursor', 'move');
		}else if(JFWL.hoverNode >= 0){
			$('body').css('cursor', 'hand');
		}else{
			$('body').css('cursor', 'default');
		}

		//console.log(2*x/w-1,2*y/h-1);
	});

	$(document).keypress(function (e) {
		console.log(e.charCode);

		//112 = 'p'
		//114 = 'r'
		//115 = 's'

		//Restart
		if(e.charCode == 112){
			if(!JFWL.paused){
				$('body').css('cursor', 'default');
				JFWL.dirtyCanvas = true;
				JFWL.paused = true;
			}else{
				JFWL.dirtyCanvas = true;
				JFWL.paused = false;
			}
		}else if(e.charCode == 114){
			JFWL.dirtyCanvas = true;
			JFWL.startGame();
			JFWL.paused = false;
		}else if(e.charCode == 115){
			JFWL.dirtyCanvas = true;
			JFWL.shuffleGraph();
			JFWL.paused = false;
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
				$('body').css('cursor', 'hand');
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
		console.log("Do: ", option.operation);
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
		}
	}
};

JFWL.menuMouseMove = function(x,y){
	var i;
	var initialIndex = JFWL.menuOptionOverIndex;
	JFWL.menuOptionOverIndex = -1;

	for(i = 0; i < JFWL.menuOptions.length; i++){
		var option = JFWL.menuOptions[i];

		if(x > option.left && x < option.left + option.width){
			if(y > option.top && y < option.top + option.height){
				JFWL.menuOptionOverIndex = i;
				$('body').css('cursor', 'hand');
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
	JFWL.pausedMouseMove(x,y);

	if(JFWL.menuOptionOverIndex != -1){
		var option = JFWL.menuOptions[JFWL.menuOptionOverIndex];
		console.log("Do: ", option.operation);

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
		}else if(option.operation == "picklevel"){
			JFWL.dirtyCanvas = true;
			JFWL.onMenuScreen = false;
			JFWL.level = option.value;
			JFWL.startGame();
		}
	}
};

JFWL.drawBackground = function(){
	var ctx = JFWL.ctx;

	//ctx.fillStyle = "rgba(255,255,255,1)";
	
	ctx.clearRect(0,0,JFWL.canvas.width,JFWL.canvas.height);

	var bgLevel = JFWL.level;
	//if(JFWL.wonGame){bgLevel--;}

	if(bgLevel == 4){
		var grd = ctx.createLinearGradient(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight()/2);
		grd.addColorStop(0, 'rgb(149,215,236)');
		grd.addColorStop(1, 'rgb(29,141,178)');
		ctx.fillStyle = grd;

		ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());	
	}else{
		var grd = ctx.createLinearGradient(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),3*JFWL.getRenderBoxHeight()/2);
		grd.addColorStop(0, 'hsl(180,50%,70%)');
		grd.addColorStop(1, 'hsl(320,50%,70%)');
		ctx.fillStyle = grd;

		ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());		
	}

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
};

JFWL.pauseScreen = function(){
	var ctx = JFWL.ctx;
	ctx.save();

	//Gray out renderBox
	ctx.fillStyle = "rgba(0,0,0,0.3)";
	ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());

	//Menu Box
	ctx.font = '36px Verdana';

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

	ctx.fillStyle = 'fff';
	var yStart = y1;

	option0.left = x1+(width-option0.width)/2;
	option0.top = yStart+option0.height;
	ctx.fillText(option0.text,option0.left,y1);
	yStart += option0.height;

	for(i = 0; i < options.length; i++){
		var option = options[i];
		
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

	//Gray out renderBox
	// ctx.fillStyle = "rgba(0,0,0,0.3)";
	// ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());

	//Menu Box
	ctx.font = '36px Verdana';

	var width = JFWL.getRenderBoxWidth();
	var height = JFWL.getRenderBoxHeight();

	//Menu Box
	var roughHeight = 1.4*ctx.measureText("m").width;

	var i;
	for(i = 0; i < JFWL.menuOptions.length; i++){
		var length = ctx.measureText(JFWL.menuOptions[i].text).width;
		JFWL.menuOptions[i].width = length;
		JFWL.menuOptions[i].height = roughHeight;
	}

	var x1 = JFWL.renderBox[0];
	var y1 = JFWL.renderBox[1];
	var x2 = JFWL.renderBox[2];
	var y2 = JFWL.renderBox[3];

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
	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';

	ctx.fillStyle = 'fff';
	var yStart = y1;
	for(i = 0; i < JFWL.menuOptions.length; i++){
		var option = JFWL.menuOptions[i];
		
		if(JFWL.menuOptionOverIndex == i){
			ctx.shadowColor = 'rgba(255,255,255,0.7)';
			ctx.shadowBlur = 12;
		}else{
			ctx.shadowColor = undefined;
			ctx.shadowBlur = 0;
		}

		option.left = x1+(width-option.width)/2;
		option.top = yStart+option.height;
		ctx.fillText(option.text,option.left,option.top);

		yStart += option.height;
	}

	ctx.restore();
};


JFWL.winGame = function(){

	if(JFWL.level == JFWL.maxLevel){
		JFWL.maxLevel++;


JFWL.menuOptions.push({
							text:"Level: " + (JFWL.maxLevel-3),
							operation:"picklevel",
							value:JFWL.maxLevel
						});

	}

	JFWL.wonGame = true;
	JFWL.paused = true;
	JFWL.dirtyCanvas = true;

	JFWL.hoverNode  = -1;
	JFWL.dragNode   = -1;

	JFWL.dragNodeMoved = false;
	JFWL.dragNode = -1

};