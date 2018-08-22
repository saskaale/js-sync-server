import WSConnection from './wsconnection';
import {REQUEST_LOADALL, REQUEST_LIST, REQUEST_SERVERCHANGE, REQUEST_CLIENTCHANGE} from './constants';
import DataStruct, {merger, MERGER_STRATEGIES} from '../../js-transaction-object';

let datastruct = new DataStruct({
    Task: {},
    SubTask: {},
    SubSubTask: {}
});

class ClientConnection extends WSConnection{
    constructor(...args){
        super(...args);

        this.status = [];

        this._configds = new DataStruct({
          listensTo: {}
        });
        this.config = this._configds.data;

        this.availableDataStructs = {
          [null]: {
                    getData  : () => this._configds,
                    readonly: true
          },
          'data': {
                    getData  :   () => datastruct
          }
        };
        this.listeningDs = {};
    }
    onClose(...args){
        super.onClose && super.onClose(...args);

        for(let k in this.listeningDs)
          this.unsubscribeFrom(k);
        super.onClose();
    }
    subscribeTo(k, silent = false){
        console.log(`subscribe to the ds ${k}`);
        if(this.listeningDs[k])
          throw new Error(`You are already subscribed to the ds ${k}`);
        if(!silent)
          this.config.listensTo[k] = true;

/*        this.request(REQUEST_SERVERCHANGE, {}, k).then(e=>{
            console.log("REQUEST_SERVERCHANGE success");
            console.log(e);
        });
*/

        let subscribe, unsubscribe;
        subscribe = (change) => {
            console.log("---- SEND REQUEST_SERVERCHANGE");
            this.request(REQUEST_SERVERCHANGE, {d:change}, k).then(e=>{
                console.log("REQUEST_SERVERCHANGE success");
                console.log(e);
            });
        };
        unsubscribe = this.availableDataStructs[k].getData().subscribe(subscribe);

        this.listeningDs[k] = {subscribe, unsubscribe};
    }
    _checkDS({s}){
      if(!this.listeningDs[s])
        throw new Error(`Datastruct >>${s}<< is not connected`)
    }
    unsubscribeFrom(k){
        console.log(`unsubscribe from the ds ${k}`);
        if(this.listeningDs[k]){
            this.listeningDs[k].unsubscribe(k);
            delete this.config.listensTo[k];
            delete this.listeningDs[k];
        }
    }
}

ClientConnection.registerRequest(REQUEST_LIST, function(d){
    return Object.keys(this.availableDataStructs);
});

ClientConnection.registerRequest(REQUEST_LOADALL, function(d){
    if(!this.availableDataStructs[d.s])
      throw new Error(`unknown datastruct >>${d.s}<<`);
    this.subscribeTo(d.s);

    return this.availableDataStructs[d.s].getData().toJS();
});

ClientConnection.registerRequest(REQUEST_CLIENTCHANGE, function(d){
    this._checkDS(d);
    let conf = this.availableDataStructs[d.s];
    if(conf.readonly)
        throw new Error('datastruct '+d.s+' is readonly');

    let datastruct = conf.getData();

    const subscribe = this.listeningDs[d.s].subscribe;
    const ret = merger(
            datastruct, 
            d.d, 
            {
                skipSubscribers : new Set([subscribe]),
                strategy        : MERGER_STRATEGIES.LOCAL
            }
    );
//    console.log(this.availableDataStructs[d.s].immutable.toJSON());
    return ret;
});

export default ClientConnection;
