register({
	title: "Sphere I",
	description: "Complete the sphere",
	category: "Perspective",
	sideLayout: false,
	drawMode: 1,

	settings:
	{
		drawThrough: true,
		drawBox: true,
		intersects1: 32,
		intersects2: 64
	},

	onNext: function()
	{
		var width = 0.5 + Math.random() * 0.5;
		return {
			radius: width,
			
			mMat: rotMat([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, 0], Math.random() * Math.PI * 2),
			fov: Math.random() * 80 + 20
		};
	},

	onQuestion: function()
	{
		clearGeo();
		addSphere(settings.intersects1, settings.intersects2, question.radius, question.radius, question.radius, question.mMat);
		
		updateVPMatrix(camMat(question.fov), true);
		
		question.ellipseMin = Infinity;
		question.ellipseMax = -Infinity;
		var off = settings.intersects1 / 2 * settings.intersects2;
		var n = subVec(geo.pointsP[0], geo.pointsP[(settings.intersects1 + 1) * settings.intersects2 - 1]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var newPoints = [];
		for (var i = 0; i < settings.intersects2; ++i)
		{
			newPoints[i] = geo.points[off + i];
			geo.edges[off + i - settings.intersects2][4] = 8;

			var pt = geo.pointsP[off + i];
			var dot2 = pt[0] * n[0] + pt[1] * n[1];
			question.ellipseMin = Math.min(question.ellipseMin, dot2 / dot);
			question.ellipseMax = Math.max(question.ellipseMax, dot2 / dot);
		}
		
		var newEdges = [];
		for (var i = 0; i < settings.intersects2; ++i)
			newEdges[i] = [i, (i + 1) % settings.intersects2, off + i, off + i - settings.intersects2, 3];

		var pointCount = geo.pointCount;
		definePoints(newPoints, identityMat());
		defineEdges(newEdges, geo.edgeCount, pointCount, 0);
		
		if (!settings.drawThrough)
			for (var i = 0; i < settings.intersects1 * 2 * settings.intersects2; ++i)
				if (geo.edges[i][4] == 0)
					geo.edges[i][4] = 6;
					
		if (settings.drawBox)
			addBox(question.radius, question.radius, question.radius, question.mMat, false);
	},

	onAnswered: function()
	{
		updatePoints();

		var offset = (settings.intersects1 + 1) * settings.intersects2;
		var n = subVec(geo.pointsP[0], geo.pointsP[(settings.intersects1 + 1) * settings.intersects2 - 1]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var off = (question.ellipseMin + question.ellipseMax) * 0.5;
		var s = Math.abs((answer2[0] * n[0] + answer2[1] * n[1]) / dot - off) / (question.ellipseMax - question.ellipseMin) * 2;

		updateAverages({"": s - 1});
	},

	onDraw: function()
	{		
		updatePoints();
		
		clear(ctx2);
		
		var offset = (settings.intersects1 + 1) * settings.intersects2;
		var n = subVec(geo.pointsP[0], geo.pointsP[(settings.intersects1 + 1) * settings.intersects2 - 1]);
		var dot = n[0] * n[0] + n[1] * n[1]; 
		var off = (question.ellipseMin + question.ellipseMax) * 0.5;
		var s = hasMouse ? Math.abs((mouse[0] * n[0] + mouse[1] * n[1]) / dot - off) / (question.ellipseMax - question.ellipseMin) * 2 : 0;

		if (hasAnswer2)
		{
			if (!settings.drawThrough)
				for (var i = 0; i < settings.intersects1 * 2 * settings.intersects2; ++i)
					if (geo.edges[i][4] == 6)
						geo.edges[i][4] = 0;
				
			for (var i = 0; i < (settings.intersects1 * 2 - 1) * settings.intersects2; ++i)
				if (geo.edges[i][4] == 8)
					geo.edges[i][4] = 0;
			
			drawEdges(ctx2, 0, (settings.intersects1 * 2 - 1) * settings.intersects2);
			drawEdges(ctx2, settings.intersects1 * 2 * settings.intersects2);
			
			ctx2.strokeStyle  = colorLight
			ctx2.lineWidth = lineWidth(1);
	
			ctx2.beginPath();
			drawEdge(ctx2, geo.pointsP[offset], geo.pointsP[offset + settings.intersects2 / 2]);
			drawEdge(ctx2, geo.pointsP[offset + settings.intersects2 / 4], geo.pointsP[offset + settings.intersects2 / 4 * 3]);
			drawEdge(ctx2, geo.pointsP[0], geo.pointsP[(settings.intersects1 + 1) * settings.intersects2 - 1]);
			ctx2.stroke();
			
			ctx2.lineWidth = lineWidth(2);
		}
		
		for (var i = 0; i < settings.intersects2; ++i)
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
				for (var i = 0; i < settings.intersects2; ++i)
					drawEdge(ctx2, geo.pointsP[offset + i], geo.pointsP[offset + (i + 1) % settings.intersects2]);
				ctx2.stroke();
			}
		}
		else
			drawEdges(ctx2);
	}
});
