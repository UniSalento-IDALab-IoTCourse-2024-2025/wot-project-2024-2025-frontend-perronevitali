import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { Device, State } from 'react-native-ble-plx';
import { getBleManager } from '@/hooks/blemanager';

// ── UUID GATT BlueUp ──────────────────────────────────────────
const CHAR_LOCK_STATE  = 'a3c87506-8ed3-4bdf-8a39-a01bebede295';
const CHAR_UNLOCK      = 'a3c87507-8ed3-4bdf-8a39-a01bebede295';
const CHAR_ACTIVE_SLOT = 'a3c87502-8ed3-4bdf-8a39-a01bebede295';
const CHAR_RW_SLOT     = 'a3c8750a-8ed3-4bdf-8a39-a01bebede295';
const SERVICE_UUID     = 'a3c87500-8ed3-4bdf-8a39-a01bebede295';
const PASSWORD         = 'blueup';

export type BleStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface BeaconData {
  name: string;
  id: string;
  rssi: number;
  batteryPercent: number | null;
  slotMessage: string | null;
}

interface UseBleReturn {
  status: BleStatus;
  beaconData: BeaconData | null;
  errorMessage: string | null;
  isBluetoothOn: boolean;
  scanAndConnect: (targetDeviceName?: string, targetDeviceId?: string) => void;
  disconnect: () => void;
}

// ── Permessi Android ──────────────────────────────────────────
async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const apiLevel = Platform.Version as number;
    if (apiLevel >= 31) {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(results).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
}

// ── Utilità base64 ────────────────────────────────────────────
function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

