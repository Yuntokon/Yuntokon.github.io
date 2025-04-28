register({
	title: "Slideshow",
	description: "Timed image slide show",
	category: "Croquis",
	sideLayout: false,
	drawMode: 1,
	
	settings:
	{
		_memory: false,
		_lines: false,
		zoomIntoFaces: false,
		flip: false,
		gridIntersecs: -1,
		opacity: 255,
		blur: 0,
		files: [],
	},
	
	onNext: function()
	{
		if (settings._memory && question && question.img && question.isQuestion)
		{
			return {
				isQuestion: false,
				imgLeft: question.imgLeft,
				imgRight: question.imgRight,
				imgBottom: question.imgBottom,
				imgTop: question.imgTop,
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
				imgLeft: NaN,
				imgRight: NaN,
				imgBottom: NaN,
				imgTop: NaN,
				img: img
			}
		}
	},

	onQuestion: function()
	{
		setCanvasRect(canvasLeft, canvasRight, canvasBottom, canvasTop);
		if (!question.isQuestion && question.img)
		{
		}
		else
		{
			question.imgLeft = question.imgRight = question.imgTop = question.imgBottom = NaN

			var onload = function(img)
			{
				clear(ctx1);
				
				var newX = newY = 0;
				var newWidth = newHeight = 1;
				
				if (!hasAnswer2)
					question.lines = undefined;
				
				if (settings.zoomIntoFaces || settings._lines && question.lines == undefined)
				{
					if (settings.zoomIntoFaces && question.newX != undefined && (!settings._lines || question.lines != undefined))
					{
						newX = question.newX;
						newY = question.newY;
						newWidth = question.newWidth;
						newHeight = question.newHeight;
					}
					else
					{
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
																		
							let src = cv.imread(tmpCanvas);
							let gray = new cv.Mat();
							cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
							
							var minX = 0;
							var minY = 0;
							var maxX = src.cols;
							var maxY = src.rows;
		
							if (settings.zoomIntoFaces)
							{
								var faceCascade;
								if (window.faceCascade)
									faceCascade = window.faceCascade;
								else
								{
									faceCascade = new cv.CascadeClassifier();
									faceCascade.load("lbpcascade_animeface.xml");
									window.faceCascade = faceCascade;
								}

								let msize = new cv.Size(0, 0);		
								let faces = new cv.RectVector();
								
								faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);			
										
								if (faces.size() > 0)
								{
									var i = Math.floor(Math.random() * faces.size.length);
																
									minX = faces.get(i).x;
									minY = faces.get(i).y;
									maxX = minX + faces.get(i).width;
									maxY = minY + faces.get(i).height;
									
									var pad = Math.max(25, Math.min(maxX - minX, maxY - minY) * 0.25);
									minX = Math.max(0, minX - pad);
									minY = Math.max(0, minY - pad * 2);
									maxX = Math.min(tmpCanvas.width, maxX + pad);
									maxY = Math.min(tmpCanvas.height, maxY);
									
									question.newX = newX = minX / tmpCanvas.width;
									question.newY = newY = minY / tmpCanvas.height;
									question.newWidth = newWidth = (maxX - minX) / tmpCanvas.width;
									question.newHeight = newHeight = (maxY - minY) / tmpCanvas.height;
								}
								else
								{
									question.newX = newX;
									question.newY = newY;
									question.newWidth = newWidth;
									question.newHeight = newHeight;
								}
															
								//faceCascade.delete();
								faces.delete();	
							}
							if (!question.lines && settings._lines)
							{
								question.lines = [];
								let w = maxX - minX - 1;
								let h = maxY - minY - 1;

								let rect = new cv.Rect(minX, minY, maxX - minX, maxY - minY);
								let gray1 = gray.roi(rect);
								
								/*
								let lines = new cv.Mat();
								cv.medianBlur(gray1, gray1, 5);								
								cv.threshold(gray1,gray1,0,255,cv.THRESH_BINARY+cv.THRESH_OTSU)
								cv.Canny(gray1, gray1, settings.lowThreshold, settings.highThreshold, settings.kernelSize, true);

								cv.HoughLinesP(gray1, lines, settings.rho, settings.theta, settings.threshold, settings.minLineLength, settings.maxLineGap);

								for (let i = 0; i < lines.rows; ++i) {
									let startPoint = [lines.data32S[i * 4] / w, lines.data32S[i * 4 + 1] / h];
									let endPoint = [lines.data32S[i * 4 + 2] / w, lines.data32S[i * 4 + 3] / h];
									question.lines.push([startPoint, endPoint, dist(startPoint, endPoint)]);
								}
								lines.delete();
								*/
								
								if (settings.filter > 0)
									cv.medianBlur(gray1, gray1, settings.filter * 2 + 1);			
								if (settings.valueBased)
									cv.threshold(gray1,gray1,0,255,cv.THRESH_BINARY+cv.THRESH_OTSU)
								else
									cv.Canny(gray1, gray1, settings.lowThreshold, settings.highThreshold, 3, true);

								let contours = new cv.MatVector();
								let hierarchy = new cv.Mat();
								cv.findContours(gray1, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

								for (let i = 0; i < contours.size(); ++i) {
									let tmp = new cv.Mat();
									let cnt = contours.get(i);
									cv.approxPolyDP(cnt, tmp, settings.valueBased ? settings.simplify : settings.simplify * 2, true);
									
									let area = cv.contourArea(tmp, false);
									if (area > settings.areaThreshold)
									{
										var first = [tmp.data32S[0] / w, tmp.data32S[1] / h];
										var last = first;
										for (let i = 1; i < tmp.rows; ++i) {
											let point = [tmp.data32S[i * 2] / w, tmp.data32S[i * 2 + 1] / h];
											if (Math.max(last[0], point[0]) > 0 && Math.min(last[0], point[0]) < 1 && 
											Math.max(last[1], point[1]) > 0 && Math.min(last[1], point[1]) < 1)
												question.lines.push([last, point, dist(last, point)]);
											last = point;
										}
										if (Math.max(first[0], last[0]) > 0 && Math.min(first[0], last[0]) < 1 && 
											Math.max(first[1], last[1]) > 0 && Math.min(first[1], last[1]) < 1)
										question.lines.push([first, last, dist(first, last)]);
									}
									
									cnt.delete(); tmp.delete();
								}
								hierarchy.delete(); contours.delete();
			
								question.lines.sort((a, b) => b[2] - a[2]);								
								//cv.imshow(tmpCanvas, gray);
							}
							
							src.delete();
							gray.delete();						
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
					}
				}
				
				var ratio = img.width * newWidth / img.height / newHeight;
				var ratio2 = window.innerWidth / window.innerHeight;
				
				if (currentTask.sideLayout)
					resize(false, ratio < ratio2);	
				
				var l, r, b, t, w, h;
				if (ratio < canvasRatio)
				{
					h = canvasTop - canvasBottom; w = ratio * h; l = w * -0.5; b = canvasBottom;
				}
				else
				{
					w = canvasRight - canvasLeft; h = w / ratio; l = canvasLeft; b = h * -0.5;
				}
				
				r = w + l;
				t = h + b;

				setCanvasRect(canvasLeft, canvasRight, canvasBottom, canvasTop, ratio < ratio2, h);

				if (settings.flip)
					ctx1.scale(1, -1);
				
				ctx1.fillStyle = "#FFFFFFFF";
				ctx1.fillRect(l - newX * w / newWidth, b - newY * h / newHeight, w / newWidth, h / newHeight);
				
				if (settings.blur > 0 && !currentTask.sideLayout && !settings._memory)
					ctx1.filter = "blur(" + settings.blur + "px)";
					
				ctx1.drawImage(img, 0, 0, img.width, img.height, l - newX * w / newWidth, b - newY * h / newHeight, w / newWidth, h / newHeight);
					
				ctx1.filter = "none";
					
				question.imgLeft = l
				question.imgRight = r
				question.imgBottom = b
				question.imgTop = t
				
				if (settings.opacity < 255 && !currentTask.sideLayout && !settings._memory)
				{
					var a = Math.floor(clampBetween(255 - settings.opacity, 0, 255)).toString(16);
					ctx1.fillStyle = "#FFFFFF" + (a.length < 2 ? 0 + a : a);
					ctx1.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
				}
				
				if (question.lines && !hasAnswer2)
				{

					ctx1.fillStyle = "#FFFFFFE0";
					ctx1.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);		
					ctx1.strokeStyle = colorNormal;
					ctx1.lineWidth = lineWidth(1);
					for (let [p1, p2] of question.lines)
					{
						ctx1.moveTo(l + p1[0] * w, b + p1[1] * h);
						ctx1.lineTo(l + p2[0] * w, b + p2[1] * h);
					}
					ctx1.stroke();
				}
				
				if (settings.gridIntersecs > -1)
				{
					ctx1.lineWidth = lineWidth(2);
					ctx1.strokeStyle = colorBold;

					ctx1.beginPath();
					ctx1.moveTo(l, t);
					ctx1.lineTo(r, t);
					ctx1.lineTo(r, b);
					ctx1.lineTo(l, b);
					ctx1.lineTo(l, t);
					ctx1.stroke();

					ctx1.globalCompositeOperation = "difference";
					ctx1.lineWidth = lineWidth(1);
					ctx1.strokeStyle = "#FFFFFFA0";
					ctx1.beginPath();
					var n = settings.gridIntersecs + 1
					for (var i = 1; i < n; ++i)
					{
						ctx1.moveTo(l + w * i / n, b);
						ctx1.lineTo(l + w * i / n, t);
						
						ctx1.moveTo(l, b + h * i / n);
						ctx1.lineTo(r, b + h * i / n);
					}
					ctx1.stroke();	
					ctx1.globalCompositeOperation = "normal";
				}
				
				clear(ctx2);
				currentTask.onDraw();
				redrawDrawmode(true);			
			};
			loadImage(question.img, onload);

			clear(ctx2);
		}
	},

	onAnswered: function()
	{		
		if (settings._memory && question.isQuestion)
			next();
		else 
		{
			if (question.lines)
				currentTask.onQuestion();
			
			if (!settings._memory && !currentTask.sideLayout)
				next();
			
			if (question.img)
				updateAverages({});
		}
	},

	onDraw: function()
	{	
		clear(ctx2);
		if (currentTask.sideLayout || !question.isQuestion)
		{
			var l = question.imgLeft, r = question.imgRight, b = question.imgBottom, t = question.imgTop;
			if (hasAnswer2)
			{
				copyCanvas("#FFFFFFE0");			
				ctx2.strokeStyle  = colorHighlightNormal;
				
				if (question.lines)
				{
					ctx2.strokeStyle  = colorNormal;
					ctx2.lineWidth = lineWidth(1);
					for (let [p1, p2] of question.lines)
					{
						ctx2.moveTo(l + p1[0] * (r - l), b + p1[1] * (t - b));
						ctx2.lineTo(l + p2[0] * (r - l), b + p2[1] * (t - b));
					}
					ctx2.stroke();
				}				
			}
			else
			{			
				if (settings.opacity > 0)
				{
					if (settings.blur > 0)
						ctx2.filter = "blur(" + settings.blur + "px)";
					var a = Math.floor(clampBetween(255 - settings.opacity, 0, 255)).toString(16);
					copyCanvas("#FFFFFF" + (a.length < 2 ? 0 + a : a));			

					ctx2.filter = "none";					
				}
				
				if (settings.gridIntersecs > -0.5 && question.imgLeft)
				{				
					if (!question.isQuestion && settings.opacity <= 0)
					{
						ctx2.fillStyle = "#FFFFFFFF";
						ctx2.beginPath();
						ctx2.moveTo(l, t);
						ctx2.lineTo(r, t);
						ctx2.lineTo(r, b);
						ctx2.lineTo(l, b);
						ctx2.lineTo(l, t);
						ctx2.fill();
					}

					ctx2.lineWidth = lineWidth(2);
					ctx2.strokeStyle = colorBold;
					   
					ctx2.beginPath();
					ctx2.moveTo(l, t);
					ctx2.lineTo(r, t);
					ctx2.lineTo(r, b);
					ctx2.lineTo(l, b);
					ctx2.lineTo(l, t);
					ctx2.stroke();
					
					ctx2.lineWidth = lineWidth(1);
					ctx2.strokeStyle = colorNormal;
					
					ctx2.beginPath();
					var n = settings.gridIntersecs + 1
					for (var i = 1; i < n; ++i)
					{
						ctx2.moveTo(l + (r - l) * i / n, b);
						ctx2.lineTo(l + (r - l) * i / n, t);
						   
						ctx2.moveTo(l, b + (t - b) * i / n);
						ctx2.lineTo(r, b + (t - b) * i / n);
					}
					ctx2.stroke();		
				}	  
			}
		}
		
		if (!question.img)
			selectImageText(ctx2);
	}
},
[
	{
		title: "Sightsize",	
		description: "Copy the reference",
		sideLayout: true,	
		drawMode: 2,
		
		settings:
		{
			gridIntersecs: 2,
			opacity: 0,
			blur: 16,
		}
	},
	{
		title: "Shape Simplification",	
		description: "Copy the simplified reference",
		sideLayout: true,	
		drawMode: 2,
		
		settings:
		{
			valueBased: true,
			filter: 1,
			simplify: 3,
			lowThreshold: 50,
			highThreshold: 500,
			areaThreshold: 200,
			
			_lines: true,
			gridIntersecs: 2,
			opacity: 0,
			blur: 16,
		}
	},
	{
		title: "Images",	
		category: "Memory",
		description: "Draw from memory",
		drawMode: 2,

		settings:
		{
			_memory: true,
			gridIntersecs: 2,
			opacity: 0,
			blur: 16,
		}
	}
]);