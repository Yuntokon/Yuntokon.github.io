register({
	title: "Sphere II",
	description: "Estimate the size of the sphere that fits right into the box",
	category: "Perspective",
	sideLayout: false,
	drawMode: 1,

	settings:
	{
		fixedPosition: false,
		guideLines: false,
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

		if (!settings.guideLines)
			for (var i = 0; i < (settings.intersects1 * 2 - 1) * settings.intersects2; ++i)
				if (geo.edges[i][4] == 0)
					geo.edges[i][4] = 8;
		
		var ptOffset = geo.pointCount;
		var nmOffset = geo.normalCount;

		addBox(question.radius, question.radius, question.radius, question.mMat);
		defineEdges([
			[0, 2,  0, 0, 7],
			[1, 3,  0, 0, 7],
			[4, 6,  1, 1, 7],		
			[5, 7,  1, 1, 7],
						  
			[0, 5,  2, 2, 7],
			[1, 4,  2, 2, 7],
			[2, 7,  4, 4, 7],
			[3, 6,  4, 4, 7],
						  
			[0, 7,  5, 5, 7],		
			[3, 4,  5, 5, 7],
			[1, 6,  3, 3, 7],
			[2, 5,  3, 3, 7]
			], geo.edgeCount, ptOffset, nmOffset);

		updateVPMatrix(camMat(question.fov), true);
	},

	onAnswered: function()
	{
		var posDelta = dist(answer1, [0, 0]) * 10;
		var rad = Math.sqrt(answer2[0] * answer2[0] + answer2[1] * answer2[1]) * 2.5;
		var radDelta = rad - question.radius;
		updateAverages(!settings.fixedPosition ? {"pos": posDelta, "rad": radDelta} : {"rad": radDelta});
	},

	onDraw: function()
	{		
		var rad = settings.fixedPosition || hasAnswer1 ? dist(mouse, !settings.fixedPosition ? answer1 : [0, 0])  * 2.5 : 0.1;
		var radius = hasAnswer2 ? question.radius : rad;
		var pos = viewIntersectPlane(hasAnswer1 ? answer1 : mouse, [0, 0, 0, 1], [0, 0, -1, 0]);
		var mat = settings.fixedPosition ? question.mMat : mulMat(question.mMat, transMat(...pos));
		updateSphere(0, settings.intersects1, settings.intersects2, radius, radius, radius, hasAnswer2 ? question.mMat : mat);
			
		if (hasAnswer2)
		{
			for (var i = 0; i < (settings.intersects1 * 2 - 1) * settings.intersects2; ++i)
				if (geo.edges[i][4] == 8)
					geo.edges[i][4] = 0;
		}
			
		clear(ctx2);		
		drawEdges(ctx2, hasMouse || hasAnswer2 ? 0 : (settings.intersects1 * 2 - 1) * settings.intersects2, hasAnswer2 ? geo.edgeCount : geo.edgeCount - 12);
	
		if (hasAnswer2 && hasMouse)
		{
			for (var i = 0; i < (settings.intersects1 * 2 - 1) * settings.intersects2; ++i)
				if (geo.edges[i][4] == 0)
					geo.edges[i][4] = 8;
				
			updateSphere(0, settings.intersects1, settings.intersects2, rad, rad, rad, mat);
			drawEdges(ctx2, 0, (settings.intersects1 * 2 - 1) * settings.intersects2, colorHighlight);
		}
	}
});
