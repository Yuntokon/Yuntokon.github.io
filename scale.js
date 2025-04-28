register({
	title: "Scale",
	description: "Estimate the scale of the square after moving",

	category: "Perspective",
	sideLayout: false,
	drawMode: 1,
	
	settings:
	{
		rotation: true,
		grid: true,
	},
	
	onNext: function()
	{		
		var vpMat = mulMat(rotMat([1, 0, 0], -(Math.random() * 0.75 + 0.125) * Math.PI * 0.25), camMat(Math.random() * 60 + 20));
		
		var pos = [0, 0, -10];
		while (!(pos[2] > -0.25) || pos[2] > 20)
			pos = viewIntersectPlane([(Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.75], [0, 0, 0, 1], [0, 1, 0, 0], identityMat(), vpMat);

		var mMat = mulMat(rotMat([0, 1, 0], settings.rotation ? Math.random() * Math.PI * 2 : 0), transMat(pos[0], pos[1], pos[2]));
		
		return {
			pos: pos,
			mMat: mMat,
			vpMat: vpMat,
			guideScale: Math.random() * 0.5 + 0.5
		};
	},

	onQuestion: function()
	{
		clearGeo();

		addGrid(settings.grid ? 4 : 1, 1, 1, identityMat(), true);
		addGrid(settings.grid ? 4 : 1, 1, 1, question.mMat, false);

		var ptOffset = geo.pointCount;
		var s = question.guideScale;
		definePoints([
			[-s, 0, -s, 1],
			[ s, 0,  s, 1],
			[-s, 0,  s, 1],
			[ s, 0, -s, 1],
		], question.mMat);
		defineEdges([
			[0, 1, -1, -1, 0],
			[2, 3, -1, -1, 0],
		], geo.edgeCount, ptOffset);
		
		updateVPMatrix(question.vpMat, true);

		clear(ctx1);	
		drawEdges(ctx1, 0, settings.grid ? 10 : 4);		

		var horizon = proj(question.vpMat, [0, 0, 1e10, 1])[1];
		ctx1.setLineDash([lineWidth(2), lineWidth(10)]);	
		ctx1.beginPath();
		ctx1.moveTo(canvasLeft,  horizon);
		ctx1.lineTo(canvasRight, horizon);
		ctx1.stroke();
		ctx1.setLineDash([]);
	},
	

	onAnswered: function()
	{
		var pt = viewIntersectPlane(answer2, [0, 0, 0, 1], [0, 1, 0, 0]);
		var scale = !pt[0] ? 0 : clampBetween(lengthVec(subVec(question.pos, pt)) * 2 / Math.sqrt(2), 0.1, 5);
		
		var delta = scale - 1;
		updateAverages({"": delta});
	},

	onDraw: function()
	{		
		clear(ctx2);
		
		var pt = viewIntersectPlane(mouse, [0, 0, 0, 1], [0, 1, 0, 0]);
		var scale = hasMouse ? !pt[0] ? 0 : clampBetween(lengthVec(subVec(question.pos, pt)) * 2 / Math.sqrt(2), 0.1, 5) : 0;
		
		updateGrid(settings.grid ? 20 : 8, settings.grid ? 4 : 1, hasAnswer2 ? 1 : scale, hasAnswer2 ? 1 : scale, question.mMat);

		drawEdges(ctx2, settings.grid ? 10 : 4, hasMouse ? (settings.grid ? 20 : 8) : geo.edgeCount);

		if (hasAnswer2)
		{			
			updateGrid(settings.grid ? 20 : 8, settings.grid ? 4 : 1, scale, scale, question.mMat);
			drawEdges(ctx2, settings.grid ? 10 : 4, settings.grid ? 20 : 8, colorHighlight);
		}
	}
});
