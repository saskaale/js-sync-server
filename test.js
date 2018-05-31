//import DataStruct from '../js-transaction-object';
//import Client from './src/client';

const requests = {
  'ntp': (d) => {
      const clientTime = d.ct;
      const serverTimestamp = new Date().getTime();
      const serverClientRequestDiffTime = serverTimestamp - clientTime;
      return {
          diff:             serverClientRequestDiffTime,
          serverTimestamp:  serverTimestamp
      };
  }
}

function onMessage(msg, ws){
  let response = {};
  if(msg.k){
    response.k = msg.k;
    if(requests[msg.t]){
      const reqRet = requests[msg.t](msg);
      if(reqRet)
          response = {...response, ...reqRet};
    }else{
      response.err = "Unknown request >>"+msg.k+"<<";
    }
  }
  console.log('send '+JSON.stringify(response));
  ws.send(JSON.stringify(response));
}

var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({port: 40510});
wss.on('connection', function (ws) {
  console.log('connection');
  ws.on('message', function (message) {
    console.log('onMessage '+message);
    onMessage(JSON.parse(message), ws);
  })
});
