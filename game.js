var FPS = 10;			// frames per second, ie, how fast game objects are updated

themes = [
		["music-horror.mp3", "background-TheRing.jpg"],
		["music-BladeRunner.mp3", "background-BladeRunner.jpg"],
		["music-Beethoven-7-2-A.mp3", "background-MobyDick.jpg"],
		["music-CandyMan.mp3", "background-TheRing2.jpg"],
		["music-流星雨.mp3", "background-Doris-mobile.jpg.png"],
		["music-TRON.mp3", "background-TRON.jpg"],
		["music-Beethoven-7-2-B.mp3", "background-MobyDick-2.jpg"],
	];

function butt(ch) {
	keybuff = ch;
}

var song_idx = 0;
const numSongs = themes.length
const music = document.getElementById("music");
const background = document.getElementById("background");
$("#music").bind('ended', nextSong);

function nextSong() {
	song_idx += 1;
	if (song_idx >= numSongs)
		song_idx = 0;
	background.src = "images/" + themes[song_idx][1];
	music.src = "sounds/" + themes[song_idx][0];
	music.pause();
	music.load();
	music.play();
	}

// *********** Read words into word list
var wordlist = new Array();
var num_words = 0;

// fetch('https://cybernetic1.github.io/game1/chinese-words.txt')
fetch('./chinese-words.txt')
  .then((response) => {
	return response.text();
  })
  .then((text) => {
		var lines = text.split("\n")

		lines.forEach(function(line) {
			var words = line.split('\t');

			words.forEach(function(w) {
				if (w != "") {
					wordlist[num_words] = w;
					num_words += 1;
				}
			});
		});
	console.log("num_words = ", num_words);
  });

var player = {
	color: "#0000AA",
	input: "",

	draw: function() {
	self.input = keybuff;
	}
};

var playerBullets = [];

