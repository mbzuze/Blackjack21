// inital game data dictionary
let blackjackDictionary = {
    
    // dealer instance for the game
    dealer : {
        scoreSpan : '#dealer-blackjack-score',
        resultSpan : '#dealer-blackjack-result',
        div: '#dealer-box',
        boxSize: '.flex-players-row div',
        score: 0,
        aceCount: 0,
    },

    // deck of cards
    deck: ['S-2','S-3','S-4','S-5','S-6','S-7','S-8','S-9','S-10','S-J','S-Q','S-K','S-A','D-2','D-3','D-4','D-5','D-6','D-7','D-8','D-9','D-10','D-J','D-Q','D-K','D-A','H-2','H-3','H-4','H-5','H-6','H-7','H-8','H-9','H-10','H-J','H-Q','H-K','H-A','C-2','C-3','C-4','C-5','C-6','C-7','C-8','C-9','C-10','C-J','C-Q','C-K','C-A'],

    // value map for deck of cards
    deckMap : {'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':10,'Q':10,'K':10,'A':[1,11]},

    isStand: false,
    isTurnsOver: false,
    pressOnce: false
};

// assign dealer instance to global variable
const DEALER = blackjackDictionary['dealer'];

// initialize width and height variables
let windowWidth = window.screen.width;
let windowHeight = window.screen.height;

// initialize winner variable to store the winner(s) of the game
let winner;
// initialize players counter variable to keep track of number of players in the game
let players = 0;

// add click event listeners to already defined menu bar options
document.querySelector('#stand').addEventListener('click', blackjackStand);
document.querySelector('#deal').addEventListener('click', blackjackDeal);
document.querySelector('#add').addEventListener('click', addPlayer);
document.querySelector('#dealer-search-deck').addEventListener('click', populateWithDeck);
document.querySelector('#dealer-hit').addEventListener('click', blackjackHit);
document.querySelector('#toggle').addEventListener('click', myToggleFunction);



//function to Toggle between Manual or Automatic card selection 
function myToggleFunction() {
    // point to toogle button reference
    let toggle = document.getElementById("toggle");
    
    // evaluate selected toggle function
    if (toggle.innerHTML === "Manual Hit Mode") {
        toggle.innerHTML = "Automatic Hit Mode";

        // hide card selection dropdowns if mode is automatic for all players and dealer
        for (let i = 0; i < players; i++) { //loop through all created players
            let playerHiddenSelects = document.getElementById('player'+ (i+1) + '-search-deck');
            playerHiddenSelects.style.display = 'none';
        }
        let dealerHiddenSelects = document.getElementById('dealer-search-deck');
        dealerHiddenSelects.style.display = 'none';

    } else {
        toggle.innerHTML = "Manual Hit Mode";
        
        // show card selection dropdowns if mode is manual for players and dealer
        for (let i = 0; i < players; i++) {//loop through all created players
            let playerHiddenSelects = document.getElementById('player'+ (i+1) + '-search-deck');
            playerHiddenSelects.style.display = '';
        }
        let dealerHiddenSelects = document.getElementById('dealer-search-deck');
        dealerHiddenSelects.style.display = '';
    }
}

// function to populate the select buttons with the card deck
function populateWithDeck() {
    // get and assign the id on the select button that was clicked on
    let id = this.id;

    // remove listener on clicked select button to prevent funtion from running again
    document.querySelector('#'+ id).removeEventListener('click', populateWithDeck);

    // initialise empty options variable
    let deckOptions = null;
    // delete all prior options that were appended to the select dropdown list
    this.innerHTML = '';

    // loop through the deck
    for(i = 0; i < blackjackDictionary['deck'].length; i++) { 

        // create an option instance
        deckOptions = document.createElement('option');

        // create a string array from the deck by splitting the suit type and suit card number
        const cardDetails = blackjackDictionary['deck'][i].split('-');

        // initialize empty variables for the suit type and card number
        let suit; 
        let number; 

        // loop through the first 'suite type' array and assign corresponding suit
        switch(cardDetails[0]) {
            case 'S':
              suit = ' of Spades';
              break;
            case 'D':
                suit = ' of Diamonds';
              break;
            case 'H':
                suit = ' of Hearts';
              break;
            case 'C':
                suit = ' of Clubs';
              break;
            default:
              break;
        }

        // loop through the second 'card number' array and assign corresponding text
        switch(cardDetails[1]) {
        case 'A':
            number = 'Ace';
            break;
        case '2':
            number = 'Two';
            break;
        case '3':
            number = 'Three';
            break;
        case '4':
            number = 'Four';
            break;
        case '5':
            number = 'Five';
            break;
        case '6':
            number = 'Six';
            break;
        case '7':
            number = 'Seven';
            break;
        case '8':
            number = 'Eight';
            break;
        case '9':
            number = 'Nine';
            break;
        case '10':
            number = 'Ten';
            break;
        case 'J':
            number = 'Jack';
            break;
        case 'Q':
            number = 'Queen';
            break;
        case 'K':
            number = 'King';
            break;
        default:
            break;
        }

        // assign values to the created option instance and then append to select button
        deckOptions.id = blackjackDictionary['deck'][i];
        deckOptions.value = blackjackDictionary['deckMap'][cardDetails[1]];
        deckOptions.innerHTML = number + suit;
        this.appendChild(deckOptions);
    }
}

