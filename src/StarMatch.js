import React, { useState, useEffect } from 'react';
import './StarMatch.css';

const utils = {
  // Sum an array
  sum: arr => arr.reduce((acc, curr) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr, max) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};


// STAR MATCH - Starting Template

const PlayNumber = props => (
  <button 
    className="number"
    style={{backgroundColor: colors[props.status]}}
    onClick={() => props.onClick(props.number, props.status)}
    disabled={props.gameStatus !== 'active'}
  >
    {props.number}
  </button>
);

const StarsDisplay = props => (
  <>
    { utils.range(1, props.count).map(starId =>
      <div key={starId} className="star" /> ) }
  </>
);

const PlayAgain = props => (
  <div className="game-done">
    <div 
      className="message"
      style={{color: props.gameStatus === 'won' ? 'lightgreen' : 'red' }}
    >
      {props.gameStatus === 'lost' ? 'game over' : 'nice'}
    </div>
    <button onClick={props.onClick}>Play Again</button>
  </div>
);


const useGameState = () => {
  const [stars, setStars] = useState(utils.random(1, 9));
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9));
  const [candidateNums, setCandidateNums] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) { 
      const timerId = setTimeout(() => setSecondsLeft(secondsLeft-1), 1000);
      return () => clearTimeout(timerId);
    }
    
  });

  const setGameState = (newCandidtateNums) => {
    if (utils.sum(newCandidtateNums) !== stars) {
      setCandidateNums(newCandidtateNums);
    } else {
      const newAvailableNums = availableNums.filter(
        n => !newCandidtateNums.includes(n)
      );
      setStars(utils.randomSumIn(newAvailableNums, 9));
      setAvailableNums(newAvailableNums);
      setCandidateNums([]);
    }
  }

  return { stars, candidateNums, availableNums, secondsLeft, setGameState }
}

const Game = props => {
  const { 
    stars,
    candidateNums, 
    availableNums,
    secondsLeft,
    setGameState
  } = useGameState();

  const candidatesAreWrong = utils.sum(candidateNums) > stars;

  const gameStatus = availableNums.length === 0
  ? 'won' 
  : secondsLeft === 0 ? 'lost' : 'active';

  const onNumberClick = (number, currentStatus) => {
    if (currentStatus === 'used') {
      return;
    }
    
    // candidate nums
    const newCandidtateNums =
      currentStatus === 'available' 
        ? candidateNums.concat(number)
        : candidateNums.filter(n => n !== number);

    setGameState(newCandidtateNums);
  }

  const numberStatus = number => {
    if (!availableNums.includes(number)) {
      return 'used';
    }
    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? 'wrong' : 'candidate'; 
    }
    return 'available';
  }


  return (
    <div className="game">
      <div className="help">
        Pick 1 or more numbers that sum to the number of stars
      </div>

      <div className="body">
        <div className="left">
          { gameStatus !== 'active' ? ( 
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus}/>          
          ) : (
            <StarsDisplay count={stars} />
          )} 
        </div>

        <div className="right">
          { utils.range(1 ,9).map(number =>
              <PlayNumber 
                key={number}
                status={numberStatus(number)} 
                number={number}
                onClick={onNumberClick} 
                gameStatus={gameStatus}
              />
          )}
        </div>
      </div>
          <div className="timer">Time Remaining: {secondsLeft}</div>
    </div>
  );
};

const StarMatch = () => {
  const [gameId, setGameId] = useState(1);
  return <Game key={gameId} startNewGame={() => setGameId(gameId + 1)}/>;
}

// Color Theme
const colors = {
  available: 'lightgray',
  used: 'lightgreen',
  wrong: 'lightcoral',
  candidate: 'deepskyblue',
};

export default StarMatch;