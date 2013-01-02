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

// State Colors
JFWL.lineHoverColor      = [0,0,0];
JFWL.lineDragColor       = [0,0,0];
JFWL.lineIntersectsColor = [255,0,0];
JFWL.lineDefaultColor    = [0,0,0];

//Draw sizes
JFWL.lineWidth = 3;
JFWL.nodeRadius = 15;

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

	JFWL.graph = genGraphPlanarity(4);//genGraph();

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

	JFWL.renderBox = [20,20,w-20,h-20];

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
};


//Events
JFWL.initEvents = function(){
	$(document).mouseup(function (e) {
		JFWL.mouse = "up";
		if(JFWL.dragNodeMoved){
			JFWL.dragNode = -1;
		}
	});

	$(document).mousedown(function (e) {
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

		//console.log(2*x/w-1,2*y/h-1);
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
};

JFWL.drawBackground = function(){
	var ctx = JFWL.ctx;

	ctx.fillStyle = "rgba(255,255,255,1)";
	
	ctx.clearRect(0,0,JFWL.canvas.width,JFWL.canvas.height);

	var grd = ctx.createLinearGradient(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight()/2);
	grd.addColorStop(0, 'rgb(149,215,236)');
	grd.addColorStop(1, 'rgb(29,141,178)');
	ctx.fillStyle = grd;

	ctx.fillRect(JFWL.renderBox[0],JFWL.renderBox[1],JFWL.getRenderBoxWidth(),JFWL.getRenderBoxHeight());	

	//Box border
	ctx.beginPath();
    ctx.moveTo(JFWL.renderBox[0],JFWL.renderBox[1]);
    ctx.lineTo(JFWL.renderBox[0],JFWL.renderBox[3]);
    ctx.lineTo(JFWL.renderBox[2],JFWL.renderBox[3]);
    ctx.lineTo(JFWL.renderBox[2],JFWL.renderBox[1]);
    ctx.lineTo(JFWL.renderBox[0],JFWL.renderBox[1]);
    ctx.strokeStyle = '000';
    ctx.lineWidth = 2;
    ctx.stroke();
};