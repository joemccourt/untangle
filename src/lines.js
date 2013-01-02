function drawLine(line,color){
	if(typeof color === "undefined"){color = '000';}

	var ctx = JFWL.ctx;

	var canvasCoord1 = JFWL.internalToRenderSpace(line[0],line[1]);
	var canvasCoord2 = JFWL.internalToRenderSpace(line[2],line[3]);

	var lineWidth = JFWL.lineWidth;
	// var angle = Math.atan2(canvasCoord1[1]-canvasCoord2[1],canvasCoord1[0]-canvasCoord2[0])
	// var angleNormal = angle+Math.PI/2;

	// var grd = ctx.createLinearGradient(canvasCoord1[0]-lineWidth/2*Math.cos(angleNormal),canvasCoord1[1]-lineWidth/2*Math.sin(angleNormal),canvasCoord1[0]+lineWidth/2*Math.cos(angleNormal),canvasCoord1[1]+lineWidth/2*Math.sin(angleNormal));
	// grd.addColorStop(0,   'rgba(0,0,0,0)');
	// grd.addColorStop(0.1, 'rgba(0,0,0,255)');
	// grd.addColorStop(0.9, 'rgba(0,0,0,255)');
	// grd.addColorStop(1,   'rgba(0,0,0,0)');

	ctx.beginPath();
    ctx.moveTo(canvasCoord1[0],canvasCoord1[1]);
    ctx.lineTo(canvasCoord2[0],canvasCoord2[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

JFWL.moveNode = function(node,x,y){

	//Clamp
	x = Math.max(-1,Math.min(1,x));
	y = Math.max(-1,Math.min(1,y));

	JFWL.graph.nodes[node].x = x;
	JFWL.graph.nodes[node].y = y;
}

function drawNode(node,color){
	if(typeof color === "undefined"){color = [0,0,0];}

	var ctx = JFWL.ctx;

	var canvasCoord = JFWL.internalToRenderSpace(node.x,node.y);

	var nodeRadius = JFWL.nodeRadius;
	var nodeOutlineWidth = nodeRadius/10;
	ctx.beginPath();

	// create radial gradient
	var grd = ctx.createRadialGradient(canvasCoord[0], canvasCoord[1], nodeRadius-nodeOutlineWidth, canvasCoord[0], canvasCoord[1], nodeRadius);
	grd.addColorStop(0, 'rgba('+color[0]+','+color[1]+','+color[2]+',255)');
	grd.addColorStop(1, 'rgba('+color[0]+','+color[1]+','+color[2]+',0)');

	ctx.arc(canvasCoord[0], canvasCoord[1], nodeRadius, 0, 2 * Math.PI, false);
	// ctx.fillStyle = color;
	ctx.fillStyle = grd;
	ctx.fill();
	// ctx.lineWidth = nodeOutlineWidth;
	// ctx.strokeStyle = grd;
 //    ctx.stroke();
}

function drawNodes(color){
	var graph = JFWL.graph;
	var n = graph.nodes.length;
	var i;
	for(i = 0; i < n; i++){
		if(i == JFWL.hoverNode){
			drawNode(graph.nodes[i],[0,0,126]);
		}else if(i == JFWL.dragNode){
			drawNode(graph.nodes[i],[0,0,255]);
		}else{
			drawNode(graph.nodes[i],color);
		}
	}
}

function countLineIntersections(lines,intersects){

	//Brute force
	var n = lines.length;

	//Set intersects to all false initially
	var i,j;
	for(i = 0; i < n; i++){
		intersects[i] = false;
	}

	for(i = 0; i < n; i++){
		for(j = 0; j < n; j++){
			if(lineIntersectsLine(lines[i],lines[j])){
				intersects[i]++;
			}
		}
	}
}


function markIntersections(intersects){

	
	//Brute force
	var graph = JFWL.graph;
	var n = graph.lines.length;
	var lines = genLinesArray(graph);

	//Set intersects to all false initially
	JFWL.numIntersections = 0;
	var i,j;
	var lineI,lineJ;
	for(i = 0; i < n; i++){
		intersects[i] = false;
	}

	lineI = [];
	lineJ = [];
	for(i = 0; i < n; i++){
		if(!intersects[i]){
			for(j = 0; j < n; j++){
				if(graph.lines[i][0] == graph.lines[j][0] || graph.lines[i][1] == graph.lines[j][0] || graph.lines[i][0] == graph.lines[j][1] || graph.lines[i][1] == graph.lines[j][1]){
					//Share same node, count as not interesecting
				}else if(lineIntersectsLine(lines[i],lines[j])){
					intersects[i] = true;
					intersects[j] = true;
					JFWL.numIntersections++;
					break;
				}
			}

		}
	}
}


// function markLineIntersections(lines,intersects){

// 	//Brute force
// 	var n = lines.length;

// 	//Set intersects to all false initially
// 	var i,j;
// 	for(i = 0; i < n; i++){
// 		intersects[i] = false;
// 	}

// 	for(i = 0; i < n; i++){
// 		if(!intersects[i]){
// 			for(j = 0; j < n; j++){
// 				if(lineIntersectsLine(lines[i],lines[j])){
// 					intersects[i] = true;
// 					intersects[j] = true;
// 					break;
// 				}
// 			}

// 		}
// 	}
// }

function lineIntersectsLine(line1,line2){
	
	//Find intersection point and test it is within line;
	var x1 = line1[0];
	var x2 = line1[2];
	var x3 = line2[0];
	var x4 = line2[2];

	var y1 = line1[1];
	var y2 = line1[3];
	var y3 = line2[1];
	var y4 = line2[3];
	
	var denom = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);

	if(denom == 0){

		//Lines are parallel
		//TODO: test parallel lines intersection
		return false;
	}

	var px = ((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/denom;
	var py = ((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/denom;

	if(px < x2 && px < x1){return false;}
	if(px > x2 && px > x1){return false;}
	if(py < y2 && py < y1){return false;}
	if(py > y2 && py > y1){return false;}

	if(px < x3 && px < x4){return false;}
	if(px > x3 && px > x4){return false;}
	if(py < y3 && py < y4){return false;}
	if(py > y3 && py > y4){return false;}

	return true;
}


function genLinesArray(){
	var graph = JFWL.graph;

	var lines = [];
	var numLines = graph.lines.length;

	var i;
	for(i = 0; i < numLines; i++){
		lines[i] = [];
		lines[i][0] = graph.nodes[graph.lines[i][0]].x;
		lines[i][1] = graph.nodes[graph.lines[i][0]].y;
		lines[i][2] = graph.nodes[graph.lines[i][1]].x;
		lines[i][3] = graph.nodes[graph.lines[i][1]].y;
	}

	return lines;
}

function genGraph(){
	// var graph = {
	// 	nodes:[
	// 		{x:0,y:0},
	// 		{x:1,y:1},
	// 		{x:0.5,y:-0.5},
	// 		{x:0.1,y:0.5}
	// 		],
	// 	lines:[
	// 		[0,1],
	// 		[1,2],
	// 		[2,3]
	// 	]
	// };

	JFWL.graph = {nodes:[],lines:[]}
	var graph = JFWL.graph;

	var numNodes = 8;
	var numLines = 3*numNodes - 6;
	var i;
	for(i = 0; i < numNodes; i++){
		graph.nodes[i] = {};
		graph.nodes[i].x = (Math.random()-0.5)*2;
		graph.nodes[i].y = (Math.random()-0.5)*2;
	}

	var nodeI,nodeJ;
	for(i = 0; i < numLines; i++){
		nodeI = Math.floor(Math.random()*numNodes);
		nodeJ = nodeI;
		while(nodeJ == nodeI){
			nodeJ = Math.floor(Math.random()*numNodes);
		}

			
		//Try again if line already exists
		var j;
		for(j = 0; j < graph.lines.length; j++){
			if(nodeI == graph.lines[j][0] && nodeJ == graph.lines[j][1] || nodeI == graph.lines[j][1] && nodeJ == graph.lines[j][0]){
				i--;
				continue;
			}
		}

		graph.lines[i] = [nodeI,nodeJ];
	}

	return graph;
}

function genGraphPlanarity(n){
	JFWL.graph = {nodes:[],lines:[]}
	var graph = JFWL.graph;

	//tmp line angles and intercepts.
	//TODO: Make sure no collisions
	var angles = [];
	var intercepts = [];
	var i,j;
	for(i = 0; i < n; i++){
		angles[i] = Math.random()*2*Math.PI;
		intercepts[i] = Math.random();
	}

	//Add nodes
	var numNodes = 0;
	for(i = 0; i < n; i++){
		for(j = i+1; j < n; j++){
			var xIntercept = (intercepts[j] - intercepts[i]) / (Math.sin(angles[i]) - Math.sin(angles[j]));
			var yIntercept = xIntercept * Math.sin(angles[i]) + intercepts[i];

			graph.nodes[numNodes] = {};
			graph.nodes[numNodes].x = xIntercept;
			graph.nodes[numNodes].y = yIntercept;
			graph.nodes[numNodes].index = numNodes;
			graph.nodes[numNodes].index1 = i;
			graph.nodes[numNodes].index2 = j;
			numNodes++;
		}
	}

	//Add edges
	for(i = 0; i < n; i++){

		//Collect nodes for every line
		var nodesOnLine = [];
		for(j = 0; j < numNodes; j++){
			if(graph.nodes[j].index1 == i || graph.nodes[j].index2 == i){
				nodesOnLine.push(graph.nodes[j]);
			}
		}

		//Sort array
		nodesOnLine.sort(function(a,b){
			if(a.y == b.y){ return a.x > b.x ? 1 : a.x < b.x ? -1 : 0;}
		  	return a.y > b.y ? 1 : -1;
		});

		//Connect edges
		for(p = 1; p < nodesOnLine.length; p++){
			graph.lines.push([nodesOnLine[p-1].index,nodesOnLine[p].index]);
		}

	}

	//Orient nodes in circle
	for(i = 0; i < numNodes; i++){
		var angle = Math.random() * 2 * Math.PI;
		graph.nodes[i].x = 0.8 * Math.cos(angle);
		graph.nodes[i].y = 0.8 * Math.sin(angle);
	}


	// var numNodes = 8;
	// var numLines = 3*numNodes - 6;
	// var i;
	// for(i = 0; i < numNodes; i++){
	// 	graph.nodes[i] = {};
	// 	graph.nodes[i].x = (Math.random()-0.5)*2;
	// 	graph.nodes[i].y = (Math.random()-0.5)*2;
	// }

	// var nodeI,nodeJ;
	// for(i = 0; i < numLines; i++){
	// 	nodeI = Math.floor(Math.random()*numNodes);
	// 	nodeJ = nodeI;
	// 	while(nodeJ == nodeI){
	// 		nodeJ = Math.floor(Math.random()*numNodes);
	// 	}

			
	// 	//Try again if line already exists
	// 	var j;
	// 	for(j = 0; j < graph.lines.length; j++){
	// 		if(nodeI == graph.lines[j][0] && nodeJ == graph.lines[j][1] || nodeI == graph.lines[j][1] && nodeJ == graph.lines[j][0]){
	// 			i--;
	// 			continue;
	// 		}
	// 	}

	// 	graph.lines[i] = [nodeI,nodeJ];
	// }

	return graph;
}

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