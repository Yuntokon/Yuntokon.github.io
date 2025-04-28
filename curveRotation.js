register({
	title: "Curve Rotation",
	description: "Match the curves in both perspectives",
	category: "Perspective",	
	sideLayout: true,
	drawMode: 1,

	settings:
	{
		grid: true,
		rotateQuestion: true,
		intersects: 64,
		order: 2,
	},
	
	onNext: function()
	{			
		var points = [];
		points.push([-0.5, 0, -0.5, 1]);
		for (var i = 0; i < settings.order - 1; ++i)
			points.push([(Math.random() - 0.5) * 1.25, 0, (Math.random() - 0.5) * 1 * 1.25, 1]);
		points.push([0.5, 0, 0.5, 1]);

		var fov = Math.random() * 60 + 20;

		return {
			points: points,
			points1: [...points],
			answer: points[1],
						
			viewMat1: mulMat(mulMat(rotMat([1, 0, 0], -0.5 * Math.PI), rotMat([(Math.random() - 0.5) * 2, 1, Math.random() - 0.5], settings.rotateQuestion ? (1 - Math.random() * Math.random()) * Math.PI * 0.45 : 0)), camMat(settings.rotateQuestion ?  Math.random() * 60 + 20 : fov, 0.8)),
			viewMat2: mulMat(mulMat(rotMat([1, 0, 0], -0.5 * Math.PI), rotMat([(Math.random() - 0.5) * 2, 1, Math.random() - 0.5], (1 - Math.random() * Math.random()) * Math.PI * 0.45)), camMat(fov, 0.8))
		};
	},

	onQuestion: function()
	{
		clearGeo();
	
		addLine(settings.intersects, question.points, transMat(0, 0, 0), true);
		addGrid(settings.grid ? 4 : 1, 1, 1, transMat(0, 0, 0), false);

		updateVPMatrix(question.viewMat1, true);

		clear(ctx1);	
		drawEdges(ctx1);
		
		updateVPMatrix(question.viewMat2, true);
	},
	

	onAnswered: function()
	{
		var delta = dist(proj(geo.vpMat, question.answer), answer2) * 10;
		updateAverages({"": delta});
	},

	onDraw: function()
	{		
		clear(ctx2);
		
		var pt = viewIntersectPlane(mouse, [0, 0, 0, 1], [0, 1, 0, 0]);
		var points = question.points1;
		points[1] = hasAnswer2 ? question.answer: pt;

		updateLine(0, settings.intersects, points, identityMat());
		drawEdges(ctx2, hasMouse || hasAnswer2 ? 0 : settings.intersects);

		if (hasAnswer2 && hasMouse)
		{	
			points[1] = pt;
		
			updateLine(0, settings.intersects, points, identityMat());
			drawEdges(ctx2, 0, settings.intersects, colorHighlight);
			
			updateVPMatrix(question.viewMat1, true);

			drawEdges(ctx1, 0, settings.intersects, colorHighlight);	
			updateVPMatrix(question.viewMat2, true);
		}
	}
});
