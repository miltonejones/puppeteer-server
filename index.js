const WebSocket = require("ws");
const SOCKET_URI = "wss://2zoxhl25v2.execute-api.us-east-1.amazonaws.com/production";
const { evaluateNode } = require('./listener');
const { tryParse } = require('./util');

// WebSocket can re-spawn
let ws = new WebSocket(SOCKET_URI); 

/************************************************************************
 * socket listeners
 ************************************************************************/
 const openListener = () => {
  console.log("you are connected");
  sendClientStatus();
};
const closeListener = () => {
  console.log("you are disconnected");
  retryConnection();
};
const messageListener = (message) => {
  const data = Buffer.from(message).toString();
  const json = tryParse(data);
  const { items, connectionId } = json; 
  if  (!items) return;
  items.map(item => evaluateNode(item, connectionId, sendClientStatus));
};


/************************************************************************
 * socket commands
 ************************************************************************/
function sendMessage(sending) {
  console.log({ sending: JSON.stringify(sending, 0, 2) });
  console.log (ws.readyState)
  ws.readyState === 1 && ws.send(JSON.stringify(sending));
}

function sendClientStatus(action = "introduce", stats = {}) {
  const time = new Date().getTime();
  const msg = {
    action,
    data: {
      time,
      ...stats,
    },
  };
  sendMessage(msg);
}

const retryConnection = () => {
  let now = new Date().getTime();
  const then = now + 5000;
  while (now < then) {
    now = new Date().getTime();
  }
  console.log("Retrying connection...");
  ws = new WebSocket(SOCKET_URI);
  mountClient();
};

const mountClient = () => {
  // configure ws
  ws.on("open", openListener);
  ws.on("close", closeListener);
  ws.on("message", messageListener);
};

mountClient();