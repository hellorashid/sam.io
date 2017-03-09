var socket = io.connect(window.location.origin);

var shapeColor;
var circleX, circleY;
var maxRadius;

var drawRippleFromElsewhere = false;
var dataFromElsewhere = {};
var ripplesFromElsewhere = [];

var ripples = [];
var dots = [];

var face;
// var notes = [54, 56, 58, 60, 62, 64, 65, 67, 69, 71, 73, 75, 77, 80];
var osc;

function setup() {
	createCanvas(windowWidth, windowHeight);
	// start silent
	osc = new p5.TriOsc();
	osc.start();
	osc.amp(0);



	var numDots = 40;

	for(var i=0; i < numDots; i++) {
		var c = randomColor();
		dots.push(new Dot(c));
	}

}

function draw() {
	// fill(255, 80);
	noStroke();
	// rect(0, 0, width, height);
	background(255, 230);

	if (drawRippleFromElsewhere) {
		for (var i = 0; i < ripplesFromElsewhere.length; ++i) {
			ripplesFromElsewhere[i].show();
		}
	}

	for(var j=0; j < dots.length; j++) {
		dots[j].draw();
	}

	for (var i = 0; i < ripples.length; ++i) {
		var rip = ripples[i];
		rip.move();
		sendDrawings(rip.color, rip.posX, rip.posY, rip.r);

        for (var x = 0; x < dots.length; x++){
                ripples[i].grow(dots[x]);
        }
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
	var width = 50;

	// var randomNote = Math.floor(Math.random()*(80-50+1)) + 50;

	ripples.push(new Ripple(shapeColor, circleX, circleY, width, "fromClick"));

}

function Ripple(color, x, y, width, origin) {
	var draw = true;
	var i = 10;
	this.color = color;

	var easing = 0.06;
	this.posX = windowWidth/2;
	this.posY = windowHeight/2;
	this.r = width;

    var samWidth;
    var samHeight;

	this.show = function() {
		fill(color);
		ellipse(this.posX, this.posY, this.r, this.r);
	};

	this.move = function() {

		this.posX += (mouseX - this.posX)*easing;
		this.posY += (mouseY - this.posY)*easing;

		fill(color);
		ellipse(this.posX, this.posY, this.r, this.r);
		// this.posX = posX;
		// this.posY = posY;
		this.lifeTime ++;
	};

    this.grow = function(someRipple) {
        if (abs(this.posX - someRipple.x) < (this.r/2 + someRipple.r/2) && abs(this.posY - someRipple.y) < (this.r/2 + someRipple.r/2)) {
            // console.log("HIT");
            this.r += someRipple.r/2;
            someRipple.r = 0;

        }


    };

}

function Dot(color) {
	this.x = Math.floor(Math.random()*(windowWidth-50) + 50);
	this.y = Math.floor(Math.random()*(windowHeight-50) + 50);
	this.r = Math.floor(Math.random()*(20) + 10);


	this.draw = function() {
		fill(color);
		ellipse(this.x, this.y, this.r, this.r);
	};




}



	// playSound(note, this.count/60.0);
	//
	// this.drawRipple = function() {
	//
	// 	if (draw) {
	// 		noStroke();
	// 		fill(color[0], color[1], color[2], 255-i*3);
	// 		ellipse(x, y, i, i);
	// 		// ellipse(x, y, i-30, i-30);
	// 		fill(color[0], color[1], color[2], 255-i*2);
	// 		ellipse(x, y, i-15, i-15);
	// 		fill(color[0], color[1], color[2], 255-i);
	// 		ellipse(x, y, i-30, i-30);
	//
	// 		i+=0.3;
	//
	// 		if (i > this.count) {
	// 			draw = false;
	// 			// remove this particular ripple from array
	// 			if (origin === "fromClick") {
	// 				var index = ripples.indexOf(this);
	// 				ripples.splice(index,1);
	// 			} else if (origin === "fromClients") {
	// 				var index = ripplesFromElsewhere.indexOf(this);
	// 				ripplesFromElsewhere.splice(index,1);
	// 			}
	// 		}

		// }
	// };

function playSound(note, duration) {
	osc.freq(midiToFreq(note));
	osc.fade(0.2, 0.2);

	osc.fade(0.3, 0.3);

	setTimeout(function() {
		osc.fade(0, 0.3);
	}, duration*100);
}

// *** sockets *** //

function 	sendDrawings(shapeColor, circleX, circleY, width) {

	var data = {
		shapeColor: shapeColor,
		circleX: circleX,
		circleY: circleY,
		r: width
	};

	socket.emit("drawing", data);
}


socket.on("drawFromOtherClients", function(data) {

	drawRippleFromElsewhere = true;
	dataFromElsewhere = data;
	ripplesFromElsewhere.push(new Ripple(
						   dataFromElsewhere.shapeColor,
						   dataFromElsewhere.circleX,
						   dataFromElsewhere.circleY,
						   dataFromElsewhere.r,
						   "fromClients"));
});


function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}