// function to respond to a player/dealer 'Hit' operation 
function blackjackHit(){
    // get the id of the current player and pull their name from the variable
    let id = this.id;
    let playerName = id.substr(0, id.indexOf('-'));

    // select toggle option reference and assign to variable
    let toggle = document.getElementById("toggle");
    
    // initialize card variable
    let card; 
    
    // evaluate if someone has not pressed the stand button
    if (blackjackDictionary['isStand'] === false) {
        // return card value using functions depending on whether it's automatic or manual card selection
        if (toggle.innerHTML === "Manual Hit Mode") {
            card = selectedCard(playerName); //manual card selection
        }else{
            card = randomCard(); //randomly generated card selection
        }
        // evaluate if anything was sent back
        if (card) {
            // pass selected card to function to display selected card, update the user hand score, and display the score to the user
            showCard(card, blackjackDictionary[playerName]); 
            updateScore(card, blackjackDictionary[playerName]);
            showScore(playerName, blackjackDictionary[playerName]);

            // pass selected card to update deck with remaining cards
            updateDeck(card);
        }
    }
}

//function to remove the selected cards from the deck
function updateDeck(card){
    const index = blackjackDictionary.deck.indexOf(card); //get the index of selected card
    if (index > -1) { // only splice array when card is found
        blackjackDictionary.deck.splice(index, 1); // 2nd parameter means remove one item only for the single card to remove from deck
    }
    //reload all the select elements with the new available cards
    reloadAvailableCards();
}

// function to reload the card deck in the select elements after one has been selected (removed) by a player
function reloadAvailableCards() {
    // loop through all the players and repopulate their select elements with the cards remaining in deck
    for (let i = 0; i < players; i++) {
        let playerHiddenSelects = document.getElementById('player'+ (i+1) + '-search-deck');
        playerHiddenSelects.innerHTML = '';

        //re-add the click event listener to the select element
        document.querySelector('#'+'player'+ (i+1) + '-search-deck').addEventListener('click', populateWithDeck);
    }
    // repopulate dealer select element with the cards remaining in deck
    let dealerHiddenSelects = document.getElementById('dealer-search-deck');
    dealerHiddenSelects.innerHTML = '';

    //re-add the click event listener to the select element
    document.querySelector('#dealer-search-deck').addEventListener('click', populateWithDeck);
}

// function to return current player selected card from the select element
function selectedCard(playerName) {
    let hiddenSelect = document.getElementById(playerName + '-search-deck'); //get select element reference
    
    if (hiddenSelect.options.length == 0) {
        // display error message in no value is selec
        document.getElementById('error').innerHTML = "Please select a card pair from the dropdown list"; 
    }
    else{
        document.getElementById('error').innerHTML = '';
        let selectedValue = hiddenSelect.options[hiddenSelect.selectedIndex].id; //get card value from the id tag since it is stored there
        return selectedValue; //return selected card value
    }
}

// funtion to generate and return a random card selection from the deck of available cards
function randomCard() {
    let randomIndex = Math.floor(Math.random() * 52);//pick a random number from 0 - 51 (52 cards in a deck)
    return blackjackDictionary['deck'][randomIndex]; //return card from random selection
}

