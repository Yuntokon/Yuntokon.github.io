register({
	title: "Bounding Box",
	description: "Estimate the bounding box of the figure",
	category: "Accuracy",
	sideLayout: true,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
		fixedPosition: true,
		fixedHeight: true
	},

onNext: function()
	{
		var points = [];
		var count = 3 + Math.floor(Math.random() * 5);
		var pos = [0, 0];
		var width  = 0.2 + Math.random() * 0.75;
		var height = 0.2 + Math.random() * 0.75;

		var minX = +Infinity, minY = +Infinity, maxX = -Infinity, maxY = -Infinity;
		for (var i = 0; i < count; ++i)
		{
			var x = pos[0] + (Math.random() * 0.25 + 0.2) * Math.sign(Math.random() - 0.5) * width;
			var y = pos[1] + (Math.random() * 0.25 + 0.2) * Math.sign(Math.random() - 0.5) * height;
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
			points[i] = [x, y, Math.atan2(y - pos[1], x - pos[0])];
		}
		
		width = maxX - minX;
		height = maxY - minY;
		//if (!settings.fixedPosition)
			//pos = [0.025 + Math.random() * (0.95 - width) + width * 0.5, 0.025 + Math.random() * (0.95 - height) + height * 0.5];

		for (var i = 0; i < count; ++i)
			points[i] = [points[i][0] + pos[0] - minX - width * 0.5, points[i][1] + pos[1] - minY - height * 0.5, points[i][2]];
		
		points.sort(function comp(a, b)
			{
				return a[2] - b[2];
			});	
			
		return {
			pos : pos,
			points: points,
			
			width: width,
			height: height,
			count: count
		};
	},

	onQuestion: function()
	{
		clear(ctx1);
		ctx1.strokeStyle  = colorBold;
		ctx1.lineWidth = lineWidth(4);
		ctx1.beginPath();
		ctx1.moveTo(question.points[0][0], question.points[0][1]);
		for (var i = 1; i <= question.count; ++i)
			ctx1.lineTo(question.points[i % question.count][0], question.points[i % question.count][1]);
		ctx1.stroke();
	},

	onAnswered: function()
	{	
		if (drawMode)
		{
			var rect = fitRectToDrawing();
			hasAnswer1 = hasAnswer2 = true;
			answer1 = [rect[0], rect[1]];
			answer2 = [rect[2], rect[3]];
			mouse = [rect[2], rect[3]];
		}
	
		var widthDelta = question.width - (answer2[0] - answer1[0]);
		var	heightDelta = question.height - (answer2[1] - answer1[1]);
		var xDelta = ((answer1[0] + answer2[0]) * 0.5 - question.pos[0]) * 10;
		var yDelta = -((answer1[1] + answer2[1]) * 0.5 - question.pos[1]) * 10;
		
		if (!settings.fixedPosition || drawMode)
			updateAverages({
				"Width": widthDelta,
				"Height": heightDelta,
				"X": xDelta,
				"Y": yDelta });
		else if (settings.fixedHeight)
			updateAverages({"": widthDelta });
		else
			updateAverages({
				"Width": widthDelta,
				"Height": heightDelta });
	},

	onDraw: function()
	{
		if (settings.fixedPosition && hasMouse)
		{
			answer1 = [question.pos[0] + (question.pos[0] - mouse[0]), question.pos[1] + (question.pos[1] - mouse[1])];
			hasAnswer1 = true;
			if (settings.fixedHeight)
			{
				answer1[1] = question.pos[1] - question.height * 0.5;
				  mouse[1] = question.pos[1] + question.height * 0.5;
			}
		}
				
		clear(ctx2);
		ctx2.strokeStyle  = colorBold;
		ctx2.lineWidth = lineWidth(2);

		if (hasAnswer2)
		{
			ctx1.strokeStyle  = colorNormal;
			ctx1.lineWidth = lineWidth(2);
			ctx1.beginPath();
			ctx1.moveTo(question.pos[0] - question.width * 0.5, question.pos[1] - question.height * 0.5);
			ctx1.lineTo(question.pos[0] + question.width * 0.5, question.pos[1] - question.height * 0.5);
			ctx1.lineTo(question.pos[0] + question.width * 0.5, question.pos[1] + question.height * 0.5);
			ctx1.lineTo(question.pos[0] - question.width * 0.5, question.pos[1] + question.height * 0.5);
			ctx1.lineTo(question.pos[0] - question.width * 0.5, question.pos[1] - question.height * 0.5);
			ctx1.stroke();
			copyCanvas("#FFFFFFE0");			
			
			ctx2.beginPath();
			ctx2.moveTo(question.pos[0] - question.width * 0.5, question.pos[1] - question.height * 0.5);
			ctx2.lineTo(question.pos[0] + question.width * 0.5, question.pos[1] - question.height * 0.5);
			ctx2.lineTo(question.pos[0] + question.width * 0.5, question.pos[1] + question.height * 0.5);
			ctx2.lineTo(question.pos[0] - question.width * 0.5, question.pos[1] + question.height * 0.5);
			ctx2.lineTo(question.pos[0] - question.width * 0.5, question.pos[1] - question.height * 0.5);
			ctx2.stroke();
			
			ctx2.strokeStyle  = colorHighlightNormal;
		}
		
		if (hasAnswer1)
		{
			ctx2.beginPath();
			ctx2.moveTo(answer1[0], answer1[1]);
			ctx2.lineTo(mouse[0], answer1[1]);
			ctx2.lineTo(mouse[0], mouse[1]);
			ctx2.lineTo(answer1[0], mouse[1]);
			ctx2.lineTo(answer1[0], answer1[1]);
			ctx2.stroke();
		}
	}
});