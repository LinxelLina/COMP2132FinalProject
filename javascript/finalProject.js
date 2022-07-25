//arrays and JSON files that will be used that are not fetched
const keys = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const goodscp = `[
    {
        "name" : "scp999",
        "description" : "A blob of goodness, a calming presence.",
        "link" : "https://scp-wiki.wikidot.com/scp-999"
    },
    {
        "name" : "scp2295",
        "description" : "The doctor is in! This patchwork bear is able to patch injuries.",
        "link" : "https://scp-wiki.wikidot.com/scp-2295"
    }

]`;
const badscp = `[
    {
        "name" : "scp017",
        "description" : "A shadowy figure, don't get close or you may disappear into the void forever.",
        "link" : "https://scp-wiki.wikidot.com/scp-017"
    },
    {
        "name" : "scp096",
        "description" : "Uh oh. Don't look at their face or you may meet an unfortunate end.",
        "link" : "https://scp-wiki.wikidot.com/scp-096"
    },
    {
        "name" : "scp173",
        "description" : "Keep your eyes on it at all times, DON'T BLINK, failure may result in termination.",
        "link" : "https://scp-wiki.wikidot.com/scp-173"
    },
    {
        "name" : "scp682",
        "description" : "Oh no, you've enranged it. Seems you've already met your end.",
        "link" : "https://scp-wiki.wikidot.com/scp-682"
    },
    {
        "name" : "scp871",
        "description" : "The cake is a lie! Not dangerous. Yet. But having infinite cake may get a bit dangerous I think.",
        "link" : "https://scp-wiki.wikidot.com/scp-871"
    }

]`;

//create arrays using json object
const goodscpObject             = JSON.parse(goodscp);
const goodscpArrayName          = goodscpObject.map(x => x.name);
const goodscpArrayDescription   = goodscpObject.map(x => x.description);
const goodscpArrayLink          = goodscpObject.map(x => x.link);

const badscpObject              = JSON.parse(badscp);
const badscpArrayName           = badscpObject.map(x => x.name);
const badscpArrayDescription    = badscpObject.map(x => x.description);
const badscpArrayLink           = badscpObject.map(x => x.link);

//get elements
const keyboard  = document.getElementById("keyboard");
const hangman   = document.getElementById("hangman");
const hangPic   = document.getElementById("hangPic");
const hangHint  = document.getElementById("hint");

const $popup            = $("#popup");
const $popup_correct    = $("#popup_correct");
const $popup_fail       = $("#popup_fail");
const $popup_restart    = $(".restart");
const $popup_text       = $(".extraText");

const jsonAnswers   = "json/answers.json";
let userAnswers     = []; //holds user answers
let currentWord     = []; //holds answers
let actualWord      = []; // holds answerkey
let word; //the value the word is assigned to

let randomNum;
let randomscpgood;
let randomscpbad;

let arrayOfNames;
let arrayOfHints;

let doorAnimation;
let doorAnimationInterval;

let errorCount      = 0;
let knockCount      = 0;
let delay           = 4000;
let animationDelay  = 1000;
let passed          = false;

//start with setting up screen
keyboard.innerHTML = createKeyboard();
$popup_correct.hide();
$popup_fail.hide();
$popup.hide();
hangPic.src = `images/door-0${errorCount+1}.png`;
hangPic.alt = `door-0${errorCount+1}`;

//grab json Object for words in hangman
fetch(jsonAnswers)
        .then(function(response){
            if(response.ok){
                return response.json();
            }else{
                console.log("Network error: fetch failed");
            }  
        })
        .then(function(data){//creates the intial data used for the first turn
            arrayOfNames = data.map(value => value.word);
            arrayOfHints = data.map(value => value.hint);

            //create random number based on arrays
            randomNum       = parseInt(Math.random()*arrayOfNames.length);
            randomscpgood   = parseInt(Math.random()*goodscpArrayName.length);
            randomscpbad    = parseInt(Math.random()*badscpArrayName.length);

            //use the values to create word object
            word = new Word(arrayOfNames[randomNum],arrayOfHints[randomNum]);

            hangman.innerHTML = word.displayNew();
            hint.innerHTML    = word.displayHint();
        })
        .catch(function(error){
            hangman.innerHTML = `<p>${error}. Please try again.</p>`;
        });
    

//Create events based on whether using keyboard or screen keyboard
document.addEventListener("keypress", key);
$(document).on('click', "button[class='keyboard_keys']", key);

function key(event){ //finds event type and reacts to values/events accordingly
    let isThere = false;
    let repeat  = false;
    let value;
    if(event.type === "click"){
        value = this.value.toUpperCase();
    }else{
        value = event.key.toUpperCase();
    }

    for(let j = 0 ; j<currentWord.length; j++){
        if(value == actualWord[j].toUpperCase()){
            currentWord[j] = value;
            isThere = true;
        }
        $(`button[id="key_${value}"]`).prop("disabled",true); //disable buttons so it can't be reused and to signify it has been used
    }

    if(userAnswers.length > 0){
        for(let k = 0; k < userAnswers.length; k++){
            if(value == userAnswers[k].toUpperCase()){
                repeat = true;
            }
        }
    }

    if(isThere == false && repeat == false){
        errorCount++;
    }else{
        hangman.innerHTML = word.displayCurrent();
    }

    userAnswers.push(value);
    changeImage(errorCount);
    checkWord();
}


