const colorBold = "#7a0246d0";
const colorNormal = "#7a0246a0";
const colorLight = "#7a024620";
const colorHighlight = "#3abbff";
const colorHighlightNormal = "#3abbffa0";
const colorShadow = "#e1cad1ff";

var canvas1, canvas2, canvas3, canvas4;
var divider;
var deltaText;
var timerProgress, timerLabel, counterLabel;
var menu, settingsMenu, settingsDescription, settingsGlobalMenu;
var tmpCanvas;

var canvasRatio, canvasWidth, canvasHeight;
var canvasLeft, canvasTop, canvasRight, canvasBottom;
var canvasDrawX, canvasDrawY, canvasDrawWidth, canvasDrawHeight;
var ctx1, ctx2, ctx3, ctx4;

var wasDrawMode = false;
var drawMode = false;
var flipCanvas = false;

var drawWidth = 1.0;
var drawCursor, verticalGuide, horizontalGuide;
var toggleDrawmode = function(b) {}
var redrawDrawmode = function(b) {}

var lastMouse = [-1, -1];
var mouse = [-1, -1];
var answer1 = [-1, -1];
var answer2 = [-1, -1];
var hasMouse = false;
var hasAnswer1 = false;
var hasAnswer2 = false;

var timelimit = 15;
var paused = true;
var timeLimitInput;
var pausedCheck;
var fullScreenCheck;
var flipCanvasCheck;
var drawmodeCheck;
var colorPickerCheck;
var downloadDrawing;
var fileIndex;
var dropdown;

var allTasks = [];
var tasksById = [];
var currentTask;
var currentSchedule;
var question;

var colorPicker = false;
var showColorpicker = function(b) {}
var showColorDiff = function(color) {}
var colorPickerColor = [0, 0, 0]
var colorPickerColorRGB = [0, 0, 0]
var answerColor = [0, 0, 0];
var mask = new Image();

var imageFiles = [];

var drawDebug = false;
var geo = 
{
	vpMat: identityMat(),
	points: [],
	pointsP: [],
	
	normals: [],
	normalDefs:[],
	edges: [],
	
	pointsDirty: false,
	normalsDirty: false,
	
	pointCount: 0,
	normalCount: 0,
	edgeCount: 0
};

var opencvReady = false;

function register(task, variants = [])
{
	if (!task.title || !task.description || !task.category || !task.onQuestion || !task.onNext || !task.onAnswered || !task.onDraw)
	{
		console.error("Failed to register task: " + task);
		return;
	}
	task.questionStack = [];
	task.questionIndex = -1;
	task.averages = {};
	task.num = 0;
	task.id = task.title.replaceAll(" / ", "_").replaceAll(" ", "_");

	if (!allTasks[task.category])
		allTasks[task.category] = [];
	allTasks[task.category].push(task);	
	tasksById[task.id] = task;

	for (var i = 0; i < variants.length; ++i)
	{
		var variant = Object.assign(Object.assign({}, task), variants[i]);
		variant.settings = Object.assign(Object.assign({}, task.settings), variants[i].settings);
		variant.questionStack = [];
		variant.averages = {};
		variant.id = variant.title.replaceAll(" / ", "_").replaceAll(" ", "_");

		if (!allTasks[variant.category])
			allTasks[variant.category] = [];
		allTasks[variant.category].push(variant);	
		tasksById[variant.id] = variant;
	}
}

function pause(p)
{
	paused = p;
	if (p)
		timerProgress.classList.add("paused");
	else
		timerProgress.classList.remove("paused");
	pausedCheck.checked = paused;
}

function toggleFlipCanvas()
{
	flipCanvas = !flipCanvas;
	flipCanvasCheck.checked = flipCanvas;
	canvas1.classList.toggle("flip");
	canvas2.classList.toggle("flip");
	ctx3.scale(-1, 1);
	ctx4.scale(-1, 1);

	redrawDrawmode(true);
}

function init()
{		
	mask.src = "mask.png";
	tmpCanvas = document.createElement("canvas");
	tmpCanvas.id = "tmpCanvas";
	tmpCanvas.willReadFrequently = true;
	//document.body.appendChild(tmpCanvas);
	
	drawCursor = document.getElementById("drawCursor");
	horizontalGuide = document.getElementById("horizontalGuide");
	verticalGuide = document.getElementById("verticalGuide");

	menu = document.getElementById("menu");
	settingsMenu = document.getElementById("settings");
	settingsDescription = document.getElementById("settingsDescription");
	settingsGlobalMenu = document.getElementById("settingsGlobal");
	timerProgress = document.getElementById("timer-progress");
	timerLabel = document.getElementById("timer-label");
	counterLabel = document.getElementById("counter");
	deltaText = document.getElementById("delta");
	canvas1 = document.getElementById("canvas1");
	canvas2 = document.getElementById("canvas2");
	canvas3 = document.getElementById("canvas3");
	canvas4 = document.getElementById("canvas4");
	divider = document.getElementById("divider");
	menu.onclick = function() { 
		if (dropdown && dropdown.classList.contains("extended"))
			dropdown.classList.remove("extended");
		else if (!menu.classList.contains("extended"))
			menu.classList.add("extended"); 
	};

	deltaText.ondragstart = deltaText.oncontextmenu =
	canvas1.ondragstart = canvas1.oncontextmenu = 
	canvas2.ondragstart = canvas2.oncontextmenu =
	canvas3.ondragstart = canvas3.oncontextmenu =	
	canvas4.ondragstart = canvas4.oncontextmenu = function() { return false};
	
	if (window.location.hash)
		window.onload = function() {}

    var timer_id = undefined;
    window.addEventListener("resize", function() {
        if(timer_id != undefined) {
            clearTimeout(timer_id);
            timer_id = undefined;
        }
        timer_id = setTimeout(function() {
            timer_id = undefined;
            resize();
        }, 100);
    });
	document.addEventListener("fullscreenchange", function() {
		if (fullScreenCheck)
			fullScreenCheck.checked = document.fullscreenElement;
	});
	
	canvas2.onpointerdown  = function(e) {
		closeMenu();

		if (!hasAnswer2)
		{
			hasAnswer1 = true;
			var off = canvas2.getBoundingClientRect();
			answer1 = transformMousePt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)], e.pointerType == "touch");
			requestAnimationFrame(currentTask.onDraw);
		}
	};
	canvas2.onpointerup  = function(e) {
		if (settings.files != undefined && settings.files.length == 0)
			document.getElementById("settings.files").click();

		if (hasAnswer2)
		{
			var now = new Date();
			if (now - timeOut > 500)
				next();
		}
		else
		{
			hasAnswer2 = true;
			var off = canvas2.getBoundingClientRect();
			answer2 =  transformMousePt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)], e.pointerType == "touch");
			clearInterval(timer);
			currentTask.onAnswered();
			requestAnimationFrame(currentTask.onDraw);
		}
	};
    canvas2.onpointermove = function(e) 
    {
		var off = canvas2.getBoundingClientRect();
		if (!hasAnswer2)
		{
			hasMouse = true;
			mouse = transformMousePt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)], e.pointerType == "touch");
			requestAnimationFrame(currentTask.onDraw);
		}
		lastMouse = transformMousePt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)], e.pointerType == "touch");
    };
	canvas2.onpointerleave = function(e) 
    {
		if (!hasAnswer2)
		{
			hasMouse = false;
			hasAnswer1 = false;
			requestAnimationFrame(currentTask.onDraw);
		}
    };

	ctx1 = canvas1.getContext("2d");
	ctx2 = canvas2.getContext("2d");
	ctx3 = canvas3.getContext("2d");
	ctx4 = canvas4.getContext("2d");
	tmpCtx = tmpCanvas.getContext("2d");

	ctx1.imageSmoothingQuality = ctx2.imageSmoothingQuality = tmpCtx.imageSmoothingQuality = "high"

	setupDrawMode();
	setupColorpicker();

	var nav = document.getElementById("tasks");
	var nextTask;
	for (var c in allTasks)
	{
		if (c != "_")		
		{
			var h = document.createElement("h3");
			h.textContent = c;
			nav.appendChild(h);
		}

		var ul = document.createElement("ul");
		var tasks = allTasks[c];
		for (var i = 0; i < tasks.length; ++i)
		{
			let task = tasks[i];
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.href = "#"+task.id;
			a.textContent = task.title;
			a.title = task.description;
			li.appendChild(a);
			ul.appendChild(li);
			if (!nextTask || window.location.hash && ('#' + encodeURIComponent(task.id)) == window.location.hash)
				nextTask = task;
		}
		nav.appendChild(ul);
	}
	
	
	window.onhashchange = function() {
		task = tasksById[decodeURIComponent(window.location.hash.substring(1))];
		if (!task)
			task = tasksById["Warm-up"];
		closeMenu();
		nav.scrollTo(0, 0);
		currentSchedule = undefined;
		switchTasks(task);
	}
	
	switchTasks(nextTask);
}

function switchTasks(t)
{
	document.title = t.category == "_" ? t.title : t.category + " - " + t.title;
	settingsDescription.innerText = t.description;
		
	loadingImage = undefined;
	question = undefined;
	settings = t.settings;
	createSettingsMenu();
	counterLabel.textContent = currentSchedule && !t.settings._schedule ? currentSchedule.reduce((a, b) => a + b.count, 0) - t.num : t.num;
	currentTask = t;
	clearGeo();
	showColorpicker(false);
	drawModeCheck.disabled = t.drawMode != 1;
	toggleDrawmode(t.drawMode == 2 || t.drawMode == 1 && wasDrawMode);
	colorPickerCheck.disabled = !drawMode;
	downloadDrawing.parentNode.style.display = drawMode ? 'block' : 'none';

	resize();
	next();
}

function startSchedule(schedule)
{
	var sched = [{
		task: currentTask.id,
		count: -1,
	}]
	sched.push(...schedule);
	sched.push({
		task: currentTask.id,
		count: 0,
		settings: { _finished: true }
	});
	for (let task of sched)
		if (tasksById[task.task] == undefined)
			console.log("No such task: " + task.task);
	currentSchedule = sched;
	next();
}

function closeMenu()
{
	if (dropdown && dropdown.classList.contains("extended"))
		dropdown.classList.remove("extended");
	else if (menu.classList.contains("extended"))
		menu.classList.remove("extended");
}

