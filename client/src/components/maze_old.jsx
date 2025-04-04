import React, { useEffect, useState } from "react";
import socket from "./socket";

const Maze = () => {
  const [maze, setMaze] = useState([]);

  useEffect(() => {
    socket.emit("requestMaze", { width: 20, height: 20 });

    socket.on("maze", (mazeData) => {
      setMaze(mazeData);
    });

    return () => {
      socket.off("maze");
    };
  }, []);

  return (
    <div>
      {maze.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              style={{
                width: 20,
                height: 20,
                backgroundColor: cell === 1 ? "black" : "white",
                border: "1px solid gray",
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Maze;