$popup_restart.click(function(){
    restart();
});

class Word{ //custom object
    constructor(word, hint){
        this.word = word;
        this.hint = hint;

        this.wordSize = this.word.length;
        actualWord = word.split("");
    }

    getWord(){
        return this.word;
    }

    displayNew(){ //creates and shows the beginning of the hangman
        let boxes = `<p>`;
        for(let i = 0; i < this.wordSize;i++){
            currentWord.push('_');
            boxes += `_ `;
        }
        boxes += `</p>`;
        return boxes;
    }

    displayHint(){
        return `<p>Hint: ${this.hint}</p>`
    }
    displayCurrent(){ //displays up to date answer
        let html = `<p>`;
        for(let i = 0; i < this.wordSize; i++){
            html += `${currentWord[i]} `;
        }
        html += `</p>`;
        return html;
    }

}

function createKeyboard(){
    let html = ``;
    for(let i = 0; i < keys.length; i++){
        html += `<button id="key_${keys[i]}" value="${keys[i]}" class="keyboard_keys">${keys[i]}</button>`;
    }
    return html;
}

function changeImage(count){
    if(count >= 6){
        $popup.show(); //activates the screen so screen buttons can't be pressed
        $popup_fail.fadeIn(delay); //fades the fail popup in

        document.removeEventListener("keypress", key); //deactivates keyboard presses

        count++;
        hangPic.src     = `images/door-0${count}.png`;
        hangPic.alt     = `door-0${count}`;
        doorAnimation   = requestAnimationFrame(animateEnd);
    }else{
        hangPic.src = `images/door-0${count+1}.png`;
        hangPic.alt = `door-0${count+1}`;
    }  
}

function checkWord(){ //recognizes if its solved
    let isFinish = true;
    for(let i = 0; i < currentWord.length; i++){
        if(currentWord[i] == `_`){
            isFinish = false;
        }
    }
    console.log(`Finished? ${isFinish}`);
    console.log(`Passed? ${passed}`);
    if(isFinish){
        doorAnimation = requestAnimationFrame(animateEnd);
        document.removeEventListener("keypress", key); //deactivates keyboard

        passed = true;

        $popup.show(); //activates screent to prevent use of screen keyboard
        $popup_correct.fadeIn(delay); //fadesin correct popup
    }
}

function animateEnd(){
    let src = ``;
    let door = ``;
    let popup_html= ``;
    if(passed){
        src         = `${goodscpArrayName[randomscpgood]}`;
        popup_html  = `<p><a href="${goodscpArrayLink[randomscpgood]}" target="_blank">${goodscpArrayName[randomscpgood].toUpperCase()}</a> 
        | ${goodscpArrayDescription[randomscpgood]}</p>`;
    }else{
        src         = `bad-${badscpArrayName[randomscpbad]}`;
        popup_html  = `<p>The word was: ${word.getWord()}</p>
                        <p><a href="${badscpArrayLink[randomscpbad]}" target="_blank">${badscpArrayName[randomscpbad].toUpperCase()}</a> 
                        | ${badscpArrayDescription[randomscpbad]}</p>`;
        door        = `-bad`;
    }

    $popup_text.html(popup_html);

    if(knockCount > 1){
        hangPic.src = `images/door-open${door}.png`;
        hangPic.alt = `door-open${door}`;
        if(knockCount > 2){
            hangPic.src = `images/door-open-${src}.png`
            hangPic.alt = `door-open-${src}`;
        }
    }else{
        hangPic.src = `images/door-0${errorCount+1}-knock${knockCount+1}.png`;
        hangPic.alt = `door-0${errorCount+1}-knock${knockCount  +1}`;
    }
    knockCount++;
    doorAnimationInterval = setTimeout(function(){
        doorAnimation = requestAnimationFrame(animateEnd);
    },animationDelay);
}

function restart(){
    //stop the animation
    cancelAnimationFrame(doorAnimation);
    clearTimeout(doorAnimationInterval);

    //reset values
    passed      = false;
    knockCount  = 0;
    errorCount  = 0;
    userAnswers = []; 
    currentWord = []; 
    actualWord  = [];
    hangPic.src = `images/door-0${errorCount+1}.png`;
    hangPic.alt = `door-0${errorCount+1}`;
    $popup_correct.hide();
    $popup_fail.hide();
    $popup.hide();

    //reactivate everything
    document.addEventListener("keypress", key);
    $(`button[class="keyboard_keys"]`).prop("disabled",false);
    
    //choose new values
    randomNum       = parseInt(Math.random()*arrayOfNames.length);
    randomscpgood   = parseInt(Math.random()*goodscpArrayName.length);
    randomscpbad    = parseInt(Math.random()*badscpArrayName.length);

    //create new value object
    word = new Word(arrayOfNames[randomNum],arrayOfHints[randomNum]);
    
    //display new value word and hint
    hangman.innerHTML = word.displayNew();
    hint.innerHTML    = word.displayHint();

}