// function to populate the screen with the selected card for the respective player or dealer
function showCard(card, activePlayer) {
    // create a card image and populate it with the player/dealer selected card
    let cardImage = document.createElement('img');
    cardImage.src = `images/${card}.png`; 
    cardImage.style = `width: ${widthSize()}; height:${heightSize()};`; // restrict card images to function defined constraints (dynamic sizing)
    // appand created card image to the player box container for display
    document.querySelector(activePlayer["div"]).appendChild(cardImage); 
}

// funtions to return width size depending on screen size and set percentages
function widthSize(){
    if (windowHeight > 1000) {
        return window.screen.width * 0.05;
    } else {
        return window.screen.width * 0.08;
    }
}

// funtions to return height size depending on screen size and set percentages
function heightSize(){
    if (windowWidth > 700) {
        return window.screen.height * 0.18;
    } else {
        return window.screen.wheightidth * 0.15;
    }
}

// function to update to current score of the player/dealer after card selection
function updateScore(card, activePlayer) {
    
    //get the card number only
    card = card.substr(2);

    // evaluate for Ace cards
    if (card === 'A') {
        // conditional statement to decide on which value to use for the Ace cards
        if (activePlayer['score'] + blackjackDictionary['deckMap'][card][1] <= 21) {
            activePlayer['aceCount'] +=1; //increment Aces used for user
            activePlayer['score'] += blackjackDictionary['deckMap'][card][1]; //update player/dealer score with selected card
        }else{
            activePlayer['score'] += blackjackDictionary['deckMap'][card][0]; //update player/dealer score with selected card
        }
    } else {
        activePlayer['score'] += blackjackDictionary['deckMap'][card];
        // loop through player/dealer Ace cards and change them to the value of '1' if total score passed 21
        while (activePlayer['score'] > 21 && activePlayer['aceCount'] > 0) {
            activePlayer['aceCount'] -= 1; //decrement ace count for player/dealer
            activePlayer['score'] -= 10; //remove ace value from score
        }
    }
}

// function to display current player/dealer score to the screen
function showScore(playerName, activePlayer) {
   
    // select display score reference and assign it to the active player's current score, and set score color to green
    document.querySelector(activePlayer['scoreSpan']).textContent = activePlayer['score'];
    document.querySelector(activePlayer['scoreSpan']).style.color = "green";

    // select current player/dealer image reference and count number of images they have
    let cardCount = document.querySelector('#'+ playerName + '-box').querySelectorAll('img').length;

    //evaluate score for different rules
    if (activePlayer['score'] > 21) {
        // display 'loses' texts and color it red
        document.querySelector(activePlayer['resultSpan']).textContent = "Loses";
        document.querySelector(activePlayer['resultSpan']).style.color = "red";
        document.querySelector(activePlayer['scoreSpan']).style.color = "red";

        // remove click listener on the hit button if the player/dealer passes 21 to prevent them from adding more cards
        document.querySelector('#' + playerName + '-hit').removeEventListener('click', blackjackHit); 

    } else if (activePlayer['score'] === 21) {
        
        // evaluate user results and show corresponsing text for results
        computeWinner(playerName);
        showWinner(activePlayer);

        // remove click listener on the hit button if the player/dealer has the score of 21 to prevent them from adding more cards
        document.querySelector('#' + playerName + '-hit').removeEventListener('click', blackjackHit);
    } else if (activePlayer['score'] <= 21 && cardCount === 5) {

        // evaluate user results and show corresponsing text for results
        computeWinner(playerName);
        showWinner(activePlayer);

        // remove click listener on the hit button if the player/dealer has 5 card and score is less than 21 to prevent them from adding more cards
        document.querySelector('#' + playerName + '-hit').removeEventListener('click', blackjackHit);
    }
}

