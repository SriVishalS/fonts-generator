/*********************************
* 
* Fancy Fonts Generator/Converter 
* Written by Alan.
* Written on 06-08-2021
*
/*********************************/

/* String Extensions */
String.prototype.unicodeAwareSplit = function() {
	// javascript doesn't handle surrogate pairs properly so we have to get around it this way
	let _arr = [];
	for (const _c of this.valueOf()) {
		_arr.push(_c);
	}
	return _arr;
}

String.prototype.toAlternateCase = function() {
	let _arr = [];
	let _alternate = true;
	for (const _c of this.valueOf()) {
		if (_alternate) {
			_alternate = false;
			_arr.push(_c.toUpperCase());
		} else {
			_alternate = true;
			_arr.push(_c.toLowerCase());
		}
	}
	return _arr.join('');
};

/* PseudoFont: Unicode Font Parser & Converter */
class PseudoFont {
	constructor(fontName, fontLower, fontUpper, fontDigits) {
		this.fontName = fontName;
		
		// splitting if not already an array, otherwise JavaScript won't handle the characters properly.
		this.fontLower = Array.isArray(fontLower) ? fontLower : fontLower.unicodeAwareSplit();
		this.fontUpper = Array.isArray(fontUpper) ? fontUpper : fontUpper.unicodeAwareSplit();
		this.fontDigits = Array.isArray(fontDigits) ? fontDigits : fontDigits.unicodeAwareSplit();
		
		this.referenceLower = "abcdefghijklmnopqrstuvwxyz";
		this.referenceUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		this.referenceDigits = "0123456789";

		// experimental means either:
		// 		- the font is incomplete.
		//		- the font is unsupported on several platforms.
		this.experimental = false;
	}

	setExperimental(state) {
		this.experimental = state;
	}
	
	convert(rawText) {
		let _converted = "";
		for (const _char of rawText) {
			if (this.referenceLower.includes(_char)) {
				// if character is lowercase
				_converted += this.fontLower[this.referenceLower.indexOf(_char)];
			} else if (this.referenceUpper.includes(_char)) {
				// if character is uppercase
				_converted += this.fontUpper[this.referenceUpper.indexOf(_char)];
			} else if (this.referenceDigits.includes(_char)) {
				// if character is digit
				_converted += this.fontDigits[this.referenceDigits.indexOf(_char)];
			} else {
				_converted += _char;
			}
		}
		return _converted;
	}
}

