import {serialize, deserialize} from './utils/serializer';

class Connection{
  constructor(uid, ws){
    this._uid = uid;
    this._ws = ws;
  }
  static registerRequest(type, handler){
    if(Connection._requests[type])
      throw new Error('Request '+type+' already exists');
    Connection._requests[type] = handler;
  }
  _onMessage(msg){
    msg = deserialize(msg);
    let response = {};
    if(msg.k)
      response.k = msg.k;

    if(Connection._requests[msg.t]){
      const reqRet = Connection._requests[msg.t](msg);
      if(reqRet)
        response = {...response, ...reqRet};
      else if(reqRet === false)
        response = undefined;
    }else{
      response.err = "Unknown request >>"+msg.k+"<<";
    }

    if(response){
      console.log('send '+JSON.stringify(response));
      this._ws.send(serialize(response));
    }
  }
}

Connection._requests = [];

export default Connection;
