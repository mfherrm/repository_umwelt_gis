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
			tag: "h5",
			style: "padding-left: 2.5%; padding-top: .5rem",
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
					style: "padding: .5rem;",
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
			className: "btn btn-secondary",
			tag: "button",
			text: "Confirm choice",
			type: "submit",
			id: "confirm"
		}));
	},
	currentChoices: [],
	currentQuestion: null,
	// data could be filled from an external source (JSON)
	data: [{
		
		question: 'The closer R is to 1...',
		solution: '... the higher the correlation between the variables',
		falses: ['...the lower the correlation between the variables', '...the higher the anti-correlation between the variables'],
		explanation: ''
	}, {
		/* category: 'HTML', */
		question: 'What is a scatterplot?',
		solution: 'A visualisation of the relationship between two variables',
		falses: ['A diagram illustrating temporal differences between variables', 'A graph showing only standardized values'],
		explanation: ''
	}, {
		/* category: 'Kategorie?', */
		question: 'How can a scatterplot be intepreted?',
		solution: 'The closer the observations lie to an imaginary 45° line, the higher their correlation',
		falses: ['Clustering indicates high correlation', 'The higher the y-value the higher the correlation'],
		explanation: ''
	},{
		/* category: 'Kategorie?', */
		question: 'Why is R² important when testing hypotheses?',
		solution: 'It evaluates whether predictions fit the actual data',
		falses: ["It indicates an observation's covariance", 'It indicates the reason for correlation'],
		explanation: ''
	},{
		/* category: 'Kategorie?', */
		question: 'How can the correlation coefficient be obtained?',
		solution: 'Division of the covariance of the two variables by the product of their standard deviations',
		falses: ['Division of the variance of the two variables by the product of their standard deviations', 'Division of the product of the standard deviation of the two variables by their covariance'],
		explanation: ''
	},
    {
		/* category: 'Kategorie?', */
		question: "What is the assumption linear regression makes use of?",
		solution: 'It assumes that observations deviate from an underlying relationship between a dependent variable y and an independent variable x',
		falses: ['It assumes that observations deviate from an underlying relationship between two dependent variables x and y'],
		explanation: ''
	},
    {
		/* category: 'Kategorie?', */
		question: "There is a clear correlation between SDGs 1.2.1 and 4.2.2 in Kenya",
		solution: 'False',
		falses: ['True'],
		explanation: ''
	},{
		/* category: 'Kategorie?', */
		question: "There is a clear correlation between SDGs 1.2.1 and 4.2.2 in Germany",
		solution: 'False',
		falses: ['True'],
		explanation: ''
	},
    {
		/* category: 'Kategorie?', */
		question: "There is a clear correlation between SDGs 1.2.1 and 4.2.2 in South Africa",
		solution: 'False',
		falses: ['True'],
		explanation: ''
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
				if (ev.target.tagName.match(/^button$/i) && t.currentQuestion) {
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
			text: "You have answered all of the questions. Your results are as follows:"
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
				text: "You answered: "
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
					text: "The right answer would have been: "
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
					text: "Explanation: "
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
			text: "Restart quiz?"
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
			className: "startBtn btn btn-secondary",
			tag: "button",
			text: "Start quiz"
		}), "p");
	}
	
};
document.addEventListener("DOMContentLoaded", function () {
	myQuiz.init();
});