/* Variables */
const randomTexts = [
	"Why did Adele cross the road? To say hello from the other side.", "What kind of concert only costs 45 cents? A 50 Cent concert featuring Nickelback.",
	"What did the grape say when it got crushed? Nothing, it just let out a little wine.", "I want to be cremated as it is my last hope for a smoking hot body.",
	"Time flies like an arrow. Fruit flies like a banana.", "To the guy who invented zero, thanks for nothing.",
	"I had a crazy dream last night! I was swimming in an ocean of orange soda. Turns out it was just a Fanta sea.",
	"A crazy wife says to her husband that moose are falling from the sky. The husband says, it’s reindeer.",
	"Ladies, if he can’t appreciate your fruit jokes, you need to let that mango.",
	"Geology rocks but Geography is where it’s at!", "I had a crazy dream last night! I was swimming in an ocean of orange soda. Turns out it was just a Fanta sea.",
	"A crazy wife says to her husband that moose are falling from the sky. The husband says, it’s reindeer.",
	"Ladies, if he can’t appreciate your fruit jokes, you need to let that mango.",
	"Geology rocks but Geography is where it’s at!", "Smaller babies may be delivered by stork but the heavier ones need a crane.",
	"My grandpa has the heart of the lion and a lifetime ban from the zoo.", "Why was Dumbo sad? He felt irrelephant.",
	"A man sued an airline company after it lost his luggage. Sadly, he lost his case.", "I lost my mood ring and I don’t know how to feel about it!",
	"Yesterday, I accidentally swallowed some food coloring. The doctor says I’m okay, but I feel like I’ve dyed a little inside.",
	"So what if I don’t know what apocalypse means? It’s not the end of the world!",
	"My friend drove his expensive car into a tree and found out how his Mercedes bends.", "Becoming a vegetarian is one big missed steak.",
	"I was wondering why the ball was getting bigger. Then it hit me.", "Some aquatic mammals at the zoo escaped. It was otter chaos!",
	"Never trust an atom, they make up everything!", "Waking up this morning was an eye-opening experience.",
	"Long fairy tales have a tendency to dragon.", "What do you use to cut a Roman Emperor’s hair? Ceasers.",
	"The Middle Ages were called the Dark Ages because there were too many knights.", 
	"My sister bet that I couldn’t build a car out of spaghetti. You should’ve seen her face when I drove pasta.", "I made a pun about the wind but it blows.",
	"Never discuss infinity with a mathematician, they can go on about it forever.", "I knew a guy who collected candy canes, they were all in mint condition.",
	"My wife tried to apply at the post office but they wouldn’t letter. They said only mails work here.", 
	"My friend’s bakery burned down last night. Now his business is toast.", "Getting the ability to fly would be so uplifting.", 
	"It's hard to explain puns to kleptomaniacs because they always take things literally.", 
	"Two windmills are standing in a wind farm. One asks, “What’s your favorite kind of music?” The other says, “I’m a big metal fan.”",
	"I can’t believe I got fired from the calendar factory. All I did was take a day off!", "England doesn't have a kidney bank, but it does have a Liverpool.", 
	"What do you call the wife of a hippie? A Mississippi.", "A cross-eyed teacher couldn’t control his pupils.", "She had a photographic memory, but never developed it.",
	"I wasn’t originally going to get a brain transplant, but then I changed my mind.", "There was a kidnapping at school yesterday. Don’t worry, though - he woke up!",
	"What do you get when you mix alcohol and literature? Tequila mockingbird.", "What washes up on tiny beaches? Microwaves.", 
	"I hate how funerals are always at 9 a.m. I’m not really a mourning person."
];

var convertAll = false;  // whether to convert and display all available fonts or not.
var randomText = "The quick brown fox jumps over the lazy dog.";  // random text used for placeholder if user input is null.
var userInput = ""; // input from the user (updated on keyup)
var selectedFont = "";  // the font the user selected.
var selectedStyle = "";  // the font style the user selected.
var fonts = [];   // all the fonts that the user can choose from

/* Elements */
const e_inputTextArea = document.getElementById('input-text-area');
const e_fontSelect = document.getElementById('font-select');
const e_fontStyleSelect = document.getElementById('font-style-select');
const e_viewAllConversions = document.getElementById('view-all-conversions');

const e_outputText = document.getElementById('output-text');
const e_outputList = document.getElementById('output-list');


// Fetch the fonts.json file and set everything up.
// To-Do: add a fallback in case the fonts can't be fetched (in case of running offline or something)
fetch("./fonts/fonts.json")
.then(response => response.json())
.then(_fontFiles => {
	for (const _font of _fontFiles) {
		// make a new pseudofont object.
		let _newFont = new PseudoFont(
			_font['fontName'],
			_font['fontLower'] || 'abcdefghijklmnopqrstuvwxyz',
			_font['fontUpper'] || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
			_font['fontDigits'] || '0123456789'
		);

		if (_font['experimentalFont'] === true) {
			_newFont.setExperimental(true);
		}
		
		// add the font to the font list.
		fonts.push(_newFont);
		
		// add the font to the fonts selection list.
		let _newFontOption = document.createElement('option');
		_newFontOption.value = _newFont.fontName;
		if (_newFont.experimental) {
			_newFontOption.innerHTML = `${_newFont.fontName} [EXPERIMENTAL]`;
		} else {
			_newFontOption.innerHTML = `${_newFont.fontName} (${_newFont.convert(_newFont.fontName)})`;
		}
		e_fontSelect.appendChild(_newFontOption);
	}
	
	// enable the text area once the fonts have been loaded.
	e_inputTextArea.disabled = false;
	
	// show how many fonts are loaded inside parenthesis
	//e_viewAllConversions.innerText = `View All Fonts (${fonts.length})`;
	e_viewAllConversions.innerText = `View All Fonts (${fonts.filter(x => !x.experimental).length})`;  // excluding experimental fonts
	
	// select a random font to show at start.
	e_fontSelect.selectedIndex = Math.floor(Math.random() * fonts.length);
	
	// update all variables and convert the first text.
	updateUserInput();
	updateFontInput();
	convertText();
});

