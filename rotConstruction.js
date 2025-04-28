register({
	title: "Rotation I",
	description: "Estimate the angle after rotation in 3D",

	category: "Perspective",
	sideLayout: false,
	drawMode: 1,
	
	settings:
	{
		intersects: 64,
		grid: false,
		plane: false,
		cylinder: true,
		angle: 90,
	},
	
	onNext: function()
	{
		var rot1 = Math.random() * Math.PI * 2;
		return {
			rot1: rot1,
			rot2: rot1 - settings.angle / 180 * Math.PI,
			
			viewMat: mulMat(mulMat(rotMat([0, 1, 0], Math.random() * Math.PI * 2), rotMat([1, 0, 0], -(Math.random() * 0.5 + 0.0625) * Math.PI * 0.5)), camMat(Math.random() * 60 + 20)),
			mMat: rotMat([1, 0, 0], Math.PI * 0.5),
		};
	},

	onQuestion: function()
	{
		clearGeo();
		definePoints([
			[0, 0, -0.25, 1],
			[0, 0,  0.25, 1],
			[Math.cos(question.rot1) * 0.5, Math.sin(question.rot1) * 0.5, -0.25, 1],
			[Math.cos(question.rot1) * 0.5, Math.sin(question.rot1) * 0.5, 0.25, 1],
			[Math.cos(question.rot2) * 0.5, Math.sin(question.rot2) * 0.5, -0.25, 1],
			[Math.cos(question.rot2) * 0.5, Math.sin(question.rot2) * 0.5, 0.25, 1]
		], question.mMat);
		defineNormals([[1, 0, 0], [0, 1, 1]]);
		defineEdges([
			[0, 4, 0, 0],
			[4, 5, -1, -1],
			[5, 1, 1, 1],

			[0, 2, 0, 0],
			[2, 3, -1, -1],
			[3, 1, 1, 1],

			[0, 1, -1, -1],
		], geo.edgeCount);
		if (settings.cylinder)
			addCylinder(settings.intersects, 1, 1, 0.5, question.mMat);
		else
			addEllipse(settings.intersects, 1, 1, Math.PI * 2, mulMat(transMat(0, 0, 0.25), question.mMat), false);

		addGrid(settings.grid ? 4 : 1, 1, 1, transMat(0, -0.25, 0), false);
		updateVPMatrix(question.viewMat, true);

		clear(ctx1);
		drawEdges(ctx1, 3);
	},

	onAnswered: function()
	{
		var pt = viewIntersectPlane(answer2, [0, 0, -0.25, 1], [0, 0, -1, 0], question.mMat);
		var rot = -Math.atan2(pt[0] - geo.points[1][0], pt[2] - geo.points[1][2]) + Math.PI * 0.5;
		var angleDelta = (rot - question.rot2) / Math.PI * 180;
		angleDelta = (angleDelta + 90 + 360) % 180 - 90;
		
		updateAverages({"angle": angleDelta});
	},

	onDraw: function()
	{		
		clear(ctx2);
		
		var pt = viewIntersectPlane(mouse, [0, 0, -0.25, 1], [0, 0, -1, 0], question.mMat);
		var rot = -Math.atan2(pt[0] - geo.points[1][0], pt[2] - geo.points[1][2]) + Math.PI * 0.5;

		var rot2 = hasAnswer2 ? question.rot2 : rot;
		definePoints([
			[Math.cos(rot2) * 0.5, Math.sin(rot2) * 0.5, -0.25, 1],
			[Math.cos(rot2) * 0.5, Math.sin(rot2) * 0.5, 0.25, 1]
		], question.mMat, 4);

		if (hasMouse || hasAnswer2)
			drawEdges(ctx2, 0, settings.plane || hasAnswer2 ? 3 : 1);

		if (hasAnswer2 && hasMouse)
		{
			definePoints([
				[Math.cos(rot) * 0.5, Math.sin(rot) * 0.5, -0.25, 1],
				[Math.cos(rot) * 0.5, Math.sin(rot) * 0.5, 0.25, 1]
			], question.mMat, 4);
	
			drawEdges(ctx2, 0, 3, colorHighlight);
		}		
	}
});
