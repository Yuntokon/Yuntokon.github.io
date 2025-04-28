register({
	title: "Loomis III",
	description: "Complete the head",
	category: "Perspective",
	sideLayout: false,
	drawMode: 1,

	settings:
	{
		intersects1: 32,
		intersects2: 64,
		animeChin: false,
	},

	onNext: function()
	{
		var width = 0.5 + Math.random() * 0.6;
		return {
			radius: width,
			
			mMat: mulMat(rotMat([0, 1, 0], (Math.random() * 1 - 0.5) * Math.PI), rotMat([1, 0, 0], -(Math.random() * 0.25 - 0.125) * Math.PI)),
			fov: Math.random() * 50 + 10
		};
	},

	onQuestion: function()
	{
		clearGeo();
		
		var flatten = Math.floor(settings.intersects1 / 4);
		var r = question.radius;
		var w = Math.sin( -Math.PI * 0.5 + Math.PI * flatten / settings.intersects1) * r * -0.5;
		var h = Math.sin(Math.PI * flatten / settings.intersects1) * r * 0.5;

		question.chinPoint = [-w * (settings.animeChin ? 0.05 : 0.25), -h * (settings.animeChin ? 1.9 : 2), -0.5 * r, 1]
		
		definePoints([
			[-w * 0.1, h, -h, 1],
			[ w * 0.1, h, -h, 1],
			[-w * 0.1, 0, -0.5 * r, 1],
			[ w * 0.1, 0, -0.5 * r, 1],
			[-w * 0.1, -h, -0.5 * r, 1],
			[ w * 0.1, -h, -0.5 * r, 1],
			question.chinPoint,
			[-question.chinPoint[0], question.chinPoint[1], question.chinPoint[2], 1],
			
			[ 0, 0,      -0.5 * r, 1],
			[ 0, -h * (settings.animeChin ? 1.9 : 2), -0.5 * r, 1],
			
			[ -w * 0.8, -h * 1.5, h * -0.5, 1],
			[  w * 0.8, -h * 1.5, h * -0.5, 1],
			[ -w, -h, 0, 1],
			[  w, -h, 0, 1],
					  
			[ -w, -h * Math.sin(0.125 * Math.PI), -h * Math.cos(0.125 * Math.PI), 1],
			[  w, -h * Math.sin(0.125 * Math.PI), -h * Math.cos(0.125 * Math.PI), 1],
			[ -w * 0.9, -h * 1, -h, 1],
			[  w * 0.9, -h * 1, -h, 1],
		], identityMat());
		defineNormals([[0, 1, 4], [6, 12, 14], [7, 15, 13], [6, 14, 7], [6, 7, 12]]);
		defineEdges([
			[0, 1, 0, 0, 0],
			//[2, 3, 0, 0, 0],
			[4, 5, 0, 0, 0],
			[8, 9, 0, 0, 0],
			//[14, 15, 0, 0, 0],

			[6, 7, 0, 4, 0],
			
			[6, 10, 1, 4, 0],
			[10, 12, 1, 4, 0],
			[7, 11, 2, 4, 0],
			[11, 13, 2, 4, 0],

			[6, 16, 1, 3, 0],
			[16, 14, 1, 3, 0],
			[7, 17, 2, 3, 0],
			[17, 15, 2, 3, 0],
			
			[6, 7, 0, 4, 0],		
			[6, 12, 1, 4, 0],
			[7, 13, 2, 4, 0],
			[6, 14, 1, 3, 0],
			[7, 15, 2, 3, 0],
		]);
		
		addSphere(settings.intersects1, settings.intersects2, question.radius, question.radius, question.radius, identityMat(), flatten);
		
		for (var i = 17; i < 17 + (settings.intersects1 * 2 - 1) * settings.intersects2; ++i)
			if (geo.edges[i][4] == 0)
				geo.edges[i][4] = 6;
						
		updateVPMatrix(mulMat(question.mMat, camMat(question.fov)), true);
	},

	onAnswered: function()
	{
		updateAverages({"": dist(answer2, geo.pointsP[9]) * 10});
	},

	onDraw: function()
	{		
		//var rotX = -(clampBetween(-mouse[1] * 1.25, -1, 1) * 0.75 + 0.125) * Math.PI * 0.5;
		//var rotY = -mouse[0] * 1.25 * Math.PI * 2;
		//var viewMat2 = mulMat(mulMat(rotMat([0, 1, 0], rotY), rotMat([1, 0, 0], rotX)), camMat(question.fov));
		//
		//updateVPMatrix(viewMat2, true);
	
		if (hasAnswer2)
		{
			for (var i = 17; i < 17 + (settings.intersects1 * 2 - 1) * settings.intersects2; ++i)
				if (geo.edges[i][4] == 6)
					geo.edges[i][4] = 0;		
		}
	
		clear(ctx2);		
		drawEdges(ctx2, 17);

		var pt = hasAnswer2 ? [0, question.chinPoint[1], question.chinPoint[2], 1] : viewIntersectPlane(mouse, question.chinPoint, [0, 1, 0, 0]);
		if ((hasMouse || hasAnswer2) && pt[0] != NaN)
		{
			geo.points[6] = [pt[0] + question.chinPoint[0], pt[1], pt[2], 1];
			geo.points[7] = [pt[0] - question.chinPoint[0], pt[1], pt[2], 1];

			updatePoints();
			updateNormals();

			drawEdges(ctx2, hasAnswer2 ? 0 : 12, hasAnswer2 ? 12 : 17);
		}
		
		if (hasAnswer2 && hasMouse)
		{
			pt = viewIntersectPlane(mouse, question.chinPoint, [0, 1, 0, 0]);

			geo.points[6] = [pt[0] + question.chinPoint[0], pt[1], pt[2], 1];
			geo.points[7] = [pt[0] - question.chinPoint[0], pt[1], pt[2], 1];

			updatePoints();
			updateNormals();

			drawEdges(ctx2, 3,  12, colorHighlight);
		}
	}
});
