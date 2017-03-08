var socket = io.connect(window.location.origin);

var shapeColor;
var circleX, circleY;
var maxRadius;

var drawRippleFromElsewhere = false;
var dataFromElsewhere = {};
var ripplesFromElsewhere = [];

var ripples = [];

// var notes = [54, 56, 58, 60, 62, 64, 65, 67, 69, 71, 73, 75, 77, 80];
var osc;

function setup() {
	createCanvas(windowWidth, windowHeight);

	// start silent
	osc = new p5.TriOsc();
	osc.start();
	osc.amp(0);
}

function draw() {
	fill(255, 80);
	noStroke();
	rect(0, 0, width, height);

	if (drawRippleFromElsewhere) {
		for (var i = 0; i < ripplesFromElsewhere.length; ++i) {
			ripplesFromElsewhere[i].drawRipple();
		}
	}

	for (var i = 0; i < ripples.length; ++i) {
		ripples[i].drawRipple();
	}

}

function randomColor() {
	var r = random(50, 230);
	var g = random(50, 230);
	var b = random(50, 230);

	return [r,g,b];
}

function mousePressed() {
	shapeColor = randomColor();
	circleX = mouseX;
	circleY = mouseY;
	maxRadius = random(70, 90);

	var randomNote = Math.floor(Math.random()*(80-50+1)) + 50;

	ripples.push(new Ripple(maxRadius, shapeColor, circleX, circleY, randomNote, "fromClick"));
	sendDrawings(maxRadius, shapeColor, circleX, circleY, randomNote);

}

function Ripple(count, color, x, y, note, origin) {
	this.count = count;
	var draw = true;
	var i = 10;

	playSound(note, this.count/60.0);

	this.drawRipple = function() {

		if (draw) {
			noStroke();
			fill(color[0], color[1], color[2], 255-i*3);
			ellipse(x, y, i, i);
			// ellipse(x, y, i-30, i-30);
			fill(color[0], color[1], color[2], 255-i*2);
			ellipse(x, y, i-15, i-15);
			fill(color[0], color[1], color[2], 255-i);
			ellipse(x, y, i-30, i-30);

			i+=0.3;

			if (i > this.count) {
				draw = false;
				// remove this particular ripple from array
				if (origin === "fromClick") {
					var index = ripples.indexOf(this);
					ripples.splice(index,1);
				} else if (origin === "fromClients") {
					var index = ripplesFromElsewhere.indexOf(this);
					ripplesFromElsewhere.splice(index,1);
				}
			}

		}
	};
}

function playSound(note, duration) {
	osc.freq(midiToFreq(note));
	osc.fade(0.2, 0.2);

	osc.fade(0.3, 0.3);

	setTimeout(function() {
		osc.fade(0, 0.3);
	}, duration*100);
}

// *** sockets *** //

function sendDrawings(count, color, x, y, n) {

	var data = {
		maxRadius: count,
		shapeColor: color,
		circleX: x,
		circleY: y,
		note: n
	};

	socket.emit("drawing", data);
}


socket.on("drawFromOtherClients", function(data) {

	drawRippleFromElsewhere = true;
	dataFromElsewhere = data;
	ripplesFromElsewhere.push(new Ripple(dataFromElsewhere.maxRadius,
						   dataFromElsewhere.shapeColor,
						   dataFromElsewhere.circleX,
						   dataFromElsewhere.circleY,
						   dataFromElsewhere.note,
						   "fromClients"));
});


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