function createSettingsMenu()
{	
	var ul = document.createElement("ul");
	timeLimitInput = addSettingsInput("timelimit", ul);
	timeLimitInput.value = timelimit;
	timeLimitInput.addEventListener('input', function(e) {
		if (e.target.valueAsNumber >= 0)
			timelimit = e.target.valueAsNumber;
	});
	fullScreenCheck = addSettingsInput("fullscreen", ul);
	fullScreenCheck.type = 'checkbox';
	fullScreenCheck.checked = document.fullscreenElement;
	fullScreenCheck.addEventListener('input', function(e) {
		if (document.fullscreenElement)
			document.exitFullscreen();
		else
			document.documentElement.requestFullscreen();

	});
	
	pausedCheck = addSettingsInput("paused", ul);
	pausedCheck.type = 'checkbox';
	pausedCheck.checked = paused;
	pausedCheck.addEventListener('input', function(e) {
		pause(e.target.checked);
	});
	
	flipCanvasCheck = addSettingsInput("flipCanvas", ul);
	flipCanvasCheck.type = 'checkbox';
	flipCanvasCheck.checked = flipCanvas;
	flipCanvasCheck.addEventListener('input', function(e) {
		toggleFlipCanvas();
	});
	
	drawModeCheck = addSettingsInput("drawMode", ul);
	drawModeCheck.type = 'checkbox';
	drawModeCheck.checked = drawMode;
	drawModeCheck.addEventListener('input', function(e) {
		toggleDrawmode(e.target.checked);
	});
	
	colorPickerCheck = addSettingsInput("colorPicker", ul);
	colorPickerCheck.type = 'checkbox';
	colorPickerCheck.checked = colorPicker;
	colorPickerCheck.disabled = !drawMode;
	colorPickerCheck.addEventListener('input', function(e) {
		showColorpicker(e.target.checked);
	});
	
	var li = document.createElement("li");	
	li.className = "no-marker";
	li.style.display = drawMode ? 'block' : 'none';
	
	downloadDrawing = document.createElement("a");
	downloadDrawing.innerText = "Download Drawing"
	downloadDrawing.download = "Canvas.png"
	downloadDrawing.title="Download transparent image of current drawing at window resolution"
	downloadDrawing.href = "#"
	downloadDrawing.addEventListener('click', function(e) {
	  var dt = canvas3.toDataURL('image/png');
	  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
	  dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

	  downloadDrawing.href = dt;
	}, false);
	
	li.appendChild(downloadDrawing);
	ul.appendChild(li);
	settingsGlobalMenu.replaceChildren(ul);

	ul = document.createElement("ul");
	var empty = true;
	
	for (let k in settings)
	{
		if (k.startsWith("_") || k == "files" || settings[k] == undefined)
			continue;

		var input = addSettingsInput(k, ul);
		let check = typeof(settings[k]) == 'boolean';
		input.type = check ? 'checkbox' : 'number';
		input.value = settings[k];
		if (check)
			input.checked = settings[k];

		input.addEventListener('input', 
		function(e) {
			if (check)
				settings[k] = e.target.checked;
			else if (e.target.valueAsNumber || e.target.valueAsNumber == 0)
				settings[k] = e.target.valueAsNumber;
			
			if (question)
			{
				currentTask.onQuestion();
				requestAnimationFrame(currentTask.onDraw);
			}
		});
		empty = false;
	}
		
	dropdown = undefined;

	if (settings._schedule)
	{
		if (!settings._defaultSchedule)
			settings._defaultSchedule = JSON.stringify(settings._schedule);

		var saved = JSON.parse(localStorage.getItem("schedule"));
		if (saved)
			settings._schedule = saved;
				
		for (let t of settings._schedule)
			addScheduleInput(t, ul);
		
		var dragged;
		var lastOver;
		var id;
		ul.addEventListener("dragstart", (event) => {
			var target = event.target;

			while (target.parentNode && (!target.classList || !target.classList.contains("dropzone")))
				target = target.parentNode;
			
			if (target.className == "dropzone")
			{
				dragged = target;
				dragged.classList.add("dragged");
				id = Array.from(dragged.parentNode.children).indexOf(dragged);
			}
			else 
				return false;
		});
		ul.addEventListener("dragend", (event) => {
			if (lastOver)
			{
				lastOver.classList.remove("dragafter");
				lastOver.classList.remove("dragbefore");
			}
			lastOver = undefined;
			dragged.classList.remove("dragged");
		});
		ul.addEventListener("dragover", (event) => {
			var target = event.target;
	
			while (target.parentNode && (!target.classList || !target.classList.contains("dropzone")))
				target = target.parentNode;
			
			if (target.classList && target.classList.contains("dropzone"))
			{
				if (lastOver)
				{
					lastOver.classList.remove("dragafter");
					lastOver.classList.remove("dragbefore");
				}
				lastOver = target;
				
				var off = target.getBoundingClientRect();
				lastOver.classList.add(event.clientY - off.top < off.height * 0.5 ? "dragbefore" : "dragafter");
			}
			event.preventDefault();
		});
		ul.addEventListener("drop", (event) => {
			event.preventDefault();
		
			var target = event.target;

			while (target.parentNode && (!target.classList || !target.classList.contains("dropzone")))
				target = target.parentNode;
			
			if (target.classList && target.classList.contains("dropzone"))
			{			
				var id1 = Array.from(target.parentNode.children).indexOf(target);
				var off = target.getBoundingClientRect();
				var after = event.clientY - off.top > off.height * 0.5;
				
				if (after)
					id1++;
					
				if (target != dragged)
				{
					dragged.parentNode.removeChild(dragged);

					if (after)
						target.after(dragged);
					else
						target.before(dragged);
					
					var tmp = settings._schedule[id];
					
					settings._schedule.splice(id, 1);
					settings._schedule.splice(id < id1 ? id1 - 1 : id1, 0, tmp);
					saveSchedule();
				}
			}
		});
		
		let li = document.createElement("li");	
		li.className = "no-marker";
		li.draggable = false;

		dropdown = document.createElement("div");
		dropdown.id = "dropdown";
		for (let t in tasksById)
		{
			var task = tasksById[t];
			if (task.settings._schedule)
				continue;

			var content = document.createElement("a");
			content.innerText = task.title;
			content.addEventListener('click', function(e) {
				var t1 = {
					task: t,
					count: 1,
				};
				
				settings._schedule.push(t1);
				addScheduleInput(t1, ul, li).classList.remove("hidden");
				saveSchedule();
				e.preventDefault();
			}, false);
			
			dropdown.appendChild(content);	
		}

		var add = document.createElement("a");
		add.innerText = "Add";
		add.href = "#"
		add.draggable = false;
		add.addEventListener('click', function(e) {
			dropdown.classList.add("extended");
			e.preventDefault();
			e.stopPropagation();
		}, false);
		
		var reset = document.createElement("a");
		reset.className = "right";
		reset.innerText = "Reset";
		reset.href = "#"
		reset.draggable = false;
		reset.addEventListener('click', function(e) {
			localStorage.removeItem("schedule");
			settings._schedule = JSON.parse(settings._defaultSchedule);
			createSettingsMenu();
			e.preventDefault();
			e.stopPropagation();
		}, false);
		
		li.appendChild(add);
		li.appendChild(reset);			
		li.appendChild(dropdown);	
		ul.appendChild(li);
		empty = false;
	}
	
	if (settings.files)
	{
		var input = addSettingsInput("files", ul);
		input.type = 'file';
		input.multiple = 'multiple'
		if (imageFiles.length != 0)
			input.files = settings['files'] = imageFiles;

		input.addEventListener('input', function(e) {
			settings['files'] = imageFiles = e.target.files;
			next();
		});
		empty = false;
	}
	
	let li1 = document.createElement("li");	
	li1.className = "no-marker";
	li1.style.display = question && question._fileIndex != undefined ? 'block' : 'none';
	
	fileIndex = document.createElement("a");
	fileIndex.innerText = "Current File"
	fileIndex.href = "#"
	fileIndex.target="_blank"
	fileIndex.title="Current file"
	fileIndex.addEventListener('click', 
	function(e) {
	  fileIndex.href = URL.createObjectURL(imageFiles[question._fileIndex]);
	}, false);
	li1.appendChild(fileIndex);
	ul.appendChild(li1);

	if (empty)
	{
		var txt = document.createElement("span");
		txt.innerText = "Nothing to configure";
		settingsMenu.replaceChildren(txt);
	}
	else
		settingsMenu.replaceChildren(ul);
}

function addSettingsInput(k, ul, prefix = "settings.")
{
	var li = document.createElement("li");
	li.draggable = false;

	var input = document.createElement("input");
	input.id = prefix + k;
//	input.title = k + ":";
	input.type = 'number';
	input.addEventListener('click', function(e) {
		e.stopPropagation();
	}, false);
	input.draggable = false;
	
	var label = document.createElement("label");
	label.htmlFor = prefix + k;
	label.innerText = k + ":"
	label.draggable = false;

	li.appendChild(label);
	li.appendChild(input);
	ul.appendChild(li);

	return input;
}

function saveSchedule()
{
	localStorage.setItem("schedule", JSON.stringify(settings._schedule));
}

function addScheduleInput(t, ul, target)
{
	if (!t || !t.task)
		return;
	
	if (!t.timelimit)
		t.timelimit = 0;
	if (!t.settings)
		t.settings = {};
		
	var task = tasksById[t.task];
	var prefix = "settings.schedule." + ul.childElementCount + "." + t.task + "."; 

	var li = document.createElement("li");
	li.className = "dropzone";
	li.draggable = true;
	
	var title = document.createElement("a");
	title.draggable = false;
	title.innerText = task.title;
	title.href = "#";
	var count = document.createElement("a");
	count.className = "right";
	count.draggable = false;
	count.innerText = t.count;
	
	var ul1 = document.createElement("ul");
	ul1.draggable = false;
	ul1.className = "sublist hidden";
	
	var input = addSettingsInput("count", ul1, prefix);
	input.value = t.count;
	input.addEventListener('input', function(e) {
		if (e.target.valueAsNumber && e.target.valueAsNumber > 0)
			t.count = e.target.valueAsNumber;
		count.innerText = t.count;
		saveSchedule();
	});
		
	input = addSettingsInput("timelimit", ul1, prefix);
	input.value = t.timelimit;
	input.addEventListener('input', function(e) {
		t.timelimit  = e.target.valueAsNumber;
		saveSchedule();
	});
	
	var fullSettings = Object.assign(Object.assign({}, task.settings), t.settings);

	for (let k in fullSettings)
	{
		if (k.startsWith("_") || k == "files" || fullSettings[k] == undefined)
			continue;

		var input = addSettingsInput(k, ul1, prefix + "settings.");
		let check = typeof(fullSettings[k]) == 'boolean';
		input.type = check ? 'checkbox' : 'number';
		input.value = fullSettings[k];
		if (check)
			input.checked = fullSettings[k];

		input.addEventListener('input', function(e) {
			if (check)
				t.settings[k] = e.target.checked;
			else if (e.target.valueAsNumber || e.target.valueAsNumber == 0)
				t.settings[k] = e.target.valueAsNumber;
			saveSchedule();
		});
	}

	var li1 = document.createElement("li");
	li1.className = "no-marker";
	li1.draggable = false;
	var remove = document.createElement("a");
	remove.innerText = "Remove";
	remove.href = "#"
	remove.draggable = false;
	remove.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		ul.removeChild(li);
		var idx = settings._schedule.indexOf(t);
		if (idx !== -1) {
			settings._schedule.splice(idx, 1);
		}
		saveSchedule();
	}, false);

	li1.appendChild(remove);
	ul1.appendChild(li1);
		
	li.addEventListener('click', function(e) {
		e.preventDefault();
		ul1.classList.toggle("hidden");
	}, false);
	li.appendChild(title);	
	li.appendChild(count);
	li.appendChild(ul1);	

	if (target)
		target.before(li);
	else
		ul.appendChild(li);
	
	return ul1;
}

function resize(redraw = true, horizontalSplit = window.innerWidth > window.innerHeight)
{
	const h = window.innerHeight * window.devicePixelRatio;
	const w = window.innerWidth * window.devicePixelRatio;
	
	canvas3.width = canvas4.width = w;
	canvas3.height = canvas4.height = h;
	
	if (currentTask.sideLayout)
	{
		if (horizontalSplit)
		{
			canvas1.classList.add("horizontal-split");
			canvas2.classList.add("horizontal-split");
			divider.classList.add("horizontal-split");
			canvas1.classList.remove("vertical-split");
			canvas2.classList.remove("vertical-split");
			divider.classList.remove("vertical-split");
			canvas1.width = canvas2.width = w / 2;
			canvas1.height = canvas2.height = h;	
		}
		else
		{
			canvas1.classList.add("vertical-split");
			canvas2.classList.add("vertical-split");
			divider.classList.add("vertical-split");
			canvas1.classList.remove("horizontal-split");
			canvas2.classList.remove("horizontal-split");
			divider.classList.remove("horizontal-split");
			canvas1.width = canvas2.width = w;
			canvas1.height = canvas2.height = h / 2;
		}
	}
	else
	{
		canvas1.width = canvas2.width = w;
		canvas1.height = canvas2.height = h;
		
		divider.classList.remove("vertical-split");
		divider.classList.remove("horizontal-split");
		canvas1.classList.remove("vertical-split");
		canvas1.classList.remove("horizontal-split");
		canvas2.classList.remove("vertical-split");
		canvas2.classList.remove("horizontal-split");		
	}

	canvasRatio = canvas2.width / canvas2.height;
	if (canvasRatio < 1)
		setCanvasRect(-0.5, 0.5, 0.5 / canvasRatio, -0.5 / canvasRatio, horizontalSplit);
	else
		setCanvasRect(-0.5 * canvasRatio, 0.5 * canvasRatio, 0.5, -0.5, horizontalSplit);

	if (question && redraw)
	{
		currentTask.onQuestion();
		requestAnimationFrame(currentTask.onDraw);
	}
	if (drawMode && redraw)
		redrawDrawmode(true);
}

