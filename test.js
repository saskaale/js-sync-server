import Server from './src/server';
import Connection from './src/connection';
import {REQUEST_LOADALL, REQUEST_SERVERCHANGE} from './src/constants';
import DataStruct from '../js-transaction-object';


class ClientConnection extends Connection{
    constructor(...args){
        super(...args);
        this.datastruct = new DataStruct({});
        const data = this.data = this.datastruct.data;

        this._interval = setInterval(() => {
            data.cnt = (data.cnt || 0)+1;
          }, 1000); 

        this.datastruct.subscribe((change) => {
            this.send(REQUEST_SERVERCHANGE, change)
        });
    }
    onClose(){
        removeInterval(this._interval);
        super.onClose();
    }
}

ClientConnection.registerRequest(REQUEST_LOADALL, function(d){
    return this.datastruct.toJS();
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