export default class NTP{
  constructor(communicator){
    this.refresh = () => {
      /*
       Implementation of the NTP protocol
       */
      this.communicator.request(
        {
          t:"servtime",
          clienttime:new Date().getTime()
        }).then((data) => {
          const nowTimeStamp = new Date().getTime();
          const serverClientRequestDiffTime = data.diff;
          const serverTimestamp = data.serverTimestamp;
          const serverClientResponseDiffTime = nowTimeStamp - serverTimestamp;
          const responseTime = (
              serverClientRequestDiffTime
              - nowTimeStamp
              + clientTimestamp
              - serverClientResponseDiffTime
            )/2;

          const syncedServerTime = nowTimeStamp + serverClientResponseDiffTime - responseTime;
          this.servClientdiff = syncedServerTime - new Date().getTime();
      });
    }
  }
  getTime(){
    return new Date().getTime() + this.servClientdiff;
  }
}