function setCanvasRect(left, right, bottom, top, horizontalSplit = window.innerWidth > window.innerHeight, scaleCorrection = 1)
{
	canvasLeft = left;
	canvasRight = right;
	canvasTop = top;
	canvasBottom = bottom;
	canvasWidth = canvasRight - canvasLeft;
	canvasHeight = canvasTop - canvasBottom;
	
	ctx1.setTransform(canvas1.width / canvasWidth, 0, 0, canvas1.height / canvasHeight, -canvasLeft * canvas1.width / canvasWidth, - canvasBottom * canvas1.height / canvasHeight);
	ctx2.setTransform(canvas2.width / canvasWidth, 0, 0, canvas2.height / canvasHeight, -canvasLeft * canvas2.width / canvasWidth, -canvasBottom * canvas2.height / canvasHeight);

	var splitHorizontal = currentTask.sideLayout && horizontalSplit;
	var splitVertical = currentTask.sideLayout && !horizontalSplit;

	canvasDrawX = splitHorizontal ? canvasLeft - canvasWidth : canvasLeft;
	canvasDrawY = splitVertical ? canvasBottom - canvasHeight : canvasBottom;
	
	canvasDrawWidth = (splitHorizontal ? canvasWidth * 2 : canvasWidth);
	canvasDrawHeight = (splitVertical ? canvasHeight * 2 : canvasHeight);

	ctx3.setTransform(canvas2.width / canvasWidth, 0, 0, canvas2.height / canvasHeight, -canvasDrawX * canvas2.width / canvasWidth, -canvasDrawY * canvas2.height / canvasHeight);
	ctx4.setTransform(canvas2.width / canvasWidth, 0, 0, canvas2.height / canvasHeight, -canvasDrawX * canvas2.width / canvasWidth, -canvasDrawY * canvas2.height / canvasHeight);
	
	ctx3.scale(flipCanvas ? -scaleCorrection : scaleCorrection, scaleCorrection)
	ctx4.scale(flipCanvas ? -scaleCorrection : scaleCorrection, scaleCorrection)
	
	canvasDrawWidth /= scaleCorrection;
	canvasDrawHeight /= scaleCorrection;
	canvasDrawX /= scaleCorrection;
	canvasDrawY /= scaleCorrection;
	
	if (canvasLeft > canvasRight)
	{
		var tmp = canvasLeft;
		canvasLeft = canvasRight;
		canvasRight = tmp;
	}
	if (canvasBottom > canvasTop)
	{
		var tmp = canvasBottom;
		canvasBottom = canvasTop;
		canvasTop = tmp;
	}
}

function setupDrawMode()
{
	var lastPos = [NaN, NaN];
	var lastTime = 0;
	var lastPressure = 0;
	var pointerDown = -1;
	var rescale = false;
	var pointers = new Set();
	var currentStroke = [];
 
	var smooth = 75;

	var drawStroke = function(ctx, stroke1, erase)
	{
		if (stroke1.fill)
		{
			ctx.globalCompositeOperation = "source-in";
			ctx.fillStyle = colorHighlight + "80";
			ctx.fillRect(canvasDrawX - Math.abs(canvasDrawWidth), canvasDrawY, canvasDrawWidth * 3, canvasDrawHeight);

			return;
		}
		
		var stroke = stroke1.stroke;
		if (!stroke || stroke.length < 2)
			return;
		
		ctx.fillStyle = (stroke1.erase && !erase ? "#FFFFFF" : stroke1.color) + (stroke1.erase ? "F0" : "A0");

		var width = stroke1.width / Math.min(window.innerWidth, window.innerHeight);
		if (stroke1.erase)
			width *= 4;

		if (stroke1.erase && erase)
			ctx.globalCompositeOperation = 'destination-out';
		else
			ctx.globalCompositeOperation = 'source-over';

		ctx.lineWidth = width;

		var lastPos = stroke[stroke.length - 1];
		var lastPressure = 0;
		var lastTime = lastPos[3];
	  
		ctx.beginPath();  
		ctx.moveTo(lastPos[0], lastPos[1]);
		var pts = [];
		var pts1 = [lastPos];
		for (var i = stroke.length - 2; i > 0; i--) {
			var pos = stroke[i];
			var t = clampBetween((lastTime - pos[3]) / 1000 * smooth, 0.01, 0.99);
			var pos1 = [lastPos[0] + (pos[0] - lastPos[0]) * t, lastPos[1] + (pos[1] - lastPos[1]) * t];

			var pressure = lastPressure * (1 - t) + pos[2] * t;
		
			var nx = pos1[1] - lastPos[1];
			var ny = lastPos[0] - pos1[0];
			var p = pressure;
			var w = width * p / Math.sqrt(nx * nx + ny * ny);
			pts.push([pos1[0] + nx * w, pos1[1] + ny * w]);
			pts1.push([pos1[0] - nx * w, pos1[1] - ny * w]);
		
			//ctx.lineTo(pos1[0], pos1[1]);

			lastPos = pos1;
			lastPressure = pressure;
			lastTime = pos[3];
		}
		pts1.push(stroke[0]);
		for (var i = 0; i < pts.length - 1; ++i) {
			var p = pts[i];
			ctx.lineTo(p[0], p[1]);
		}
		for (var i = pts1.length - 1; i >= 0; i--) {
			var p = pts1[i];
			ctx.lineTo(p[0], p[1]);
		}
		ctx.fill();  
		//ctx.stroke();
	}

	redrawDrawmode = function(full = false) {
		if (full)
			ctx3.clearRect(canvasDrawX - Math.abs(canvasDrawWidth), canvasDrawY, canvasDrawWidth * 3, canvasDrawHeight);
		ctx4.clearRect(canvasDrawX - Math.abs(canvasDrawWidth), canvasDrawY, canvasDrawWidth * 3, canvasDrawHeight);
		if (!question)
			return;
		if (!question._strokes)
			question._strokes = [];
		
		if (full)
			for (var j = 0; j < question._strokes.length - (currentStroke.length > 0 ? 1 : 0); ++j)
				drawStroke(ctx3, question._strokes[j], true);
			
		if (question._strokes.length > 0 && currentStroke.length > 0)
			drawStroke(ctx4, question._strokes[question._strokes.length - 1], false);
	}
	
	canvas4.onpointerenter = function(e) {
		if (e.isPrimary && drawMode)
		{
			var off = canvas4.getBoundingClientRect();
			drawCursor.style.left = verticalGuide.style.left = (e.clientX - off.left) + "px";
			drawCursor.style.top = horizontalGuide.style.top = (e.clientY - off.top) + "px";
			drawCursor.style.width = drawCursor.style.height = drawWidth + "px";
			drawCursor.style.display = "block";
		}
	}
	canvas4.onpointerleave = function(e) {
		pointers.delete(e.pointerId);

		if (e.isPrimary)
			drawCursor.style.display = "none";
		if (rescale)
			canvas4.onpointerup(e);
	}
	canvas4.onpointerdown  = function(e) {
		e.preventDefault();
		if (settings.files != undefined && settings.files.length == 0)
		{
			document.getElementById("settings.files").click();
			return;
		}
		
		pointers.add(e.pointerId);
		closeMenu();

		var off = canvas4.getBoundingClientRect();
		lastPos = transformMouseDrawPt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)]);
		lastPressure = 0;
		lastTime = e.timeStamp;
		pointerDown = e.pointerId;
		rescale = e.shiftKey;
	
		currentStroke = [];
		question._strokes.push({stroke: currentStroke, erase: e.button != 0 || e.ctrlKey, width: drawWidth, color: colorPicker ? rgbToColor(colorPickerColorRGB) : "#000000"});
	
		if (pointers.size == 2)
		{
			if (hasAnswer2)
				next();
			else
			{
				hasAnswer2 = true;
				clearInterval(timer);
				currentTask.onAnswered();
				requestAnimationFrame(currentTask.onDraw);
			}
		}
		else if (pointers.size == 3)
		{
			question._strokes = [];
			redrawDrawmode(true);
		}
	};
	window.onpointerup = function(e) {
		e.preventDefault();
		
		pointers.delete(e.pointerId);

		if (e.pointerId == pointerDown)
		{
			if (rescale)
			{
				var off = canvas4.getBoundingClientRect();
				var pos = transformMouseDrawPt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)]);
				drawWidth = Math.max(0.1, drawWidth * (1 + (pos[0] - lastPos[0]) * 5.0));
				drawCursor.style.width = drawCursor.style.height = drawWidth + "px";
			}
			else if (question._strokes.length > 0)
			{
				currentStroke = [];
				drawStroke(ctx3, question._strokes[question._strokes.length - 1], true);
				ctx4.clearRect(canvasDrawX - Math.abs(canvasDrawWidth), canvasDrawY, canvasDrawWidth * 3, canvasDrawHeight);
			}
			lastPos = [NaN, NaN];
			lastPos1 = [lastPos[0], lastPos[1]];
			lastPressure = 0;
			lastTime = 0;
			pointerDown = -1;
			rescale = false;
		}
	};
    window.onpointermove = function(e) 
    {
		var off = canvas4.getBoundingClientRect();

		if ((pointerDown == -1 || e.pointerId == pointerDown) && !rescale)
		{
			drawCursor.style.left = verticalGuide.style.left = (e.clientX - off.left) + "px";
			drawCursor.style.top = horizontalGuide.style.top = (e.clientY - off.top) + "px";
		}
		if (e.pointerId != pointerDown)
			return;

		var pos = transformMouseDrawPt([clampBetween((e.clientX - off.left) / off.width, 0, 1), clampBetween((e.clientY - off.top) / off.height, 0, 1)]);

		if (rescale)
		{
			drawCursor.style.width = drawCursor.style.height = Math.max(0.1, drawWidth * (1 + (pos[0] - lastPos[0]) * 5.0)) + "px";
			return;
		}
		
		const coalescedEvents = e.getCoalescedEvents();
		for (let e1 of coalescedEvents)
		{
			var pos = transformMouseDrawPt([(e1.clientX - off.left) / off.width, (e1.clientY - off.top) / off.height, e1.pressure]);
			var t = clampBetween((e1.timeStamp - lastTime) / 1000 * smooth, 0.01, 0.99);
			var pos1 = [lastPos[0] + (pos[0] - lastPos[0]) * t, lastPos[1] + (pos[1] - lastPos[1]) * t];

			var pressure = lastPressure * (1 - t) + e1.pressure * t;
			currentStroke.push([pos1[0], pos1[1], pressure, e1.timeStamp]);
			
			lastPos = pos1;
			lastPressure = pressure;
			lastTime = e1.timeStamp;
		}
			
		requestAnimationFrame(redrawDrawmode);
	};
	window.addEventListener("keydown", function(event) {
		if (event.isComposing || event.keyCode === 229) {
			return;
		}
		
		if (event.keyCode == 27)
		{
			if (document.fullscreenElement)
				document.exitFullscreen();
			else
				closeMenu();
		}
		else if (event.keyCode == 13)
		{
			if (hasAnswer2)
				next();
			else
			{
				hasAnswer2 = true;
				clearInterval(timer);
				currentTask.onAnswered();
				requestAnimationFrame(currentTask.onDraw);
			}
			
			event.preventDefault();
			event.stopPropagation();
			return true;
		}
		else if (event.keyCode == 32 || event.keyCode == 40 || event.keyCode == 83)
		{
			pause(!paused);
		}
		else if (event.keyCode == 77)
		{
			toggleFlipCanvas();
		}
		else if (event.keyCode == 37 || event.keyCode == 65)
		{
			currentTask.questionIndex -= 2;
			next();
		}
		else if (event.keyCode == 39)
			next();
		
		else if (event.keyCode == 8 || event.keyCode == 46)
		{
			if (event.ctrlKey)
				question._strokes = [];
			else
				question._strokes.push({fill: true});
			
			redrawDrawmode(true);
		}
		else if (event.keyCode == 90 && event.ctrlKey)
		{
			question._strokes.pop();
			redrawDrawmode(true);
		}
		else if (event.keyCode == 68)
		{
			if (currentTask.drawMode == 1)
			{
				wasDrawMode = !wasDrawMode;
				toggleDrawmode(!drawMode)
			}
		}
		else if (event.keyCode == 67)
		{
			if (!colorPickerCheck.disabled)
				showColorpicker(!colorPicker)
		}
		else if (event.keyCode == 16)
			verticalGuide.style.display = horizontalGuide.style.display = 'block';
	});
	window.addEventListener("keyup", function(event) {
		if (event.isComposing || event.keyCode === 229) {
			return;
		}
		
		if (event.keyCode == 16)
			verticalGuide.style.display = horizontalGuide.style.display = 'none';
	});
	
	toggleDrawmode = function(b) {
		drawMode = b;
		if (drawModeCheck)
		{
			drawModeCheck.checked = b;
			colorPickerCheck.disabled = !b;
			downloadDrawing.parentNode.style.display = b ? 'block' : 'none';
			if (!b)
				showColorpicker(false);
		}
		canvas3.style.display = canvas4.style.display = drawMode ? "block" : "none";

		if (drawMode)
		{
			hasMouse = hasAnswer1 = hasAnswer2 = false;
			drawCursor.style.display = "block";
		}
		else
			drawCursor.style.display = "none";
		
		redrawDrawmode(true);
	}
	if (!drawMode)
		canvas3.style.display = canvas4.style.display = "none";
}

