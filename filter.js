register({
	title: "Image Colors II",
	description: "Match color in local images",
	category: "Memory",
	sideLayout: false,
	drawMode: 0,

	settings:
	{
		files: [],
	},
	
	onNext: function()
	{
		if (question && question.isQuestion)
		{
			return {
				isQuestion: false,
				img: question.img,
				hue: question.hue,
				offsetX: question.offsetX,
				offsetY: question.offsetY,
				_fileIndex: question._fileIndex,
			}
		}
		else
		{
			var index = settings.files.length == 0 ? undefined : Math.floor(Math.random() * settings.files.length);
			var img = index == undefined ? undefined : URL.createObjectURL(settings.files[index]);
			return {
				_fileIndex: index,
				isQuestion: true,
				hue: Math.random() < 0.5,
				offsetX: -0.5 + Math.random(),
				offsetY: -0.5 + Math.random(),
				img: img
			}
		}
	},

	onQuestion: function()
	{
		setCanvasRect(canvasLeft, canvasRight, canvasBottom, canvasTop);
		
		var onload = function(img)
		{
			clear(ctx1);
			var ratio = img.width / img.height;
			var left = canvasLeft, bottom = canvasBottom, width = canvasWidth, height = canvasHeight;
			if (ratio < canvasRatio)
			{
				left = -ratio * canvasHeight * 0.5;
				width = ratio * canvasHeight;
			}
			else
			{
				bottom = -0.5 * canvasWidth / ratio;
				height = canvasWidth / ratio;
			}
			
			ctx1.drawImage(img, 0, 0, img.width, img.height, left, bottom, width, height);
			question.loaded = true;
			
			currentTask.onDraw();
		};
		loadImage(question.img, onload);

		clear(ctx2);
	},

	onAnswered: function()
	{	
		if (question.isQuestion)
			next();
		else if (question.img)
		{	
			var sat = clampBetween((mouse[0] + 0.4) / 0.8 - question.offsetX, 0, 1);
			var val = clampBetween((mouse[1] + 0.4) / 0.8 - question.offsetY, 0, 1);
			var colorDelta = question.hue ? (sat - 0.5) * 10 : (sat - 0.25) * 10;
			var valDelta = (val - 0.25) * 10;

			updateAverages({ "color": colorDelta, "contrast": valDelta });
		}
	},

	onDraw: function()
	{	
		var sat = clampBetween((mouse[0] + 0.4) / 0.8 - question.offsetX, 0, 1);
		var val = clampBetween((mouse[1] + 0.4) / 0.8 - question.offsetY, 0, 1);
		
		if (!question.isQuestion && question.loaded)
		{
			ctx2.filter = (question.hue ? "hue-rotate(" + (sat * 90 - 90) + "deg)" : "saturate(" + (sat * 400) + "%)") + " contrast(" + (val * 400) + "%)";
			copyCanvas("#FFFFFF00");			
			ctx2.filter = "none"
		}
		
		if (hasAnswer2)
			ctx2.clearRect(0, canvasBottom, canvasRight, canvasTop - canvasBottom);
	}
});