register({
	title: "Symmetry",
	description: "Restore symmetry",
	category: "Accuracy",
	sideLayout: false,
	drawMode: 1,

	settings:
	{
		distortFeatures: true,
        rotate: false,
		centerLine: true,
		eyeLine: false,
	},
	
	onNext: function()
	{
		return {
			shiftX: Math.random() - 0.5,
			shiftY: Math.random() - 0.5,
            angle: settings.rotate ? Math.random() * Math.PI * 2 : Math.PI * 0.5,
			size: Math.random() * 0.05 + 0.35,
			width: Math.random(),
			chin: Math.random(),
			eyeX: Math.random(),
			eyeY: Math.random(),
			eyeShift: Math.random(),
			eyeSize: Math.random(),
			eyebrowX: Math.random(),
			eyebrowX2: Math.random(),
			eyebrowY: Math.random(),
			eyebrowY2: Math.random(),
			eyebrowAngle: Math.random(),
			tsurime: Math.random(),
			mouthX: Math.random(),
			mouthY: Math.random(),
			mouthY2: Math.random(),
			earX: Math.random(),
			earY: Math.random(),
			earY2: Math.random(),
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
		if (settings.centerLine)
		{
			ctx1.moveTo(c * -question.size, s * -question.size);
			ctx1.lineTo(c * question.size, s * question.size);    
		}
		if (settings.eyeLine)
		{
			var x, y;
			var eyeY = 0;
			var w = question.size * -0.5;

			y = eyeY; x = -w; ctx1.moveTo(c * y + s * x, s * y - c * x);
			y = eyeY; x =  w; ctx1.lineTo(c * y + s * x, s * y - c * x);
		}      
		ctx1.stroke();
  },

	onAnswered: function()
	{
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);
		var projX = clampBetween((s * answer2[0] - c * answer2[1]) * 2 + question.shiftX + 0.5, 0.5, 1.5) - 1;
		var projY = clampBetween((c * answer2[0] + s * answer2[1]) * 2 + question.shiftY, -1, 1);

		updateAverages({ "width": projX, "shift": projY});
	},

    drawFace: function(x1, y1)
    {
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);
        var si = question.size;
		var chin = question.chin * question.chin * 0.075;
		var eyeX = 0.17 + question.eyeX * 0.1;
		var eyeY = 0.34 + question.eyeY * 0.04 + question.eyeSize * 0.025 - chin * 0.5;
		var eyeShift = (question.eyeShift - 0.75) * 0.05;
		var eyeSize = (question.eyeSize - 0.25) * -0.05;
		var eyebrowX = 0.45 + 0.3 * question.eyebrowX * (1.0 - question.eyebrowY * 0.25);
		var eyebrowX2 = 0.05 + 0.2 * question.eyebrowX2 + question.eyebrowY * 0.05;
		var eyebrowY = eyeY + 0.175 + question.eyebrowY * question.eyebrowY * 0.15;
		var eyebrowY2 = eyebrowY + 0.001 + question.eyebrowY2 * 0.02;
		var eyebrowAngle = (question.eyebrowAngle - 0.5) * 0.03;
		var tsurime = (question.tsurime - 0.25) * 0.04;
		var mouthX  = 0.04 + question.mouthX * 0.1;
		var mouthY  = 0.15 + question.mouthY * 0.04 - chin * 0.5;
		var mouthY2 = mouthY + question.mouthY2 * 0.02 - 0.01;
		var earX = question.earX + 0.25;
		var earY = question.earY * 0.1;
		var earY2 = question.earY2 * 0.05;

		if (settings.distortFeatures)
		{			
			chin += y1 * 0.05;
			chin *= Math.abs(x1);
			eyeY += y1 * -0.1;
			eyeSize += y1 * 0.05;
			tsurime += y1 * -0.1;
			eyebrowAngle += y1 * -0.05;
			earY += y1 * 0.1;
			mouthY += y1 * -0.05;
		}
		
		var w = x1 * question.size * (0.725 + question.width * 0.1 + question.chin * 0.01);
		var x, y;

        ctx2.beginPath();
		ctx2.moveTo(c * -si, s * -si);

		y = -si + si * 2 * (0.10 - chin); x = w * (0.50 - question.chin * 0.1); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.25 - chin * 2.0); x = w * (0.75 - question.chin * 0.1); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.30 - chin * 0.8); x = w * 0.80; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.50 - chin * 0.5); x = w * 0.90; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.65 + question.width * 0.05); x = w * 1.00; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * 0.85; x = w * 0.90; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * 0.95; x = w * 0.60; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * 1.00; x = w * 0.20; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		
		ctx2.lineTo(c * si, s * si);

		y = -si + si * 2 * (0.27 - earY); x = w * (0.77 + chin * 0.5 - earY); y += x * y1; ctx2.moveTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.27 - earY); x = w * (0.80 + chin * 0.5 - earY); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.35 + earY2 - earY * 0.75); x = w * (0.9 + earX * 0.17 - earY2 + chin * 0.2); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.4 + earY2 * 0.7 - earY * 0.75); x = w * (0.9 + earX * 0.16); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.45 + earY2 * 0.5 - earY * 0.75); x = w * (0.9 + earX * 0.1); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (0.49 - earY); x = w * (0.90 - earY * 0.5); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);

		y = -si + si * 2 * (eyeY + tsurime + 0.08);  x = w * 0.73; y += x * y1; ctx2.moveTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime + 0.12);  x = w * 0.75; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime + 0.13);  x = w * 0.73; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * -0.5 + 0.125); x = w * (eyeX * 1.1 + 0.07); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * -0.5 + 0.10);  x = w * eyeX; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * -0.5 + 0.105);  x = w * 0.35; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * -0.3 + 0.05 + eyeSize * 0.5);  x = w * (0.33 + eyeShift * 0.25); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + 0.01 + eyeSize);  x = w * (0.40 + eyeShift); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + 0.00 + eyeSize);  x = w * (0.50 + eyeShift * 1.1); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * 0.4 + 0.02 + eyeSize);  x = w * (0.60 + eyeShift); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * 0.4 + 0.09 + eyeSize * 0.25);  x = w * 0.63; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * 0.5 + 0.11);  x = w * 0.60; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime * 0.7 + 0.11);  x = w * (0.60 + eyeX * 0.4); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyeY + tsurime + 0.08);  x = w * 0.73; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);

		y = -si + si * 2 * mouthY;  x = w * mouthX; y += x * y1; ctx2.moveTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * mouthY2; x = w * 0.02;  y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		
		y = -si + si * 2 * (eyebrowY + tsurime * 0.1 + eyebrowAngle); x = w * eyebrowX; y += x * y1; ctx2.moveTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyebrowY + 0.02 - eyebrowAngle); x = w * (eyebrowX2 * (1 - eyebrowY2 * 0.5) + eyebrowX * eyebrowY2 * 0.5); y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyebrowY - 0.01 - eyebrowAngle); x = w * eyebrowX2; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);
		y = -si + si * 2 * (eyebrowY + 0.0 + eyebrowAngle); x = w * eyebrowX; y += x * y1; ctx2.lineTo(c * y + s * x, s * y - c * x);

        ctx2.stroke();
    },

	onDraw: function()
	{    
        var c = Math.cos(question.angle);
        var s = Math.sin(question.angle);

		clear(ctx2);
        ctx2.strokeStyle  = colorNormal
        ctx2.lineWidth = lineWidth(2);
		
		currentTask.drawFace(-1, 0)

		if (hasAnswer2)
		{       
			currentTask.drawFace(1, 0)

			ctx2.strokeStyle  = colorHighlightNormal
		}

		if (hasMouse)
		{
			var projX = clampBetween((s * mouse[0] - c * mouse[1]) * 2 + question.shiftX + 0.5, 0.5, 1.5);
            var projY = clampBetween((c * mouse[0] + s * mouse[1]) * 2 + question.shiftY, -1, 1);

			currentTask.drawFace(projX, projY) 
		}			
	}
});