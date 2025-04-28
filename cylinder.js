register({
	title: "Ellipse Degree",
	description: "Complete the cylinder",
	category: "Perspective",
	sideLayout: false,
	drawMode: 1,

	settings:
	{
		intersects: 64
	},

	onNext: function()
	{
		var width = 0.5 + Math.random() * 0.25;
		return {
			width: width,
			height: width,
			depth: 0.5 + Math.random() * 0.25,
			
			mMat: rotMat([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, 0], Math.random() * Math.PI * 2),
			fov: Math.random() * 80 + 20
		};
	},

	onQuestion: function()
	{
		clearGeo();
		addCylinder(settings.intersects, question.width, question.height, question.depth, question.mMat);

		definePoints([
			[0, 0, -question.depth * 0.5, 1],
			[0, 0,  question.depth * 0.5, 1],
			[-0.2 * question.width, 0, -question.depth * 0.5, 1],
			[ 0.2 * question.width, 0, -question.depth * 0.5, 1],
			[-0.2 * question.width, 0, question.depth * 0.5, 1],
			[ 0.2 * question.width, 0, question.depth * 0.5, 1]
		], question.mMat);
		
		defineEdges([
			[settings.intersects * 2,     settings.intersects * 2 + 1, -1, -1],
			[settings.intersects * 2 + 2, settings.intersects * 2 + 3, -1, -1],
			[settings.intersects * 2 + 4, settings.intersects * 2 + 5, -1, -1]
		]);

		updateVPMatrix(camMat(question.fov), true);

		question.ellipseMin = Infinity;
		question.ellipseMax = -Infinity;
		var n = subVec(geo.pointsP[settings.intersects * 2 + 1], geo.pointsP[settings.intersects * 2]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		for (var i = 0; i < settings.intersects; ++i)
		{
			var pt = geo.pointsP[i];
			var dot2 = pt[0] * n[0] + pt[1] * n[1];
			question.ellipseMin = Math.min(question.ellipseMin, dot2 / dot);
			question.ellipseMax = Math.max(question.ellipseMax, dot2 / dot);
		}
	},

	onAnswered: function()
	{
		var n = subVec(geo.pointsP[settings.intersects * 2 + 1], geo.pointsP[settings.intersects * 2]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var off = (question.ellipseMin + question.ellipseMax) * 0.5;
		var s = Math.abs((answer2[0] * n[0] + answer2[1] * n[1]) / dot - off) * 2;
		updateAverages({"": s - 1});
	},

	onDraw: function()
	{		
		updatePoints();
		
		clear(ctx2);
		
		if (hasAnswer2)
			drawEdges(ctx2);
		
		var n = subVec(geo.pointsP[settings.intersects * 2 + 1], geo.pointsP[settings.intersects * 2]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var off = (question.ellipseMin + question.ellipseMax) * 0.5;
		var s = hasMouse ? Math.abs((mouse[0] * n[0] + mouse[1] * n[1]) / dot - off) / (question.ellipseMax - question.ellipseMin) * 2 : 1;

		for (var i = 0; i < settings.intersects; ++i)
		{
			var dot2 = geo.pointsP[i][0] * n[0] + geo.pointsP[i][1] * n[1];
			geo.pointsP[i][0] = geo.pointsP[i][0] + (s - 1) * (dot2 / dot - off) * n[0];
			geo.pointsP[i][1] = geo.pointsP[i][1] + (s - 1) * (dot2 / dot - off) * n[1];
		}
		
		updateNormals();
			
		if (hasAnswer2)
			drawEdges(ctx2, 0, settings.intersects, colorHighlight);
		else
			drawEdges(ctx2, hasMouse ? 0 : settings.intersects);
	}
});
