register({
	title: "Points",
	description: "Memorize the location of the points",
	category: "Memory",
	sideLayout: false,
	drawModeDeltas: true,
	drawMode: 1,

	settings:
	{
		count: 3,
		centerGuide: false,
		_points: true,
		_lines: false,
	},
	
	onNext: function()
	{
		if (!question)
			question = 
			{
				question: [],
				questions: [],
				isQuestion: false
			};
		
		question._strokes = [];
		question.isQuestion = question.isQuestion && question.questions.length > 0 || question.questions.length >= settings.count;
		
		if (question.isQuestion)
			question.question = question.questions.shift();
		else
		{
			if (settings._points && (!settings._lines || Math.floor(Math.random() * 2) == 0))
				question.questions.push(question.question = [(Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.9]);
			else
			{
				var angle = Math.random() * Math.PI * 2;
				var c = Math.cos(angle) * 0.4;
				var s = Math.sin(angle) * 0.4;
				question.questions.push(question.question = [c, s, angle]);
			}
		}
		
		return question;
	},

	onQuestion: function()
	{
		clear(ctx1);

		if (settings.centerGuide)
		{
			ctx1.strokeStyle = colorLight;
			ctx1.lineWidth = lineWidth(2);
				
			var size = 0.05;
			ctx1.beginPath();
			ctx1.moveTo(-size, -size);
			ctx1.lineTo(size, size);
			ctx1.moveTo(size, -size);
			ctx1.lineTo(-size, size);
			ctx1.stroke();
		}
		
		ctx1.strokeStyle = colorBold;

		if (!question.isQuestion)
		{
			ctx1.lineWidth = lineWidth(3);
		
			ctx1.beginPath();
			if (question.question.length == 2)
			{
				ctx1.arc(question.question[0], question.question[1], lineWidth(10), 0, Math.PI * 2);
				ctx1.stroke();
				
				drawText(ctx1, "" + question.questions.length, question.question[0], question.question[1] + 0.015);
			}
			else
			{
				ctx1.moveTo(-question.question[0], -question.question[1]); 
				ctx1.lineTo(question.question[0], question.question[1]); 
				ctx1.stroke();

				drawText(ctx1, "" + question.questions.length, question.question[0] * (0.42 / 0.4), question.question[1] * (0.42 / 0.4));
			}
		}
	},

	onAnswered: function()
	{
		if (question.isQuestion)
		{
			if (question.question.length == 2)
			{
				if (drawMode)
				{
					var pt = fitPointToDrawing();
					hasAnswer2 = true;
					answer2 = pt;
					mouse = [answer2[0], answer2[1]];
				}
				
				updateAverages({"Pos": dist(question.question, answer2) * 10});
			}
			else
			{
				var angle2 = Math.atan2(mouse[1], mouse[0]);

				if (drawMode)
				{
					var line = fitLineToDrawing();
					hasAnswer1 = hasAnswer2 = true;
					answer1 = line[0];
					answer2 = line[1];
					mouse = [line[1][0], line[1][1]];
					angle2 = Math.atan2(line[1][1] - line[0][1], line[1][0] - line[0][0]);
				}
		
				var angleDelta = (question.question[2] - angle2) / Math.PI * 180;
				angleDelta = (angleDelta + 90 + 360) % 180 - 90;
				updateAverages({"Angle": angleDelta});
			}
		}
		else
			next();
	},

	onDraw: function()
	{      
		clear(ctx2);
		
		if (settings.centerGuide && currentTask.sideLayout)
		{
			ctx2.strokeStyle = colorLight;
			ctx2.lineWidth = lineWidth(2);
				
			var size = 0.05;
			ctx2.beginPath();
			ctx2.moveTo(-size, -size);
			ctx2.lineTo(size, size);
			ctx2.moveTo(size, -size);
			ctx2.lineTo(-size, size);
			ctx2.stroke();
		}
		
		ctx2.strokeStyle = colorBold;
		ctx2.lineWidth = lineWidth(2);

		if (question.isQuestion)
		{
			if (hasAnswer2)
			{
				ctx2.strokeStyle  = colorNormal;
				
				ctx2.beginPath();
				if (question.question.length == 2)
				{
					ctx2.arc(question.question[0], question.question[1], lineWidth(10), 0, Math.PI * 2);
					ctx2.stroke();
					
					drawText(ctx2, "" + (settings.count - question.questions.length), question.question[0], question.question[1] + 0.015);
				}
				else
				{
					ctx2.moveTo(-question.question[0], -question.question[1]); 
					ctx2.lineTo(question.question[0], question.question[1]); 
					ctx2.stroke();

					drawText(ctx2, "" + (settings.count - question.questions.length), question.question[0] * (0.42 / 0.4), question.question[1] * (0.42 / 0.4));
				}
				
				ctx2.strokeStyle  = colorHighlightNormal;
			}
			if (hasMouse || drawMode && hasAnswer2)
			{
				ctx2.beginPath();
				if (question.question.length == 2)
					ctx2.arc(mouse[0], mouse[1], lineWidth(10), 0, Math.PI * 2); 
				else if (drawMode)
				{
					ctx2.moveTo(answer1[0], answer1[1]); 
					ctx2.lineTo(answer2[0], answer2[1]); 	
				}
				else
				{
					var l = 0.4 / lengthVec(mouse);
					ctx2.moveTo(-mouse[0] * l, -mouse[1] * l); 
					ctx2.lineTo(mouse[0] * l, mouse[1] * l); 
				}
				ctx2.stroke();
			}
		}
	}
},[
	{	
		title: "Lines",
		description: "Memorize the angle of the lines",

		settings:
		{
			_points: false,
			_lines: true,
		},
	},
	{	
		title: "Points and Lines",
		description: "Memorize the points and lines",

		settings:
		{
			_points: true,
			_lines: true,
		},
	},
	{	
		title: "Translated Points",
		description: "Memorize the points and transfer them to the other side",
		sideLayout: true,

		settings:
		{
			centerGuide: true
		},
	},
]
);