register({
	title: "Viewpoint change I",
	description: "Match the scenes in both perspectives",

	category: "Perspective",
	sideLayout: true,
	drawMode: 1,
	
	settings:
	{
		grid: true,
		_position: true,
		_rotation: false,
	},
	
	onNext: function()
	{			
		return {			
			pos: [Math.random() - 0.5, 0.05, Math.random() - 0.5, 1],
			rot: Math.random() * Math.PI * 2,
			
			viewMat1: mulMat(mulMat(rotMat([0, 1, 0], Math.random() * Math.PI * 2), rotMat([1, 0, 0], -(Math.random() * 0.75 + 0.125) * Math.PI * 0.5)), camMat(Math.random() * 60 + 20)),
			
			viewMat2: mulMat(mulMat(rotMat([0, 1, 0], Math.random() * Math.PI * 2), rotMat([1, 0, 0], -(Math.random() * 0.75 + 0.125) * Math.PI * 0.5)), camMat(Math.random() * 60 + 20))
		};
	},

	onQuestion: function()
	{
		clearGeo();
		
		addBox(0.1, 0.1, 0.2, transRotMat(question.pos[0], question.pos[1], question.pos[2], 0, question.rot, 0));
		addBox(0.1, 0.5, 0.1, transRotMat(0.5, 0.25, 0.5, 0, Math.PI * 0.25, 0));
		addGrid(settings.grid ? 4 : 1, 1.2, 1.2, transMat(0, 0, 0), false);
		updateVPMatrix(question.viewMat1, true);

		clear(ctx1);	
		drawEdges(ctx1);
		
		updateVPMatrix(question.viewMat2, true);
	},
	

	onAnswered: function()
	{
		var deltas = {};
		if (settings._position)
			deltas["pos"] = dist(proj(geo.vpMat, question.pos), answer1) * 10;
		
		if (settings._rotation)
		{
			var pt2 = viewIntersectPlane(answer2, [0, 0, 0, 1], [0, 1, 0, 0]);
			var pt1 = !settings._position ? pt2 : viewIntersectPlane(answer1, [0, 0, 0, 1], [0, 1, 0, 0]);
			var pos = settings._position ? (hasAnswer1 ? pt1 : pt2) : question.pos;

			var angleDelta =  (Math.atan2(pt2[0] - pos[0], pt2[2] - pos[2]) - question.rot) / Math.PI * 180;
			angleDelta = (angleDelta + 90 + 360) % 180 - 90;
			deltas["angle"] = angleDelta;
		}

		updateAverages(deltas);
	},

	onDraw: function()
	{		
		clear(ctx2);
		
		var pt2 = viewIntersectPlane(mouse, [0, 0, 0, 1], [0, 1, 0, 0]);
		var pt1 = settings._rotation && !settings._position ? pt2 : viewIntersectPlane(answer1, [0, 0, 0, 1], [0, 1, 0, 0]);

		var pos = settings._position ? (hasAnswer1 ? pt1 : pt2) : question.pos;
		pos[0] = clampBetween(pos[0], -0.5, 0.5);
		pos[1] = question.pos[1];
		pos[2] = clampBetween(pos[2], -0.5, 0.5);

		var rot = settings._rotation ? Math.atan2(pt2[0] - pos[0], pt2[2] - pos[2]) : question.rot;
		
		if (hasAnswer2)
			updateBox(0, 0.1, 0.1, 0.2, transRotMat(question.pos[0], question.pos[1], question.pos[2], 0, question.rot, 0));
		else          
			updateBox(0, 0.1, 0.1, 0.2, transRotMat(pos[0], pos[1], pos[2], 0, rot, 0));

		drawEdges(ctx2, hasMouse || hasAnswer2 ? 0 : 12);

		if (hasAnswer2 && hasMouse)
		{			
			updateBox(0, 0.1, 0.1, 0.2, transRotMat(pos[0], pos[1], pos[2], 0, rot, 0));
			drawEdges(ctx2, 0, 12, colorHighlight);
			
			updateVPMatrix(question.viewMat1, true);

			drawEdges(ctx1, 0, 12, colorHighlight);	
			updateVPMatrix(question.viewMat2, true);
		}
	}
},[
	{
		title: "Viewpoint change II",
		
		settings:
		{
			_position: false,
			_rotation: true,
		},	
	},
	{
		title: "Viewpoint change III",
		
		settings:
		{
			_position: true,
			_rotation: true,
		},	
	}
]);