function Bullet(I) {
	I.active = true;

	I.color = "#000000";

	I.inBounds = function() {
	return I.x >= 0 && I.x <= CANVAS_WIDTH &&
		I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.draw = function() {
	};

	I.update = function() {
	// I.x += I.xVelocity;
	// I.y += I.yVelocity;

	// I.active = I.active && I.inBounds();
	};

	I.explode = function() {
	this.active = false;
	// Extra Credit: Add an explosion graphic
	};

	return I;
}

enemies = [];
currentActive = 0;

function Enemy(I) {
	I = I || {};

	I.alive = true;

	/***** If possible, speak Mandarin *****
	$.ajax({
		method: "POST",
		url: "http://localhost:9090/speakMandarin/",
		data: {text: I.text},
		success: function(resp) {
			// nothing
		}
	});
	*/

	ch = document.getElementById("char" + I.position.toString());
	ch.textContent = I.ch;

	py = document.getElementById("pinyin" + I.position.toString());
	py.textContent = I.question;

	I.draw = function() {
		};

	I.update = function() {
		if (this.position == currentActive) {
			var py = document.getElementById("pinyin" + this.position.toString());
			var str = py.textContent;
			var c = '░';
			if (str[0] != '█')
				c = '█';
			py.textContent = c + str.slice(1);
			}
		};

	I.explode = function() {
		Sound.play("explosion");
		ans = document.getElementById("answer");
		ans.textContent = "?";
		// console.log("this.position = ", this.position);
		var py = document.getElementById("pinyin" + this.position.toString());
		py.textContent = this.answer + this.question.slice(1);
		py.color = "#CC44DD";
		this.alive = false;
		currentActive += 1;
		};

	return I;
};

setInterval(function() {
	update();
	draw();
}, 1000/FPS);

function display_pinyin(nucleus, tone) {
	// var nucleus = pinyins[1];
	// var tone = pinyins[2];
	var str2 = "";
	var n0 = '!';

	if (tone == 1) {
		if (nucleus[0] == 'a') n0 = 'ā';
		if (nucleus[0] == 'e') n0 = 'ē';
		if (nucleus[0] == 'i') n0 = 'ī';
		if (nucleus[0] == 'o') n0 = 'ō';
		if (nucleus[0] == 'u') n0 = 'ū';
	}
	else if (tone == 2) {
		if (nucleus[0] == 'a') n0 = 'á';
		if (nucleus[0] == 'e') n0 = 'é';
		if (nucleus[0] == 'i') n0 = 'í';
		if (nucleus[0] == 'o') n0 = 'ó';
		if (nucleus[0] == 'u') n0 = 'ú';
	}
	else if (tone == 3) {
		if (nucleus[0] == 'a') n0 = 'ă';
		if (nucleus[0] == 'e') n0 = 'ě';
		if (nucleus[0] == 'i') n0 = 'ĭ';
		if (nucleus[0] == 'o') n0 = 'ŏ';
		if (nucleus[0] == 'u') n0 = 'ŭ';
	}
	else if (tone == 4) {
		if (nucleus[0] == 'a') n0 = 'à';
		if (nucleus[0] == 'e') n0 = 'è';
		if (nucleus[0] == 'i') n0 = 'ì';
		if (nucleus[0] == 'o') n0 = 'ò';
		if (nucleus[0] == 'u') n0 = 'ù';
	}
	if (n0 == '!')
		return nucleus;  	// tone.toString()
	else
		return n0 + nucleus.substr(1);
}

function update() {
	if(keydown.esc) {
		// clear key buffer
		keybuff = "";
	}

	if(keydown.backspace) {
		// give up, display answer
		player.shoot();
	}

	if(keydown.space) {
		// give up, display answer
		keybuff = " ";
	}

	if(keydown.left) {
	//	player.x -= 5;
	}

	if(keydown.right) {
		nextSong();
	}

	playerBullets.forEach(function(bullet) {
		bullet.update();
	});

	playerBullets = playerBullets.filter(function(bullet) {
		return bullet.active;
	});

	enemies.forEach(function(enemy) {
		enemy.update();
	});

	enemies = enemies.filter(function(enemy) {
		return enemy.alive;
	});

	handleCollisions();

	// Add new enemies:
	if (enemies.length == 0) {
		currentActive = 0;
		var text = wordlist[Math.floor(Math.random() * num_words)];
		var pos = 0;
		for (var len = text.length; pos < len; ++pos) {
			var ch = text[pos];
			var answer = pin[ch][0];
			if (answer == '')		// if no consonent, require an empty ' '
				answer = ' ';
			var question = '_' + display_pinyin(pin[ch][1], pin[ch][2]);
			enemies.push(Enemy({
				position: pos,
				ch: ch,
				answer: answer,
				question: question
			}));
		}
		// Fill empty spaces
		for (; pos < 4; ++pos) {
			var ch = document.getElementById("char" + pos.toString());
			ch.textContent = "";
			var py = document.getElementById("pinyin" + pos.toString());
			py.textContent = "";
		}
	}
}

player.shoot = function() {
	// This causes true answer to be displayed
	Sound.play("shoot");
	ans = document.getElementById("answer");
	ans.textContent = enemies[0].answer;
	keybuff = "";
};

function draw() {
	player.draw();

	playerBullets.forEach(function(bullet) {
	bullet.draw();
	});

	enemies.forEach(function(enemy) {
	enemy.draw();
	});
}

function collides(enemy) {
	// New rule:  need only check consonant, and check only "currentActive"
	if (enemy.position != currentActive)
		return false;

	if (keybuff == enemy.answer)
		return true;
	else
		return false;

	/* var match = true;
	for (var i = 0, j = 0, len1 = enemy.answer.length, len2 = keybuff.length;
			i < len1; ++i, ++j) {
		if (j >= len2)
			j = len2 - 1;
		if (enemy.answer[i] != keybuff[j]) {
			match = false;
			break;
			}
		}
	return match;
	*/
	}

function handleCollisions() {
	enemies.forEach(function(enemy) {
	if(collides(enemy)) {
		keybuff = "";
		enemy.explode();
	}
	});
}

player.explode = function() {
	Sound.play("explosion-self");
	this.active = false;
	// Extra Credit: Add an explosion graphic and then end the game
};
