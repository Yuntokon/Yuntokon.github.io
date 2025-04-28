register({
	title: "Ellipse Axis",
	description: "Align minor axis of the ellipse",
	category: "Perspective",
	sideLayout: false,
	drawMode: 1,

	settings:
	{
	},
	
	onNext: function()
	{
		var width = Math.random() * 0.25 + 0.125;
		
		return {
			angleOff: Math.random() * Math.PI * 2,
			angle: Math.random() * Math.PI * 2,
			width: width,
			degree: Math.random() * width
		};
	},

	onQuestion: function()
	{
		clear(ctx1);
		ctx1.strokeStyle  = colorLight
		ctx1.lineWidth = lineWidth(1);
		ctx1.beginPath();
		var c = Math.cos(question.angle + Math.PI * 0.5) * 0.4;
		var s = Math.sin(question.angle + Math.PI * 0.5) * 0.4;
		ctx1.moveTo(-c, -s);
		ctx1.lineTo( c,  s);
		ctx1.stroke();
	},

	onAnswered: function()
	{
		var angle2 = Math.atan2(mouse[1], mouse[0]) + question.angleOff;

		if (drawMode)
		{
			var ellipse = fitEllipseToDrawing();
			angle2 = ellipse[4];
		}
		
		var angleDelta = (question.angle - angle2) / Math.PI * 180;
		angleDelta = (angleDelta + 90 + 360) % 180 - 90;
		updateAverages({"": angleDelta});
	},

	onDraw: function()
	{      
		clear(ctx2);
		
		if (!hasMouse)
		{
			ctx2.strokeStyle  = colorLight
			ctx2.lineWidth = lineWidth(1);

			var c = Math.cos(question.angle + Math.PI * 0.5);
			var s = Math.sin(question.angle + Math.PI * 0.5);
			
			ctx2.beginPath();
			ctx2.moveTo(c *  question.degree + s * 0.01, s *  question.degree - c * 0.01);
			ctx2.lineTo(c *  question.degree - s * 0.01, s *  question.degree + c * 0.01);
			ctx2.moveTo(c * -question.degree + s * 0.01, s * -question.degree - c * 0.01);
			ctx2.lineTo(c * -question.degree - s * 0.01, s * -question.degree + c * 0.01);
					
			ctx2.moveTo(s *  question.width + c * 0.3, -c *  question.width + s * 0.3);
			ctx2.lineTo(s *  question.width - c * 0.3, -c *  question.width - s * 0.3);
			ctx2.moveTo(s * -question.width + c * 0.3, -c * -question.width + s * 0.3);
			ctx2.lineTo(s * -question.width - c * 0.3, -c * -question.width - s * 0.3);
			ctx2.stroke();
		}
		
		ctx2.strokeStyle  = colorNormal
		ctx2.lineWidth = lineWidth(2);
		
		if (hasAnswer2)
		{
			ctx2.beginPath();
			ctx2.ellipse(0, 0, question.width, question.degree, question.angle, 0, Math.PI * 2);
			ctx2.stroke();
			
			ctx2.strokeStyle  = colorHighlightNormal
			
			if (drawMode)
			{
				var ellipse = fitEllipseToDrawing();
				ctx2.beginPath();
				ctx2.ellipse(ellipse[0], ellipse[1], ellipse[2], ellipse[3], ellipse[4], 0, Math.PI * 2);
				ctx2.stroke();
			}
		}

		if (hasMouse)
		{
			var angle2 = Math.atan2(mouse[1], mouse[0]) + question.angleOff;
			ctx2.beginPath();
			ctx2.ellipse(0, 0, question.width, question.degree, angle2, 0, Math.PI * 2);
			ctx2.stroke();
		}
	}
});