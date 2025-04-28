register({
	title: "Color picker",
	description: "Match color in local images",
	category: "Color",
	sideLayout: false,
	drawMode: 0,

	settings:
	{
		_memory: false,
		files: [],
	},
	
	onNext: function()
	{
		if (settings._memory && question && question.img && question.isQuestion)
		{
			return {
				isQuestion: false,
				normX: question.normX,
				normY: question.normY,
				r: question.r,
				g: question.g,
				b: question.b,
				imgData: question.imgData,
				imgColor: question.imgColor,
				img: question.img,
				_fileIndex: question._fileIndex
			}
		}
		else
		{
			var index = settings.files.length == 0 ? undefined : Math.floor(Math.random() * settings.files.length);
			var img = index == undefined ? undefined : URL.createObjectURL(settings.files[index]);
			return {
				_fileIndex: index,
				isQuestion: true,
				normX: NaN,
				normY: NaN,
				imgData: undefined,
				imgColor: [0, 0, 0],
				img: img
			}
		}
	},

	onQuestion: function()
	{
		showColorpicker(question.isQuestion != settings._memory);
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
			
			ctx1.fillStyle = "#FFFFFFFF";
			ctx1.fillRect(left, bottom, width, height);
			ctx1.drawImage(img, 0, 0, img.width, img.height, left, bottom, width, height);
			
			if (isNaN(question.normX))
			{
				var x, y, r = 0, g = 0, b = 0;
				for (var t = 0; t < 50; ++t)
				{
					r = 0, g = 0, b = 0
					x = 15 + Math.floor(Math.random() * (canvas1.width - 30));
					y = 15 + Math.floor(Math.random() * (canvas1.height - 30));
					var p = ctx1.getImageData(x - 2, y - 2, 4, 4).data;
					for (var i = 0; i < 16; ++i)
					{
						r += p[i * 4 + 0] / 16;
						g += p[i * 4 + 1] / 16;
						b += p[i * 4 + 2] / 16;
					}
					
					if (r > 1 && r < 254 || g > 1 && g < 254 || b > 1 && b < 254)
						break;
				}

				var imgColorRGB = [r / 255.0, g / 255.0, b / 255.0];
				question.r = r;
				question.g = g;
				question.b = b;
				question.imgColor = RGBToHSY709(...imgColorRGB);
				question.normX = (x / canvas1.width * canvasWidth + canvasLeft - left) / width;
				question.normY = (y / canvas1.height * canvasHeight + canvasBottom - bottom) / height;
			}
			question.x = question.normX * width + left;
			question.y = question.normY * height + bottom;

			ctx1.lineWidth = lineWidth(1);
			ctx1.strokeStyle = "#FFFFFFA0";
			ctx1.globalCompositeOperation = "difference";

			ctx1.beginPath();
			ctx1.moveTo(question.x, question.y);
			ctx1.lineTo(question.x, canvasTop);
			ctx1.moveTo(question.x, question.y);
			ctx1.lineTo(question.x, canvasBottom);
			ctx1.moveTo(question.x, question.y);
			ctx1.lineTo(canvasLeft, question.y);
			ctx1.moveTo(question.x, question.y);
			ctx1.lineTo(canvasRight, question.y);
			ctx1.stroke();

			var w = lineWidth(20)
			var w2 = lineWidth(30)
			
			ctx1.globalCompositeOperation = "normal";
			ctx1.fillStyle = "rgb(128, 128, 128)";
			ctx1.fillRect(question.x - w2, question.y - w2, w2 * 2, w2 * 2);
			ctx1.fillStyle = "rgb(" + question.r+", "+question.g+", "+question.b+")";
			ctx1.fillRect(question.x - w, question.y - w, w * 2, w * 2);
			
			if (!question.isQuestion)
			{
				var imgData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
				for (i = 0; i < imgData.data.length; i += 4)
				{
					var val = imgData.data[i] * Rec709[0] + imgData.data[i + 1] * Rec709[1] + imgData.data[i + 2] * Rec709[2];

					imgData.data[i] = val;
					imgData.data[i + 1] = val;
					imgData.data[i + 2] = val;
				}
				question.imgData = imgData;
			}
		};
		loadImage(question.img, onload);

		clear(ctx2);
	},

	onAnswered: function()
	{	
		if (settings._memory && question.isQuestion)
			next();
		else
		{
			if (question.img)
				showColorDiff(question.imgColor);
		}
	},

	onDraw: function()
	{	
		clear(ctx2);
		
		if (!hasAnswer2 && question.imgData)
			ctx2.putImageData(question.imgData, 0, 0);
		
		if (hasAnswer2)
		{
			clear(ctx2);
			var x = question.x;
			var y = question.y;
			var w = lineWidth(20)			
			ctx2.fillStyle = rgbToColor(HSY709ToRGB(...answerColor))
			ctx2.fillRect(x, y - w, w, w * 2);
		}
		
		if (!question.img)
			selectImageText(ctx2);
	}
},
[
	{
		title: "Image Colors I",	
		category: "Memory",
		description: "Memorize and match color in local images",
		settings:
		{
			_memory: true
		}
	}
]);