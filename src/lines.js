function drawLine(canvas,line,color){
	if(typeof color === "undefined"){color = '000';}

	var ctx = canvas.getContext("2d");

	var w = canvas.width;
	var h = canvas.height;

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

function markLineIntersections(lines,intersects){

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

	// for(i = 0; i < n; i++){
	// 	if(!intersects[i]){
	// 		for(j = 0; j < n; j++){
	// 			if(lineIntersectsLine(lines[i],lines[j])){
	// 				intersects[i] = true;
	// 				intersects[j] = true;
	// 				break;
	// 			}
	// 		}

	// 	}
	// }
}

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

	if(denom == 0){return false;} //Lines are parallel

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