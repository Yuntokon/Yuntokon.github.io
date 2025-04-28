register({
	title: "Vanishing Point IV",
	description: "Complete the box",
	category: "Perspective",
	sideLayout: false,
	offsetTouch: true,
	drawMode: 1,

	settings:
	{
		_moveSide: false
	},
	
	onNext: function()
	{						
		return {
			width: 0.5 + Math.random() * 0.5,
		    height: 0.5 + Math.random() * 0.5,
		    depth: 0.5 + Math.random() * 0.5,
			
			mMat: rotMat([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, 0], Math.random() * Math.PI * 2),
			fov: Math.random() * 100 + 2
		};
	},

	onQuestion: function()
	{
		clearGeo();
		addBox(question.width, question.height, question.depth, question.mMat);

		updateVPMatrix(camMat(question.fov), true);
		question.mvp = mulMat(question.mMat, geo.vpMat);
	},

	onAnswered: function()
	{
		var pt = geo.pointsP[0];
		if (settings._moveSide)
			pt = mulVec(addVec(pt, geo.pointsP[1]), 0.5);
		var delta = dist(pt, answer2) * 10;
		updateAverages({"": delta});
	},

	onDraw: function()
	{		
		clear(ctx2);
		if (hasAnswer2)
		{
			ctx2.lineWidth = lineWidth(1);		
			ctx2.strokeStyle = colorLight;
			ctx2.beginPath();
			
			var mvp = question.mvp;
			var vp1 = proj(mvp, [1, 0, 0, 0]);
			var vp2 = proj(mvp, [0, 1, 0, 0]);
			var vp3 = proj(mvp, [0, 0, 1, 0]);

			drawEdge1(ctx2, vp3, geo.pointsP[4]);
			drawEdge1(ctx2, vp3, geo.pointsP[5]);
			drawEdge1(ctx2, vp3, geo.pointsP[6]);
			drawEdge1(ctx2, vp3, geo.pointsP[7]);
			
			drawEdge1(ctx2, vp2, geo.pointsP[1]);	
			drawEdge1(ctx2, vp2, geo.pointsP[2]);	
			drawEdge1(ctx2, vp2, geo.pointsP[6]);	
			drawEdge1(ctx2, vp2, geo.pointsP[5]);	
			
			drawEdge1(ctx2, vp1, geo.pointsP[0]);	
			drawEdge1(ctx2, vp1, geo.pointsP[2]);	
			drawEdge1(ctx2, vp1, geo.pointsP[5]);	
			drawEdge1(ctx2, vp1, geo.pointsP[7]);	
			
			ctx2.stroke();	
			
			ctx2.lineWidth = lineWidth(2);	
			ctx2.strokeStyle  = colorNormal
		}
		
		drawEdges(ctx2, hasAnswer2 ? 0 : settings._moveSide ? 5 : 3);

		if (hasAnswer2)	
			ctx2.strokeStyle  = colorHighlightNormal

		if (hasMouse)
		{
			if (!hasAnswer2)
				ctx2.setLineDash([lineWidth(2), lineWidth(10)]);	
			ctx2.beginPath();
			
			if (settings._moveSide)
			{
				var d = dist(geo.pointsP[0], geo.pointsP[1]);
				var mid = mulVec(addVec(geo.pointsP[0], geo.pointsP[1]), 0.5);
				var vp = LineThrough(geo.pointsP[0], geo.pointsP[1]).intersect(LineThrough(geo.pointsP[2], geo.pointsP[3]));
				var p0, p1;
				if (vp[0] == vp[0])
				{
					var dir = subVec(vp, mouse);
					dir = mulVec(dir, d / lengthVec(dir) * 0.5 * Math.sign(dotVec(subVec(vp, mid), subVec(geo.pointsP[1], geo.pointsP[0]))));
					p0 = subVec(mouse, dir);
					p1 = addVec(mouse, dir);		
				}
				else
				{
					p0 = addVec(mouse, subVec(geo.pointsP[0], mid));
					p1 = addVec(mouse, subVec(geo.pointsP[1], mid));
				}
					
				
				drawEdge(ctx2, p0, p1);
				drawEdge(ctx2, geo.pointsP[3], p0); 
				drawEdge(ctx2, p0, geo.pointsP[4]); 
				drawEdge(ctx2, p1, geo.pointsP[2]); 
				drawEdge(ctx2, p1, geo.pointsP[5]); 
			}
			else
			{
				drawEdge(ctx2, geo.pointsP[1], mouse);
				drawEdge(ctx2, geo.pointsP[3], mouse);
				drawEdge(ctx2, geo.pointsP[4], mouse);
			}
			
			ctx2.stroke();		
			ctx2.setLineDash([]);
		}
	}
}, [
{
	title: "Vanishing Point V",
	settings:
	{
		_moveSide: true
	}
}
]);
