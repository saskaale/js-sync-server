const WebSocket = require('websocket').w3cwebsocket;
import uuidv1 from 'uuid/v1';
import {serialize} from 'js-sync-utils';


export default class Communicator{
  constructor(options, onMessage){
    this._requests = new Map();
    this.connection = new WebSocket(options.url);
    this._onOpens = [];

    this.connection.onopen = (evt) => {
      this._onOpens.forEach(f=>f());
      this.openned = true;
    }
    this.connection.onclose = (evt) => {
      this.openned = false;
    }
    this.connection.onmessage = this._parseMessage.bind(this);
  }
  _parseMessage(d){
    if(d.key){
      const d = this._requests.get(d.key);
      d.resolve(d);
      this._requests.remove(d.key);
    }
  }
  connected(f){
    if(this.openned) {
      f();
    } else {
      this._onOpens.push(f);
    }
  }
  request(request){
    if(!request.key) request.key = uuidv1();
    return new Promise((resolve, reject) => {
      this._requests.set(request.key, {resolve, reject});
      this.send(request);
    });
  }
  send(data){
    this.connection.send(serialize(data));
  }
  close(){
    this.connection.close();
  }
}
