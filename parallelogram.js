register({
	title: "Parallelogram",
	description: "Complete the parallelogram",
	category: "Accuracy",
	sideLayout: false,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
	},

	onNext: function()
	{
		var angle = Math.random() * Math.PI * 2;
		var width = Math.random() * 0.05 + 0.15;
		var height = Math.random() * 0.05 + 0.15;
		var shiftX = Math.random() * 0.1 + 0.1;
		var shiftY = Math.random() * 0.1 + 0.1;

		var x = Math.cos(angle);
		var y = Math.sin(angle);
		
		var x0 = Math.random() * 0.2 - 0.1;
		var y0 = Math.random() * 0.2 - 0.1;
		
		var points = [
		[x0 - x * width + shiftX, y0 - y * height - shiftY],
		[x0 + x * width + shiftX, y0 - y * height + shiftY],
		[x0 + x * width - shiftX, y0 + y * height + shiftY],
		[x0 - x * width - shiftX, y0 + y * height - shiftY],
		];
		
		return {
			points: points,
		};
	},
	
	onQuestion: function()
	{
		clear(ctx1);
		ctx1.strokeStyle  = colorBold
		ctx1.lineWidth = lineWidth(3);
		ctx1.beginPath();
		ctx1.moveTo(question.points[0][0], question.points[0][1]);
		for (var i = 1; i < 3; ++i)
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
		
		updateAverages({"": dist(question.points[3], answer2)});
	},

	onDraw: function()
	{      
		clear(ctx2);
		ctx2.strokeStyle = colorNormal;
		
		if (hasAnswer2)
		{
			ctx2.lineWidth = lineWidth(2);
			ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	

			ctx2.beginPath();
			for (var i = 0; i < 4; ++i)
			{
				ctx2.moveTo(question.points[i][0] * 5 - question.points[(i + 1) % 4][0] * 4, question.points[i][1] * 5 - question.points[(i + 1) % 4][1] * 4);
				ctx2.lineTo(question.points[(i + 1) % 4][0] * 5 - question.points[i][0] * 4, question.points[(i + 1) % 4][1] * 5 - question.points[i][1] * 4);
			}
			ctx2.stroke();
			
			ctx2.setLineDash([]);	

			ctx2.strokeStyle = colorBold;
			ctx2.lineWidth = lineWidth(3);
			
			ctx2.beginPath();
			ctx2.moveTo(question.points[2][0], question.points[2][1]);
			ctx2.lineTo(question.points[3][0], question.points[3][1]);
			ctx2.lineTo(question.points[0][0], question.points[0][1]);
			ctx2.stroke();
			
			ctx2.strokeStyle = colorHighlightNormal;
		}

		if (hasMouse || drawMode && hasAnswer2)
		{
			ctx2.lineWidth = lineWidth(2);

			ctx2.beginPath();
			ctx2.moveTo(question.points[2][0], question.points[2][1]);
			ctx2.lineTo(mouse[0], mouse[1]);
			ctx2.lineTo(question.points[0][0], question.points[0][1]);
			ctx2.stroke();
		}
	}
});