function drawLine(line,color){
	if(typeof color === "undefined"){color = '000';}

	var ctx = JFWL.canvas.getContext("2d");

	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;

	var x1 = (line[0]+1)*w/2;
	var y1 = (line[1]+1)*h/2;
	var x2 = (line[2]+1)*w/2;
	var y2 = (line[3]+1)*h/2;

	ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = color;
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
	if(typeof color === "undefined"){color = '000';}

	var ctx = JFWL.canvas.getContext("2d");

	var w = JFWL.canvas.width;
	var h = JFWL.canvas.height;

	var x = (node.x+1)*w/2;
	var y = (node.y+1)*h/2;

	ctx.beginPath();
	ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.lineWidth = 0;
	ctx.strokeStyle = color;
    ctx.stroke();
}

function drawNodes(color){
	var graph = JFWL.graph;
	var n = graph.nodes.length;
	var i;
	for(i = 0; i < n; i++){
		if(i == JFWL.hoverNode){
			drawNode(graph.nodes[i],'00f');
		}else if(i == JFWL.dragNode){
			drawNode(graph.nodes[i],'f00');
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

	var numNodes = 10;
	var numLines = 15;
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

		graph.lines[i] = [nodeI,nodeJ];
	}

	return graph;
}
