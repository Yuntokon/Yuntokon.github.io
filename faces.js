register({
	title: "The other eye",
	description: "Complete the face",
	category: "Croquis",
	sideLayout: false,
	drawMode: 2,

	settings:
	{
		zoomIntoFaces: true,
		opacity: 255,
		blur: 0,
		files: [],
	},
	
	onNext: function()
	{
		var index = settings.files.length == 0 ? undefined : Math.floor(Math.random() * settings.files.length);
		return {
			_fileIndex: index,
			eyeRects: [],
			img: index == undefined ? undefined : URL.createObjectURL(settings.files[index])
		}
	},

	onQuestion: function()
	{
		question.imgX = question.imgY = question.imgWidth = question.imgHeight = undefined
		setCanvasRect(canvasLeft, canvasRight, canvasBottom, canvasTop);

		var onload = function(img)
		{
			clear(ctx1);
			var minX = 0, minY = 0, maxX = 1, maxY = 1;

			if (question.minX != undefined)
			{
				minX = question.minX;
				minY = question.minY;
				maxX = question.maxX;
				maxY = question.maxY;
			}
			else
			{
				if (img.width > img.height)
				{
					tmpCanvas.height = Math.min(img.height / 2, 1000);
					tmpCanvas.width = tmpCanvas.height / img.height * img.width;
				}
				else
				{
					tmpCanvas.width = Math.min(img.width / 2, 1000);
					tmpCanvas.height = tmpCanvas.width / img.width * img.height;
				}
				tmpCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, tmpCanvas.width, tmpCanvas.height);
						
				var minX = tmpCanvas.width, maxX = 0.0, minY = tmpCanvas.height, maxY = 0.0;
						
				if (!opencvReady)
				{
					clear(ctx1);
					ctx1.textAlign = "center";
					ctx1.font = 0.04 + "px cursive";
					ctx1.fillStyle = colorLight;
					ctx1.fillText("OpenCV loading...", 0, 0);
					return;
				}
				try 
				{
					let src = cv.imread(tmpCanvas);
					let gray = new cv.Mat();
					cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
					
					var eyeCascade;
					if (window.eyeCascade)
						eyeCascade = window.eyeCascade;
					else
					{
						eyeCascade = new cv.CascadeClassifier();
						eyeCascade.load("anime-eyes-cascade.xml");
						window.eyeCascade = eyeCascade;
					}

					let msize = new cv.Size(0, 0);		
					let eyes = new cv.RectVector();
					
					eyeCascade.detectMultiScale(gray, eyes, 1.1, 10, cv.CASCADE_SCALE_IMAGE, msize, msize);			
									
					question.eyeRects = []
					for (let i = 0; i < eyes.size(); ++i) {
						//let roiSrc = src.roi(eyes.get(i));
						var x = eyes.get(i).x;
						var y = eyes.get(i).y;
						var width = eyes.get(i).width;
						var height = eyes.get(i).height;
								
						minX = Math.min(minX, x);
						minY = Math.min(minY, y);
						maxX = Math.max(maxX, x + width);
						maxY = Math.max(maxY, y + height);

						x -= width * 0.125;
						width *= 1.25;
							
						var rgb = [0, 0, 0];
						var maxVal = 0;
						for (var n = 0; n < 2; ++n)
							for (var j = 0; j < 3; ++j)
							{
								let k = (y + height * n) * src.cols * 4 +  Math.floor(x + width * (0.325 + j / 2 * 0.25)) * 4
								let r = src.data[k + 0] / 255, g = src.data[k + 1] / 255, b = src.data[k + 2] / 255;
								let val = r * Rec709[0] + g * Rec709[1] + b * Rec709[2];

								if (val > maxVal)
								{
									rgb[0] = r;
									rgb[1] = g;
									rgb[2] = b;
									maxVal = val;
								}
							}
				
						y -= height * 0.0625;
						height *= 1.125;
						
						question.eyeRects.push([x / tmpCanvas.width, y / tmpCanvas.height, width / tmpCanvas.width, height / tmpCanvas.height, rgb]);
						//roiSrc.delete();
					}
			
					src.delete();
					gray.delete();
					//eyeCascade.delete();
					eyes.delete();			
				}
				catch ({ name, message }) 
				{
					console.log(name); 
					console.log(message);
					clear(ctx1);
					ctx1.textAlign = "center";
					ctx1.font = 0.05 + "px cursive";
					ctx1.fillStyle = colorBold;
					ctx1.fillText("OpenCV Error", 0, 0);
					ctx1.font = 0.04 + "px cursive";
					ctx1.fillStyle = colorBold;
					ctx1.fillText(message, 0, 0.05);
					
					return;
				}	

				var pad = Math.max(25, Math.min(maxX - minX, maxY - minY) * 1.5);
				question.minX = minX = Math.max(0, (minX - pad) / tmpCanvas.width);
				question.minY = minY = Math.max(0, (minY - pad) / tmpCanvas.height);
				question.maxX = maxX = Math.min(1, (maxX + pad) / tmpCanvas.width);
				question.maxY = maxY = Math.min(1, (maxY + pad) / tmpCanvas.height);
			}				
			
			if (question.eyeRects.length == 0)
				next();		
			
			else if (question.eyeRects.length != 0)
			{				
				var newX = settings.zoomIntoFaces ? minX : 0;
				var newY = settings.zoomIntoFaces ? minY : 0;
				var newWidth = settings.zoomIntoFaces ? maxX - minX : 1;
				var newHeight = settings.zoomIntoFaces ? maxY - minY : 1;
				
				var ratio = img.width * newWidth / img.height / newHeight;
				var l, r, b, t, w, h;
				if (ratio < canvasRatio)
				{
					h = canvasTop - canvasBottom;
					w = ratio * h;
					l = w * -0.5;
					b = canvasBottom;
				}
				else
				{
					w = canvasRight - canvasLeft;
					h = w / ratio;
					l = canvasLeft;
					b = h * -0.5;
				}

				setCanvasRect(canvasLeft, canvasRight, canvasBottom, canvasTop, window.innerWidth > window.innerHeight, h);

				w /= newWidth;
				h /= newHeight;	
				l -= newX * w;
				b -= newY * h;	
				
				r = w + l;
				t = h + b;

				question.imgX = l;
				question.imgY = b; 
				question.imgWidth = w;
				question.imgHeight = h
			
				if (settings.blur > 0)
					ctx1.filter = "blur(" + settings.blur + "px)";
				ctx1.drawImage(img, 0, 0, img.width, img.height, l, b, w, h);
				ctx1.filter = "none";

				currentTask.onDraw();
				redrawDrawmode(true);
			}
		};
		loadImage(question.img, onload);
	},

	onAnswered: function()
	{	
		if (!question.img)
			next();
		else
			updateAverages({});
	},

	onDraw: function()
	{	
		clear(ctx2);

		if (!hasAnswer2)
		{
			for (let i = 0; i < question.eyeRects.length; i+=2)
			{
				let r = question.eyeRects[i];
				ctx2.drawImage(mask, 0, 0, mask.width, mask.height, r[0] * question.imgWidth + question.imgX, r[1] * question.imgHeight + question.imgY, r[2] * question.imgWidth, r[3] * question.imgHeight);
			}
			
			ctx2.globalCompositeOperation = "source-atop";
			for (let i = 0; i < question.eyeRects.length; i+=2)
			{
				let r = question.eyeRects[i];
				ctx2.fillStyle = rgbToColor(r[4]);
				ctx2.fillRect(r[0] * question.imgWidth + question.imgX, r[1] * question.imgHeight + question.imgY, r[2] * question.imgWidth, r[3] * question.imgHeight);
			}
			ctx2.globalCompositeOperation = "source-over";
			

			if (settings.opacity < 255)
			{
				var a = Math.floor(clampBetween(255 - settings.opacity, 0, 255)).toString(16);
				ctx2.fillStyle = "#FFFFFF" + (a.length < 2 ? 0 + a : a);
				ctx2.fillRect(canvasLeft, canvasBottom, (canvasRight - canvasLeft), canvasTop - canvasBottom);
			}
		}
		else
		{
			ctx2.fillStyle = "#FFFFFF80";
			ctx2.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
		}

		if (!question.img)
			selectImageText(ctx2);
	}
});