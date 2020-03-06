import {setRoom} from "./actions/setRoom";
import {setUsername} from "./actions/setUsername";
import {setGames} from "./actions/setGames";
import {updateGame} from "./actions/updateGame";
import {setPlayersGames} from "./actions/setPlayersGames";
import {setPieces} from "./actions/setPieces";
import {setPlayer} from "./actions/setPlayer";


const socketsClient = (socket, dispatch) => {
  // window.addEventListener('keydown', keyDown);

  // socket.on('setRoom', (data) => {
  //   if (data.status === 'NEW_ROOM') {
  //     dispatch(addRoom(data.room));
  //   } else if (data.status === 'JOIN_ROOM') {
  //     dispatch(joinRoom(data.room));
  //   }
  //
  //   location.hash = data.room.room + '/' + data.room.master;
  // });

  // socket.on('setRoom', (data) => {
  //   dispatch(setRoom(data.player, data.room, data.games));
  //   location.hash = data.room + '[' + data.player.name + ']';
  // });
  //
  // socket.on('setUsername', (data) => {
  //   dispatch(setUsername(data.username));
  //   socket.emit('getGames');
  // });

  socket.on('setGames', (data) => {
    if (data.status) {
      dispatch(setGames(data.games));
    }
  });

  socket.on('updateGames', (data) => {
    console.log('updateGames');
    dispatch(updateGame(data));
  });

  socket.on('setPlayersGames', (data) => {
    dispatch(setPlayersGames(data));
  });

  socket.on('setPieces', (data) => {
    dispatch(setPieces(data));
  });

  socket.on('setGame', (data) => {
    location.hash = data.game.room + '[' + data.player.name + ']';
    dispatch(setPlayer(data.player, data.game.room));
    console.log(data);
  });
};

export default socketsClient;
