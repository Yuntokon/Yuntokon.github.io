register({
	title: "Division",
	description: "Estimate the given head size / division",
	category: "Accuracy",
	sideLayout: false,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
        rotate: true,
        drawFigure: true,
        minDivisions: 2,
        maxDivision: 10,
        divisionSteps: 2,
	},
	
	onNext: function()
	{
		return {
            divs: settings.minDivisions + Math.floor(Math.random() * (settings.maxDivision - settings.minDivisions) * settings.divisionSteps) / settings.divisionSteps,
            angle: settings.rotate ? Math.random() * Math.PI * 2 : Math.PI * 0.5,
			size: Math.random() * 0.05 + 0.35,
		};
	},
	
	onQuestion: function()
	{
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);

		clear(ctx1);
        ctx1.strokeStyle  = colorLight
        ctx1.lineWidth = lineWidth(1);

		ctx1.beginPath();
		ctx1.moveTo(c * -question.size, s * -question.size);
        ctx1.lineTo(c * question.size, s * question.size);    
        ctx1.moveTo(c * -question.size + s * 0.01, s * -question.size - c * 0.01);
        ctx1.lineTo(c * -question.size + s * -0.01, s * -question.size - c * -0.01);      
		ctx1.stroke();

        ctx1.strokeStyle  = colorBold
		ctx1.lineWidth = lineWidth(3);
        
        ctx1.beginPath();
        ctx1.moveTo(c * question.size + s * 0.0075, s * question.size - c * 0.0075);
        ctx1.lineTo(c * question.size + s * -0.0075, s * question.size - c * -0.0075);         
		ctx1.stroke();

        drawText(ctx1, "" + question.divs, c * (question.size + 0.05), s * (question.size + 0.05));
  },

	onAnswered: function()
	{
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);
		var proj = c * answer2[0] + s * answer2[1];

		if (drawMode)
		{
			var projection = fitProjectionToDrawing(0, 0, c, s);
			proj = projection[3];
			mouse = [projection[0], projection[1]];
		}
		
        var div = -question.size + question.size * 2 * (1 - 1.0 / question.divs);

		updateAverages({"": proj - div});
	},

    drawFigure: function(headSize)
    {
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);
        var si = question.size;
        
        ctx2.beginPath();
        for (var i = -1; i <= 1; i += 2)
        {
            var w1 = si * 2 * (0.08 + 0.07 * Math.sqrt(headSize));
            var w3 = si * 2 * (0.14 - 0.06 * (headSize));
            var w2 = si * 2 * (headSize * headSize * 0.5 + headSize * 0.3);
            ctx2.moveTo(c * question.size, s * question.size);
            
            var x, y;
            y = -si + si * 2 * (1 - headSize * 0.02); x = i * w2 * 0.50; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize * 0.10); x = i * w2 * 0.90; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize * 0.25); x = i * w2 * 1.00; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize * 0.75); x = i * w2 * 0.90; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize * 0.90); x = i * w2 * 0.75; ctx2.lineTo(c * y + s * x, s * y - c * x);

            y = -si + si * 2 * (1 - headSize * 1.00); x = i * w2 * 0.55;
            ctx2.lineTo(c * y + s * x, s * y - c * x); 
            ctx2.lineTo(c * y, s * y);             
            y = -si + si * 2 * (1 - headSize) * 0.98; x = i * w1 * 0.25;
            ctx2.moveTo(c * y , s * y);             
            ctx2.lineTo(c * y + s * x, s * y - c * x);
            
            y = -si + si * 2 * (1 - headSize) * 0.95; x = i * w3 * 0.95; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize) * 0.52; x = i * w1 * 1.00; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize) * 0.47; x = i * w1 * 0.65; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize) * 0.00; x = i * w1 * 0.50; ctx2.lineTo(c * y + s * x, s * y - c * x);
            y = -si + si * 2 * (1 - headSize) * 0.00; x = i * w1 * 0.00; ctx2.lineTo(c * y + s * x, s * y - c * x);
        }                
        ctx2.stroke();
    },

	onDraw: function()
	{    
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);

		clear(ctx2);
        ctx2.strokeStyle  = colorNormal
        ctx2.lineWidth = lineWidth(2);
		
		if (hasAnswer2)
		{       
            ctx2.beginPath();
            for (var i = 1; i <= question.divs; ++i)
            {
                var l = question.size - question.size * 2 * i / question.divs;
                var w = i == 1 ? 0.025 : 0.01;
                ctx2.moveTo(c * l + s * w,  s * l - c * w);
                ctx2.lineTo(c * l + s * -w, s * l - c * -w);       
            }
            ctx2.stroke();
            
            if (settings.drawFigure)
                currentTask.drawFigure(1 / question.divs)
		
			ctx2.strokeStyle  = colorHighlightNormal
		}

		if (hasMouse || drawMode && hasAnswer2)
		{
            var proj = clampBetween(c * mouse[0] + s * mouse[1], -question.size + 0.001, question.size - 0.001);
            
            if (settings.drawFigure)
                currentTask.drawFigure((question.size - proj) / question.size / 2)
            else
            {
                ctx2.beginPath();
                ctx2.moveTo(c * proj + s * 0.075,  s * proj - c * 0.075);
                ctx2.lineTo(c * proj + s * -0.075, s * proj - c * -0.075);              
                ctx2.stroke();
            }        
		}
	}
});