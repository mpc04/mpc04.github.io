const API_ENDPOINT = 'https://trivia.cyberwisp.com/getrandomchristmasquestion'

const newQuoteButton = document.querySelector('#js-new-quote');

function displayQuote(quote){
    const quoteTextElement = document.querySelector('#js-quote-text');

    if(quote && quote.question) {
        quoteTextElement.textContent = quote.question;
    } else{
        quoteTextElement.textContent = "Could not retrieve a valid question.";
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

        displayQuote(quote);

    } catch (error) {
        console.error("Fetch failed:", error);

        alert(`Failed to fetch quote. Check console for details. Error: ${error.message}`);
    }
}

newQuoteButton.addEventListener('click', getQuote);

getQuote();