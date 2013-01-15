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
							text:"Restart (r)",
							operation:"restart"
						},
						{
							text:"PlaceHolder",
							operation:"todod"
						}
					];

//Draw sizes
JFWL.lineWidth = 3;
JFWL.nodeRadius = 15;

JFWL.startGame = function(numLines){
	if(typeof numLines !== "number"){
		numLines = 5;
	}

	JFWL.hoverNode  = -1;
	JFWL.dragNode   = -1;

	JFWL.graph = {};
	JFWL.dirtyCanvas = true;

	JFWL.graph = genGraphPlanarity(numLines);
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

			JFWL.reDraw();

			if(JFWL.numIntersections){
				console.log("Playing...");
			}else{
				console.log("You Win!");
			}

			JFWL.dirtyCanvas = false;
		}

		//JFWL.display();
	},0);
};

JFWL.reDraw = function(){
	var context = JFWL.ctx;
	var ctx = context; //alias

	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;

	JFWL.renderBox = [w,30,30-30,h-30];

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
		}
	});

	$(document).mousedown(function (e) {
		if(JFWL.paused){return;}
		JFWL.mouse = "down";

		if(JFWL.dragNode < 0 && JFWL.hoverNode >= 0){
			JFWL.dragNode = JFWL.hoverNode;
			JFWL.hoverNode = -1;
			JFWL.dirtyCanvas = true;


			var offset = $("#demoCanvas").offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;

			//Convert to internal coord system
			var internalPoint = JFWL.renderToInternalSpace(x,y);
			x = internalPoint[0];
			y = internalPoint[1];

			JFWL.clickOffset.x = x - JFWL.graph.nodes[JFWL.dragNode].x;
			JFWL.clickOffset.y = y - JFWL.graph.nodes[JFWL.dragNode].y;
		}else{
			JFWL.dragNode = -1;
		}

		JFWL.dragNodeMoved = false;
	});

	$(document).mousemove(function (e) {
		if(JFWL.paused){return;}

		var offset = $("#demoCanvas").offset();
		var x = e.pageX - offset.left;
		var y = e.pageY - offset.top;

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
		if(e.charCode == 114){
			JFWL.startGame();
		}else if(e.charCode == 115){
			JFWL.dirtyCanvas = true;
			JFWL.shuffleGraph();
		}else if(e.charCode == 112){
			if(!JFWL.paused){
				$('body').css('cursor', 'default');
				JFWL.paused = true;
				JFWL.pauseScreen();
			}else{
				JFWL.dirtyCanvas = true;
				JFWL.paused = false;
			}
		}
	});

};



function hoverAt(x,y){
	var graph = JFWL.graph;

	var i, dist;
	var minDist = 9999999999;
	var selectRadius = 0.1000;
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

JFWL.drawBackground = function(){
	var ctx = JFWL.ctx;

	//ctx.fillStyle = "rgba(255,255,255,1)";
	
	ctx.clearRect(0,0,JFWL.canvas.width,JFWL.canvas.height);

	var grd = ctx.createLinearGradient(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight()/2);
	grd.addColorStop(0, 'rgb(149,215,236)');
	grd.addColorStop(1, 'rgb(29,141,178)');
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
};

JFWL.pauseScreen = function(){
	var ctx = JFWL.ctx;

	//Gray out renderBox
	ctx.fillStyle = "rgba(0,0,0,0.3)";
	ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());

	//Menu Box
	ctx.font = '64px Helvetica';

	var minWidth = 40;
	var maxWidth = 0;

	var i;
	for(i = 0; i < JFWL.menuOptions.length; i++){
		var length = ctx.measureText(JFWL.menuOptions[i].text).width;
		JFWL.menuOptions[i].width = length;
		if(length > maxWidth){maxWidth = length;}
	}


	var width = (maxWidth + minWidth)+0.5|0;
	var height = 400;

	var centerX = (JFWL.renderBox[0] + JFWL.renderBox[2]) / 2;
	var centerY = (JFWL.renderBox[1] + JFWL.renderBox[3]) / 2;

	var x1 = centerX-width/2 | 0;
	var y1 = centerY-height/2 | 0;
	var x2 = x1 + width;
	var y2 = y1 + height;
	ctx.fillStyle = "rgba(0,0,0,0.93)";
	ctx.fillRect(x1+0.5, y1+0.5, width, height);

	//Box border
	ctx.beginPath();
	ctx.moveTo(x1-0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y2+0.5);
	ctx.lineTo(x2+0.5,y1-0.5);
	ctx.lineTo(x1-0.5,y1-0.5);
	ctx.closePath();
	ctx.strokeStyle = 'rgba(255,255,255,0.7)';
	ctx.lineWidth = 1;
	ctx.stroke();

	//Draw options
	ctx.textAlign = 'start';
	ctx.textBaseline = 'top';

	ctx.fillStyle = 'fff';
	for(i = 0; i < JFWL.menuOptions.length; i++){
		var option = JFWL.menuOptions[i];
		ctx.fillText(option.text,x1+(width-option.width)/2,y1+50*i);
	}

};