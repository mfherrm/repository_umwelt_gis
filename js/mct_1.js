// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
	Array.from = (function () {
		var toStr = Object.prototype.toString;
		var isCallable = function (fn) {
			return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
		};
		var toInteger = function (value) {
			var number = Number(value);
			if (isNaN(number)) {
				return 0;
			}
			if (number === 0 || !isFinite(number)) {
				return number;
			}
			return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
		};
		var maxSafeInteger = Math.pow(2, 53) - 1;
		var toLength = function (value) {
			var len = toInteger(value);
			return Math.min(Math.max(len, 0), maxSafeInteger);
		};
		// The length property of the from method is 1.
		return function from(arrayLike /*, mapFn, thisArg */ ) {
			// 1. Let C be the this value.
			var C = this;
			// 2. Let items be ToObject(arrayLike).
			var items = Object(arrayLike);
			// 3. ReturnIfAbrupt(items).
			if (arrayLike == null) {
				throw new TypeError(
					"Array.from requires an array-like object - not null or undefined");
			}
			// 4. If mapfn is undefined, then let mapping be false.
			var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
			var T;
			if (typeof mapFn !== 'undefined') {
				// 5. else
				// 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
				if (!isCallable(mapFn)) {
					throw new TypeError(
						'Array.from: when provided, the second argument must be a function');
				}
				// 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (arguments.length > 2) {
					T = arguments[2];
				}
			}
			// 10. Let lenValue be Get(items, "length").
			// 11. Let len be ToLength(lenValue).
			var len = toLength(items.length);
			// 13. If IsConstructor(C) is true, then
			// 13. a. Let A be the result of calling the [[Construct]] internal method 
			// of C with an argument list containing the single item len.
			// 14. a. Else, Let A be ArrayCreate(len).
			var A = isCallable(C) ? Object(new C(len)) : new Array(len);
			// 16. Let k be 0.
			var k = 0;
			// 17. Repeat, while k < len… (also steps a - h)
			var kValue;
			while (k < len) {
				kValue = items[k];
				if (mapFn) {
					A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T,
						kValue, k);
				} else {
					A[k] = kValue;
				}
				k += 1;
			}
			// 18. Let putStatus be Put(A, "length", len, true).
			A.length = len;
			// 20. Return A.
			return A;
		};
	}());
}
'use strict';
var myQuiz = {
	container: null,
	// helper function
	createElement: function (o) {
		var el, p;
		if (o && (o.tag || o.tagName)) {
			el = document.createElement(o.tag || o.tagName);
			if (o.text || o.txt) {
				var text = (o.text || o.txt)
				el.innerHTML = text;
			}
			for (p in o) {
				if (!p.match(/^t(e)?xt|tag(name)?$/i)) {
					el[p] = o[p];
				}
			}
		}
		return el;
	},
	// user interface for a quiz question
	createOptions: function () {
		var t = this,
			options = [],
			ul = document.createElement("ul");
		t.emptyContainer();
		t.intoContainer(t.createElement({
			tag: "h2",
			text: /* "(" + t.currentQuestion.category + ") " + */ t.currentQuestion.question
		}));
		t.intoContainer(ul);
		// create options
		options.push(t.currentQuestion.solution);
		t.currentQuestion.falses.forEach(function (s) {
			options.push(s);
		});
		t.shuffleArray(options);
		options.forEach(function (s, i) {
			var li = document.createElement("li"),
				label = t.createElement({
					htmlFor: "a" + t.questions.length + "_" + i,
					tag: "label",
					text: s
				}),
				radio = t.createElement({
					id: "a" + t.questions.length + "_" + i,
					name: "answer",
					tag: "input",
					type: "radio",
					tabindex: "0",
					value: s
				});
			ul.appendChild(li);
			li.appendChild(radio);
			li.appendChild(label);
		});
		// Hinweis für Tastatur-User
		t.intoContainer(t.createElement({
			tag: "button",
			text: "confirm choice",
			type: "submit"
		}));
	},
	currentChoices: [],
	currentQuestion: null,
	// data could be filled from an external source (JSON)
	data: [{
		
		question: 'Wie lautet der SDG Indikator 4.2.2?',
		solution: 'Teilnahmequote an organisiertem Lernen (ein Jahr vor dem offiziellen Einschulungsalter), nach Geschlecht',
		falses: ['Teilnahmequote an organisiertem Lernen', 'frühkindliche Bildung'],
		explanation: ''
	}, {
		/* category: 'HTML', */
		question: 'Welche zwei Provinzen liegen mit dem Anteil an frühkindlicher Bildung unter 60%?',
		solution: 'Northern Cape, KwaZulu-Natal',
		falses: ['Limpopo, Gauteng', 'North West, Gauteng'],
		explanation: ''
	}, {
		/* category: 'Kategorie?', */
		question: 'Um welche Altersgruppe geht es hier bei der frühkindlichen Bildung?',
		solution: 'Kinder in Kindertagesbetreuung im Alter von 5 Jahren.',
		falses: ['Kinder in Kindestagesbetreuung im Alter von 3 - 6 Jahren.', 'Kinder in Kindertagesbetreuung im Alter von 3 - 5 Jahren.'],
		explanation: ''
	},{
		/* category: 'Kategorie?', */
		question: 'Wer hat das gesagt: "Bildung ist die mächtigste Waffe, um die Welt zu verändern."?',
		solution: 'Nelson Mandela',
		falses: ['Barack Obama', 'Dalai Lama'],
		explanation: ''
	},{
		/* category: 'Kategorie?', */
		question: 'Bis wann soll sichergestellt werden, dass alle Mädchen und Jungen Zugang zu einer hochwertigen frühkindlichen Entwicklung, Betreuung und Vorschulerziehung haben?',
		solution: '2030',
		falses: ['2025', '2050'],
		explanation: 'Der Indikator 4.2.2 hat das Ziel, dass bis 2030 sicherstellen, dass alle Mädchen und Jungen Zugang zu hochwertiger frühkindlicher Erziehung, Betreuung und Vorschulbildung erhalten, damit sie auf die Grundschule vorbereitet sind.'
	}],
	emptyContainer: function () {
		var t = this;
		while (t.container.firstChild) {
			t.container.removeChild(t.container.firstChild);
		}
	},
	handleInput: function () {
		var t = this, // t points to myQuiz
			// create real array so we can use forEach
			inputs = Array.from(t.container.getElementsByTagName("input")),
			selectedSolution = "";
		// determine selection
		inputs.forEach(function (o) {
			if (o.checked) {
				selectedSolution = o.value;
			}
		});
		// process selected answer
		if (selectedSolution && t.currentQuestion) {
			t.currentChoices.push({
				a: selectedSolution,
				q: t.currentQuestion
			});
			t.play();
		}
		// accept start button
		if (!t.currentQuestion) {
			t.play();
		}
	},
	init: function () {
		var t = this;
		// here goes any code for loading data from an external source
		t.container = document.getElementById("quiz");
		if (t.data.length && t.container) {
			// use anonymous functions so in handleInput
			// "this" can point to myQuiz
			t.container.addEventListener("submit", function (ev) {
				t.handleInput();
				ev.stopPropagation();
				ev.preventDefault();
				return false;
			});
			t.container.addEventListener("mouseup", function (ev) {
				// we want to only support clicks on start buttons...
				var go = ev.target.tagName.match(/^button$/i);
				// ... and labels for radio buttons when in a game
				if (ev.target.tagName.match(/^label$/i) && t.currentQuestion) {
					go = true;
				}
				if (go) {
					window.setTimeout(function () {
						t.handleInput();
					}, 50);
					ev.stopPropagation();
					ev.preventDefault();
					return false;
				}
			});
			t.start();
		}
	},
	intoContainer: function (el, parentType) {
		var t = this,
			parent;
		if (!el) {
			return;
		}
		if (parentType) {
			parent = document.createElement(parentType);
			parent.appendChild(el);
		} else {
			parent = el;
		}
		t.container.appendChild(parent);
		return parent;
	},
	// ask next question or end quiz if none are left
	play: function () {
		var t = this,
			ol;
		// game over?
		if (!t.questions.length) {
			t.showResults();
			// offer restart
			window.setTimeout(function () {
				t.start();
			}, 50);
			return;
		}
		t.currentQuestion = t.questions.shift();
		t.createOptions();
	},
	// list with remaining quiz question objects
	questions: [],
	// list original questions and given answers and elaborate on solutions
	showResults: function () {
		var cat, ol, s, scores = {},
			t = this,
			tab, thead, tbody, tr;
		t.emptyContainer();
		// show message
		t.intoContainer(t.createElement({
			tag: "b",
			text: "Sie haben alle Fragen beantwortet. Hier die Auswertung Ihrer Antworten:"
		}));
		// list questions and given answers
		ol = t.intoContainer(t.createElement({
			id: "result",
			tag: "ol"
		}));
		t.currentChoices.forEach(function (o) {
			var p, li = ol.appendChild(t.createElement({
				tag: "li"
			}));
			// list original question
			li.appendChild(t.createElement({
				className: "question",
				tag: "p",
				text: /* "(" + o.q.category + ") " + */ o.q.question
			}));
			// list given answer
			p = li.appendChild(t.createElement({
				tag: "p",
				text: "Ihre Antwort: "
			}));
			p.appendChild(t.createElement({
				className: (o.q.solution == o.a ? "correct" : "wrong"),
				tag: "em",
				text: o.a
			}));
			// wrong answer?
			if (o.q.solution != o.a) {
				p = li.appendChild(t.createElement({
					tag: "p",
					text: "Die richtige Antwort wäre gewesen: "
				}));
				p.appendChild(t.createElement({
					tag: "em",
					text: o.q.solution
				}));
			}
			// elaborate on solution?
			if (o.q.explanation) {
				p = li.appendChild(t.createElement({
					tag: "p",
					text: "Erläuterung: "
				}));
				p.appendChild(t.createElement({
					tag: "em",
					text: o.q.explanation
				}));
			}
		});

		// show message
		t.intoContainer(t.createElement({
			tag: "b",
			text: "Möchten Sie den Test wiederholen?"
		}));
	},
	// helper function: shuffle array (adapted from http://javascript.jstruebig.de/javascript/69)
	shuffleArray: function (a) {
		var i = a.length;
		while (i >= 2) {
			var zi = Math.floor(Math.random() * i);
			var t = a[zi];
			a[zi] = a[--i];
			a[i] = t;
		}
		// no return argument since the array has been
		// handed over as a reference and not a copy!
	},
	// start quiz with a start button
	start: function () {
		var t = this;
		// fill list of remaining quiz questions
		t.questions = [];
		t.data.forEach(function (o) {
			t.questions.push(o);
		});
		t.shuffleArray(t.questions);
		t.currentChoices = [];
		t.currentQuestion = null;
		// install start button
		t.intoContainer(t.createElement({
			className: "startBtn",
			tag: "button",
			text: "Multiple Choice Test starten!"
		}), "p");
	}
	
};
document.addEventListener("DOMContentLoaded", function () {
	myQuiz.init();
});
