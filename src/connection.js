import {serialize, deserialize} from './utils/serializer';

const requestFunName = (n) => "request_"+n;
class Connection{
  constructor(uid, ws){
    this._uid = uid;
    this._ws = ws;

    console.log("NEW CLIENT connection");
  }
  static registerRequest(type, handler){
    type = requestFunName(type);
    if(this.prototype[type])
      throw new Error('Request ( function '+type+' ) already exists');
    this.prototype[type] = handler;
  }
  _onMessage(msg){
    this.onMessage(deserialize(msg));
  }
  _send(d){
    console.log('send '+JSON.stringify(d));
    this._ws.send(serialize(d));
  }
  onClose(){}
  send(type, data){
    this._send({t: type, d:data});
  }
  onMessage(msg){
    console.log('receive '+JSON.stringify(msg));
    let response = {};
    if(msg.k)
      response.k = msg.k;

    let t = requestFunName(msg.t);
    if(this[t]){
      const reqRet = this[t].call(this, msg);
      if(reqRet)
        response.d = reqRet;
      else if(reqRet === false)
        response = undefined;
    }else{
      response.err = "Unknown request >>"+msg.k+"<<";
    }

    if(response){
      this._send(response);
    }
  }
}

export default Connection;
