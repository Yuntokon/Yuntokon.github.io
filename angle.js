register({
	title: "Angle I",
	description: "Rotate the line by 90°",
	category: "Accuracy",
	sideLayout: false,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
		angle: 90,
		fixedLength: false
	},

	onNext: function()
	{
		var angle = Math.random() * Math.PI * 2;
		var pos = [(Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4];
		return ({
			angle: angle,
			angle2: angle - settings.angle / 180 * Math.PI,
			pos: pos,
			length: 0.1 + Math.random() * (0.5 - Math.max(Math.abs(pos[0]), Math.abs(pos[1])) - 0.125)
			});
	},
	
	onQuestion: function()
	{
		var x = Math.cos(question.angle);
		var y = Math.sin(question.angle);
		
		clear(ctx1);
		ctx1.strokeStyle = colorBold;
		ctx1.lineWidth = lineWidth(4);
		ctx1.beginPath();
		ctx1.moveTo(question.pos[0], question.pos[1]);
		ctx1.lineTo(question.pos[0] + x * question.length, question.pos[1] + y * question.length);
		ctx1.stroke();
	},

	onAnswered: function()
	{				
		if (drawMode)
		{
			var line = fitLineToDrawing();
			hasAnswer2 = true;
			answer2 =  dist(question.pos, line[0]) < dist(question.pos, line[1]) ? line[1] : line[0];
			mouse = [answer2[0], answer2[1]];
		}

		var angleDelta = (Math.atan2(answer2[1] - question.pos[1], answer2[0] - question.pos[0]) - question.angle2) / Math.PI * 180;
		angleDelta = (angleDelta + 90 + 360) % 180 - 90;
		var lengthDelta = (dist(question.pos, answer2) - question.length) * 10;

		if (!settings.fixedLength || drawMode)
			updateAverages({
				"Angle": angleDelta,
				"Length": lengthDelta});
		else
			updateAverages({
				"Angle": angleDelta });
	},

	onDraw: function()
	{	
		var x0 = mouse[0] - question.pos[0];
		var y0 = mouse[1] - question.pos[1];
		var len = Math.sqrt(x0 * x0 + y0 * y0);
		x0 /= len;
		y0 /= len;
				
		clear(ctx2);
		ctx2.strokeStyle = colorBold;
		ctx2.lineWidth = lineWidth(2);
			
		if (hasAnswer2)
		{
			var x = Math.cos(question.angle);
			var y = Math.sin(question.angle);
		
			var x1 = Math.cos(question.angle2);
			var y1 = Math.sin(question.angle2);
		
			ctx2.lineWidth = lineWidth(4);
			ctx2.beginPath();
			ctx2.moveTo(question.pos[0], question.pos[1]);
			ctx2.lineTo(question.pos[0] + x1 * question.length, question.pos[1] + y1 * question.length);
			ctx2.stroke();
			
			ctx2.lineWidth = lineWidth(2);

			ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
			ctx2.beginPath();
			ctx2.moveTo(question.pos[0] - x * 1.5, question.pos[1] - y * 1.5);
			ctx2.lineTo(question.pos[0] + x * 1.5, question.pos[1] + y * 1.5);
			
			ctx2.moveTo(question.pos[0] - x1 * 1.5, question.pos[1] - y1 * 1.5);
			ctx2.lineTo(question.pos[0] + x1 * 1.5, question.pos[1] + y1 * 1.5);
			ctx2.stroke();
			ctx2.setLineDash([]);
			
			ctx2.strokeStyle  = colorHighlightNormal;
			
			if (hasMouse || drawMode)
			{
				ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
				ctx2.beginPath();
				ctx2.moveTo(question.pos[0] - x0 * 1.5, question.pos[1] - y0 * 1.5);
				ctx2.lineTo(question.pos[0] + x0 * 1.5, question.pos[1] + y0 * 1.5);
				ctx2.stroke();
				ctx2.setLineDash([]);
			}
		}
		
		if (hasMouse || drawMode && hasAnswer2)
		{
			ctx2.beginPath();
			ctx2.moveTo(question.pos[0], question.pos[1]);
			if (settings.fixedLength)
				ctx2.lineTo(question.pos[0] + x0 * question.length, question.pos[1] + y0 * question.length);
			else
				ctx2.lineTo(mouse[0], mouse[1]);
			ctx2.stroke();
		}
		else if (settings.fixedLength)
		{
			ctx2.strokeStyle = colorLight;
			ctx2.lineWidth = lineWidth(1);
			
			ctx2.beginPath();
			ctx2.arc(question.pos[0], question.pos[1], question.length, 0, Math.PI * 2); 
			ctx2.stroke();
		}
		else
		{			
			ctx2.beginPath();
			ctx2.arc(question.pos[0], question.pos[1], lineWidth(5), 0, Math.PI * 2); 
			ctx2.stroke();
		}
	}
});