register({
	title: "Rotation II",
	description: "Complete the rotated box",

	category: "Perspective",
	sideLayout: false,
	drawMode: 1,
	
	settings:
	{
		intersects: 64,
		grid: false,
		cylinder: true,
		plane: false,
	},
	
	onNext: function()
	{
		return {			
			viewMat: mulMat(mulMat(rotMat([0, 1, 0], Math.random() * Math.PI * 2), rotMat([1, 0, 0], -(Math.random() * 0.5 + 0.0625) * Math.PI * 0.5)), camMat(Math.random() * 60 + 20)),
			mMat: rotMat([1, 0, 0], Math.PI * 0.5),
			mMat2: mulMat(rotMat([1, 0, 1], Math.PI), mulMat(transMat(-0.25, 0, -0.25), rotMat([0, 1, 0], Math.random() * Math.PI * 2)))
		};
	},

	onQuestion: function()
	{
		clearGeo();

		addBox(0.5, 0.5, 0.5, question.mMat2);
		if (settings.cylinder)
			addCylinder(settings.intersects, 1, 1, 0.5, question.mMat, false);
		else
			addEllipse(settings.intersects, 1, 1, Math.PI * 2, mulMat(transMat(0, 0, 0.25), question.mMat), false);

		addGrid(settings.grid ? 4 : 1, 1, 1, transMat(0, -0.25, 0), false);
		updateVPMatrix(question.viewMat, true);

		clear(ctx1);
		drawEdges(ctx1, 5);
	},

	onAnswered: function()
	{
		updateBox(0, 0.5, 0.5, 0.5, question.mMat2);
		updatePoints();	

		var pt = geo.pointsP[0];
		var delta = dist(pt, answer2) * 10;
		updateAverages({"": delta});
	},

	onDraw: function()
	{		
		clear(ctx2);
		
		var pt = viewIntersectPlane(mouse, [0, 0, -0.25, 1], [0, 0, -1, 0], question.mMat);

		if (!hasAnswer2)
		{
			geo.points[0][0] = geo.points[1][0] = pt[0];
			geo.points[0][2] = geo.points[1][2] = pt[2];
			updatePoints();
		}
		else
			updateBox(0, 0.5, 0.5, 0.5, question.mMat2);

		if (hasMouse || hasAnswer2)
			drawEdges(ctx2, 0, settings.plane || hasAnswer2 ? 5 : 2);

		if (hasAnswer2 && hasMouse)
		{
			geo.points[0][0] = geo.points[1][0] = pt[0];
			geo.points[0][2] = geo.points[1][2] = pt[2];

			updatePoints();	
			drawEdges(ctx2, 0, 5, colorHighlight);
		}		
	}
});
