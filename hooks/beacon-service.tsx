import { BleManager, Service, ScanMode } from 'react-native-ble-plx';
import { getExistingStompClient, isStompReady, switchAreaSubscription } from './stompClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bleManager = new BleManager();
let isScanning = false;
let stateSubscription = null;
let idRabbit = '';
let curr_area = null;
let prev_area = null;
let client = null;
const BeaconService = {
  startAll,
  startScanning,
  stopScanning,
};

function startAll(zones, idWorker) {
  idRabbit = idWorker;
  if (stateSubscription) {
    return;
  }
  client = getExistingStompClient();
  if (!client || !isStompReady()) {
    console.warn('STOMP non ancora pronto, impossibile avviare beacon service');
    return;
  }
  stateSubscription = bleManager.onStateChange((state) => {
    console.log(state);
    if (state === 'PoweredOn') {
      startScanning(zones, idWorker);
    }
    if (state === 'PoweredOff') {
      alert('Bluetooth spento');
      stopScanning();
    }
    if (state === 'Unauthorized') {
      alert("Autorizza dall'app");
    }
  }, true);
}

function startScanning(zones, idWorker) {
  if (isScanning) {
    console.log('Scansione già avviata');
    return;
  }
  console.log('Inizio scansione');
  bleManager.startDeviceScan(null, { allowDuplicates: true, legacyScan: false }, async (error, scannedDevice) => {
    if (error) {
      if (error.errorCode !== 102) console.warn(JSON.stringify(error, null, 2));
      return;
    }
    if (scannedDevice) {
      const devicefounded = zones.find(({ mac }) => mac === scannedDevice.id);
      if (devicefounded === null || devicefounded === undefined) {
        return;
      }

      if (curr_area === null) {
        curr_area = devicefounded;
        curr_area['power'] = scannedDevice.rssi;
        prev_area = devicefounded;
        prev_area['power'] = scannedDevice.rssi;
        if (client.connected) {

          await setCurrentArea(devicefounded.area);
          switchAreaSubscription(devicefounded.area);

          const date = new Date();
          const message = JSON.stringify({
            type: 'POSITION_UPDATE',
            timestamp: date,
            payload: {
              areaId: devicefounded.area,
              previousAreaId: prev_area.area,
            },
          });
          client.publish({
            destination: '/exchange/faro.outbox/' + idWorker,
            headers: { type: 'POSITION_UPDATE' },
            body: message,
          });
          console.log('Messaggio pubblicato');
        }
        return;
      } else {
        curr_area = devicefounded;
        curr_area['power'] = scannedDevice.rssi;
        if (curr_area['area'] === prev_area['area']) {
          return;
        }
      }

      if (curr_area['power'] > prev_area['power']) {
        console.log('Ti sei allontanato da', prev_area, 'ma ti sei avvicinato a', curr_area);
        const previous = prev_area;
        prev_area = curr_area;
        curr_area = devicefounded;
        if (client.connected) {
          await setCurrentArea(devicefounded.area);
          switchAreaSubscription(devicefounded.area);

          const date = new Date();
          const message = JSON.stringify({
            type: 'POSITION_UPDATE',
            timestamp: date,
            payload: {
              areaId: devicefounded.area,
              previousAreaId: previous.area,
            },
          });
          client.publish({
            destination: '/exchange/faro.outbox/' + idWorker,
            headers: { type: 'POSITION_UPDATE' },
            body: message,
          });
          console.log('Messaggio pubblicato');
        } else {
          console.log('STOMP non ancora connesso, scarto questo tentativo');
        }
      }
    }
  });
}

function stopScanning() {
  console.log('Ferma scansione');
  bleManager.stopDeviceScan();
  isScanning = false;
}

const setCurrentArea = async (areaID) => {
  await AsyncStorage.setItem('currAreaID', areaID);
  const areas = JSON.parse(await AsyncStorage.getItem('areas'));
  const currArea = areas.find((area) => area.id === areaID);
  console.log('Area Corrente', currArea);
  await AsyncStorage.setItem('currArea', JSON.stringify(currArea));
};

export default BeaconService;