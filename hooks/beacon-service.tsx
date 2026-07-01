import { BleManager, Service, ScanMode} from 'react-native-ble-plx';
import {useState} from "react";
import {Buffer} from "buffer";
import CryptoJS from "crypto-js";
import mqtt from 'mqtt';

   const TYPE_BEACON="BlueUp-01-021238";
   const CHAR_LOCK_STATE = "a3c87506-8ed3-4bdf-8a39-a01bebede295"
   const CHAR_UNLOCK = "a3c87507-8ed3-4bdf-8a39-a01bebede295"
   const SERVICE_UUID = "a3c87500-8ed3-4bdf-8a39-a01bebede295"
   const CHAR_RW_SLOT = "a3c8750a-8ed3-4bdf-8a39-a01bebede295"
   const EDDYSTONE_UUID = "0000feaa-0000-1000-8000-00805f9b34fb";
   const PASSWORD = "blueup";
   const URL_SCHEMA="https://"
   let lastRaw = null;


   const TX_POWER_1M_MAC1 = -70
    const TX_POWER_1M_MAC2 = -82.6
   let rssi=0;
   const bleManager = new BleManager();
   const BeaconService = {
       startScanning,
       stopScanning,
   };

   const client = mqtt.connect('ws://10.219.129.93:15675/ws', {
     username: 'guest',
     password: 'guest',
   });

  client.on('connect', () => {
    // Puoi usare wildcard: + = un livello, # = tutto il resto
    client.subscribe('queue1');
  });

  client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log('Topic:', topic, 'Payload:', data);
  });


   function decodeBlueUpPayload(serviceData) {
     if (!serviceData) return null;

     const KEY = "00008800-0000-1000-8000-00805f9b34fb";

     const base64 = serviceData[KEY];
     if (!base64) return null;

     const bytes = Buffer.from(base64, "base64");

     return {
       rawBase64: base64,
       rawBytes: [...bytes],
       value: bytes[0], // nel tuo caso: 0x01
     };
   }
   function mapBlueUpState(value) {
     const states = {
       0: "IDLE",
       1: "ACTIVE",
       2: "TRIGGER",
     };

     return states[value] || "UNKNOWN";
   }
    function md5Hex(password) {
      return CryptoJS.MD5(password).toString(CryptoJS.enc.Hex);
    }
    function aes128EcbEncryptHex(keyHex, dataHex) {
      const key = CryptoJS.enc.Hex.parse(keyHex);
      const data = CryptoJS.enc.Hex.parse(dataHex);
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      });
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    }
    function calculateDistance(tx,rssi,n=2.5){
        return Math.pow(10,(tx-rssi)/(10*n))
    }
    function decodeEddystonUrl(message){
            if(message[0]!== 0x10){
                return null
            }
            let url = URL_SCHEMA
            for(let i=3;i<message.length;i++){
                let char = message[i]
                url = url + String.fromCharCode(char)
            }
            return url;
    }
    const read = async (device) =>{
        try{
            const deviceRead = await bleManager.discoverAllServicesAndCharacteristicsForDevice(device.id)
             console.log(JSON.stringify(deviceRead,'',2))
        }catch(e){

            console.log("error",e)
        }
     }
     function startScanning (){
         console.log("Inizio scansione")
         bleManager.startDeviceScan(null,  {allowDuplicates: true, legacyScan: false }, (error, scannedDevice) => {
             if (error) {
                 console.warn(JSON.stringify(error,null,2));
                 return;
             }
            if (scannedDevice) {
                let distance=0
                //if(scannedDevice.id!=="2C:CF:67:81:88:04") return;
                /*if(scannedDevice.id==="14:7F:CE:8E:F0:33"){
                    distance=calculateDistance(TX_POWER_1M_MAC1,scannedDevice.rssi)
                    if (client.connected) {
                            const payload = JSON.stringify({
                                zone: 3,
                                distance: distance,
                                timestamp: Date.now(),
                            });
                            client.publish('queue2', payload, { qos: 1 }, (err) => {
                                if (!err) console.log('Messaggio inviato');
                            });
                    }
                    stopScanning()
                    //console.log("rssi",scannedDevice.rssi)
                    console.log("Distance from",scannedDevice.name,":",distance.toFixed(2),"m with rssi",scannedDevice.rssi)
                }else if(scannedDevice.id==="C4:35:D9:A9:2A:00"){
                    distance=calculateDistance(TX_POWER_1M_MAC2,scannedDevice.rssi)
                    console.log("Distance from:",scannedDevice.name,":",distance.toFixed(2),"m with rssi",scannedDevice.rssi)


                }*/
                if (scannedDevice.id !== "C2:74:C5:9E:62:C1") return;


                //read(scannedDevice)
                //console.log("Trovato",scannedDevice

                    // decodifica Eddystone-URL qui
                //const raw = decodeBlueUpPayload(scannedDevice.serviceData)
                //console.log(JSON.stringify(raw,null,2))
                //console.log("STATE:", mapBlueUpState(raw.value));
                //const device = await bleManager.discoverAllServicesAndCharacteristicsForDevice(scannedDevice.id)



                    /*const svcDataB64 = scannedDevice.serviceData?.[EDDYSTONE_UUID];
                    if (!svcDataB64) return; // questo device non sta trasmettendo Eddystone
                    const frame = Buffer.from(svcDataB64, "base64"); // bytes grezzi, come adv.service_data in bleak
                     if (frame[0] === 0x10) {
                         const url = decodeEddystonUrl(frame);
                         console.log("NAME:", scannedDevice.name, "RSSI:", scannedDevice.rssi, "URL:", url);
                     }*/
                    ///console.log("------------------------------")
                    //console.log("DEVICE");
                    //console.log("NAME:", scannedDevice.name);
                    //console.log("RSSI:", scannedDevice.rssi);

                   //console.log("SERVICE UUIDS:", scannedDevice.serviceUUIDs);
                   //console.log("SERVICE DATA:", scannedDevice.serviceData);
                   //console.log("MANUFACTURER:", scannedDevice.manufacturerData);
                   //console.log("SCANNED",scannedDevice.rawScanRecord);

                   //console.log(JSON.stringify(scannedDevice, null, 2));
                    //console.log("------------------------------")

                   // console.log(JSON.stringify("Scanned device\n",scannedDevice, null, 2))
                    //console.log("rawScanRecord:",Buffer.from(scannedDevice.rawScanRecord, "base64").toString("hex"))
                    //stopScanning()
                    //console.log("Scanned",scannedDevice)
                    //rssi=scannedDevice.rssi
                    stampaContenuto(scannedDevice,scannedDevice.id)


                   // scopriTutto(scannedDevice)
                    //vediServizi(scannedDevice)
                    //disconnectFromDevice(scannedDevice.id)
                //}
               }
             });
     }
    function stampaContenuto(device,idDevice,rssi){
        connect(idDevice)
   }
    function stopScanning(){
        console.log("Ferma scansione")
        bleManager.stopDeviceScan();
    }

   const connect = async (macAddrres) => {

    try {

    await bleManager.connectToDevice(macAddrres).then(device=>{

    let connDate = new Date()
    console.log('Connected to device:', device.name,"at",connDate.getHours(),":",connDate.getMinutes(),":",connDate.getSeconds());
    scopriTutto(device)

    //console.log('Is conn',device.isConnectable)
    //console.log(device)
    //disconnectFromDevice(macAddrres)

    }).catch(error => {

     })

    } catch (error) {

    console.error('Error connecting to device:', error);

    }

    };

    // Function to  disconnect from device

    const disconnectFromDevice = async (macAddrres) => {

        await bleManager.cancelDeviceConnection(macAddrres).then (device=>{
            let discDate = new Date()
            console.log(' Disconnect success: ', device.name,"at",discDate.getHours(),":",discDate.getMinutes(),":",discDate.getSeconds());

        }).catch(error=>{

            console.log(' Disconnect Failed: ', error);

        })
    }
    const scopriTutto = async (dispositivo) =>{
        try{
                const allSaC =  await dispositivo.discoverAllServicesAndCharacteristics()
                console.log("discovered:",allSaC)
                await sblocca(allSaC)
                await vediServizi(allSaC)
                //vediServizi(dispositivo.id)
        }catch(e){
            console.log("Discover error",e)
        }
    }
    const sblocca = async (dispositivo) =>{
        try{
            //.log("INIZIO SBLOCCO")
            const result = await dispositivo.readCharacteristicForService(SERVICE_UUID,CHAR_LOCK_STATE)
            const normal = Buffer.from(result.value,"base64")[0]
            //console.log(service.uuid, '->', ch.uuid,'value:',result.value)
            //console.log("stato",normal.toString(16).padStart(2, '0f'))
            //console.log('hex:',normal.toString("hex"),'ascii:',normal.toString("ascii"))
             if(normal === 0x01 || normal === 0x02){
                 console.log("Sbloccato")
                 return
              }
              const nonceResult = await dispositivo.readCharacteristicForService(SERVICE_UUID,CHAR_UNLOCK)
              const nonceHex = Buffer.from(nonceResult.value,'base64').toString('hex')


              const keyHex = md5Hex(PASSWORD)
             // console.log("keyHex",keyHex)
              const responseHex = aes128EcbEncryptHex(keyHex,nonceHex)
             // console.log('Risposta hex:', responseHex);

              const responseBase64 = Buffer.from(responseHex,'hex').toString('base64')
             // console.log("Resp B64",responseBase64)
              await dispositivo.writeCharacteristicWithResponseForService(SERVICE_UUID,CHAR_UNLOCK,responseBase64)

              await new Promise(r => setTimeout(r, 400));

              const resultUnlock = await dispositivo.readCharacteristicForService(SERVICE_UUID,CHAR_LOCK_STATE)
              const normalUnlock =  Buffer.from(resultUnlock.value,"base64")[0]
              //console.log(resultUnlock.uuid,'value unlocked:',normalUnlock.toString(16))
        }catch(e){
            console.log('errore:', e);
        }
    }
    const vediServizi = async (dispositivo) =>{
            try{
                const services = await dispositivo.services()
                for(const service of services){
                    const characteristics = await service.characteristics()
                    for(const ch of characteristics){
                        if(ch.isReadable){
                            try{
                                const result = await dispositivo.readCharacteristicForService(service.uuid,ch.uuid)
                                var messageEnc = Buffer.from(result.value,"base64")
                                //console.log(service.uuid, '->', ch.uuid,'value unlocked:',result.value)
                                if(ch.uuid===CHAR_RW_SLOT){
                                    console.log("raw hex:",Buffer.from(result.value,"base64").toString("hex"))
                                    console.log("raw bytes:",[...Buffer.from(result.value,"base64")])
                                    var decoded = decodeEddystonUrl(messageEnc)
                                    var tx=0
                                    if(messageEnc[1]>127){
                                       tx = messageEnc[1]-256
                                    }else{
                                       tx = messageEnc[1]
                                    }
                                    console.log("tx:",messageEnc[1])
                                    console.log("rssi:",rssi)
                                    var distance = calculateDistance(messageEnc[1],rssi)
                                    console.log(service.uuid, '->', ch.uuid,'value unlocked:',result.value,"decode url:",decoded)
                                    console.log("distance",distance)

                                }
                            }catch(e){
                                //console.log(service.uuid, '->', ch.uuid,'errore:', e);
                            }
                        }

                    }
                 }
                disconnectFromDevice(dispositivo.id)
            }catch(e){
                console.log("Services error",JSON.stringify(e))
            }
        }

export default BeaconService;