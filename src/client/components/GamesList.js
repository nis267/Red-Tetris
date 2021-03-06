import React from 'react';

const GamesList = ({socket, playersGames}) => {
  const joinGame = ((room) => {
    socket.emit('getRoom', {room: room});
  });
  return (
    <div className={'gameListContainer'}>
      {Object.keys(playersGames).map((game, index) => {
        return (
          <div key={index} className={'game'} onClick={() => joinGame(game)}>
            <h1 key={index}>{game}</h1>
            <div>
              {playersGames[game].map((player, index) => {
                return (<p key={index}>{player}</p> );
              })}
            </div>
          </div>
        )
      })}
    </div>
    );
};

export default GamesList;