function setupColorpicker()
{
	colorPickerColor = [1, 0.0, 0.5];
	colorPickerColorRGB = HSY709ToRGB(colorPickerColor);
	var imgColor = [0, 0, 0];
	var imgColorRGB = HSY709ToRGB(imgColor);

	var div = document.getElementById("colorPicker");
	var canvasSatVal = document.getElementById("canvasSatVal");
	var width = canvasSatVal.width;
	var height = canvasSatVal.height;
	var imgData = canvasSatVal.getContext("2d").createImageData(width, height);
	canvasHue = document.getElementById("canvasHue");
	var imgData2 = canvasHue.getContext("2d").createImageData(width, 1);
	var color1 = document.getElementById("color1");
	var color2 = document.getElementById("color2");
	div.oncontextmenu = canvasSatVal.ondragstart = canvasHue.ondragstart = canvasSatVal.oncontextmenu = canvasSatVal.oncontextmenu = function() { return false; }

	var showDist = false;
	var updateCol = function()
	{
	  var ctx = canvasSatVal.getContext("2d");
	  ctx.putImageData(imgData, 0, 0);
	  
	  if (showDist)
	  {
		ctx.strokeStyle  = "#FFFFFF40";
		ctx.beginPath();
		ctx.arc(imgColor[1] * width, (1 - imgColor[2]) * height, 4, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.strokeStyle  = "#00000040";
		ctx.beginPath();
		ctx.arc(imgColor[1] * width, (1 - imgColor[2]) * height, 6, 0, 2 * Math.PI);
		ctx.stroke(); 
		
		ctx.strokeStyle  = "#FFFFFF20";
		ctx.beginPath();
		ctx.arc(answerColor[1] * width, (1 - answerColor[2]) * height, 1, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.strokeStyle  = "#00000020";
		ctx.beginPath();
		ctx.arc(answerColor[1] * width, (1 - answerColor[2]) * height, 3, 0, 2 * Math.PI);
		ctx.stroke(); 
	  }
	  
	  ctx.strokeStyle  = "#FFFFFFA0";
	  ctx.beginPath();
	  ctx.arc(colorPickerColor[1] * width, (1 - colorPickerColor[2]) * height, 3, 0, 2 * Math.PI);
	  ctx.stroke();
	  ctx.strokeStyle  = "#000000A0";
	  ctx.beginPath();
	  ctx.arc(colorPickerColor[1] * width, (1 - colorPickerColor[2]) * height, 5, 0, 2 * Math.PI);
	  ctx.stroke();
	  
	  var ctx = canvasHue.getContext("2d");
	  ctx.putImageData(imgData2, 0, 0);
	  
	  if (showDist)
	  {
		ctx.strokeStyle  = "#FFFFFF40";
		ctx.beginPath();
		ctx.moveTo(Math.round(imgColor[0] * width + 1), 0);
		ctx.lineTo(Math.round(imgColor[0] * width + 1), 1); 
		ctx.stroke();
		ctx.strokeStyle  = "#00000040";
		ctx.beginPath();
		ctx.moveTo(Math.round(imgColor[0] * width - 1), 0);
		ctx.lineTo(Math.round(imgColor[0] * width - 1), 1); 
		ctx.stroke();
		
		ctx.strokeStyle  = "#FFFFFF10";
		ctx.beginPath();
		ctx.moveTo(Math.round(answerColor[0] * width + 1), 0);
		ctx.lineTo(Math.round(answerColor[0] * width + 1), 1); 
		ctx.stroke();
		ctx.strokeStyle  = "#00000010";
		ctx.beginPath();
		ctx.moveTo(Math.round(answerColor[0] * width - 1), 0);
		ctx.lineTo(Math.round(answerColor[0] * width - 1), 1); 
		ctx.stroke();
	  }
	  
	  ctx.strokeStyle = "#FFFFFFA0";
	  ctx.beginPath();
	  ctx.moveTo(Math.round(colorPickerColor[0] * width + 1), 0);
	  ctx.lineTo(Math.round(colorPickerColor[0] * width + 1), 1); 
	  ctx.stroke();
	  ctx.strokeStyle = "#000000A0";
	  ctx.beginPath();
	  ctx.moveTo(Math.round(colorPickerColor[0] * width - 1), 0);
	  ctx.lineTo(Math.round(colorPickerColor[0] * width - 1), 1); 
	  ctx.stroke();
	  
	  colorPickerColorRGB = HSY709ToRGB(colorPickerColor[0], colorPickerColor[1], colorPickerColor[2]);
	  var r = Math.round(colorPickerColorRGB[0] * 255);
	  var g = Math.round(colorPickerColorRGB[1] * 255);
	  var b = Math.round(colorPickerColorRGB[2] * 255);
	  color2.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
	  
	  if (showDist)
	  {
		var r = Math.round(imgColorRGB[0] * 255);
		var g = Math.round(imgColorRGB[1] * 255);
		var b = Math.round(imgColorRGB[2] * 255);
		color1.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
	  }

	};
	var updateSY = function()
	{
	  for (var x = 0; x < width; x++)
	  {
		const rgb = HSY709ToRGB(x / (width - 1), 0.5, colorPickerColor[2]);
		imgData2.data[x*4+0] = Math.round(rgb[0] * 255);
		imgData2.data[x*4+1] = Math.round(rgb[1] * 255);
		imgData2.data[x*4+2] = Math.round(rgb[2] * 255);
		imgData2.data[x*4+3] = 255;
	  }
	  updateCol();
	};
	var updateH = function()
	{
		for (var y = 0; y < height; y++)
		{
		  for (var x = 0; x < width; x++)
		  {
			const rgb = HSY709ToRGB(colorPickerColor[0], x / (width - 1), 1 - y / (height - 1));
			imgData.data[(y * width + x)*4+0] = Math.round(rgb[0] * 255);
			imgData.data[(y * width + x)*4+1] = Math.round(rgb[1] * 255);
			imgData.data[(y * width + x)*4+2] = Math.round(rgb[2] * 255);
			imgData.data[(y * width + x)*4+3] = 255;
		  }
		}
		updateCol();
	}
	var downH = false, downSV = false, downDrag = false;
	var offset = [0, 0];
	
	canvasSatVal.onpointerdown = function(e)
	{
		if (e.button != 0)
		{
			downDrag = true;
			offset = [e.offsetX, e.offsetY];
		}
		else
		{
			var r = Math.round(colorPickerColorRGB[0] * 255);
			var g = Math.round(colorPickerColorRGB[1] * 255);
			var b = Math.round(colorPickerColorRGB[2] * 255);
			color1.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
			downSV = true;
			colorPickerColor[1] = (e.offsetX / width);
			colorPickerColor[2] = (1 - e.offsetY / height);
			updateSY()
		}
	};
	canvasHue.onpointerdown = function(e)
	{
		if (e.button != 0)
		{
			downDrag = true;
			offset = [e.offsetX, e.offsetY - 30];
		}
		else
		{
			var r = Math.round(colorPickerColorRGB[0] * 255);
			var g = Math.round(colorPickerColorRGB[1] * 255);
			var b = Math.round(colorPickerColorRGB[2] * 255);
			color1.style.backgroundColor = "rgb(" + r + ", " + g + ", " + b + ")";
			downH = true;
			colorPickerColor[0] = (e.offsetX / width);
			updateH();
		}
	}
	var prevUp = window.onpointerup;
	window.onpointerup  = window.onpointercancel = function(e) { prevUp(e); downH = downSV = downDrag = false; };
	var prevMove = window.onpointermove;
	window.onpointermove = function(e) 
	{
		prevMove(e);
		
		if (downDrag)
		{
			div.style.right = (window.innerWidth - e.clientX + offset[0]) + 'px';
			div.style.bottom  = (window.innerHeight - e.clientY + offset[1]) + 'px';
		}
		else if (downSV)
		{
			var off = canvasSatVal.getBoundingClientRect();
			colorPickerColor[1] = clampBetween((e.clientX - off.left) / width, 0, 1);
			colorPickerColor[2] = clampBetween(1 - (e.clientY - off.top) / height, 0, 1);
			updateSY(); 
		}
		else if (downH)
		{
			var off = canvasSatVal.getBoundingClientRect();
			colorPickerColor[0] = clampBetween((e.clientX - off.left) / width, 0, 1);
			updateH(); 
		}
	}
	showColorpicker = function(b)
	{
		colorPicker = b;
		if (colorPickerCheck)
			colorPickerCheck.checked = b;
		div.style.display = b ? "block" : "none";
		showDist = false;
		colorPickerColor = [1, 0, 0.5];
		updateH();
		updateSY();
	}
	showColorDiff = function(imgC)
	{
		answerColor = [colorPickerColor[0], colorPickerColor[1], colorPickerColor[2]];
		imgColor = [imgC[0], imgC[1], imgC[2]];
		imgColorRGB = HSY709ToRGB(...imgColor);
		showDist = true;
		updateCol();
					
		var lab1 = RGBToLAB(colorPickerColorRGB);
		var lab2 = RGBToLAB(imgColorRGB);
		
		updateAverages({
						/*"H": (answerColor[0] - imgColor[0]) * 10, 
						"S": (answerColor[0] - imgColor[0]) * 10,
						"Y": (answerColor[0] - imgColor[0]) * 10,
						*/
						"LAB": (deltaE(lab1, lab2))});
	}
	showColorpicker(colorPicker);
}

var cachedImage;
var loadingImage;

function loadImage(src, onload, crossOrigin = true)
{
	if (!src)
		src = "chibi.webp";
	
	if (cachedImage && cachedImage.src == src)
	{
		onload(cachedImage);
	}
	else
	{
		clear(ctx1);
		ctx1.textAlign = "center";
		ctx1.font = 0.04 + "px cursive";
		ctx1.fillStyle = colorLight;
		ctx1.fillText("Loading...", 0, 0);
			
		var img = new Image();
		loadingImage = img;
		if (crossOrigin)
			img.crossOrigin = "Anonymous";
		img.onload = function() {
			if (img == loadingImage)
			{		
				cachedImage = img;
				onload(img);
			}
		}
		img.onerror = function(){
			clear(ctx1);
			ctx1.textAlign = "center";
			ctx1.font = 0.05 + "px cursive";
			ctx1.fillStyle = colorBold;
			ctx1.fillText("No file chosen", 0, 0);
		}
		img.src = src;	
	}	
}

function selectImageText(ctx)
{
	ctx.textAlign = "center";
	ctx.fillStyle = colorBold;
	ctx.strokeStyle = "#ffffff"
	ctx.lineWidth = lineWidth(16);
	ctx.font = 0.03 + "px cursive";
	 
	ctx.filter = "drop-shadow(0px 2px 8px " + colorShadow + ")";
	ctx.strokeText("Select reference images from a local folder", 0, canvasTop - 0.1);
	ctx.filter = "none";
	ctx.fillText("Select reference images from a local folder", 0, canvasTop - 0.1);
}

function clear(ctx)
{
	ctx.clearRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
}

function copyCanvas(style)
{
	ctx2.scale(Math.sign(canvasWidth), Math.sign(canvasHeight));
	ctx2.drawImage(canvas1, canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
	ctx2.scale(Math.sign(canvasWidth), Math.sign(canvasHeight));
	
	ctx2.fillStyle = style;
	ctx2.fillRect(canvasLeft, canvasBottom, canvasRight - canvasLeft, canvasTop - canvasBottom);
}

function drawText(ctx, text, x, y, width = 4, style= colorBold)
{
    ctx.fillStyle = style;
    ctx.textAlign = "center";
	ctx.baseline = "middle"
    ctx.font = (width * 0.005) + "px cursive";
    
	ctx.scale(Math.sign(canvasWidth), Math.sign(canvasHeight));
    ctx.fillText(text, x * Math.sign(canvasWidth), y * Math.sign(canvasHeight));
	ctx.scale(Math.sign(canvasWidth), Math.sign(canvasHeight));
	
	ctx.baseline = "alphabetic"
}

function definePoints(pts, mat, offset = geo.pointCount)
{
	geo.pointsDirty = true;
	geo.normalsDirty = true;

	if (geo.points.length < offset + pts.length)
	{
		for (var i = geo.points.length; i < offset + pts.length; ++i)
		{
			geo.points[i] = [0, 0, 0, 1];
			geo.pointsP[i] = [0, 0, 0, 1];
		}
	}
	
	for (var i = 0; i < pts.length; ++i)
		setVec(geo.points[offset + i], mulMatVec(mat, pts[i]));
	
	geo.pointCount = Math.max(geo.pointCount, offset + pts.length);
}

function defineNormals(nms, offset = geo.normalCount, ptOffset = 0)
{
	geo.normalsDirty = true;

	if (geo.normals.length < offset + nms.length)
	{
		for (var i = geo.normals.length; i < offset + nms.length; ++i)
		{
			geo.normalDefs[i] = [0, 0, 0];
			geo.normals[i] = [0, 0, 0];
		}
	}
	
	for (var i = 0; i < nms.length; ++i)
	{
		var vec = addVec(nms[i], [ptOffset, ptOffset, ptOffset]);
		setVec(geo.normalDefs[offset + i], vec);
	}
	
	geo.normalCount = Math.max(geo.normalCount, offset + nms.length);
}

function defineEdges(eds, offset = geo.edgeCount, ptOffset = 0, nmOffset = 0)
{
	if (geo.edges.length < offset + eds.length)
		for (var i = geo.edges.length; i < offset + eds.length; ++i)
			geo.edges[i] = [0, 0, 0, 0, 0];
	
	for (var i = 0; i < eds.length; ++i)
	{
		var e = eds[i];
		setVec(geo.edges[offset + i], [geo.pointsP[e[0] + ptOffset], geo.pointsP[e[1] + ptOffset], e[2] < 0 ? [0, 0, 1] : geo.normals[e[2] + nmOffset], e[3] < 0 ? [0, 0, 1] : geo.normals[e[3] + nmOffset], e[4] ? e[4] : 0]);
	}
	
	geo.edgeCount = Math.max(geo.edgeCount, offset + eds.length);
}

function updateVPMatrix(vpMat, updateGeoImmediately)
{
	geo.vpMat = vpMat;
	geo.pointsDirty = true;
	geo.normalsDirty = true;
	
	if (updateGeoImmediately)
		updateNormals();
}

function updatePoints(i0 = 0, i1 = geo.points.length)
{
	for (var i = i0; i < i1; ++i)
		setVec(geo.pointsP[i], proj(geo.vpMat, geo.points[i])); 
	
	geo.pointsDirty = false;
}

function updateNormals(i0 = 0, i1 = geo.normalDefs.length)
{
	if (geo.pointsDirty)
		updatePoints();

	for (var i = i0; i < i1; ++i)
	{
		var def = geo.normalDefs[i];
		setVec(geo.normals[i], def[2] == def[3] ? subVec(geo.pointsP[def[2]], geo.pointsP[def[0]]) : normalOfTris(geo.pointsP[def[0]], geo.pointsP[def[1]], geo.pointsP[def[2]])); 
	}
	
	geo.normalsDirty = false;
}

function drawEdges(ctx, i0 = 0, i1 = geo.edgeCount, color = "#7a0246")
{
	if (geo.normalsDirty)
		updateNormals();
	
	var edges1 = [];
	var edges2 = [];
	var edges3 = [];
	var edges4 = [];

	for (var i = i0; i < i1; ++i)
	{
		var e = geo.edges[i];
		var s1 = Math.sign(e[2][2]);
		var s2 = Math.sign(e[3][2]);
		var p = 0;

		if (e[4] == 0)
			p = s1 != s2 ? 1 : s1 < 0 ? 2 : 3;

		else if (e[4] <= 3)
			p = e[4];
			
		else if (e[4] == 4 || e[4] == 8)
			p = s1 != s2 ? 1 : 0;

		else if (e[4] == 5 || e[4] == 9)
			p = s1 != s2 ? 3 : 0;
		
		else if (e[4] == 6)
			p = s1 != s2 ? 1 : s1 < 0 ? 2 : 0;
		
		else if (e[4] == 7)
			p = s1 != s2 ? 1 : s1 < 0 ? 3 : 0;
		
		if (p == 1)
			edges1.push(e);
		else if (p == 2)
			edges2.push(e);
		else if (p == 3)
			edges3.push(e);
		else
			edges4.push(e);
	}

	ctx.strokeStyle = color + "F0"
	ctx.lineWidth = lineWidth(4);
	ctx.beginPath();
	for (var i = 0; i < edges1.length; ++i)
	{
		var e = edges1[i];
		drawEdge(ctx, e[0], e[1]);
	}
	ctx.stroke();
	
	ctx.strokeStyle  = color + "40"
	ctx.lineWidth = lineWidth(1);
	ctx.beginPath();
	for (var i = 0; i < edges3.length; ++i)
	{
		var e = edges3[i];
		drawEdge(ctx, e[0], e[1]);
	}
	ctx.stroke();
	
	if (drawDebug)
	{
		ctx.lineWidth = lineWidth(1);		
		ctx.strokeStyle = colorLight;
		ctx.beginPath();
		for (var i = 0; i < edges4.length; ++i)
		{
			var e = edges4[i];
			drawEdge(ctx, e[0], e[1]);
		}
		ctx.stroke();
	}
	
	ctx.strokeStyle  = color + "A0"
	ctx.lineWidth = lineWidth(3);
	ctx.beginPath();
	for (var i = 0; i < edges2.length; ++i)
	{
		var e = edges2[i];
		drawEdge(ctx, e[0], e[1]);
	}
	ctx.stroke();
}

function clearGeo()
{
	geo.pointCount = geo.normalCount = geo.edgeCount = 0;
}

function addBox(width, height, depth, mat, bold = true)
{
	var pointCount = geo.pointCount;
	var normalCount = geo.normalCount;
	
	updateBox(pointCount, width, height, depth, mat);
	
	defineNormals([
		[0, 1, 2],
		[4, 6, 5],
		
		[0, 5, 1],
		[1, 6, 2],
		
		[2, 7, 3],
		[3, 4, 0]], normalCount, pointCount);
	
	var edgeType = bold ? 0 : 3;
	defineEdges([
		[0, 4,  2, 5, edgeType],
		[3, 0,  0, 5, edgeType],
		[0, 1,  0, 2, edgeType],
		[1, 2,  0, 3, edgeType],
		[1, 5,  3, 2, edgeType],

		[2, 3,  0, 4, edgeType],

		[4, 5,  1, 2, edgeType],
		[5, 6,  1, 3, edgeType],
		[6, 7,  1, 4, edgeType],
		[7, 4,  1, 5, edgeType],

		[2, 6,  4, 3, edgeType],
		[3, 7,  5, 4, edgeType],		
	], geo.edgeCount, pointCount, normalCount);
}

function updateBox(offset, width, height, depth, mat)
{
	definePoints([
		[-width * 0.5, -height * 0.5, -depth * 0.5, 1],
		[-width * 0.5,  height * 0.5, -depth * 0.5, 1],
		[ width * 0.5,  height * 0.5, -depth * 0.5, 1],
		[ width * 0.5, -height * 0.5, -depth * 0.5, 1],
		[-width * 0.5, -height * 0.5,  depth * 0.5, 1],
		[-width * 0.5,  height * 0.5,  depth * 0.5, 1],
		[ width * 0.5,  height * 0.5,  depth * 0.5, 1],
		[ width * 0.5, -height * 0.5,  depth * 0.5, 1]],
		mat, offset);
}

function addGrid(intersecs, width, depth, mat, bold = true)
{
	var pointCount = geo.pointCount;
		
	updateGrid(pointCount, intersecs, width, depth, mat);
	
	intersecs++;
	var edges = [];
	for (var i = 0; i < intersecs * 2; ++i)
		edges[i] = [i * 2, i * 2 + 1, -1, -1, bold && (i == 0 || i == intersecs -1 || i == intersecs || i == intersecs * 2 - 1) ? 1 : 0];
	
	defineEdges(edges, geo.edgeCount, pointCount);
}

function updateGrid(offset, intersecs, width, depth, mat)
{
	intersecs++;
	var points = [];
	for (var i = 0; i < intersecs; ++i)
	{
		var f = -0.5 + i / (intersecs - 1);
		points[i * 2]     = [f * width, 0, -0.5 * depth, 1];
		points[i * 2 + 1] = [f * width, 0,  0.5 * depth, 1];
		points[i * 2 + intersecs * 2]     = [-0.5 * width, 0, f * depth, 1];
		points[i * 2 + intersecs * 2 + 1] = [ 0.5 * width, 0, f * depth, 1];
	}
	
	definePoints(points, mat, offset);
}

function addCylinder(intersects, width, height, depth, mat, bold = true)
{
	var pointCount = geo.pointCount;
	var normalCount = geo.normalCount;
	
	updateCylinder(pointCount, intersects, width, height, depth, mat)
	
	var normals = [ [0, 1, 2], [intersects, intersects + 2, intersects + 1]];
	for (var i = 0; i < intersects; ++i)
		normals[i + 2] = [i, i + intersects, (i + 1) % intersects];
	
	defineNormals(normals, normalCount, pointCount);

	var edges = [];
	for (var i = 0; i < intersects; ++i)
	{
		edges[i] = [i, (i + 1) % intersects, 0, 2 + i, bold ? 0 : 3];
		edges[i + intersects] = [i + intersects, (i + 1) % intersects + intersects, 1, 2 + i, bold ? 0 : 3];
		edges[i + intersects * 2] = [i, i + intersects, 2 + i, 2 + (i + intersects - 1) % intersects, bold ? 4 : 5];
	}
	defineEdges(edges, geo.edgeCount, pointCount, normalCount);
}

function updateCylinder(offset, intersects, width, height, depth, mat)
{
	var points = [];
	for (var i = 0; i < intersects; ++i)
	{
		var angle = i / intersects * Math.PI * 2;
		var c = Math.cos(-angle) * 0.5;
		var s = Math.sin(-angle) * 0.5;
		points[i]              = [width * c, height * s, -depth * 0.5, 1];
		points[i + intersects] = [width * c, height * s,  depth * 0.5, 1];
	}
	definePoints(points, mat, offset);
}

function addSphere(intersects1, intersects2, width, height, depth, mat, flatten = -1, bold = true)
{
	var pointCount = geo.pointCount;
	var normalCount = geo.normalCount;
	
	updateSphere(pointCount, intersects1, intersects2, width, height, depth, mat, flatten);
	
	var normals = [];
	var edges = [];
	for (var r = 0; r < intersects1; r++) 
		for (var s = 0; s < intersects2; s++) 
		{
			var i  = r * intersects2 + s;
			var i1 = r * intersects2 + (s+1) % intersects2;
			var i2 = (r+1) * intersects2 + s;
			var i3 = (r+1) * intersects2 + (s+1) % intersects2;
	
			normals[i] = r == 0 ? [i, i3, i2] : [i, i1, i2];
		}
		
	defineNormals(normals, normalCount, pointCount);

	for (var r = 0; r < intersects1; r++) 
		for (var s = 0; s < intersects2; s++) 
		{
			var i  = r * intersects2 + s;
			var i1 = r * intersects2 + (s+1) % intersects2;
			var i2 = (r+1) * intersects2 + s;
			
			var i3 = r * intersects2 + (s+intersects2-1) % intersects2;
			var i4 = (r-1) * intersects2 + s;

			if (r > 0)
				edges[i - intersects2] = [i, i1, i4, i, r == intersects1 / 2 || r == flatten || r == intersects1 - flatten ? (bold ? 0 : 3) : bold ? 4 : 5];
			edges[i + (intersects1 - 1) * intersects2] = [i, i2, i3, i, s == 0 || s == intersects2 / 4 || s == intersects2 / 2 || s == intersects2 / 4 * 3 ? (bold ? 0 : 3) : bold ? 4 : 5];
		}
		
	defineEdges(edges, geo.edgeCount, pointCount, normalCount);
}

function updateSphere(offset, intersects1, intersects2, width, height, depth, mat, flatten = -1)
{
	var points = [];

	for (var r = 0; r <= intersects1; r++) 
		for(var s = 0; s < intersects2; s++) 
		{
			var y = Math.sin( -Math.PI * 0.5 + Math.PI * clampBetween(r, flatten, intersects1 - flatten) / intersects1);
			var x = Math.cos(2*Math.PI * s / intersects2) * Math.sin(Math.PI * r / intersects1);
			var z = Math.sin(2*Math.PI * s / intersects2) * Math.sin(Math.PI * r / intersects1);
					
			points[r * intersects2 + s] = [y * width * 0.5, x * height * 0.5, z * depth * 0.5, 1];
		}

	definePoints(points, mat, offset);
}

function addBlob(intersects1, intersects2, width, points, mat, bold = true)
{
	var pointCount = geo.pointCount;
	var normalCount = geo.normalCount;
	
	updateBlob(pointCount, intersects1, intersects2, width, points, mat)
	
	var normals = [];
	for (var j = 0; j < intersects2; ++j)
		for (var i = 0; i < intersects1; ++i)
		{
			const v1 = j * intersects1 + i;
			const v2 = j * intersects1 + (i + 1) % intersects1;
			const v3 = (j + 1) * intersects1 + i;
			const v4 = (j + 1) * intersects1 + (i + 1) % intersects1;

			normals.push([v1, v2, v3]);
			normals.push([v2, v4, v3]);
		}
	
	defineNormals(normals, normalCount, pointCount);

	var edges = [];
	for (var j = 0; j < intersects2; ++j)
		for (var i = 0; i < intersects1; ++i)
		{
			const v1 = j * intersects1 + i;
			const v2 = j * intersects1 + (i + 1) % intersects1;
			const v3 = (j + 1) * intersects1 + i;
			edges.push([v1, v3, v1 * 2, (j * intersects1 + (i + intersects1 - 1) % intersects1) * 2 + 1, bold ? 4 : 5]);
			if (j != 0)
				edges.push([v1, v2, ((j - 1) * intersects1 + i) * 2 + 1, v1 * 2, j > 0 && j % 16 == 0 ? 0 : bold ? 4 : 5]);
			edges.push([v2, v3, v1 * 2, v1 * 2 + 1, bold ? 4 : 5]);
		}
	for (var j = 0; j < intersects2; ++j)
		edges.push([(intersects2 + 1) * intersects1 + j, (intersects2 + 1) * intersects1 + j + 1, -1, -1, 3]);

	defineEdges(edges, geo.edgeCount, pointCount, normalCount);
}

function updateBlob(offset, intersects1, intersects2, width, bePoints, mat)
{
	var points = [];
	var last = bePoints[0];
	for (var j = 0; j <= intersects2; ++j)
	{
		var f = j / intersects2;
		var center = basier(f + 1e-6, bePoints);
		var up = [0, 1, 0, 0];
		var forward = subVec(center, last);
		var right = normalizeVec(crossVec3(up, forward));
		up = normalizeVec(crossVec3(right, forward));
		last = center;
		var rad = 1 - Math.sin(f * Math.PI);
		rad = 1e-6 + (1 - Math.pow(rad, 5)) * width;
		points[(intersects2 + 1) * intersects1 + j] = center;
		for (var i = 0; i < intersects1; ++i)
		{
			var angle = i / intersects1 * Math.PI * 2;
			var c = Math.cos(-angle) * 0.5 * rad;
			var s = Math.sin(-angle) * 0.5 * rad;
			var vec = addVec(center, addVec(mulVec(right, c), mulVec(up, s)));
			points[j * intersects1 + i] = vec;
		}
	}
	definePoints(points, mat, offset);
}

function addEllipse(intersects, width, height, arc, mat, bold = true)
{
	var pointCount = geo.pointCount;
	
	updateEllipse(pointCount, intersects, width, height, arc, mat)

	var edges = [];
	for (var i = 0; i < intersects; ++i)
		edges[i] = [i, (i + 1) % intersects, -1, -1, bold ? 1 : 3];
	defineEdges(edges, geo.edgeCount, pointCount);
}

function updateEllipse(offset, intersects, width, height, arc, mat)
{
	var points = [];
	for (var i = 0; i < intersects; ++i)
	{
		var angle = i / intersects * arc;
		var c = Math.cos(-angle) * 0.5;
		var s = Math.sin(-angle) * 0.5;
		points[i] = [width * c, height * s, 0, 1];
	}
	definePoints(points, mat, offset);
}

function addLine(intersects, bePoints, mat, bold = true)
{
	var pointCount = geo.pointCount;
	
	updateLine(pointCount, intersects, bePoints, mat)

	var edges = [];
	for (var i = 0; i < intersects; ++i)
		edges[i] = [i, i + 1, -1, -1, bold ? 1 : 3];
	defineEdges(edges, geo.edgeCount, pointCount);
}

function updateLine(offset, intersects, bePoints, mat)
{
	var points = [];
	for (var i = 0; i <= intersects; ++i)
		points[i] = basier(i / intersects, bePoints);
	definePoints(points, mat, offset);
}

function lineWidth(w)
{
	return (canvasRatio < 1 ? w / canvas2.width : w / canvas2.height);
}

function transformMousePt(mouse, offset = false)
{
	if (offset && currentTask.offsetTouch)
	{
		mouse[0] -= 0.05 / canvasRatio;
		mouse[1] -= 0.05;
	}
	if (flipCanvas)
		mouse[0] = 1 - mouse[0];
	mouse[0] = (canvasWidth  < 0 ? mouse[0] - 1 : mouse[0]) * canvasWidth  + canvasLeft;
	mouse[1] = (canvasHeight < 0 ? mouse[1] - 1 : mouse[1]) * canvasHeight + canvasBottom;
	return mouse;
}

function transformMouseDrawPt(mouse)
{
	mouse[0] = mouse[0] * canvasDrawWidth  + canvasDrawX;
	mouse[1] = mouse[1] * canvasDrawHeight + canvasDrawY;
	if (flipCanvas)
		mouse[0] = -mouse[0];
	return mouse;
}

function updateAverages(deltas)
{
	var txt = "";
	if (!drawMode || currentTask.drawModeDeltas)
	{
		for (var d in deltas)
		{
			if (isNaN(deltas[d]))
				continue;
			
			if (txt != "")
				txt += ", ";
			txt += d + "Δ: " + (Math.round(deltas[d] * 100) / 100.0);
			if (!currentTask.averages[d])
				currentTask.averages[d] = 0;
			currentTask.averages[d] += deltas[d];
		}
	}
	deltaText.innerText = txt;
	deltaText.classList.add("answer");
	currentTask.num++;
	counterLabel.textContent = currentSchedule && !currentTask.settings._schedule  ? currentSchedule.reduce((a, b) => a + b.count, 0) - currentTask.num : currentTask.num;
}

var timer;
var timeOut = 0;

function next()
{
	if (currentSchedule && currentTask.num >= currentSchedule[0].count)
	{		
		currentSchedule.shift();
		if (currentSchedule.length == 0)
			currentSchedule = undefined;
		
		else
		{
			var task = tasksById[currentSchedule[0].task];
			if (currentSchedule[0].settings)
				Object.assign(task.settings, currentSchedule[0].settings);
			if (currentSchedule[0].timelimit)
			{
				timelimit = currentSchedule[0].timelimit;
				timeLimitInput.value = timelimit;
				pause(false);
			}
			else
				pause(true);
			if (!task.settings._schedule)
			{
				task.averages = {};
				task.num = 0;
			}
			switchTasks(task);
						
			return;
		}
	}
	
	mouse = lastMouse;
	answer1 = [0, 0];
	answer2 = [0, 0];
	hasAnswer1 = false;
	hasAnswer2 = false;

	var txt = "";
	if (!drawMode || currentTask.drawModeDeltas)
		for (var d in currentTask.averages)
		{
			if (txt != "")
				txt += ", ";
			txt += "Avg " + d + "Δ: " + (Math.round(currentTask.averages[d] / currentTask.num * 100) / 100.0);
		}
		
	if (txt == "" && currentTask.num == 0)
		txt = currentTask.description;

	deltaText.innerText = txt;
	deltaText.classList.remove("answer");

	currentTask.questionIndex++;
	var question1 = currentTask.questionStack[currentTask.questionIndex]
	if (question1)
		question = question1;
	else
	{
		question = currentTask.onNext();
		if (question.isQuestion == false)
			currentTask.questionIndex--;
		else
			currentTask.questionStack[currentTask.questionIndex] = question;
	}

	fileIndex.parentNode.style.display = question._fileIndex != undefined ? 'block' : 'none';
	if (question._fileIndex != undefined)
		fileIndex.innerText = imageFiles[question._fileIndex].name;
	
	currentTask.onQuestion();
	requestAnimationFrame(currentTask.onDraw);
	
	if (drawMode)
		redrawDrawmode(true);

	var countdown = timelimit;

	if (timer)
	{
		clearInterval(timer);
		timerProgress.classList.add("notransition");
		timerProgress.style.strokeDashoffset = 0;
	}	
	
	timerProgress.style.strokeDashoffset = 0;
	var interval = 0.1;
	if (timelimit > 0)
	{
		setTimeout(function() 
		{
			timerProgress.classList.remove("notransition");
			timerProgress.style.strokeDashoffset = (1 - (countdown - (paused ? 0 : interval)) / timelimit) * 2 * 15 * Math.PI;
		}, interval)
		var secs = Math.ceil(countdown);
		timerLabel.textContent = (paused ? "PAUSED - " : "") + secs + (secs == 1 ? " sec" : " secs");
		
		timer = setInterval(function() {
			if (!paused)
				countdown -= interval;
			var secs = Math.ceil(countdown);
			timerLabel.textContent = (paused ? "PAUSED - " : "") + secs + (secs == 1 ? " sec" : " secs");
			if (countdown <= 0)
			{
				timerLabel.textContent = (paused ? "PAUSED - " : "") + 0 + " secs";
				timerProgress.style.strokeDashoffset = 2 * 15 * Math.PI;
				timeOut = new Date();
				answer2 = mouse;
				hasAnswer2 = true;
				clearInterval(timer);				
				currentTask.onAnswered();
				requestAnimationFrame(currentTask.onDraw);
			}
			else if (!paused)
				timerProgress.style.strokeDashoffset = clampBetween(1 - (countdown - interval) / timelimit, 0, 1) * 2 * 15 * Math.PI;
		  }, 1000 * interval);
	}
	else
		timerLabel.textContent = "";
}

function clampBetween(value, lowerBound, upperBound) {
  let result = upperBound;
  if ( value >= lowerBound && value <= upperBound) {
    result = value;
  } else if (value < lowerBound) {
    result = lowerBound;
  } else if ( value > upperBound) {
    result = upperBound;
  }
  return result;
}

function valueToColor(v)
{
	var h = (Math.floor(255 * clampBetween(v, 0, 1))).toString(16);
	if (h.length < 2)
		h = 0 + h;
	return "#" + h + h + h;
}

function rgbToColor(rgb)
{
	var r = (Math.floor(255 * clampBetween(rgb[0], 0, 1))).toString(16);
	if (r.length < 2)
		r = 0 + r;
	var g = (Math.floor(255 * clampBetween(rgb[1], 0, 1))).toString(16);
	if (g.length < 2)
		g = 0 + g;
	var b = (Math.floor(255 * clampBetween(rgb[2], 0, 1))).toString(16);
	if (b.length < 2)
		b = 0 + b;
	return "#" + r + g + b;
}

function colorToRGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]: null;
}

function hsyToColor(hsy)
{
	return rgbToColor(HSY709ToRGB(hsy[0], hsy[1], hsy[2]));
}

function dist(p1, p2)
{
	var dx = p2[0] - p1[0];
	var dy = p2[1] - p1[1];
	return Math.sqrt(dx * dx + dy * dy);
}

function binomial(n, k)
{
    var value = 1.0;
	if (n != k)
		for (var i = 1; i <= k; i++)
			value = value * ((n + 1 - i) / i);
    return value;
}

function basier(t, points)
{
	var ret = [];
	for (var i = 0; i < points[0].length; ++i)
		ret[i] = 0;
	var n = points.length - 1;
	var t1 = 1 - t;

	for (var i = 0; i <= n; ++i)
	{
		var co = binomial(n, i) * Math.pow(t1, n - i) * Math.pow(t, i);

		for (var j = 0; j < ret.length; ++j)
			ret[j] += co * points[i][j];
	}

	ret[3] = 1;
	return ret;
}

function solveQuad(a, b, c)
{
	var r = Math.sqrt(b * b - 4 * a * c);
	return [(-b - r) / (2 * a), (-b + r) / (2 * a)];
}

function LineThrough(p1, p2)
{
	var m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
	return new Line(m, p1[1] - m * p1[0]);
}

function Line(m, b)
{
	this.m = m;
	this.b = b;
	this.point = function(x)
	{
		return this.m * x + this.b;
	};
	this.intersect = function(l)
	{
		var x = (this.b - l.b) / (l.m - this.m)
		return [x, this.point(x)];
	};
	return this;
}

function viewRay(ms, view = geo.vpMat)
{
	var inv = inverseMat(view);
	var mouseW1 = mulMatVec(inv, [ms[0], ms[1], 0, 1]);
	var mouseW2 = mulMatVec(inv, [ms[0], ms[1], 0.5, 1]);

	mouseW1 = divVec(mouseW1, mouseW1[3]);
	mouseW2 = divVec(mouseW2, mouseW2[3]);
	var dirW = normalizeVec(subVec(mouseW2, mouseW1));

	return [mouseW1, mouseW2, dirW];
}

function viewIntersectPlane(ms, pt, normal, mat = identityMat(), viewMat = geo.vpMat)
{
	var view = viewRay(ms, viewMat);
	
	pt[3] = 1;
	var ptW     = mulMatVec(mat, pt);
	normal[3] = 0;
	var normalW = normalizeVec(mulMatVec(mat, normal));
	
	var denom = dotVec(normalW, view[2]); 
    if (Math.abs(denom) > 1e-6) { 
        var t = dotVec(subVec(ptW, view[0]), normalW) / denom; 
        return addVec(view[0], mulVec(view[2], t)); 
    } 
	
	return [NaN, NaN, NaN, 1];
}

function proj(mat, pt)
{
	pt = mulMatVec(mat, pt)
	return [pt[0] / pt[3], pt[1] / pt[3], pt[2], 1];
}

function moveToProj(ctx, pt, mat = geo.vpMat)
{
	pt = proj(mat, pt);
	ctx.moveTo(pt[0], pt[1], mat);
}

function drawEdgeProj(ctx, pt1, pt2, mat = geo.vpMat)
{
	moveToProj(ctx, pt1, mat);
	lineToProj(ctx, pt2, mat);
}

function lineToProj(ctx, pt, mat = geo.vpMat)
{
	pt = proj(mat, pt);
	ctx.lineTo(pt[0], pt[1]);
}

function drawEdge(ctx, pt1, pt2)
{
	if (pt1[2] < 0 || pt2[2] < 0)
		return;
	drawEdge1(ctx, pt1, pt2);
}

function drawEdge1(ctx, pt1, pt2)
{
	ctx.moveTo(pt1[0], pt1[1]);
	ctx.lineTo(pt2[0], pt2[1]);
}

function mulMat(mat1, mat2)
{
	var ret = [];
	for (var k = 0; k < mat2.length; ++k)
	{
		ret[k] = [];
		for (var i = 0; i < mat1.length; ++i)
		{
			var r = 0;
			for (var j = 0; j < mat1[0].length; ++j)
				r += mat1[j][i] * mat2[k][j];
			ret[k][i] = r;
		}
	}
	return ret;
}

function mulMat1(mat1, mat2)
{
	var ret = [];
	for (var i = 0; i < mat1.length; ++i)
	{
		ret[i] = [];

		for (var k = 0; k < mat2[0].length; ++k)
		{
			var r = 0;
			for (var j = 0; j < mat1[0].length; ++j)
				r += mat1[i][j] * mat2[j][k];
			ret[i][k] = r;
		}
	}
	return ret;
}

function mulMatVec(mat, v)
{
	var ret = [];
	for (var i = 0; i < mat.length; ++i)
	{
		if (drawDebug && mat[0].length != v.length)
			console.log("Mat vec length mismatch!");
		var r = 0;
		for (var j = 0; j < mat[0].length; ++j)
			r += mat[i][j] * v[j];
		ret[i] = r;
	}
	return ret;
}

function mulVec(v, d)
{
	var ret = [];

	for (var i = 0; i < v.length; ++i)
		ret[i] = v[i] * d;
	return ret;
}

function divVec(v, d)
{
	return mulVec(v, 1 / d);
}

function addVec(v1, v2)
{
	var ret = [];
	for (var i = 0; i < v1.length; ++i)
		ret[i] = v1[i] + v2[i];
	return ret;
}

function subVec(v1, v2)
{
	var ret = [];
	for (var i = 0; i < v1.length; ++i)
		ret[i] = v1[i] - v2[i];
	return ret;
}

function lerpVec(v1, v2, t)
{
	var ret = [];
	for (var i = 0; i < v1.length; ++i)
		ret[i] = v1[i] * (1 - t) + v2[i] * t;
	return ret;
}

function crossVec3(v1, v2)
{
	return [v1[1] * v2[2] - v2[1] * v1[2],
	v2[0] * v1[2] - v1[0] * v2[2],
	v1[0] * v2[1] - v2[0] * v1[1], 0];
}

function dotVec(v1, v2, l = v1.length)
{
	var a = 0;
	for (var i = 0; i < l; ++i)
		a += v1[i] * v2[i];
	return a;
}


function setVec(v1, v2)
{
	for (var i = 0; i < v1.length; ++i)
		v1[i] = v2[i];
	return v1;
}

function lengthVec(v, n = v.length)
{
	return Math.sqrt(dotVec(v, v, n));
}

function normalizeVec(v)
{
	return mulVec(v, 1 / lengthVec(v));
}

function normalOfTris(v1, v2, v3)
{
	return crossVec3(subVec(v2, v1), subVec(v3, v1));
}

function rotMat(axis, angle)
{
	var naxis = normalizeVec(axis);
	
	var c = Math.cos(angle);
	var s = Math.sin(angle);
	var t = 1 - c;
	var x = naxis[0];
	var y = naxis[1];
	var z = naxis[2];

	return 	[
	[t*x*x + c,   t*x*y - z*s, t*x*z + y*s, 0],
	[t*x*y + z*s, t*y*y + c,   t*y*z - x*s, 0],
	[t*x*z - y*s, t*y*z + x*s, t*z*z + c,   0],
	[0, 0, 0, 1]];
}

function scaleMat(x, y, z)
{
	return 	[
	[x, 0, 0, 0],
	[0, y, 0, 0],
	[0, 0, z, 0],
	[0, 0, 0, 1]];
}


function transMat(x, y, z)
{
	return 	[
	[1, 0, 0, x],
	[0, 1, 0, y],
	[0, 0, 1, z],
	[0, 0, 0, 1]];
}

function transRotMat(x, y, z, rotX, rotY, rotZ)
{
	return mulMat(mulMat(rotMat([0, 0, 1], rotZ), mulMat(rotMat([0, 1, 0], rotY), rotMat([0, 0, 1], rotX))), transMat(x, y, z));
}

function projMat(fov)
{
	var f = 0.5 / Math.tan(fov / 180 * Math.PI / 2);
	return 	[
	[f, 0, 0, 0],
	[0, f, 0, 0],
	[0, 0, 1, 1],
	[0, 0, 1, 0]];
}

function camMat(fov, dist = 1)
{
	return mulMat(transMat(0, 0, dist / Math.tan(fov / 180 * Math.PI / 2)), projMat(fov));
}

function identityMat(n = 4)
{
	var ret = [];
	for (var i = 0; i < n; ++i)
	{
		ret[i] = [];
		for (var j = 0; j < n; ++j)
			ret[i][j] = i == j ? 1 : 0;
	}
	return ret;
}

function cofactorMat(m, tmp, p, q, n)
{
    var i=0, j=0;
    for (var row = 0; row < n; row++)
		if (row != p )
		{					
			j = 0;
			for (var col = 0; col < n; col++)
				if (col != q)
					tmp[i][j++] = m[row][col];
			i++;
		}
}
 
function detMat(m, n = m.length)
{ 
    if (n == 1)
        return m[0][0];
 
	var det = 0;
    var tmp = identityMat(n);
 
    for (var i = 0; i < n; i++)
    {
        cofactorMat(m, tmp, 0, i, n);
        det += (i % 2 == 0 ? 1 : -1) * m[0][i] * detMat(tmp, n - 1);
    }
 
    return det;
}
 
function inverseMat(m)
{
	if (m.length != m[0].length)
		return undefined;
	
	let n = m.length;
    let det = detMat(m, n);
    if (det == 0)
        return undefined;
 
    if (m.length == 1)
        return [[1 / det]];
 
	let tmp = identityMat(n);
	let inverse = identityMat(n); 
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
        {
            cofactorMat(m, tmp, i, j, n);
            inverse[j][i] = detMat(tmp, n - 1) / ((i + j) % 2 == 0 ? det : -det);
        }

    return inverse;
}
 
function transposeMat(m)
{
	transpose = [];
	for (let i = 0; i < m[0].length; i++)
	{
		transpose[i] = []
        for (let j = 0; j < m.length; j++)
            transpose[i][j] = m[j][i];
	}
	return transpose;
}
 

// Rec. 709 luma coefficients
// https://en.wikipedia.org/wiki/Luma_%28video%29
const Rec709 = [0.2126, 0.7152, 0.0722];
const Gamma = 2.2

// Hue/Saturation/Luma to Red/Green/Blue
// These algorithms were taken from KDE Krita's source code.
// https://github.com/KDE/krita/blob/fcf9a431b0af9f51546f986499b9621d5ccdf489/libs/pigment/KoColorConversions.cpp#L630-L841
function HSYToRGB(h, s, y, R, G, B) {
  const hue = h % 1;
  const sat = clampBetween(s, 0, 1);
  const lum = Math.pow(clampBetween(y, 0, 1), Gamma);
  const segment = 0.16666666666666666; // 1 / 6
  let r, g, b;

  let maxSat, m, fract, lumB, chroma, x;

  if (hue >= 0 && hue < segment) {
    maxSat = R + G * hue * 6;

    if (lum <= maxSat) {
      lumB = lum / maxSat * 0.5;
      chroma = sat * 2 * lumB;
    } else {
      lumB = (lum - maxSat) / ( 1 - maxSat) * 0.5 + 0.5;
      chroma = sat * (2 - 2 * lumB);
    }

    fract = hue * 6;
    x = (1 - Math.abs(fract % 2 - 1)) * chroma;
    r = chroma; g = x; b = 0;
    m = lum - ( R * r + G * g + B * b);
    r += m; g += m; b += m;
  } else if ( hue >= segment && hue < 2 * segment) {
    maxSat = G + R - R * (hue - segment) * 6;

    if (lum < maxSat) {
      lumB = lum / maxSat * 0.5;
      chroma = sat * 2 * lumB;
    } else {
      lumB = (lum - maxSat) / (1 - maxSat) * 0.5 + 0.5;
      chroma = sat * (2 - 2 * lumB);
    }

    fract = hue * 6;
    x = (1 - Math.abs(fract % 2 - 1)) * chroma;
    r =  x; g = chroma; b = 0;
    m = lum - (R * r + G * g + B * b);
    r += m; g += m; b += m;
  } else if (hue >= 2 * segment && hue < 3 * segment) {
    maxSat = G + B * (hue - 2 * segment) * 6;

    if (lum < maxSat) {
      lumB = lum / maxSat * 0.5;
      chroma = sat * 2 * lumB;
    } else {
      lumB = (lum - maxSat) / (1 - maxSat) * 0.5 + 0.5;
      chroma = sat * (2 - 2 * lumB);
    }

    fract = hue * 6.0;
    x = (1 - Math.abs(fract % 2 - 1)) * chroma;
    r = 0; g = chroma; b = x;
    m = lum - (R * r + G * g + B * b);
    r += m; g += m; b += m;
  } else if (hue >= 3 * segment && hue < 4 * segment) {
    maxSat = G + B - G * (hue - 3 * segment) * 6;

    if (lum < maxSat) {
      lumB = lum / maxSat * 0.5;
      chroma = sat * 2 * lumB;
    } else {
      lumB = (lum - maxSat) / (1 - maxSat) * 0.5 + 0.5;
      chroma = sat * (2 - 2 * lumB);
    }

    fract = hue * 6;
    x = (1 - Math.abs(fract % 2 - 1)) * chroma;
    r = 0; g = x; b = chroma;
    m = lum - (R * r + G * g + B * b);
    r += m; g += m; b += m;
  } else if (hue >= 4 * segment && hue < 5 * segment) {
    maxSat = B + R * (hue - 4 * segment) * 6;

    if (lum < maxSat) {
      lumB = lum / maxSat * 0.5;
      chroma = sat * 2 * lumB;
    } else {
      lumB = (lum - maxSat) / (1 - maxSat) * 0.5 + 0.5;
      chroma = sat * (2 - 2 * lumB);
    }

    fract = hue * 6;
    x = (1 - Math.abs(fract % 2 - 1)) * chroma;
    r = x; g = 0; b = chroma;
    m = lum - (R * r + G * g + B * b);
    r += m; g += m; b += m;
  } else if (hue >= 5 * segment && hue <= 1) {
    maxSat = B + R - B * (hue - 5 * segment) * 6;

    if (lum < maxSat) {
      lumB = lum / maxSat * 0.5;
      chroma = sat * 2 * lumB;
    } else {
      lumB = (lum - maxSat) / (1 - maxSat) * 0.5 + 0.5;
      chroma = sat * (2 - 2 * lumB);
    }

    fract = hue * 6;
    x = (1 - Math.abs(fract % 2 - 1)) * chroma;
    r = chroma; g = 0; b = x;
    m = lum - (R * r + G * g + B * b);
    r += m; g += m; b += m;
  } else {
    r = 0;
    g = 0;
    b = 0;
  }

  r = Math.pow(clampBetween(r, 0, 1), 1.0 / Gamma);
  g = Math.pow(clampBetween(g, 0, 1), 1.0 / Gamma);
  b = Math.pow(clampBetween(b, 0, 1), 1.0 / Gamma);

  return [r, g, b];
}

function RGBToHSY(r,g,b,R,G,B)
{
	r = Math.pow(clampBetween(r, 0, 1), Gamma);
	g = Math.pow(clampBetween(g, 0, 1), Gamma);
	b = Math.pow(clampBetween(b, 0, 1), Gamma);

	var minval = Math.min(r, Math.min(g, b));
	var maxval = Math.max(r, Math.max(g, b));
	var hue = 0.0;
	var sat = 0.0;
	var luma = 0.0;
	luma=(R*r+G*g+B*b);
	var luma_a=luma;
	var chroma = maxval-minval;
	var max_sat=0.5;
	if(chroma==0)
	{
		hue = 0.0;
		sat = 0.0;
	}
	else
	{
		if (maxval==r)
		{
			if (minval==b) {hue = (g-b)/chroma;}
			else {hue = (g-b)/chroma + 6.0;}
		}
		else if (maxval==g)
		{
			hue = (b-r)/chroma + 2.0;
		}
		else if (maxval==b)
			hue = (r-g)/chroma + 4.0;
		
		hue /= 6.0;
		const segment = 0.16666666666666666;
		if (hue>1.0 || hue<0.0){hue=hue%1.0;}
		
		if (hue>=0.0 && hue<segment)
		{max_sat = R + G*(hue*6);}
		else if (hue>=segment && hue<(2.0*segment))
		{max_sat = (G+R) - R*((hue-segment)*6) ;}
		else if (hue>=(2.0*segment) && hue<(3.0*segment))
		{max_sat = G + B*((hue-2.0*segment)*6);}
		else if (hue>=(3.0*segment) && hue<(4.0*segment))
		{max_sat = (B+G) - G*((hue-3.0*segment)*6) ;}
		else if (hue>=(4.0*segment) && hue<(5.0*segment))
		{max_sat =  (B) + R*((hue-4.0*segment)*6);}
		else if (hue>=(5.0*segment) && hue<=1.0)
		{max_sat = (R+B) - B*((hue-5.0*segment)*6);}
		else
		{max_sat=0.5;}

		if(max_sat>1.0 || max_sat<0.0){
			max_sat=(max_sat%1.0);}
		if (luma <= max_sat){luma_a = (luma/max_sat)*0.5;}
		else{luma_a = ((luma-max_sat)/(1-max_sat)*0.5)+0.5;}
		if ((sat = chroma) > 0.0)
		{sat = (luma <= max_sat) ? (chroma/ (2*luma_a) ) :(chroma/(2.0-(2*luma_a) ) ) ;}
	}

	sat = clampBetween(sat, 0, 1);
	luma = Math.pow(clampBetween(luma, 0, 1), 1 / Gamma);
	
	return [hue, sat, luma]
}

function HSY709ToRGB(h, s, y) {
  return HSYToRGB(h, s, y, ...Rec709);
}

function RGBToHSY709(r, g, b) {
  return RGBToHSY(r, g, b, ...Rec709);
}

function RGBToLAB(rgb){
  var r = rgb[0],
      g = rgb[1],
      b = rgb[2],
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs
function deltaE(labA, labB){
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / (1.0);
  var deltaCkcsc = deltaC / (sc);
  var deltaHkhsh = deltaH / (sh);
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function getDrawnPoints()
{
	var points = [];
	for (let stroke of question._strokes)
	{
		if (stroke.fill)
			points = []
		if (!stroke.erase && stroke.stroke && stroke.stroke.length > 2)
			points.push(...stroke.stroke)
	}
	return points;
}

function fitPointToDrawing()
{
	points = getDrawnPoints();
	let sumX = 0, sumY = 0;

    points.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
    });
	return [sumX / points.length, sumY / points.length];
}

function fitRectToDrawing()
{
	points = getDrawnPoints();
	var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    points.forEach(([x, y]) => {
        minX = Math.min(x, minX);
        maxX = Math.max(x, maxX);
		minY = Math.min(y, minY);
        maxY = Math.max(y, maxY);
    });
	return [minX, minY, maxX, maxY];
}

function fitLineToDrawing()
{
	const points = getDrawnPoints();
	let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = points.length;

    points.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });

    const meanX = sumX / n;
    const meanY = sumY / n;

    const slope = (sumXY - sumX * meanY) / (sumX2 - sumX * meanX);
    const intercept = meanY - slope * meanX;

    const direction = [1, slope];
    const normalize = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
    const vx = direction[0] / normalize;
    const vy = direction[1] / normalize;
	const px = 0;
	const py = intercept;

	const vl = vx ** 2 + vy ** 2;
    const tValues = points.map(([x, y]) => {
        return ((x - px) * vx + (y - py) * vy) / vl;
    });
    const minT = Math.min(...tValues);
    const maxT = Math.max(...tValues);

	return [[minT * vx + px, minT * vy + py], [maxT * vx + px, maxT * vy + py]];
}

