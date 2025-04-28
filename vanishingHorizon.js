register({
	title: "Vanishing Point III",
	description: "Estimate the convergence to the horizon line in 2 point Perspective",

	category: "Perspective",
	sideLayout: false,
	drawMode: 0,
	
	settings:
	{
	},
	
	onNext: function()
	{
		var y1 =  0.25 + Math.random() * 0.125;
		var y2 = -(0.25 + Math.random() * 0.125);
		var horizon =  Math.random() * 3 - 1.5;

		return {
			y1: y1,
			y2: y2,
			x: Math.random() * 0.25 - 0.125,
			
			horizon: horizon,
			left: -(Math.random() * 3 + 0.25),
			right:  Math.random() * 3 + 0.25,
			offset: (Math.random() - 0.5) * 0.9,
			scale: Math.random() + 0.5
		};
	},

	onQuestion: function()
	{
		clear(ctx1);

		ctx1.strokeStyle  = colorBold
		ctx1.lineWidth = lineWidth(3);
		ctx1.beginPath();
		ctx1.moveTo(question.x, question.y1);
		ctx1.lineTo(question.x, question.y2);
		ctx1.lineTo(question.left, question.horizon);
		ctx1.lineTo(question.x, question.y1);
		ctx1.stroke();
	},

	onAnswered: function()
	{
		var delta = question.horizon - (mouse[1] + question.offset);
		updateAverages({"": delta});
	},

	onDraw: function()
	{
		clear(ctx2);

		ctx2.strokeStyle  = colorNormal
		ctx2.lineWidth = lineWidth(2);
			
		if (hasAnswer2)
		{
			ctx2.beginPath();
			ctx2.moveTo(question.x, question.y1);
			ctx2.lineTo(question.right, question.horizon);
			ctx2.lineTo(question.x, question.y2);
			ctx2.stroke();
			
			if (question.horizon > canvasBottom && question.horizon < canvasTop)
			{
				ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
				ctx2.beginPath();
				ctx2.moveTo(canvasLeft,  question.horizon);
				ctx2.lineTo(canvasRight, question.horizon);
				ctx2.stroke();
				ctx2.setLineDash([]);
			}

			ctx2.strokeStyle  = colorHighlightNormal
		}

		if (hasMouse)
		{
			ctx2.beginPath();
			ctx2.moveTo(question.x, question.y1);
			ctx2.lineTo(question.right, question.horizon + (mouse[1] + question.offset) * question.scale);
			ctx2.lineTo(question.x, question.y2);
			ctx2.stroke();
		}
	}
});