/* Event Listeners */
// Convert text on update of the text field.
e_inputTextArea.addEventListener('keyup', () => {
	updateUserInput(); 
	convertTextAll();
});

// Convert text when font is changed from the list.
e_fontSelect.addEventListener('change', () => {
	updateFontInput();
	convertText();
});

// Convert text when font style is changed from the list.
e_fontStyleSelect.addEventListener('change', () => {
	updateFontInput();
	updateUserInput();
	convertText();
});

// Enable/disable whether to convert all fonts or not.
e_viewAllConversions.addEventListener('click', () => {
	convertAll = (convertAll ? false : true);
	convertTextAll();
});




// Copy content to clipboard if the user clicks on the converted text.
e_outputText.addEventListener('click', () => {
	let _range = document.createRange();
	window.getSelection().removeAllRanges();
	_range.selectNode(e_outputText);
	window.getSelection().addRange(_range);
	document.execCommand('copy');
	window.getSelection().removeAllRanges();
	
	// To-Do: replace this with a less annoying pop-up later.
	alert("Copied to clipboard!");
});

/* Update Functions */
function updateUserInput() {
	let _userInput = e_inputTextArea.value;
	if (_userInput.trim()) {
		userInput = _userInput;
	} else {
		// generate a new random placeholder if the textarea has no value.
		updateRandomText();
		userInput = randomText;
	}
	
	switch (selectedStyle) {
		case "shift-upper":
			userInput = userInput.toUpperCase();
			break;
		case "shift-lower":
			userInput = userInput.toLowerCase();
			break;
		case "shift-alternate":
			userInput = userInput.toAlternateCase();;
			break;
		case "spaced":
			userInput = userInput.split('').join(' ');
			break;
		case "reverse":
			userInput = userInput.split('').reverse().join('');
			break;
	}
}

function updateFontInput() {
	// update the selected font and its style.
	selectedFont = fonts.find(fnt => fnt.fontName === e_fontSelect.value);
	selectedStyle = e_fontStyleSelect.value;
}

function updateRandomText() {
	// new random pun for placeholder.
	randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)];
}

/* Conversion Functions */
function convertText() {
	// update the main font output.
	e_outputText.innerHTML = selectedFont.convert(userInput);
}

function convertTextAll() {
	// update the main font output.
	convertText();
	
	// make sure we convert everything only if the user has clicked the "View All" <detail> tag.
	if (convertAll) {
		// remove all children of the output list
		e_outputList.innerHTML = "";
		
		// convert the text and display all available fonts.
		for (const _font of fonts) {
			if (!_font.experimental) {
				let _li = document.createElement("li");
				_li.innerHTML = `<p> <b class="unselectable">${_font.fontName}:</b> ${_font.convert(userInput)}</p>`;
				e_outputList.appendChild(_li);
			}
		}
	}
}

// Set a randomly generated pastel color for the background.
// just a cute little addition ^^
var _hue = Math.floor(Math.random() * 360);
_pastel = `hsl(${_hue}, 100%, 80%)`;
document.body.style.backgroundColor = _pastel;
document.querySelector('meta[name="theme-color"]').setAttribute('content',  _pastel);