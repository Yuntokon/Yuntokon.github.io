register({
	title: "Midpoint II",
	description: "Estimate the 3D midpoint",

	category: "Perspective",
	sideLayout: false,
	offsetTouch: true,
	drawModeDeltas: true,
	drawMode: 1,
	
	settings:
	{
	},
	
	onNext: function()
	{
		var angle = Math.random() * Math.PI * 2;
		var offset = 0;
		var size = Math.random() * 0.15 + 0.3;
		var minAngle = Math.PI * 0.25;
		var points = [];
		for (var i = 0; i < 4; ++i)
		{
			points[i] = [Math.cos(angle + offset) * size, Math.sin(angle + offset) * size];
			offset += minAngle + (Math.random() * (Math.PI * 2 - offset - minAngle * (4 - i)));
		}
		
		return {
			points: points,
			mid: LineThrough(points[0], points[2]).intersect(LineThrough(points[1], points[3]))
		};
	},
	
	onQuestion: function()
	{
		clear(ctx1);
		ctx1.strokeStyle  = colorBold
		ctx1.lineWidth = lineWidth(3);
		ctx1.beginPath();
		ctx1.moveTo(question.points[0][0], question.points[0][1]);
		for (var i = 1; i <= 4; ++i)
			ctx1.lineTo(question.points[i % 4][0], question.points[i % 4][1]);
		ctx1.stroke();
	},

	onAnswered: function()
	{
		if (drawMode)
		{
			var point = fitPointToDrawing();
			hasAnswer1 = hasAnswer2 = true;
			answer2 = point;
			mouse = [answer2[0], answer2[1]];
		}
		
		updateAverages({"": dist(question.mid, answer2)});
	},

	onDraw: function()
	{      
		clear(ctx2);
		ctx2.strokeStyle  = colorBold
		ctx2.lineWidth = lineWidth(3);
		
		if (hasAnswer2)
		{
			ctx2.strokeStyle  = colorNormal
			ctx2.lineWidth = lineWidth(2);
			
			ctx2.beginPath();
			ctx2.moveTo(question.points[0][0], question.points[0][1]);
			ctx2.lineTo(question.points[2][0], question.points[2][1]);
			ctx2.moveTo(question.points[1][0], question.points[1][1]);
			ctx2.lineTo(question.points[3][0], question.points[3][1]);
			ctx2.stroke();
			
			ctx2.beginPath();
			ctx2.arc(question.mid[0], question.mid[1], lineWidth(5), 0, Math.PI * 2); 
			ctx2.stroke();
			
			ctx2.strokeStyle  = colorHighlightNormal
		}

		if (hasMouse || drawMode && hasAnswer2)
		{
			ctx2.beginPath();
			ctx2.arc(mouse[0], mouse[1], lineWidth(5), 0, Math.PI * 2); 
			ctx2.stroke();
		}
	}
});