// function to evaluate results when the 'Stand' button is clicked
function blackjackStand() {
    // set a flag for number of cards each player has
    let playerCardsNotEnough = false;

    // loop through all players, as well as the cards they all have and make sure they all have drawn at least 2 cards
    for (let i = 0; i < players; i++) {
        if (document.querySelector('#player'+ players + '-box').querySelectorAll('img').length < 2) {
            playerCardsNotEnough = true; //set fleg true if player has less than two cards
        }
    }
    
    // counter to check how many cards the dealer has
    let dealerCards = document.querySelector('#dealer-box').querySelectorAll('img').length

    // evaluate if flag is not triggered and there is at least one player in the game
    if (playerCardsNotEnough === false && players > 0 && dealerCards > 1) {
        // loop through available players
        for (let i = 0; i < players; i++) {
            // evaluate if the 'Stand' button hasn't been pressed yet
            if (blackjackDictionary.pressOnce === false) {
                blackjackDictionary['isStand'] = true; //indicate that the 'Stand' button has been clicked 
                
                blackjackDictionary['isTurnsOver'] = true; //indicate that there's no more playing to be done, every player's turn is over

                //generate player name from counter and get details of the active player from the dictionary
                let playerName = 'player'+(i+1);
                let activePlayer = blackjackDictionary[playerName];

                // evaluate user results and show corresponsing text for results
                computeWinner(playerName);
                showWinner(activePlayer);
            } 
        }
        blackjackDictionary.pressOnce = true; //indicate that the 'Stand' button has been clicked and restricts it to only be pressed once
    }else{
        // initialize error variable
        let errorMessage = '';
        if (players === 0) {
            // display error message if there's not enough players
            errorMessage += "There should be at least one player before clicking Stand. \n"; 
        }
        if (playerCardsNotEnough == true) {
            // display error message if there's not enough players
            errorMessage += "All players should have at least two cards before clicking Stand. \n"; 
        }
         if (dealerCards < 2) {
            // display error message if there's not enough players
            errorMessage += "Dealer should have at least two cards before clicking Stand. \n"; 
        }
        // error message reference; Assign errors and red color and display to user
        let errorDisplay = document.getElementById('error');
        errorDisplay.innerHTML = errorMessage;
        errorDisplay.style.color = '#ff0000';
    }
}

// function to evaluate the winners against the dealer
function computeWinner(playerName) {
    
    // collect all image tags and count them for a representation of number of cards they have
    let cardCount = document.querySelector('#'+ playerName + '-box').querySelectorAll('img').length;
    
    // initialize active player from given 'playerName' variable
    let activePlayer = blackjackDictionary[playerName];

    // evaluate the rules to determine the winner
    if (activePlayer['score'] <= 21) {
        // rules for player score less than or equal to 21
        if (activePlayer['score'] === 21) {
            winner = activePlayer;
        }else if (cardCount === 5) { //automatic win
            winner = activePlayer;
        } else if (activePlayer['score'] >= DEALER['score']) {
            winner = activePlayer;
        } else if(activePlayer['score'] < DEALER['score']) {
            winner = DEALER;
        }
    } else if(activePlayer['score'] > 21) {
        winner = DEALER;
    } 
    return winner;
}

// function to show the players who managed to beat the dealer
function showWinner(activePlayer) {
    // initialize message and message color variables
    let message, messageColor;
    
    // assign winning message and green color for a winning player
    if (winner === activePlayer) {
        message = "Beats dealer";
        messageColor = "#00ff00";
    }    
    
    // assign loses message and red color for a losing player
    if (winner === DEALER) {
        message = "Loses";
        messageColor = "#ff0000";
    }

    // assign variables to respective references and display to user screen
    document.querySelector(activePlayer['resultSpan']).textContent = message;
    document.querySelector(activePlayer['resultSpan']).style.color = messageColor;
}

