import Connection from '../connection';
import {REQUEST_NTP} from '../constants';

Connection.registerRequest(REQUEST_NTP, function(d){
    const clientTime = d.ct;
    const serverTimestamp = new Date().getTime();
    const serverClientRequestDiffTime = serverTimestamp - clientTime;
    return {
        diff:             serverClientRequestDiffTime,
        serverTimestamp:  serverTimestamp
    };
});
