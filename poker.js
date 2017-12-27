const poker = require("./cards.js");
const readlineSync = require("readline-sync");
const fs = require("fs");

// reads in the test file passed in from the commandline
function getConfig() {
  const configFile = process.argv[2];
  return configFile;
}

//  passed in as a callback in main function - calls configFilePoker with data parsed from test file
function parseFile(err, data) {
  if (err) {
    console.log(`problem parsing`, err);
  }
  configFilePoker(data);
}

// determines whether regular Poker or Configuration poker is called
// [0]node [1]poker.js [2]test.txt
function main() {
  const config = getConfig();
  if (config === undefined) {
    // if no [2] is found, then run interactive poker
    playPoker();
  } else {
    // else call parseFile and pass
    fs.readFile(config, "utf8", parseFile);
  }
}

main();

function configFilePoker(parsedData) {
  // if there is a third argument passed into terminal then run
  // [0]node [1]poker.js [2]test.txt
  if (process.argv[2]) {
    // split each line in txt file
    const splitByLine = parsedData.split("\n");

    // get the line with the number of players
    const numPlayers = splitByLine[2];
    // console.log('main', numPlayers);

    // get the players and their hands
    const playerHands = splitByLine.slice(3, splitByLine.length - 3);

    // lines trimmed and any possible blank elements filtered out
    const trimLines = trimHands(playerHands);

    // gets players and their ranks
    const calculatedHand = evaluateHands(trimLines, numPlayers);

    // if calulateHand is returned not null or undefined
    if (calculatedHand) {
      const winner = getWinner(calculatedHand);

      // print winner to stdout
      console.log(winner);
    }
  }
}

function trimHands(arrayOfHands) {
  const copyOfHand = arrayOfHands;

  // filter out any blank elements in array
  const removeBlanks = copyOfHand.filter(v => v.length > 0);
  const trimLines = [];

  // trimes spaces at the beginning and end
  removeBlanks.forEach(function(hand) {
    return trimLines.push(hand.trim());
  });

  return trimLines;
}

// this function will evaluate the score of each player's hand
function evaluateHands(arrayOfHands, numPlayers) {
  const calculateHand = [];
  const copyOfHand = arrayOfHands;
  const copyOfPlayers = numPlayers;

  // check that there are the same number of players as there are hands
  if (copyOfHand.length != copyOfPlayers) {
    console.error(
      `Number of players defined does not equal number of Hands given. Game terminated.\n`
    );
    return;
  }

  // for each player calculate their hand's score
  for (let i = 0; i < copyOfPlayers; i++) {
    // split each 'hand' or row by space
    const splitBySpace = copyOfHand[i].split(" ");

    // check that the hand is valid i.e. has 3 valid cards
    if (poker.isValidHand(splitBySpace.slice(1))) {
      // push the player and their score as an array into an array of all calculated hands
      calculateHand.push([
        splitBySpace[0],
        poker.evalRank(splitBySpace.slice(1))
      ]);
    } else {
      // if a player has an invalid hand, return - game terminates
      console.error(
        `\nPlayer ${i} has an invalid hand. The game has been terminated.\n`
      );
      return;
    }
  }

  return calculateHand;
}

// get the winner!
function getWinner(arrayOfHands) {
  // sort players from highest score to lowest
  const sortTheRanks = arrayOfHands.sort(poker.compareRanks);

  // scores will be keys and values will be arrays [player, score] with that score
  const tallyScores = {};

  sortTheRanks.forEach(function(eachPlayer) {
    // if that score is already in the object, then push this player array into the values array
    if (eachPlayer[1] in tallyScores) {
      tallyScores[eachPlayer[1]].push(eachPlayer);
    } else {
      // else create a new key and set its value to the player array
      tallyScores[eachPlayer[1]] = [eachPlayer];
    }
  });

  // if the key has more than one value associate with it, there is a tie, return all players with that score
  if (tallyScores[sortTheRanks[0][1]].length > 1) {
    let stringOfWinners = ``;
    for (let j = 0; j < tallyScores[sortTheRanks[0][1]].length; i++) {
      stringOfWinners += `${sortTheRanks[j][0]} `;
    }

    return `${stringOfWinners} `;
  } else {
    // else return the single winner
    return `${sortTheRanks[0][0]}`;
  }
}

/*======================================================

        Code for interactive game play

======================================================*/

// funtion called at the very end of interactive gameplay
function playAgain() {
  const prompt = readlineSync.question(
    `\nWould you like to play again? (y/n)\n`
  );

  // if 'y' called playPoker() and restart the game
  if (prompt === "y") {
    playPoker();
  } else if (prompt === "n") {
    // end game with message if 'n'
    console.log(`Thank you for playing! Hope you didn't lose any money.`);
  } else {
    // if neither 'y' or 'n' call prompt again
    console.log(`Please enter 'y' or 'n'`);
    playAgain();
  }
}

// returns an array of players without hands
function generateNames() {
  // numPlayers must be between 2 and 15 inclusive
  const numPlayers = readlineSync.question(
    `How many players are in the game?\n`,
    { limit: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
  );
  const players = [];

  // generate the names of new players, if nothing is entered they are player 'i'
  for (let i = 1; i <= numPlayers; ++i) {
    const newPlayer = readlineSync.question(
      `What is the name of player ${i}?\n`
    );

    // if no name is given then player is named player 'i' by default
    if (newPlayer) {
      players.push(newPlayer);
    } else {
      players.push(i);
    }
  }

  // return the array of players
  return players;
}

/* Fisher-Yates shuffling algorithm that generates unbiased permutations */
function shuffle(deck) {
  let i = 0,
    j = 0,
    temp = null,
    deckCopy = deck;

  // Runtime: O(N)
  for (i = deckCopy.length - 1; i > 0; i -= 1) {
    // cards are swaped at random indexes
    j = Math.floor(Math.random() * (i + 1));
    temp = deckCopy[i];
    deckCopy[i] = deckCopy[j];
    deckCopy[j] = temp;
  }

  // return a shuffled deck
  return deckCopy;
}

// takes in shuffled deck and an array of players and generates a hand for each player
function dealHand(deckOfCards, arrayOfPlayers) {
  const deckCopy = deckOfCards;
  const playersCopy = arrayOfPlayers;

  // keeps track of which cards have already been distributed
  let deckIndex = 0;

  const populatedHands = playersCopy.map(function(each) {
    // each player receives a hand of 3 cards
    const letsPopulate = [each, []];
    for (let i = deckIndex; i < deckIndex + 3; ++i) {
      letsPopulate[1].push(deckCopy[i]);
    }

    // increment deck index by 3 for the cards that have just been distributed
    deckIndex += 3;
    return letsPopulate;
  });

  return populatedHands;
}

// function that "plays" interactive poker!
function playPoker() {
  const start = readlineSync.question(`\n3 Card Poker - Hit enter to start\n`);
  let run = true;
  while (run) {
    const ourPlayers = generateNames();
    const gameDeck = shuffle(poker.generateCards());
    const ourPlayersHaveCardsNow = dealHand(gameDeck, ourPlayers);
    console.log(`Players Hands:\n`, ourPlayersHaveCardsNow);
    const winner = getWinner(ourPlayersHaveCardsNow);
    console.log(`\n${winner}\n`);
    run = false;
  }

  // call play again to determine whether program should terminate or restart
  playAgain();
}