// restart the game with the created players
function blackjackDeal() {
    // loop through the players counter
    for (let i = 1; i <= players; i++) {
        // create player name from counter variable and use it to pull a player instance from the dictionary
        playerName = 'player'+i
        let activePlayer = blackjackDictionary[playerName];

        // add a click listener to each player's 'Hit' button
        document.querySelector('#'+ playerName + '-hit').addEventListener('click', blackjackHit);

        // evaluate if there's no more turns for any player to take
        if (blackjackDictionary['isTurnsOver'] === true) {
            // initialize variables with all players and delears played cards count
            let cardCountPlayer = document.querySelector('#'+ playerName + '-box').querySelectorAll('img');
            let cardCountDealer = document.querySelector('#dealer-box').querySelectorAll('img');

            // remove all images from the dealer/player
            for (let i = 0; i < cardCountPlayer.length; i++) {
                cardCountPlayer[i].remove();
            }
            for (let i = 0; i < cardCountDealer.length; i++) {
                cardCountDealer[i].remove();
            }

            // reset player/dealer score and ace cards count to 0
            activePlayer['score'] = DEALER['score'] = 0;
            activePlayer['aceCount'] = DEALER['aceCount'] = 0;

            // reset player/dealer scores, results and colors on user screen to defaults
            document.querySelector('#'+ playerName + '-blackjack-score').textContent = 0;
            document.querySelector('#dealer-blackjack-score').textContent = 0;
            document.querySelector('#'+ playerName + '-blackjack-result').textContent = '';

            document.querySelector('#dealer-blackjack-score').style.color = '#ff0000';
            document.querySelector('#'+ playerName + '-blackjack-score').style.color = '#ff0000';
            document.querySelector('#'+ playerName + '-blackjack-result').style.color = '#000000';

            // reset card deck to defualt
            blackjackDictionary.deck = ['S-2','S-3','S-4','S-5','S-6','S-7','S-8','S-9','S-10','S-J','S-Q','S-K','S-A','D-2','D-3','D-4','D-5','D-6','D-7','D-8','D-9','D-10','D-J','D-Q','D-K','D-A','H-2','H-3','H-4','H-5','H-6','H-7','H-8','H-9','H-10','H-J','H-Q','H-K','H-A','C-2','C-3','C-4','C-5','C-6','C-7','C-8','C-9','C-10','C-J','C-Q','C-K','C-A']

        }else{
            // error message reference; Assign errors and red color and display to user
            let errorDisplay = document.getElementById('error');
            errorDisplay.innerHTML = 'Players need to playe a full round first before being able to click Deal. ';
            errorDisplay.style.color = '#ff0000';
        }
    }
        // reset flags to default flags
        blackjackDictionary['isStand'] = false;
        blackjackDictionary.pressOnce = false;
        blackjackDictionary['isTurnsOver'] = false;
}

// function to add a new player
function addPlayer() {
    // get the player name from an entered text field from the user
    let playerName = document.getElementById("player-name").value;

    // increment the player counter by one
    players += 1;

    // create text variable with player counter for each specific player
    let newPlayer = 'player'+ players;

    // assign system created name if no name entered in the Player Name field
    if (playerName == '') {
        playerName = newPlayer;
    }
    
    // get manual or automatic toggle reference
    let toggle = document.getElementById("toggle");

    // add a new player initialization to the dictionary with default values
    blackjackDictionary[newPlayer] = {
        scoreSpan : '#'+ newPlayer +'-blackjack-score',
        resultSpan : '#'+ newPlayer +'-blackjack-result',
        div: '#'+ newPlayer +'-box',
        boxSize: '.flex-players-row div',
        score: 0,
        aceCount: 0,
    }

    // create a new user box div container
    let divBox = document.createElement('div');
    divBox.id = newPlayer + '-box';
    let headerTag = document.createElement('h2');
    headerTag.innerHTML = playerName+ ': ';
    // create span tag to display user score
    let spanTag1 = document.createElement('span');
    spanTag1.id = newPlayer + '-blackjack-score';
    spanTag1.innerText = 0;
    // create break element
    let breakTag = document.createElement('br');
    // create span tag to display user result text
    let spanTag2 = document.createElement('span');
    spanTag2.id = newPlayer + '-blackjack-result';

    // create a user box div menu
    let flexBox = document.createElement('div');
    flexBox.className = 'flex-player-menu-row';
    flexBox.id = newPlayer;
    // create user hit button
    let hitBox = document.createElement('div');
    hitBox.className = 'menu-item';
    hitBox.id = newPlayer + '-hit';
    hitBox.innerHTML = 'Hit';

    // create a hidden select
    let hiddenSelect = document.createElement('select');
    hiddenSelect.id = newPlayer + '-search-deck';
    hiddenSelect.className = 'menu-item';
    if (toggle.innerHTML === "Automatic Hit Mode") {
        hiddenSelect.style.display = 'none';
    }
    // append created items to main containers
    flexBox.append(hiddenSelect, hitBox);
    headerTag.append(spanTag1, breakTag, spanTag2);
    divBox.append(headerTag,flexBox);
    document.querySelector('.flex-players-row').appendChild(divBox);

    //reset player name text field to empty
    document.getElementById("player-name").value = "";

    // add click event listeners to user hit button and select element
    document.querySelector('#'+ newPlayer +'-search-deck').addEventListener('click', populateWithDeck);
    document.querySelector('#'+ newPlayer +'-hit').addEventListener('click', blackjackHit);
}
 