// ── MD5 puro JS ───────────────────────────────────────────────
function computeMd5(str: string): Uint8Array {
  function safeAdd(x: number, y: number) { const lsw=(x&0xFFFF)+(y&0xFFFF); return (((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xFFFF); }
  function bitRotateLeft(num: number, cnt: number) { return (num<<cnt)|(num>>>(32-cnt)); }
  function md5cmn(q:number,a:number,b:number,x:number,s:number,t:number){return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function md5ff(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
  function md5gg(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
  function md5hh(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(b^c^d,a,b,x,s,t);}
  function md5ii(a:number,b:number,c:number,d:number,x:number,s:number,t:number){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
  const bytes = new TextEncoder().encode(str);
  const len8 = bytes.length;
  const len32 = len8 >> 2;
  const k: number[] = [];
  for(let i=0;i<len32;i++) k[i]=(bytes[i*4])|(bytes[i*4+1]<<8)|(bytes[i*4+2]<<16)|(bytes[i*4+3]<<24);
  const rem = len8 % 4;
  let last = 0;
  for(let i=0;i<rem;i++) last|=bytes[len32*4+i]<<(i*8);
  last|=0x80<<(rem*8);
  k.push(last);
  if(k.length%16===15) k.push(0);
  while(k.length%16!==14) k.push(0);
  k.push((len8*8)&0xFFFFFFFF); k.push(Math.floor(len8/0x20000000));
  let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<k.length;i+=16){
    const [A,B,C,D]=[a,b,c,d];
    a=md5ff(a,b,c,d,k[i],7,-680876936);d=md5ff(d,a,b,c,k[i+1],12,-389564586);c=md5ff(c,d,a,b,k[i+2],17,606105819);b=md5ff(b,c,d,a,k[i+3],22,-1044525330);
    a=md5ff(a,b,c,d,k[i+4],7,-176418897);d=md5ff(d,a,b,c,k[i+5],12,1200080426);c=md5ff(c,d,a,b,k[i+6],17,-1473231341);b=md5ff(b,c,d,a,k[i+7],22,-45705983);
    a=md5ff(a,b,c,d,k[i+8],7,1770035416);d=md5ff(d,a,b,c,k[i+9],12,-1958414417);c=md5ff(c,d,a,b,k[i+10],17,-42063);b=md5ff(b,c,d,a,k[i+11],22,-1990404162);
    a=md5ff(a,b,c,d,k[i+12],7,1804603682);d=md5ff(d,a,b,c,k[i+13],12,-40341101);c=md5ff(c,d,a,b,k[i+14],17,-1502002290);b=md5ff(b,c,d,a,k[i+15],22,1236535329);
    a=md5gg(a,b,c,d,k[i+1],5,-165796510);d=md5gg(d,a,b,c,k[i+6],9,-1069501632);c=md5gg(c,d,a,b,k[i+11],14,643717713);b=md5gg(b,c,d,a,k[i],20,-373897302);
    a=md5gg(a,b,c,d,k[i+5],5,-701558691);d=md5gg(d,a,b,c,k[i+10],9,38016083);c=md5gg(c,d,a,b,k[i+15],14,-660478335);b=md5gg(b,c,d,a,k[i+4],20,-405537848);
    a=md5gg(a,b,c,d,k[i+9],5,568446438);d=md5gg(d,a,b,c,k[i+14],9,-1019803690);c=md5gg(c,d,a,b,k[i+3],14,-187363961);b=md5gg(b,c,d,a,k[i+8],20,1163531501);
    a=md5gg(a,b,c,d,k[i+13],5,-1444681467);d=md5gg(d,a,b,c,k[i+2],9,-51403784);c=md5gg(c,d,a,b,k[i+7],14,1735328473);b=md5gg(b,c,d,a,k[i+12],20,-1926607734);
    a=md5hh(a,b,c,d,k[i+5],4,-378558);d=md5hh(d,a,b,c,k[i+8],11,-2022574463);c=md5hh(c,d,a,b,k[i+11],16,1839030562);b=md5hh(b,c,d,a,k[i+14],23,-35309556);
    a=md5hh(a,b,c,d,k[i+1],4,-1530992060);d=md5hh(d,a,b,c,k[i+4],11,1272893353);c=md5hh(c,d,a,b,k[i+7],16,-155497632);b=md5hh(b,c,d,a,k[i+10],23,-1094730640);
    a=md5hh(a,b,c,d,k[i+13],4,681279174);d=md5hh(d,a,b,c,k[i],11,-358537222);c=md5hh(c,d,a,b,k[i+3],16,-722521979);b=md5hh(b,c,d,a,k[i+6],23,76029189);
    a=md5hh(a,b,c,d,k[i+9],4,-640364487);d=md5hh(d,a,b,c,k[i+12],11,-421815835);c=md5hh(c,d,a,b,k[i+15],16,530742520);b=md5hh(b,c,d,a,k[i+2],23,-995338651);
    a=md5ii(a,b,c,d,k[i],6,-198630844);d=md5ii(d,a,b,c,k[i+7],10,1126891415);c=md5ii(c,d,a,b,k[i+14],15,-1416354905);b=md5ii(b,c,d,a,k[i+5],21,-57434055);
    a=md5ii(a,b,c,d,k[i+12],6,1700485571);d=md5ii(d,a,b,c,k[i+3],10,-1894986606);c=md5ii(c,d,a,b,k[i+10],15,-1051523);b=md5ii(b,c,d,a,k[i+1],21,-2054922799);
    a=md5ii(a,b,c,d,k[i+8],6,1873313359);d=md5ii(d,a,b,c,k[i+15],10,-30611744);c=md5ii(c,d,a,b,k[i+6],15,-1560198380);b=md5ii(b,c,d,a,k[i+13],21,1309151649);
    a=md5ii(a,b,c,d,k[i+4],6,-145523070);d=md5ii(d,a,b,c,k[i+11],10,-1120210379);c=md5ii(c,d,a,b,k[i+2],15,718787259);b=md5ii(b,c,d,a,k[i+9],21,-343485551);
    a=safeAdd(a,A);b=safeAdd(b,B);c=safeAdd(c,C);d=safeAdd(d,D);
  }
  const out = new Uint8Array(16);
  [a,b,c,d].forEach((v,i)=>{ out[i*4]=v&0xff;out[i*4+1]=(v>>8)&0xff;out[i*4+2]=(v>>16)&0xff;out[i*4+3]=(v>>24)&0xff; });
  return out;
}

// ── AES-128-ECB puro JS ───────────────────────────────────────
function computeAes128ecb(key: Uint8Array, data: Uint8Array): Uint8Array {
  const sbox=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22];
  const xtime=(x:number)=>((x<<1)^((x&0x80)?0x1b:0));
  function subBytes(s:number[][]){return s.map(r=>r.map(b=>sbox[b]));}
  function shiftRows(s:number[][]){return [[s[0][0],s[1][1],s[2][2],s[3][3]],[s[1][0],s[2][1],s[3][2],s[0][3]],[s[2][0],s[3][1],s[0][2],s[1][3]],[s[3][0],s[0][1],s[1][2],s[2][3]]];}
  function mixCol(c:number[]){return[xtime(c[0])^xtime(c[1])^c[1]^c[2]^c[3],c[0]^xtime(c[1])^xtime(c[2])^c[2]^c[3],c[0]^c[1]^xtime(c[2])^xtime(c[3])^c[3],xtime(c[0])^c[0]^c[1]^c[2]^xtime(c[3])];}
  function mixColumns(s:number[][]){return s.map(mixCol);}
  function addRoundKey(s:number[][],rk:number[][]){return s.map((r,i)=>r.map((b,j)=>b^rk[i][j]));}
  function keyExpansion(k:Uint8Array){
    const rcon=[0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];
    const w:number[][]=[];
    for(let i=0;i<4;i++) w.push([k[i*4],k[i*4+1],k[i*4+2],k[i*4+3]]);
    for(let i=4;i<44;i++){
      let t=[...w[i-1]];
      if(i%4===0){t=[t[1],t[2],t[3],t[0]].map(b=>sbox[b]);t[0]^=rcon[i/4-1];}
      w.push(w[i-4].map((b,j)=>b^t[j]));
    }
    return Array.from({length:11},(_,r)=>[w[r*4],w[r*4+1],w[r*4+2],w[r*4+3]]);
  }
  const rks=keyExpansion(key);
  let state:number[][]=[[data[0],data[4],data[8],data[12]],[data[1],data[5],data[9],data[13]],[data[2],data[6],data[10],data[14]],[data[3],data[7],data[11],data[15]]];
  state=addRoundKey(state,rks[0]);
  for(let r=1;r<=10;r++){
    state=subBytes(state);
    state=shiftRows(state);
    if(r<10) state=mixColumns(state);
    state=addRoundKey(state,rks[r]);
  }
  const out=new Uint8Array(16);
  state.forEach((col,c)=>col.forEach((b,r)=>out[r*4+c]=b));
  return out;
}

// ── Decode Eddystone-URL ──────────────────────────────────────
function decodeEddystoneUrl(data: Uint8Array): string {
  const prefixes = ['http://www.','https://www.','http://','https://'];
  const suffixes = ['.com/','.org/','.edu/','.net/','.info/','.biz/','.gov/','.com','.org','.edu','.net','.info','.biz','.gov'];
  if (data.length === 0 || all(data, b => b === 0)) return 'Slot vuoto';
  if (data[0] !== 0x10) return `raw: ${Array.from(data).map(b=>b.toString(16).padStart(2,'0')).join(' ')}`;
  const scheme = prefixes[data[2]] ?? '?://';
  let url = scheme;
  for (let i = 3; i < data.length; i++) {
    const b = data[i];
    if (b === 0) break;
    if (b < suffixes.length) url += suffixes[b];
    else url += String.fromCharCode(b);
  }
  return url;
}

function all(arr: Uint8Array, fn: (b: number) => boolean): boolean {
  for (const b of arr) if (!fn(b)) return false;
  return true;
}

// ── Unlock GATT + leggi slot 0 ────────────────────────────────
async function unlockAndReadSlot(device: Device): Promise<string> {
  const connected = await device.connect();
  await connected.discoverAllServicesAndCharacteristics();

  // 1. Leggi lock state
  const lockStateChar = await connected.readCharacteristicForService(SERVICE_UUID, CHAR_LOCK_STATE);
  const lockState = base64ToBytes(lockStateChar.value ?? '')[0];
  console.log('>>> lock state:', lockState);

  if (lockState !== 0x01 && lockState !== 0x02) {
    // 2. Leggi nonce
    const nonceChar = await connected.readCharacteristicForService(SERVICE_UUID, CHAR_UNLOCK);
    const nonce = base64ToBytes(nonceChar.value ?? '');
    console.log('>>> nonce:', Array.from(nonce).map(b=>b.toString(16).padStart(2,'0')).join(' '));

    // 3. AES-128-ECB(MD5(password), nonce)
    const key = computeMd5(PASSWORD);
    const response = computeAes128ecb(key, nonce);

    // 4. Scrivi risposta
    await connected.writeCharacteristicWithResponseForService(SERVICE_UUID, CHAR_UNLOCK, bytesToBase64(response));
    await new Promise(r => setTimeout(r, 400));

    // 5. Verifica unlock
    const newStateChar = await connected.readCharacteristicForService(SERVICE_UUID, CHAR_LOCK_STATE);
    const unlocked = base64ToBytes(newStateChar.value ?? '')[0];
    console.log('>>> unlock result:', unlocked);
    if (unlocked !== 0x01 && unlocked !== 0x02) throw new Error('Unlock fallito — password errata?');
  }

  // 6. Seleziona slot 0
  await connected.writeCharacteristicWithResponseForService(SERVICE_UUID, CHAR_ACTIVE_SLOT, bytesToBase64(new Uint8Array([0])));
  await new Promise(r => setTimeout(r, 200));

  // 7. Leggi slot 0
  const slotChar = await connected.readCharacteristicForService(SERVICE_UUID, CHAR_RW_SLOT);
  const slotData = base64ToBytes(slotChar.value ?? '');
  console.log('>>> slot 0 raw:', Array.from(slotData).map(b=>b.toString(16).padStart(2,'0')).join(' '));

  await connected.cancelConnection();
  return decodeEddystoneUrl(slotData);
}

// ── Hook principale ───────────────────────────────────────────
export function useBle(): UseBleReturn {
  const [status, setStatus] = useState<BleStatus>('idle');
  const [beaconData, setBeaconData] = useState<BeaconData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const granted = await requestPermissions();
      if (!granted) { setErrorMessage('Permessi Bluetooth non concessi'); return; }
      try {
        const manager = getBleManager();
        const currentState = await manager.state();
        console.log('>>> BLE state attuale:', currentState);
        setIsBluetoothOn(currentState === State.PoweredOn);
        subscription = manager.onStateChange((state) => {
          setIsBluetoothOn(state === State.PoweredOn);
        }, false);
      } catch (e: any) {
        setErrorMessage('BLE non disponibile');
      }
    };
    init();
    return () => subscription?.remove();
  }, []);

  const scanAndConnect = useCallback(
    async (targetDeviceName?: string, targetDeviceId?: string) => {
      setErrorMessage(null);
      setBeaconData(null);
      if (!isBluetoothOn) { setStatus('error'); setErrorMessage('Bluetooth disattivato'); return; }

      let manager: ReturnType<typeof getBleManager>;
      try { manager = getBleManager(); }
      catch (e: any) { setStatus('error'); setErrorMessage('BLE non disponibile'); return; }

      setStatus('scanning');

      manager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
        if (error) { setStatus('error'); setErrorMessage(error.message); return; }
        if (!device) return;

        console.log(`>>> Dispositivo: ${device.name ?? 'SENZA NOME'} | ID: ${device.id} | RSSI: ${device.rssi}`);

        const matchById   = targetDeviceId   && device.id   === targetDeviceId;
        const matchByName = targetDeviceName && device.name === targetDeviceName;

        if (matchById || matchByName) {
          manager.stopDeviceScan();
          setStatus('connecting');

          const serviceData = device.serviceData ?? {};
          const batteryRaw  = serviceData['0000180f-0000-1000-8000-00805f9b34fb'];
          const battery     = batteryRaw ? base64ToBytes(batteryRaw)[0] : null;

          try {
            const slotMessage = await unlockAndReadSlot(device);
            setBeaconData({
              name: device.name ?? 'Sconosciuto',
              id: device.id,
              rssi: device.rssi ?? 0,
              batteryPercent: battery,
              slotMessage,
            });
            setStatus('connected');
          } catch (e: any) {
            console.log('>>> ERRORE GATT:', e.message);
            setStatus('error');
            setErrorMessage('Errore lettura beacon: ' + e.message);
          }
        }
      });

      setTimeout(() => {
        manager.stopDeviceScan();
        setStatus(prev => {
          if (prev === 'scanning') { setErrorMessage('Dispositivo non trovato'); return 'error'; }
          return prev;
        });
      }, 15000);
    },
    [isBluetoothOn]
  );

  const disconnect = useCallback(() => {
    setStatus('idle');
    setBeaconData(null);
  }, []);

  return { status, beaconData, errorMessage, isBluetoothOn, scanAndConnect, disconnect };
}