function fitProjectionToDrawing(px, py, vx, vy)
{
	const points = getDrawnPoints();
	let sumT = 0;

	const vl = vx ** 2 + vy ** 2;
    points.forEach(([x, y]) => {
        sumT += ((x - px) * vx + (y - py) * vy) / vl;
    });

    const meanT = sumT / points.length;

	return [meanT * vx + px, meanT * vy + py, meanT];
}

function fitEllipseToDrawing()
{
	const points = getDrawnPoints();
	const n = points.length;

    let centroid = points.reduce((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
    centroid = [centroid[0] / n, centroid[1] / n];

    let covMatrix = [[0, 0], [0, 0]];
    points.forEach(point => {
        let dx = point[0] - centroid[0];
        let dy = point[1] - centroid[1];
        covMatrix[0][0] += dx * dx;
        covMatrix[0][1] += dx * dy;
        covMatrix[1][0] += dy * dx;
        covMatrix[1][1] += dy * dy;
    });

    covMatrix = covMatrix.map(row => row.map(value => value / n));

    let trace = covMatrix[0][0] + covMatrix[1][1];
    let det = covMatrix[0][0] * covMatrix[1][1] - covMatrix[0][1] * covMatrix[1][0];
    let eigenvalue1 = trace / 2 + Math.sqrt(trace * trace / 4 - det);
    let eigenvalue2 = trace / 2 - Math.sqrt(trace * trace / 4 - det);
    let eigenvector1 = [covMatrix[0][1], eigenvalue1 - covMatrix[0][0]];

    return [ centroid[0], centroid[1], Math.sqrt(2 * eigenvalue1), Math.sqrt(2 * eigenvalue2),  Math.atan2(eigenvector1[1], eigenvector1[0]) ];
}