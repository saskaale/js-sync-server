import Connection from '../connection';
import {REQUEST_LOADALL} from '../constants';

Connection.registerRequest(REQUEST_LOADALL, (d) => {
  return {d: {a:1,b:3,c:{a:2}}};
});
