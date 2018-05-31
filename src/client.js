import Communicator from './communicator';
import NTPprotocol from './ntp';

const defaultConf = {
  Communicator,
  CommunicatorOptions: {}
};

export default class Client{
  constructor(datastruct, options = {}){
    this.options = options = {...defaultConf, ...options};

    this.datastruct = datastruct;
    this.communicator =
          new options.Communicator(
            options.CommunicatorOptions,
            this.onMessage);

    this.communicator.connected(()=>{
      this.ntpservice = new NTPprotocol(this.communicator);
    });

    this.datastruct.subscribe(this.dataChange.bind(this));
  }
  dataChange(uuid,diff){
    /**** TODO: rewrite this to not use a callback for better performance ****/

    this.communicator.connected(()=>{
      console.log('connected');
      this.communicator.request('change',{
        change: diff,
        uuid,
        tm: this.ntpservice.getTime()
      });
    });
    console.log(diff.toJS());
//    console.log(diff);
//    console.log('datachange');
  }
}
