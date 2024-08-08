import React, { useState, useEffect } from 'react';
import './App.css'; 

const WebSocketExample = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const createWebSocket = () => {
      const socket = new WebSocket('ws://flappy-senai.up.railway.app/leaderboard-ws'); // URL do WebSocket

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.players) {
          setPlayers(data.players);
        } else if (data.playersWithAlteredPositions) {
          setPlayers(prevPlayers => {
            const updatedPlayers = [...prevPlayers];
            data.playersWithAlteredPositions.forEach(updatedPlayer => {
              const index = updatedPlayers.findIndex(player => player.id === updatedPlayer.id);
              if (index !== -1) {
                updatedPlayers[index] = updatedPlayer;
              }
            });
            return updatedPlayers;
          });
        }
      };

      socket.onerror = (error) => {
        console.error('Erro:', error);
      };

      return socket;
    };

    createWebSocket();

  }, []); 

  const sortedPlayers = [...players].sort((a, b) => b.highScore - a.highScore);

  return (
    <div className="container">
      <div className="column" style={{backgroundColor: '#333'}} >
        <h1 style={{textAlign: 'center'}} >Pontuação Flappy-Senai:</h1>
        <ul className="player-list">
          {sortedPlayers.length === 0 ? (
            <li>Nenhum jogador encontrado</li>
          ) : (
            sortedPlayers.map((player, index) => {
              let className = 'player-item';
              if (index === 0) { className += ' gold' } // Primeiro lugar
              else if (index === 1) { className += ' silver'} // Segundo lugar
              else if (index === 2) { className += ' bronze' } // Terceiro lugar
              else { className += ' other' } // Outros lugares
              
              return (
                <li key={player.id} className={className}>
                  {player.position} - <span style={{ fontWeight: 'bold' }}>{player.playerName}</span> - {player.highScore} 
                </li>
              );
            })
          )}
        </ul>
      </div>
      <div className="column" style={{backgroundColor: '#444'}} >
        <div className="qr-code">
          <div className="title">Premios:</div> 
          <div className="prize-list">1° Lugar: Tapa</div> 
          <div className="prize-list">2° Lugar: Tapa</div> 
          <div className="prize-list">3° Lugar: Tapa</div> 

          <img src="https://via.placeholder.com/300" alt="QR Code" />
          <div className="qr-code-scan">Escaneie o QR Code para jogar!</div> 
        </div>
      </div>
    </div>
  );
};

export default WebSocketExample;
