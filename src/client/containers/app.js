import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {checkCollision} from "../gameHelpers";
import {setPieces} from "../actions/setPieces";
import {setGameOver} from "../actions/setGameOver";
import {updateTetromino} from "../actions/updateTetromino";
import {usePlayer} from "../Hooks/usePlayer";
import {useBoard} from '../Hooks/useBoard';
import {useInterval} from "../Hooks/useInterval";
import {dropPlayer} from "../actions/dropPlayer";
import {setDelay} from "../actions/setDelay";
import socketsClient from "../socketsClient";
import Login from "../components/Login";
import Board from "../components/Board";
import {setCurRoom} from "../actions/setCurRoom";
import { Ring } from 'react-awesome-spinners';
import PlayersList from "../components/PlayersList";

const App = () => {
  const [socket, player, curUser, curGame, curRoom, delay] = useSelector(store => [store.socket, store.player, store.curUser, store.games, store.curRoom, store.player.delay]);
  const dispatch = useDispatch();
  const [updatePlayerPos, pieceRotate] = usePlayer();
  const [updateStage] = useBoard();

  useEffect(() => {
    socketsClient(socket, dispatch);
  }, []);


  const keyDown = (event) => {
    if (player && !player.gameOver) {
      if (event.keyCode === 32) {
        let tmpPiece = JSON.parse(JSON.stringify(player.piece));
        while (!checkCollision(tmpPiece, player.grid, { x: 0, y: 1 })) {
          tmpPiece.pos.y++;
        }
        updatePlayerPos(tmpPiece.pos.y - player.piece.pos.y, null, true);
        // Mejorar porque actualizo tablero cuando se actualiza la posición, pego la pieza y lo vuelvo a actualizar.
      } else if (event.keyCode === 39) {
        if (!checkCollision(player.piece, player.grid, { x: 1, y: 0 })) {
          updatePlayerPos(null, 1, false);
        }
      } else if (event.keyCode === 37) {
        if (!checkCollision(player.piece, player.grid, { x: -1, y: 0 })) {
          updatePlayerPos(null, -1, false);
        }
      } else if (event.keyCode === 40) {
        if (!checkCollision(player.piece, player.grid, { x: 0, y: 1 })) {
          updatePlayerPos(1, null, false);
        } else {
          if (player.piece.pos.y < 1) {
            console.log('GAME OVER!!!');
            dispatch(setGameOver());
            // setDropTime(null);
          } else {
            updatePlayerPos(null, null, true);
          }
          console.log('collided');
        }
      } else if (event.keyCode === 38) {
        pieceRotate(player.piece, player.grid, 1);
      }
      if (player.pieces.length < 3) {
        socket.emit('getPiece');
      }
    }
  };

  useInterval(() => {
    console.log('test');
    dispatch(dropPlayer());
  }, delay);

  const start = () => {
    socket.emit('start');
    socket.on('startGame', (data) => {
      dispatch(setPieces(data));
      dispatch(updateTetromino());
      dispatch(setDelay(1000));
    });

  };

  const checkUrl = (data) => {
    return new Promise((resolve, reject) => {
      console.log("client sending message");
      socket.emit('checkUrl', data, (response) => {
        console.log("client got ack response", response);
        resolve(response);
      });
    });
  };

  const found = window.location.href.split('/')[3].match(/^#([a-z1-9]+)\[([a-z1-9]+)\]$/);

  console.log("Found: " + found);
  if (!player || !player.grid) {
    console.log("HOME");
    return (
      <div tabIndex={0} onKeyDown={(event) => keyDown(event)}>
        <Login />
      </div>
    )
  }
  else {
    if (curRoom === null) {
      checkUrl({ room: found[1], player: found[2] }).then(message => {
        console.log("response from checkUrl(): ", message);
        dispatch(setCurRoom());
      });
    }
    console.log('curRoom: ', curRoom);
    return (
      <div tabIndex={0} onKeyDown={(event) => keyDown(event)}>
        <div>
          {curRoom ? (
            <div>
              Player {curUser} in {curGame} room.
              <div>
              <Board />
              <PlayersList />
              </div>
              <button onClick={() => start()} >Start</button>
            </div>
          ) : <Ring />
          }
        </div>
      </div>
    );
  }
};

export default App;
