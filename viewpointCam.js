register({
	title: "Viewpoint change IV",
	description: "Rotate the scene to the viewpoint of the camera",

	category: "Perspective",
	sideLayout: true,
	drawMode: 0,
	
	settings:
	{
		grid: true,
	},
	
	onNext: function()
	{			
		return {
			fov: Math.random() * 60 + 20,
			
			rotX: -(Math.random() * 0.75 + 0.125) * Math.PI * 0.5,
			rotY: Math.random() * Math.PI * 2,
			
			viewMat1: mulMat(mulMat(rotMat([0, 1, 0], Math.random() * Math.PI * 2), rotMat([1, 0, 0], -(Math.random() * 0.75 + 0.125) * Math.PI * 0.5)), camMat(Math.random() * 60 + 20, 1.5)),
		};
	},

	onQuestion: function()
	{
		clearGeo();
		
		var mat = mulMat(transMat(0, 0, -1), mulMat(rotMat([1, 0, 0], -question.rotX), rotMat([0, 1, 0], -question.rotY)));
		var offset = geo.pointCoint;
		var height = 0.2 * Math.tan(question.fov / 180 * Math.PI / 2);
		var width = height * canvasRatio;

		definePoints([
		[0, 0, 0.1, 1],
		[-width, -height, 0.3, 1],
		[-width,  height, 0.3, 1],
		[ width,  height, 0.3, 1],
		[ width, -height, 0.3, 1]], mat);
		
		defineEdges([
			[0, 1,  -1, -1],
			[0, 2,  -1, -1],
			[0, 3,  -1, -1],		
			[0, 4,  -1, -1],
			[1, 2,  -1, -1],
			[2, 3,  -1, -1],
			[3, 4,  -1, -1],
			[4, 1,  -1, -1]], geo.edgeCount, offset);

		addBox(0.1, 0.1, 0.2, mat);
		addBox(0.1, 0.5, 0.1, transRotMat(0.5, 0.25, 0.5, 0, Math.PI * 0.25, 0));
		addGrid(settings.grid ? 4 : 1, 1.2, 1.2, transMat(0, 0, 0), false);

		updateVPMatrix(question.viewMat1, true);

		clear(ctx1);	
		drawEdges(ctx1);	
		
		var cam = mulMatVec(mat, [0, 0, 0, 1]);
		ctx1.setLineDash([lineWidth(2), lineWidth(10)]);
		ctx1.beginPath();
		moveToProj(ctx1, [0, 0, 0, 1]);
		lineToProj(ctx1, [cam[0], 0, cam[2], 1]);
		lineToProj(ctx1, cam);
		ctx1.stroke();
		ctx1.setLineDash([]);
	},
	

	onAnswered: function()
	{
		var angleDeltaX = (-(clampBetween(-answer2[1] * 1.25 + 0.5, 0, 1) * 0.75 + 0.125) * Math.PI * 0.5 - question.rotX) / Math.PI * 180;
		var angleDeltaY = (-answer2[0] * 1.25 * Math.PI * 2 - question.rotY) / Math.PI * 180;

		angleDeltaX = (angleDeltaX + 180 + 360) % 360 - 180;
		angleDeltaY = (angleDeltaY + 180 + 360) % 360 - 180;

		updateAverages({"angleX": angleDeltaX, "angleY": angleDeltaY});
	},

	onDraw: function()
	{		
		var rotX = -(clampBetween(-mouse[1] * 1.25 + 0.5, 0, 1) * 0.75 + 0.125) * Math.PI * 0.5;
		var rotY = -mouse[0] * 1.25 * Math.PI * 2;
		var viewMat2 = mulMat(mulMat(rotMat([0, 1, 0], rotY), rotMat([1, 0, 0], rotX)), camMat(question.fov));
	
		clear(ctx2);
		if (!hasAnswer2)
		{
			updateVPMatrix(viewMat2, true);
			drawEdges(ctx2, 20);
		}

		if (hasAnswer2)
		{	
			updateVPMatrix(mulMat(mulMat(rotMat([0, 1, 0], question.rotY), rotMat([1, 0, 0], question.rotX)), camMat(question.fov)), true);
			
			drawEdges(ctx2, 20);	
			
			updateVPMatrix(viewMat2, true);

			drawEdges(ctx2, 0, 20);	

			var mat = mulMat(transMat(0, 0, -1), mulMat(rotMat([1, 0, 0], -question.rotX), rotMat([0, 1, 0], -question.rotY)));
			var cam = mulMatVec(mat, [0, 0, 0, 1]);
			ctx2.setLineDash([lineWidth(2), lineWidth(10)]);
			ctx2.beginPath();
			moveToProj(ctx2, [0, 0, 0, 1]);
			lineToProj(ctx2, [cam[0], 0, cam[2], 1]);
			lineToProj(ctx2, cam);
			ctx2.stroke();

			mat = mulMat(transMat(0, 0, -1), mulMat(rotMat([1, 0, 0], -rotX), rotMat([0, 1, 0], -rotY)));
			cam = mulMatVec(mat, [0, 0, 0, 1]);
			
			ctx2.strokeStyle  = colorHighlightNormal
			ctx2.beginPath();
			moveToProj(ctx2, [0, 0, 0, 1]);
			lineToProj(ctx2, [cam[0] / Math.tan(question.fov / 180 * Math.PI / 2), 0, cam[2] / Math.tan(question.fov / 180 * Math.PI / 2), 1]);
			ctx2.stroke();
			ctx2.setLineDash([]);
		
			drawEdges(ctx2, 20, geo.edgeCount, colorHighlight);

			var offset = geo.pointCoint;
			var height = 0.2 * Math.tan(question.fov / 180 * Math.PI / 2);
			var width = height * canvasRatio;

			definePoints([
			[0, 0, 0.1, 1],
			[-width, -height, 0.3, 1],
			[-width,  height, 0.3, 1],
			[ width,  height, 0.3, 1],
			[ width, -height, 0.3, 1]], mat, 0);
			
			updateBox(5, 0.1, 0.1, 0.2, mat);
		
			updateVPMatrix(question.viewMat1);

			drawEdges(ctx1, 0, 20, colorHighlight);	
			ctx1.setLineDash([lineWidth(2), lineWidth(10)]);
			ctx1.beginPath();
			moveToProj(ctx1, [0, 0, 0, 1]);
			lineToProj(ctx1, [cam[0], 0, cam[2], 1]);
			lineToProj(ctx1, cam);
			ctx1.stroke();
			ctx1.setLineDash([]);
		}
	}
});
