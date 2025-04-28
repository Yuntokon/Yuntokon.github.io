register({
	title: "Angle II",
	description: "Estimate the angle and length of the line",
	category: "Accuracy",
	sideLayout: true,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
		mirror: false,
		fixedPosition: true
	},

	onNext: function()
	{
		var pos = [(Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4];
		return ({
			angle: Math.random() * Math.PI,
			pos: pos,
			length: 0.2 + Math.random() * (0.5 - Math.max(Math.abs(pos[0]), Math.abs(pos[1])) - 0.125) * 2 
			});
	},
	
	onQuestion: function()
	{
		var x = Math.cos(question.angle);
		var y = Math.sin(question.angle);
		var question1 = [question.pos[0] - x * question.length * 0.5, question.pos[1] - y * question.length * 0.5];
		var question2 = [question.pos[0] + x * question.length * 0.5, question.pos[1] + y * question.length * 0.5];
		
		if (settings.mirror)
			ctx1.scale(-1, 1);

		clear(ctx1);
		ctx1.strokeStyle  = colorBold;
		ctx1.lineWidth = lineWidth(4);
		ctx1.beginPath();
		ctx1.moveTo(question1[0], question1[1]);
		ctx1.lineTo(question2[0], question2[1]);
		ctx1.stroke();
		
		if (hasAnswer2)
		{
			ctx1.strokeStyle  = colorNormal
			ctx1.lineWidth = lineWidth(2);

			ctx1.setLineDash([lineWidth(2), lineWidth(10)]);	
			ctx1.beginPath();
			ctx1.moveTo(question.pos[0] - x * 1.5, question.pos[1] - y * 1.5);
			ctx1.lineTo(question.pos[0] + x * 1.5, question.pos[1] + y * 1.5);
			ctx1.stroke();
			ctx1.setLineDash([]);
		}
		
		if (settings.mirror)
			ctx1.scale(-1, 1);
	},

	onAnswered: function()
	{				
		if (drawMode)
		{
			var line = fitLineToDrawing();
			hasAnswer1 = hasAnswer2 = true;
			answer1 = line[0];
			answer2 = line[1];
			mouse = [line[1][0], line[1][1]];
		}
	
		if (settings.mirror)
			ctx1.scale(-1, 1);

		var x = Math.cos(question.angle);
		var y = Math.sin(question.angle);
		ctx1.strokeStyle  = colorNormal
		ctx1.lineWidth = lineWidth(2);

		ctx1.setLineDash([lineWidth(2), lineWidth(10)]);	
		ctx1.beginPath();
		ctx1.moveTo(question.pos[0] - x * 1.5, question.pos[1] - y * 1.5);
		ctx1.lineTo(question.pos[0] + x * 1.5, question.pos[1] + y * 1.5);
		ctx1.stroke();
		ctx1.setLineDash([]);
		
		var angleDelta = (Math.atan2(answer2[1] - answer1[1], answer2[0] - answer1[0]) - question.angle) / Math.PI * 180;
		angleDelta = (angleDelta + 90 + 360) % 180 - 90;
		var lengthDelta = (dist(answer1, answer2) - question.length) * 10;
		var xDelta = ((answer1[0] + answer2[0]) * 0.5 - question.pos[0]) * 10;
		var yDelta = -((answer1[1] + answer2[1]) * 0.5 - question.pos[1]) * 10;
		
		if (!settings.fixedPosition || drawMode)
			updateAverages({
				"Angle": angleDelta,
				"Length": lengthDelta,
				"X": xDelta,
				"Y": yDelta });
		else
			updateAverages({
				"Angle": angleDelta,
				"Length": lengthDelta });
				
		if (settings.mirror)
			ctx1.scale(-1, 1);
	},

	onDraw: function()
	{
		if (settings.fixedPosition && hasMouse)
		{
			hasAnswer1 = true;
			answer1 = [question.pos[0] + (question.pos[0] - mouse[0]), question.pos[1] + (question.pos[1] - mouse[1])];
		}
				
		clear(ctx2);
		ctx2.strokeStyle = colorBold;
		ctx2.lineWidth = lineWidth(2);
			
		if (hasAnswer2)
		{
			if (settings.mirror)
				ctx2.scale(-1, 1);

			copyCanvas("#FFFFFFE0");			
			ctx2.strokeStyle  = colorHighlightNormal;
			
			if (settings.mirror)
				ctx2.scale(-1, 1);

			if (hasMouse || drawMode)
			{
				var x = answer1[0] - mouse[0];
				var y = answer1[1] - mouse[1];
				var len = Math.sqrt(x * x + y * y);
				x /= len;
				y /= len;

				ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
				ctx2.beginPath();
				ctx2.moveTo(answer1[0] - x * 1.5, answer1[1] - y * 1.5);
				ctx2.lineTo(mouse[0] + x * 1.5, mouse[1] + y * 1.5);
				ctx2.stroke();
				ctx2.setLineDash([]);
			}
		}
		
		if (hasAnswer1)
		{
			ctx2.beginPath();
			ctx2.moveTo(answer1[0], answer1[1]);
			ctx2.lineTo(mouse[0], mouse[1]);
			ctx2.stroke();
		}
	}
});