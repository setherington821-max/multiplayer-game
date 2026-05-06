const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let bossHP = 1000;
let players = {};

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    players[socket.id] = { name, damage: 0 };
  });

  socket.on("attack", () => {
    if (!players[socket.id]) return;

    let dmg = Math.floor(Math.random()*5)+1;
    bossHP -= dmg;
    players[socket.id].damage += dmg;

    if (bossHP <= 0) {
      bossHP = 1500;
      for (let id in players) {
        players[id].damage = 0;
      }
    }

    io.emit("update", { hp: bossHP, players });
  });

  socket.on("chat", (msg) => {
    if (!players[socket.id]) return;

    io.emit("chat", {
      name: players[socket.id].name,
      message: msg
    });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });

});

http.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
