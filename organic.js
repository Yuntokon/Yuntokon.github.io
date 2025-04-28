register({
	title: "Organic",
	description: "Estimate the ellipse degree",

	category: "Perspective",
	sideLayout: false,
	drawMode: 1,
	
	settings:
	{
		intersects1: 64,
		intersects2: 64,
		order: 2
	},

	onNext: function()
	{
		var width = Math.random() * 0.5 + 0.5;
		var height = Math.random() * 0.5 + 0.5;
		var depth = 1;//Math.random() * 0.5 + 0.5;

		var points = [];
		points.push([-width * 0.5, -height * 0.5, -depth * 0.5]);
		for (var i = 0; i < settings.order - 1; ++i)
			points.push([(Math.random() - 0.5) * 2, (Math.random() - 0.5)* 2, (Math.random() - 0.5) * 0.5]);
		points.push([width * 0.5, height * 0.5, depth * 0.5]);

		return {
			width: width,
			height: height,
			depth: depth,
			points: points,

			width2: Math.random() * 0.25 + 0.25,

			mMat: rotMat([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, 0], Math.random() * Math.PI * 2),
			fov: Math.random() * 80 + 20
		};
	},

	onQuestion: function()
	{
		clearGeo();
		addBlob(settings.intersects1, settings.intersects2, question.width2, question.points, question.mMat);
		addBox(question.width, question.height, question.depth, question.mMat, false);

		updateVPMatrix(camMat(question.fov), true);

		question.ellipseMin = Infinity;
		question.ellipseMax = -Infinity;
		var off = settings.intersects1 * 32;
		var n = subVec(geo.pointsP[(settings.intersects2 + 1) * settings.intersects1 + 33], geo.pointsP[(settings.intersects2 + 1) * settings.intersects1 + 32]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		for (var i = 0; i < settings.intersects1; ++i)
		{
			var pt = geo.pointsP[off + i];
			var dot2 = pt[0] * n[0] + pt[1] * n[1];
			question.ellipseMin = Math.min(question.ellipseMin, dot2 / dot);
			question.ellipseMax = Math.max(question.ellipseMax, dot2 / dot);
		}
	},

	onAnswered: function()
	{
		updatePoints();

		var n = subVec(geo.pointsP[(settings.intersects2 + 1) * settings.intersects1 + 33], geo.pointsP[(settings.intersects2 + 1) * settings.intersects1 + 32]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var off = (question.ellipseMin + question.ellipseMax) * 0.5;
		var s = Math.abs((answer2[0] * n[0] + answer2[1] * n[1]) / dot - off) / (question.ellipseMax - question.ellipseMin) * 2;

		updateAverages({"": s - 1});
	},

	onDraw: function()
	{		
		updatePoints();
		
		clear(ctx2);
		
		if (hasAnswer2)
			drawEdges(ctx2);
		
		var offset = settings.intersects1 * 32;
		var n = subVec(geo.pointsP[(settings.intersects2 + 1) * settings.intersects1 + 33], geo.pointsP[(settings.intersects2 + 1) * settings.intersects1 + 32]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var off = (question.ellipseMin + question.ellipseMax) * 0.5;
		var s = hasMouse ? Math.abs((mouse[0] * n[0] + mouse[1] * n[1]) / dot - off) / (question.ellipseMax - question.ellipseMin) * 2 : 0;

		for (var i = 0; i < settings.intersects1; ++i)
		{
			var dot2 = geo.pointsP[offset + i][0] * n[0] + geo.pointsP[offset + i][1] * n[1];
			geo.pointsP[offset + i][0] = geo.pointsP[offset + i][0] + (s - 1) * (dot2 / dot - off) * n[0];
			geo.pointsP[offset + i][1] = geo.pointsP[offset + i][1] + (s - 1) * (dot2 / dot - off) * n[1];
		}
					
		if (hasAnswer2)
		{
			if (hasMouse)
			{
				ctx2.strokeStyle = colorHighlightNormal
				ctx2.beginPath();
				for (var i = 0; i < settings.intersects1; ++i)
					drawEdge(ctx2, geo.pointsP[offset + i], geo.pointsP[offset + (i + 1) % settings.intersects1]);
				ctx2.stroke();
			}
		}
		else
			drawEdges(ctx2);
	}
});
