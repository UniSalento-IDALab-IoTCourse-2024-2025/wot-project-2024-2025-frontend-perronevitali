import { BleManager, Service, ScanMode} from 'react-native-ble-plx';
import {useState} from "react";
import { Client } from '@stomp/stompjs';

   const bleManager = new BleManager();
   let isScanning = false;
   let stateSubscription = null;
   let stompReady = false;
   let prev=0
   let idRabbit=""
   const BeaconService = {
       startAll,
       startScanning,
       stopScanning
   };

   let powb1=0,powb2=0
   const client = new Client({
     brokerURL: 'ws://100.65.22.118:15674/ws',
     connectHeaders: {
       login: 'FARO',
       passcode: 'FARO',
     },
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
     debug: (str) => console.log('STOMP DEBUG:', str),
       onConnect: () => {
         console.log('STOMP CONNESSO');
         client.subscribe('/queue/faro.inbox.'+idRabbit, onPersonalMessage);
         stompReady=true
       },
       onStompError: (frame) => {
         console.log('STOMP ERROR:', frame.headers['message'], frame.body);
       },
       onWebSocketError: (event) => {
         console.log('WEBSOCKET ERROR:', event.message || event);
       },
       onDisconnect: () => {
         console.log('STOMP DISCONNESSO');
     }
   });

   //function cconnectTorabbit(){}
   /*const client = mqtt.connect('ws://100.65.22.118:15674/ws', {
     username: 'FARO',
     password: 'FARO',
   });

  client.on('connect', () => {
    // Puoi usare wildcard: + = un livello, # = tutto il resto
    client.subscribe('faro.outbox');
  });

  client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log('Topic:', topic, 'Payload:', data);
  });*/


 function startAll (macs,idWorker){
      idRabbit=idWorker
      if (stateSubscription) {
          console.log("Listener BLE già attivo, skip");
          return;
      }
      client.activate();
      stateSubscription = bleManager.onStateChange((state) => {
          console.log(state);
          if (state === "PoweredOn") {
            startScanning(macs, idWorker);
          }
          if (state === "PoweredOff") {
            alert("Bluetooth spento");
            stopScanning();
          }
          if (state === "Unauthorized") {
            alert("Autorizza dall'app");
          }
      }, true);
  }
  function onPersonalMessage(message) {
      console.log("Messaggio ricevuto:", message.body);
  }

  function startScanning (macs,idWorker){
      console.log("MAC TO SEARCH",macs)
      console.log("RABBIT key",idWorker)
      if(isScanning){
          console.log("Scansione già avviata")
          return
      }
      console.log("Inizio scansione")
      console.log('client.connected al momento del publish:', client.connected);
      bleManager.startDeviceScan(null,  {allowDuplicates: true, legacyScan: false }, (error, scannedDevice) => {
      if (error) {
          if(error.errorCode!==102)
            console.warn(JSON.stringify(error,null,2));
        return;
      }
      if (scannedDevice) {
            /*if (scannedDevice.id !== "C2:74:C5:9E:62:C1" && scannedDevice.id !== "F8:C2:9B:71:FC:26") return;
            else if(scannedDevice.id==="C2:74:C5:9E:62:C1")
                powb1=scannedDevice.rssi
            else
                powb2=scannedDevice.rssi
            if(powb1===0 || powb2===0)
                return;
            else if(powb1>=powb2)
                console.log("Sei piu vicino al dispositivo C2:74:C5:9E:62:C1")
            else
                console.log("Sei piu vicino al dispositivo F8:C2:9B:71:FC:26")*/
            if(prev===0){
                if(client.connected){
                    const date = new Date()
                    const message = JSON.stringify(
                        {
                            "type":"POSITION_UPDATE",
                            "timestamp":date,
                            "payload":{
                                "areaId":"cassacarragnu",
                                "previousAreaId":"42r24r24r42r43t432t25",
                            }
                        })
                    client.subscribe(`/exchange/faro.areas/area.cassacarragnu`, (message) => {
                        console.log('Messaggio ricevuto:', JSON.parse(message.body));
                    });
                    client.publish({
                        destination: "/exchange/faro.outbox/"+idWorker,
                        headers: {type:"POSITION_UPDATE"},
                        body: message
                    })
                    prev=1
                    console.log("Messaggio pubblicato")
                }else{
                    console.log("STOMP non ancora connesso, scarto questo tentativo")
                }
            }
            /*
            if (client.connected) {
                const payload = JSON.stringify({
                    zone: 3,
                    distance: distance,
                    timestamp: Date.now(),
               });
               client.publish('queue2', payload, { qos: 1 }, (err) => {
               if (!err) console.log('Messaggio inviato');
               });
            }*/
      }
      });
     }

    function stopScanning(){
        console.log("Ferma scansione")
        bleManager.stopDeviceScan();
        isScanning=false
    }
export default BeaconService;