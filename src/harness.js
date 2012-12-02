window.onload = function(){
	// var line1 = [-0.1,-0.5,0.9,0.9];
	// var line2 = [0.7,0,-0.7,0.6];

	// var lines = [line1,line2];
	// drawLine(canvas,lines[0]);
	// drawLine(canvas,lines[1]);


	//var lines = [];
	//var numLines = 1000;
	//var i;

	// for(i = 0; i < numLines; i++){
	// 	lines[i] = [];

	// 	// uniform random
	// 	// lines[i][0] = (Math.random()-0.5)*2;
	// 	// lines[i][1] = (Math.random()-0.5)*2;
	// 	// lines[i][2] = (Math.random()-0.5)*2;
	// 	// lines[i][3] = (Math.random()-0.5)*2;

	// 	//Const length
	// 	lines[i][0] = (Math.random()-0.5)*2;
	// 	lines[i][1] = (Math.random()-0.5)*2;

	// 	var length = 0.15;
	// 	var angle = Math.random() * Math.PI * 2;

	// 	lines[i][2] = lines[i][0] + length*Math.cos(angle);
	// 	lines[i][3] = lines[i][1] + length*Math.sin(angle);
	// }

	JFWL.canvas = document.getElementById("demoCanvas");
	JFWL.graph = genGraph();

	JFWL.initEvents();

	//Main loop
	window.setInterval(function(){
		var start = JFWL.clockTime;
		// while(JFWL.clockTime - start < JFWL.refreshRate / 1000){
		// 	JFWL.iterations++;
		// };

		JFWL.reDraw();
		//JFWL.display();
	},0);
};

//Global vars
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

JFWL.reDraw = function(){
	var context = JFWL.canvas.getContext("2d");
	var ctx = context; //alias

	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;
	
	var newCanvasData = context.createImageData(w, h); // blank
	var dst = newCanvasData.data;
	
	var n;
	for(n = 0; n < w*h; n++){
		dst[4*n  ] = 255;
		dst[4*n+1] = 255;
		dst[4*n+2] = 255;
		dst[4*n+3] = 255;
	}

	context.putImageData(newCanvasData, 0, 0);

	var intersectsColor = 'f00';
	var multiIntersectsColor = '00f';
	var defaultColor = '0f0';
	var intersects = [];

	var numLines = JFWL.graph.lines.length;
	var lines = genLinesArray();
	
	markIntersections(intersects);

	//console.log(graph,lines);
	//countLineIntersections(lines,intersects);

	var color;
	for(i = 0; i < numLines; i++){
		if(intersects[i] > 1){
			color = multiIntersectsColor;
		}else if(intersects[i] == 1){
			color = intersectsColor;
		}else{
			color = defaultColor;
		}
		drawLine(lines[i],color);
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

			var offset = $("#demoCanvas").offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;

			var w = JFWL.canvas.width;
			var h = JFWL.canvas.height;

			//Convert to my coord system
			x = 2*x/w-1;
			y = 2*y/h-1;

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

		var w = JFWL.canvas.width;
		var h = JFWL.canvas.height;

		//Convert to my coord system
		x = 2*x/w-1;
		y = 2*y/h-1;

		if(JFWL.dragNode < 0){
			hoverAt(x,y);
		}else{

			var dist = Math.sqrt(Math.pow(JFWL.graph.nodes[JFWL.dragNode].x - (x - JFWL.clickOffset.x),2)+Math.pow(JFWL.graph.nodes[JFWL.dragNode].y - (y - JFWL.clickOffset.y),2));

			if(JFWL.dragNodeMoved || dist > 0.03){
				JFWL.dragNodeMoved = true;
				JFWL.moveNode(JFWL.dragNode, x - JFWL.clickOffset.x, y - JFWL.clickOffset.y);
			}
		}

		//console.log(2*x/w-1,2*y/h-1);
	});
};

function hoverAt(x,y){
	var graph = JFWL.graph;

	var i, dist;
	var minDist = 10; var minIndex = -1;
	for(i = 0; i < graph.nodes.length; i++){
		dist = Math.sqrt(Math.pow(graph.nodes[i].x - x, 2) + Math.pow(graph.nodes[i].y - y, 2));
		if(dist < minDist && dist < 0.03){
			minIndex = i;
			minDist  = dist;
		}
	}

	JFWL.hoverNode = minIndex;
};


