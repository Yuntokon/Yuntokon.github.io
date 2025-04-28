const _flower1 = new Image();
_flower1.src = "flower.png";
const _flower2 = new Image();
_flower2.src = "flower2.png";

register({
	title: "Warm-up",
	description: "A recommended subset of exercises",
	category: "_",
	sideLayout: false,
	drawMode: 0,
	
	settings:
	{
		_finished: false,
		_flowers: new Array(30).fill(null).map(()=> ({ birth: 0, life: Math.random() * 3 })),
		_lastFrame: Date.now(),
		_time: 0,
		_schedule:
		[
			{
				task: "Angle_II",
				count: 5,
			},
			{
				task: "Bounding_Box",
				count: 3,
				settings: {
					fixedHeight: true
				}	
			},
			{
				task: "Bounding_Box",
				count: 2,
				settings: {
					fixedHeight: false
				}
			},
			{
				task: "Symmetry",
				count: 2,
				settings: {
					rotate: false,
				}
			},
			{
				task: "Symmetry",
				count: 1,
				settings: {
					rotate: true,
				}
			},
			{
				task: "Translated_Points",
				count: 9,
			},
			{
				task: "Midpoint_I",
				count: 3,
			},
			{
				task: "Vanishing_Point_IV",
				count: 3,
			},
			{
				task: "Value_I",
				count: 1,
			},
			{
				task: "Value_II",
				count: 1
			},
			{
				task: "Value_III",
				count: 1
			},
			{
				task: "Image_Colors_I",
				count: 3,
			},
			{
				task: "Sightsize",
				count: 1,
				settings: {
					zoomIntoFaces: false,
					gridIntersecs: 2,
				}
			},
			{
				task: "Sightsize",
				count: 1,
				settings: {
					zoomIntoFaces: true,
					gridIntersecs: 2,
				}
			},
			{
				task: "Sightsize",
				count: 1,
				settings: {
					zoomIntoFaces: true,
					gridIntersecs: 0,
				}
			},
			{
				task: "Sketch",
				count: 2
			}
		]
	},
	
	onNext: function()
	{
		return {};
	},

	onQuestion: function()
	{
		setCanvasRect(canvasLeft, canvasRight, canvasBottom, canvasTop);

		const grad = ctx2.createLinearGradient(0,canvasTop - 0.15,0,canvasTop);
		grad.addColorStop(0, "#ffe6ed00");
		grad.addColorStop(1, "#ffe6edc0");
		settings._grad = grad;

		var onload = function(img)
		{
			clear(ctx2);

			ctx2.filter = "drop-shadow(0px 2px 8px " + colorShadow + ")";

			var height = 0.8;
			var ratio = img.width / img.height;
			ctx2.drawImage(img, 0, 0, img.width, img.height, -ratio * height * 0.5 + height * 0.02, -height * 0.5 - 0.05, ratio * height, height);
			
			ctx2.filter = "none";
					
			ctx2.textAlign = "center";
			ctx2.fillStyle = colorBold;
			ctx2.strokeStyle = "#ffffff"
			ctx2.lineWidth = lineWidth(16);
			ctx2.font = 0.03 + "px cursive";
			   
			ctx2.filter = "drop-shadow(0px 2px 8px " + colorShadow + ")";
			ctx2.strokeText(settings._finished ? "Well done!" : "Click to start!", 0, canvasTop - 0.1);
			ctx2.filter = "none";
			   
			ctx2.fillText(settings._finished ? "Well done!" : "Click to start!", 0, canvasTop - 0.1);
		};
		loadImage("chibi.webp", onload, false)
	},

	onAnswered: function()
	{		
		if (settings._finished)
		{
			settings._finished = false;
			updateAverages({});
			next();
		}
		else
			startSchedule(settings._schedule);
	},

	onDraw: function()
	{		
		if (!settings._flowers)
			return;
		
	    var now = Date.now();
		var elapsed = Math.min(0.5, (now - settings._lastFrame) / 1000);
		settings._lastFrame = now;
		settings._time += elapsed;

		clear(ctx1);
		
		ctx1.fillStyle = settings._grad;
		ctx1.fillRect(canvasLeft, canvasTop - 0.15, canvasRight - canvasLeft, 0.15);
			
		for (let it of settings._flowers)
		{
            if (it.birth + it.life < settings._time)
            {
				const h = 0.15;
				it.size = (Math.random() * Math.random() * 0.5 + 0.1) * h;
				it.r = Math.random() * Math.PI * 2;
				it.vX = -(Math.random() * 0.125 + 0.125) * h;
				it.vY = (Math.random() * 0.1 + 0.1) * h;
				it.vR = (Math.random() + 0.5) * Math.PI * 0.75;
				it.birth = settings._time;
				it.life = (h + it.size) / it.vY;
				it.tex = Math.random() < 0.3;
				it.x = canvasLeft + Math.random() * (canvasRight - canvasLeft) - it.vX * it.life * 0.5;
				it.y = canvasTop - h - it.size * 0.5;
			}
			else if (!it.size)
				continue;

            var t = settings._time - it.birth;
            var x = it.x + t * it.vX;
            var y = it.y + t * it.vY;
            var r = it.r + t * it.vR;
            var t1 = t / it.life;
            var s = it.size;
            var b = it.tex ? _flower1 : _flower2;

			ctx1.save();
			ctx1.translate(x, y);
			ctx1.rotate(r);
			ctx1.scale(s, s);	
			ctx1.drawImage(b, 0, 0, b.width, b.height, -0.5, -0.5, 1, 1);
			ctx1.restore();
        }
		
		requestAnimationFrame(currentTask.onDraw);
	}
});