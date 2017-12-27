const PokerEvaluator = require("poker-evaluator");

/* Global objects for easy access in multiple functions*/
const validRank = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A"
];
const validSuit = ["c", "s", "d", "h"];


// Function returns the rank of a hand of cards
function evalRank(hand) {
  return PokerEvaluator.evalHand(hand).handRank;
}

// checks that array is appropriate size and that each card is valid
function isValidHand(arrayOfCards) {
  const copyOfHand = arrayOfCards;
  let validFlag = false;

  if (copyOfHand && copyOfHand.length === 3) {
    const validCards = copyOfHand.filter(function(card) {
      return isValidCard(card);
    });

    // if filtered array still contains 3 elements then flip flag to true
    if (validCards.length === 3) {
      validFlag = true;
    }
  }
  return validFlag;
}

// helper function for isValidHand, evaluates that each card has a valid rank and suit
function isValidCard(card) {
  // boolean flag set to false by default
  let validFlag = false;
  const cardCopy = card;

  // if card copy is not null or undefined
  if (cardCopy) {
    const thisCard = cardCopy.split("");

    if (
      thisCard.length === 2 &&
      validRank.includes(thisCard[0]) &&
      validSuit.includes(thisCard[1])
    ) {
      // flips flag if card is valid
      validFlag = true;
    }
  }

  return validFlag;
}

// sorts hands from best to worst
function compareRanks(a, b) {
  if (a[1] > b[1]) return -1;
  if (a[1] < b[1]) return 1;
  return 0;
}


// generates a deck of cards from arrays of valid suits and rank
function generateCards() {
  const allCards = [];
  validSuit.forEach(function(suit) {
    validRank.forEach(function(face) {
      allCards.push(`${face}${suit}`);
    });
  });

  // return an array of 52 cards
  return allCards;
}


module.exports = {
  evalRank: evalRank,
  compareRanks: compareRanks,
  generateCards: generateCards,
  isValidHand: isValidHand
};
