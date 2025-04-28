register({
	title: "Midpoint I",
	description: "Estimate the 3D midpoint",

	category: "Perspective",
	sideLayout: false,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
		_errorRange: 0.005,
		maxIntersecs: 4,
	},
	
	onNext: function()
	{
		var intersecs = 2 + Math.floor(Math.random() * (settings.maxIntersecs - 2));
		var r = Math.random();
		
		return {
			intersecs: intersecs,
			question: 1 + Math.floor(Math.random() * (intersecs - 2)),
			horizon: Math.random(),
			height: 0.05 + 0.95 * r * r
		};
	},

	onQuestion: function()
	{
		setCanvasRect(-0.1, 1.1, -0.1, 1.1);

		clear(ctx1);	
		ctx1.strokeStyle = colorBold
		ctx1.lineWidth = lineWidth(3);
		ctx1.beginPath();
		ctx1.moveTo(0, 0);
		ctx1.lineTo(0, 1);
		ctx1.moveTo(1, currentTask.y1(1));
		ctx1.lineTo(1, currentTask.y2(1));
		for (var t = 1; t < question.intersecs; ++t)
		{
			if (t != question.question)
			{
				var t1 = (1 - question.intersecs / t) / (1 - question.height - question.intersecs / t);	
				ctx1.moveTo(t1, currentTask.y1(t1));
				ctx1.lineTo(t1, currentTask.y2(t1)); 
			}
		}
		ctx1.stroke();
		
		ctx1.strokeStyle  = colorNormal
		ctx1.lineWidth = lineWidth(2);
		ctx1.setLineDash([lineWidth(2), lineWidth(10)]);

		ctx1.beginPath();
		ctx1.moveTo(canvasLeft, question.horizon); 
		ctx1.lineTo(canvasRight, question.horizon); 
		ctx1.stroke();
		ctx1.setLineDash([]);
	},

	onAnswered: function()
	{
		if (drawMode)
		{
			var line = fitLineToDrawing();
			hasAnswer1 = hasAnswer2 = true;
			answer2 = [(line[0][0] + line[1][0]) * 0.5, (line[0][1] + line[1][1]) * 0.5];
			mouse = [answer2[0], answer2[1]];
		}
		
		var solution = (1 - question.intersecs / (question.question)) / (1 - question.height - question.intersecs / (question.question));
		var l = (1 - question.intersecs / (question.question) - settings._errorRange) / (1 - question.height - question.intersecs / (question.question));
		var r = (1 - question.intersecs / (question.question) + settings._errorRange) / (1 - question.height - question.intersecs / (question.question));
		var delta = (clampBetween(answer2[0], 0, 1) - solution) / (l - r);
		updateAverages({"": delta});
	},

	y1: function(x)
	{
		return question.horizon - (1 - x * (1 - question.height)) * question.horizon;
	},

	y2: function(x)
	{
		return question.horizon + (1 - x * (1 - question.height)) * (1 - question.horizon);
	},

	onDraw: function()
	{
		clear(ctx2);	
		ctx2.strokeStyle  = colorNormal
		ctx2.lineWidth = lineWidth(2);

		if (hasAnswer2)
		{
			var solution = (1 - question.intersecs / (question.question)) / (1 - question.height - question.intersecs / (question.question));

			ctx2.beginPath();
			ctx2.moveTo(solution, currentTask.y1(solution));
			ctx2.lineTo(solution, currentTask.y2(solution)); 
			ctx2.stroke();

			ctx2.lineWidth = lineWidth(1.5);
			ctx2.beginPath();
			
			ctx2.moveTo(0, 0);
			ctx2.lineTo(1, question.horizon - question.height * question.horizon); 
			ctx2.moveTo(0, 1); 
			ctx2.lineTo(1, question.horizon + question.height * (1 - question.horizon)); 
			ctx2.moveTo(0, 0.5); 
			ctx2.lineTo(1, question.horizon + question.height * 0.5 * (1 - 2 * question.horizon)); 
			
			var t1 = 1;	
			var t2 = (1.0 - question.intersecs / 1) / (1 - question.height - question.intersecs / 1);	
			for (var t = 2; t <= question.intersecs; ++t)
			{
				var t3 = (1.0 - question.intersecs / t) / (1 - question.height - question.intersecs / t);	
				ctx2.moveTo(t1, currentTask.y1(t1));
				ctx2.lineTo(t3, currentTask.y2(t3));
				if (t == question + 1)
				{
					ctx2.moveTo(t3, currentTask.y1(t3));
					ctx2.lineTo(t1, currentTask.y2(t1));
				}
				t1 = t2;
				t2 = t3;
			}

			ctx2.stroke();
			
			/*
			ctx2.fillStyle  = colorHighlightNormal;
			var l = (1 - question.intersecs / question.question - settings._errorRange) / (1 - question.height - question.intersecs / question.question);
			var r = (1 - question.intersecs / question.question + settings._errorRange) / (1 - question.height - question.intersecs / question.question);
			ctx2.beginPath();
			ctx2.moveTo(l, currentTask.y2(l));
			ctx2.lineTo(r, currentTask.y2(r));
			ctx2.lineTo(r, currentTask.y1(r));
			ctx2.lineTo(l, currentTask.y1(l));
			ctx2.lineTo(l, currentTask.y2(l));
			ctx2.fill();
			*/
			
			ctx2.strokeStyle  = colorHighlight;
		}
		else
		{
			ctx2.beginPath();
			ctx2.moveTo(0, 0);
			ctx2.lineTo(1, currentTask.y1(1));
			ctx2.moveTo(0, 1); 
			ctx2.lineTo(1, currentTask.y2(1)); 
			ctx2.stroke();
		}
		
		if (hasMouse || drawMode && hasAnswer2)
		{
			var t = clampBetween(mouse[0], 0, 1);
			ctx2.beginPath();
			ctx2.moveTo(t, currentTask.y1(t));
			ctx2.lineTo(t, currentTask.y2(t)); 
			ctx2.stroke();
		}
	}
});