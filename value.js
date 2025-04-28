register({
	title: "Value I",
	description: "Estimate the value",

	category: "Color",
	sideLayout: true,
	drawMode: 0,
	
	settings:
	{
		changeBackground: true,
		changeBackground2: true,
		_color: false,
		_differentColors: false
	},
	
	onNext: function()
	{
		var color = [Math.random(), settings._color ? Math.random() : 0, Math.random()];

		return {
			color: color,
			color2: settings._differentColors ? [Math.random(), settings._color ? Math.random() : 0, color[2]] : color,

			backColor: [Math.random(), settings._color ? Math.random() : 0, Math.random()],
			backColor2: [Math.random(), settings._color ? Math.random() : 0, Math.random()],
			
			size: 0.1 + Math.random() * 0.8,
			size2: 0.1 + Math.random() * 0.8
		}
	},

	onQuestion: function()
	{
		clear(ctx1);
		ctx1.fillStyle = hsyToColor(settings.changeBackground ? question.backColor : [0, 0, 0.5]);
		ctx1.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
		ctx1.fillStyle = hsyToColor(question.color);
		ctx1.fillRect(-question.size * 0.5, -question.size * 0.5, question.size, question.size);
	},

	onAnswered: function()
	{	
		updateAverages({"": question.color[2] - clampBetween((answer2[0] + 0.4) / 0.8,0,1)});
	},

	onDraw: function()
	{	
		var val = (mouse[0] + 0.4) / 0.8;
		
		clear(ctx2);
		
		ctx2.fillStyle  = hsyToColor(settings.changeBackground2 ? question.backColor2 : [0, 0, 0.5]);
		ctx2.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
		
		ctx2.fillStyle  = hsyToColor([question.color2[0], question.color2[1], val]);
		ctx2.fillRect(-question.size2 * 0.5, -question.size2 * 0.5, question.size2, question.size2);

		if (hasAnswer2)
		{
			ctx2.fillStyle = hsyToColor(settings.changeBackground ? question.backColor : [0, 0, 0.5]);
			ctx2.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, (canvasTop - canvasBottom) * 0.5);
	
			ctx2.fillStyle = hsyToColor([question.color2[0], question.color2[1], val]);
			ctx2.fillRect(0, -question.size2 * 0.5, question.size2 * 0.5, question.size2);
			
			ctx2.fillStyle = hsyToColor(question.color);
			ctx2.fillRect(-question.size2 * 0.5, -question.size2 * 0.5, question.size2 * 0.5, question.size2);
			
			if (settings._differentColors)
			{
				ctx2.fillStyle = hsyToColor([question.color2[0], 0.0, val]);
				ctx2.fillRect(0, -question.size2 * 0.25, question.size2 * 0.25, question.size2 * 0.5);
			
				ctx2.fillStyle = hsyToColor([question.color[0], 0.0, question.color[2]]);
				ctx2.fillRect(-question.size2 * 0.25, -question.size2 * 0.25, question.size2 * 0.25, question.size2 * 0.5);	
			}
			
			ctx2.lineWidth = lineWidth(2);
			ctx2.strokeStyle = colorHighlight;
			ctx2.strokeRect(0, -question.size2 * 0.5, question.size2 * 0.5, question.size2);
		}
	}
},
[
	{
		title: "Value II",		
		settings:
		{
			_color: true,
			_differentColors: false
		}
	},
	{
		title: "Value III",		
		settings:
		{
			_color: true,
			_differentColors: true
		}
	}
]);