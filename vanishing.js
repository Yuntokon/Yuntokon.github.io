register({
	title: "Vanishing Point I",
	description: "Estimate the vanishing point",

	category: "Perspective",
	sideLayout: false,
	offsetTouch: true,
	drawModeDeltas: true,
	drawMode: 1,
	
	settings:
	{
		guides: false,
		minLines: 3,
		maxLines: 5,
	},
	
	onNext: function()
	{
		var count = settings.minLines * 2 + Math.floor(Math.random() * (settings.maxLines - settings.minLines)) * 2;
		var angle = Math.random() * Math.PI * 2;
		var dist = Math.random() * 0.25;
		var vPoint = [Math.cos(angle) * dist, Math.sin(angle) * dist];
		var questionLength;
		var points = [];
		
		for (var i = 0; i < count; i += 2)
		{
			points[i] = [Math.random() * 0.6 - 0.3, Math.random() * 0.6 - 0.3];
			var angle = Math.atan2(vPoint[1] - points[i][1], vPoint[0] - points[i][0]);
			var length = Math.random() * 0.3 + 0.1;
			points[i + 1] = [points[i][0] + Math.cos(angle) * -length, points[i][1] + Math.sin(angle) * -length];
		}
		
		return {
			count: count,
			vPoint: vPoint,
			points: points
		};
	},

	onQuestion: function()
	{
		clear(ctx1);

		ctx1.strokeStyle  = colorBold
		ctx1.lineWidth = lineWidth(3);
		ctx1.beginPath();
		for (var i = 0; i < question.count; i += 2)
			drawEdge(ctx1, question.points[i], question.points[i + 1]);
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
		
		updateAverages({"": dist(question.vPoint, answer2)});
	},

	onDraw: function()
	{
		clear(ctx2);

		ctx2.strokeStyle  = colorNormal
		ctx2.lineWidth = lineWidth(2);
			
		if (hasAnswer2)
		{
			ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
			ctx2.beginPath();
			for (var i = 0; i < question.count; i += 2)
				drawEdge(ctx2, question.vPoint, question.points[i]);
			ctx2.stroke();
			ctx2.setLineDash([]);
				
			ctx2.strokeStyle  = colorHighlightNormal
		}

		if (hasMouse || drawMode && hasAnswer2)
		{
			if (settings.guides || hasAnswer2)
			{
				ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
				ctx2.beginPath();
				for (var i = 0; i < question.count; i += 2)
					drawEdge(ctx2, mouse, question.points[i]);
				ctx2.stroke();
				ctx2.setLineDash([]);
			}
			else
			{
				ctx2.beginPath();
				ctx2.arc(mouse[0], mouse[1], lineWidth(5), 0, Math.PI * 2); 
				ctx2.stroke();
			}
		}
	}
});