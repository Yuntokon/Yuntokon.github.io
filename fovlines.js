register({
	title: "FOV II",
	description: "Estimate the rate of convergence, so that the box matches the scene",
	category: "Perspective",
	sideLayout: false,
	drawMode: 0,

	settings:
	{
		lines: undefined,
		_grid: true,
		rotateGrid: true,
	},
	
	onNext: function()
	{
		var mMat = mulMat(rotMat([0, 1, 0], Math.random() * Math.PI * 2), rotMat([1, 0, 0], -(Math.random() * 0.5 + 0.75) * Math.PI * 0.25));

		var height = 0.25 + Math.random() * 0.5;

		return {
			targetFov: Math.random() * 100 + 20,

			width: 0.25 + Math.random() * 0.5,
			height: height,
			depth: 0.25 + Math.random() * 0.5,

			mMat: mMat,
			gridMat: mulMat(rotMat([0, 1, 0], settings.rotateGrid ? Math.random() * Math.PI * 2 : 0), mulMat(transMat(0, -height * 0.5, 0), mMat)),
			};
	},

	onQuestion: function()
	{
		clearGeo();
		
		var points = [];
		for (var i = 0; i < settings.lines; ++i)
		{
			var angle = Math.random() * Math.PI * 2
			var d = Math.sqrt(Math.random());
			points[i * 2]     = [Math.cos(angle) * d, -question.height * 0.5, Math.sin(angle) * d, 1];	
			angle = Math.random() * Math.PI * 2
			d = Math.sqrt(Math.random());
			points[i * 2 + 1] = [Math.cos(angle) * d, -question.height * 0.5, Math.sin(angle) * d, 1];
		}
		
		addBox(question.width, question.height, question.depth, question.mMat);
		
		if (settings._grid)
			addGrid(4, 1, 1, question.gridMat, false);
		else
			definePoints(points, question.mMat, 8);

		updateVPMatrix(camMat(question.targetFov), true);

		clear(ctx1);	
		if (settings._grid)
			drawEdges(ctx1, 12)
		else
		{
			ctx1.strokeStyle  = colorLight
			ctx1.lineWidth = lineWidth(1);
			ctx1.beginPath();
			for (var i = 0; i < settings.lines; ++i)
				drawEdge(ctx1, geo.pointsP[8 + i * 2], geo.pointsP[8 + i * 2 + 1]);
			ctx1.stroke();
		}
	},
	

	onAnswered: function()
	{
		var delta = question.targetFov - (clampBetween(answer2[0] * 2 + 0.5, 0, 1) * 100 + 20);
		updateAverages({"FOV": delta});
	},

	onDraw: function()
	{		
		var fov = clampBetween(mouse[0] * 2 + 0.5, 0, 1) * 100 + 20;
		clear(ctx2);
		
		updateVPMatrix(camMat(hasAnswer2 ? question.targetFov : fov), true);
		drawEdges(ctx2, 0, 12);

		if (hasAnswer2)
		{	
			updateVPMatrix(camMat(fov), true);
			drawEdges(ctx2, 0, 12, colorHighlight);
		}
	}
},
[{
	title: "FOV III",
	
	settings:
	{
		lines: 100,
		_grid: false,
		rotateGrid: undefined
	}
}]);
