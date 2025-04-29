import {useEffect,  useRef, useState} from "react";
import "./App.css";
import QrCode from "/qrcode.png";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [players, setPlayers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {

    if (!socketRef.current) {
      const uuid = uuidv4();
      socketRef.current = new WebSocket(
        // "wss://flappy-senai.up.railway.app/leaderboard-ws${uuid}",
        `ws://localhost:8080/leaderboard-ws/${uuid}`,
      );
    }

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setPlayers((prevPlayers) => {
        const updatedPlayers = [...prevPlayers];

        data.forEach((updatedPlayer) => {
          const index = updatedPlayers.findIndex(
            (player) => player.id === updatedPlayer.id,
          );

          if (index !== -1) {
            updatedPlayers[index] = updatedPlayer;
          } else {
            updatedPlayers.push(updatedPlayer);
          }
        });

        updatedPlayers.forEach((player) => {
          const index = data.findIndex((p) => p.id === player.id);

          if (index === -1) {
            updatedPlayers.remove(player)
          }
        });

        return updatedPlayers;
      });

      socketRef.current.send("Message received");
    };

    socketRef.current.onerror = (error) => {
      console.error("Erro:", error);
    };

    return () => {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const sortedPlayers = [...players].sort((a, b) => b.highScore - a.highScore);

  return (
    <div className="container">
      <div className="column" style={{ backgroundColor: "#333" }}>
        <h1 style={{ textAlign: "center" }}>Pontuação Flappy-Senai:</h1>
        <div style={{ overflowY: "scroll" }}>
          <ul className="player-list">
            <AnimatePresence>
              {sortedPlayers.length === 0
                ? (
                  <motion.li
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Nenhum jogador encontrado
                  </motion.li>
                )
                : (
                  sortedPlayers.map((player, index) => {
                    const position = index + 1;

                    let className = "player-item";
                    if (index === 0) className += " gold";
                    else if (index === 1) className += " silver";
                    else if (index === 2) className += " bronze";
                    else className += " other";

                    return (
                      <motion.li
                        key={player.id}
                        layout
                        initial={{ opacity: 0, y: index * 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        style={{ position: "relative", zIndex: 1 }}
                        className={className}
                      >
                        {position} -{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {player.playerName}
                        </span>{" "}
                        - {player.highScore}
                      </motion.li>
                    );
                  })
                )}
            </AnimatePresence>
          </ul>
        </div>
      </div>
      <div className="column" style={{ backgroundColor: "#444" }}>
        <div className="qr-code">
          <div className="title">Premios:</div>
          <div className="prize-list">1° Lugar: Tapa</div>
          <div className="prize-list">2° Lugar: Tapa</div>
          <div className="prize-list">3° Lugar: Tapa</div>

          <img src={QrCode} alt="QR Code" />
          <div className="qr-code-scan">
            Escaneie o QR Code para jogar!
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
