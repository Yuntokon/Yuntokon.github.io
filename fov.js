register({
	title: "FOV I",
	description: "Estimate the rate of convergence, so that the box matches the scene",
	category: "Perspective",
	sideLayout: false,
	drawMode: 0,

	settings:
	{
		cube: true,
		randomAxis: false,
		rotateBoth: false,
	},
	
	onNext: function()
	{
		var size = 0.25 + Math.random() * 0.5;
		var viewMat = rotMat([1, 0, 0], -Math.random() * Math.PI * 0.5);
		
		return {
			targetFov: Math.random() * 80 + 20,

			width:  settings.cube ? size : 0.25 + Math.random() * 0.5,
			height: settings.cube ? size : 0.25 + Math.random() * 0.5,
			depth:  settings.cube ? size : 0.25 + Math.random() * 0.5,

			mMat: mulMat(rotMat(settings.randomAxis ? [Math.random(), Math.random(), Math.random()] : [0, 1, 0], Math.random() * Math.PI * 2), viewMat),
			mMat2:  mulMat(settings.rotateBoth ? rotMat(settings.randomAxis ? [Math.random(), Math.random(), Math.random()] : [0, 1, 0], Math.random() * Math.PI * 2) : identityMat(), viewMat)
		};
	},

	onQuestion: function()
	{
		clearGeo();
		
		addBox(question.width, question.height, question.depth, question.mMat);
		addBox(0.9, 0.9, 0.9, question.mMat2);

		updateVPMatrix(camMat(question.targetFov), true);

		clear(ctx1);	
		drawEdges(ctx1, 12, 24);
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
});
