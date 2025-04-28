register({
	title: "Vanishing Point II",
	description: "Estimate the direction to the vanishing point",

	category: "Perspective",
	sideLayout: false,
	drawModeDeltas: true,
	drawMode: 1,
	
	settings:
	{
		fixedLength: true,
		minLines: 4,
		maxLines: 6,
	},
	
	onNext: function()
	{
		var count = settings.minLines * 2 + Math.floor(Math.random() * (settings.maxLines - settings.minLines)) * 2;
		var angle = Math.random() * Math.PI * 2;
		var dist = 0.4 + Math.random() * 1;
		var vPoint = [Math.cos(angle) * dist, Math.sin(angle) * dist];
		var questionLength;
		var points = [];
		
		for (var i = 0; i < count; i += 2)
		{
			points[i] = [Math.random() * 0.6 - 0.3, Math.random() * 0.6 - 0.3];
			var angle = Math.atan2(vPoint[1] - points[i][1], vPoint[0] - points[i][0]);
			var length = Math.random() * 0.3 + 0.1;
			if (i == 0)
				questionLength = length;
			points[i + 1] = [points[i][0] + Math.cos(angle) * length, points[i][1] + Math.sin(angle) * length];
		}
		
		return {
			length: questionLength,
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
		for (var i = 2; i < question.count; i += 2)
			drawEdge(ctx1, question.points[i], question.points[i + 1]);
		ctx1.stroke();
	},

	onAnswered: function()
	{
		var length = dist(question.points[0], answer2);
		var angle = Math.atan2(answer2[1] - question.points[0][1], answer2[0] - question.points[0][0]);
		
		if (drawMode)
		{
			var line = fitLineToDrawing();
			hasAnswer1 = hasAnswer2 = true;
			answer1 = line[0];
			answer2 = line[1];
			
			length = dist(answer1, answer2);
			angle = Math.atan2(answer2[1] - answer1[1], answer2[0] - answer1[0]);
		}
		
		var angleSolution = Math.atan2(question.vPoint[1] - question.points[0][1], question.vPoint[0] - question.points[0][0]);
		
		var angleDelta = (angle - angleSolution) / Math.PI * 180;
		if (Math.abs(angleDelta) > 90)
			length = -length;
		angleDelta = (angleDelta + 90 + 360) % 180 - 90;
		
		if (!settings.fixedLength || drawMode)
			question.points[1] = [question.points[0][0] + Math.cos(angleSolution) * length, question.points[0][1] + Math.sin(angleSolution) * length];
		updateAverages({"Angle": angleDelta});
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
				drawEdge(ctx2, question.vPoint, question.points[i + 1]);
			ctx2.stroke();
			ctx2.setLineDash([]);
				
			ctx2.beginPath();
			drawEdge(ctx2, question.points[0], question.points[1]);
			ctx2.stroke();

			ctx2.strokeStyle  = colorHighlightNormal
		}

		if (hasMouse)
		{
			var point = mouse;
			if (settings.fixedLength)
				point = addVec(question.points[0], mulVec(normalizeVec(subVec(point, question.points[0])), question.length));
		
			ctx2.beginPath();
			drawEdge(ctx2, question.points[0], point);
			ctx2.stroke();
		}
		else if (!hasAnswer2)
		{
			ctx2.beginPath();
			ctx2.arc(question.points[0][0], question.points[0][1], lineWidth(5), 0, Math.PI * 2); 
			ctx2.stroke();
		}
		else if (drawMode)
		{
			ctx2.beginPath();
			drawEdge(ctx2, answer1, answer2);
			ctx2.stroke();
		}
	}
});