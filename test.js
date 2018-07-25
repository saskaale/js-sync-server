import Server from './src/server';
import Connection from './src/connection';
import {REQUEST_LOADALL, REQUEST_LIST, REQUEST_SERVERCHANGE, REQUEST_CLIENTCHANGE} from './src/constants';
import DataStruct from '../js-transaction-object';

class ClientConnection extends Connection{
    constructor(...args){
        super(...args);


        this.status = [];

        this._configds = new DataStruct({
          listensTo: {}
        });
        this.config = this._configds.data;

        this.availableDataStructs = {
          [null]: this._configds
        };
        this.listeningDsUnsubscribe = {};
    }
    onClose(){
        for(let k in this.listeningDsUnsubscribe)
          this.unsubscribeFrom(k);
        super.onClose();
    }
    subscribeTo(k, silent = false){
        console.log(`subscribe to the ds ${k}`);
        if(this.listeningDsUnsubscribe[k])
          throw new Error(`You are already subscribed to the ds ${k}`);
        if(!silent)
          this.config.listensTo[k] = true;
        this.listeningDsUnsubscribe[k] = this.availableDataStructs[k].subscribe((change) => {
            this.send(REQUEST_SERVERCHANGE, {struct: k, d:change});
        });
    }
    unsubscribeFrom(k){
        console.log(`unsubscribe from the ds ${k}`);
        if(this.listeningDsUnsubscribe[k]){
            this.listeningDsUnsubscribe[k](k);
            delete this.config.listensTo[k];
            delete this.listeningDsUnsubscribe[k];
        }
    }
}

ClientConnection.registerRequest(REQUEST_LIST, function(d){
    return Object.keys(this.availableDataStructs);
});

ClientConnection.registerRequest(REQUEST_LOADALL, function(d){
    console.log(REQUEST_LOADALL);
    console.log("request_all");
    console.log(this.availableDataStructs[d.s])
    if(!this.availableDataStructs[d.s])
      throw new Error(`unknown datastruct >>${d.s}<<`);
    console.log("request_all 2");
    this.subscribeTo(d.s);
    return this.availableDataStructs[d.s].toJS();
});

ClientConnection.registerRequest(REQUEST_CLIENTCHANGE, function(d){
//    return this.datastruct.toJS();
});

let server = new Server({
    ClientConnection,
});
/*

class ClientConnection2 extends Connection{
    constructor(...args){
        super(...args);
        this.datastruct = new DataStruct({});
    }
}

ClientConnection2.registerRequest(REQUEST_LOADALL+"LOAD2", function(d){
    return this.data.toJS();
});


/*let server = new Server({
    ClientConnection,
});
*/
