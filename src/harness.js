window.onload = function(){
	var canvas = document.getElementById("demoCanvas");

	var w = canvas.width;
	var h = canvas.height;

	var context = canvas.getContext("2d");
	var ctx = context; //alias

	//var oldCanvasData = context.getImageData(0, 0, canvas.width, canvas.height);
	var newCanvasData = context.createImageData(w, h); // blank
	
	var dst = newCanvasData.data;
	// var src = oldCanvasData.data;
	
	var n;
	for(n = 0; n < w*h; n++){
		dst[4*n  ] = 255;
		dst[4*n+1] = 255;
		dst[4*n+2] = 255;
		dst[4*n+3] = 255;
	}

	context.putImageData(newCanvasData, 0, 0);
	
	// var line1 = [-0.1,-0.5,0.9,0.9];
	// var line2 = [0.7,0,-0.7,0.6];

	// var lines = [line1,line2];
	// drawLine(canvas,lines[0]);
	// drawLine(canvas,lines[1]);

	var intersectsColor = 'f00';
	var multiIntersectsColor = '00f';
	var defaultColor = '0f0';

	var lines = [];
	var intersects = []
	var numLines = 1000;
	var i;

	for(i = 0; i < numLines; i++){
		lines[i] = [];

		// uniform random
		// lines[i][0] = (Math.random()-0.5)*2;
		// lines[i][1] = (Math.random()-0.5)*2;
		// lines[i][2] = (Math.random()-0.5)*2;
		// lines[i][3] = (Math.random()-0.5)*2;

		//Const length
		lines[i][0] = (Math.random()-0.5)*2;
		lines[i][1] = (Math.random()-0.5)*2;

		var length = 0.08;
		var angle = Math.random() * Math.PI * 2;

		lines[i][2] = lines[i][0] + length*Math.cos(angle);
		lines[i][3] = lines[i][1] + length*Math.sin(angle);
	}

	markLineIntersections(lines,intersects);

	var color;
	for(i = 0; i < numLines; i++){
		if(intersects[i] > 1){
			color = multiIntersectsColor;
		}else if(intersects[i] == 1){
			color = intersectsColor;
		}else{
			color = defaultColor;
		}
		drawLine(canvas,lines[i],color);
	}
};
