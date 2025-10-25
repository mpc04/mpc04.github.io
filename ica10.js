const API_ENDPOINT = 'https://trivia.cyberwisp.com/getrandomchristmasquestion'

const newQuoteButton = document.querySelector('#js-new-quote');
const answerButton = document.querySelector('#js-tweet');
const answerTextElement = document.querySelector('#js-answer-text');

let currentAnswer = '';

function displayQuote(quote){
    const quoteTextElement = document.querySelector('#js-quote-text');

    if(quote && quote.question) {
        quoteTextElement.textContent = quote.question;
    } else{
        quoteTextElement.textContent = "Could not retrieve a valid question.";
    }
    
}

function displayAnswer(){
    console.log("Answer button clicked.");
    if (currentAnswer){
         answerTextElement.textContent = `Answer: ${currentAnswer}`;
    }else{
        answerTextElement.textContent = "Please generate a question first!";
    }
   
}

async function getQuote(){
    console.log("Button Clicked: Attempting to fetch a new quote");

    try{
        const response = await fetch(API_ENDPOINT);

        if(!response.ok){

            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const quote = await response.json();

        console.log("successfully fetched quote object:", quote);

        currentAnswer = quote.answer;

        displayQuote(quote);

    } catch (error) {
        console.error("Fetch failed:", error);

        alert(`Failed to fetch quote. Check console for details. Error: ${error.message}`);
    }
}

newQuoteButton.addEventListener('click', getQuote);
answerButton.addEventListener('click', displayAnswer);

getQuote();