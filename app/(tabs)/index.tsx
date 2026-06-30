import { useState,useEffect } from 'react';
import { Image } from 'expo-image';
import { Platform, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import BeaconService from "@/hooks/beacon-service"
import {Buffer} from "buffer";
import CryptoJS from "crypto-js";
import { BleManager} from 'react-native-ble-plx';
import { NativeModules } from 'react-native';
import { PlatformConstants } from 'react-native';
import BeaconNativeScanner from '../../modules/beacon-native-scanner';


export default function HomeScreen() {
  const router = useRouter();

  //const bleManager = new BleManager();
  const NAME="BlueUp-01-021238";
  // Function to start scanning BLE devices
  function startScanning() {
      BeaconService.startScanning()
  }
  // Stop scanning if necessary
  function stopScanning() {

    BeaconService.stopScanning();
  }

  //const { status, connectedDevice, beaconData, errorMessage, isBluetoothOn, scanAndConnect, disconnect } = useBle();

  const handleExit = async () => router.replace('/login');

  const testNotifica = async () => {
    try {
      const { status: permStatus } = await Notifications.requestPermissionsAsync();
      if (permStatus !== 'granted') { alert('Permessi negati: ' + permStatus); return; }
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Test Notifica IoT', body: 'La notifica funziona correttamente!',sound:'alarm.wav' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                          seconds: 1,
                          channelId: 'default', },
      });
      alert('Notifica inviata!');
    } catch (e) { alert('Errore: ' + e); }
  };

  const simulaNotificaRemota = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Alert IoT',
        body: 'Temperatura sensore #1 troppo alta: 85°C!',
        data: { sensorId: 1, valore: 85 },
        sound: 'alarm.wav',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: 'default',
      },
    });
    alert("Notifica in arrivo tra 5 secondi... metti l'app in background!");
  };

  const handleBlePress=() => {
      startScanning()
  }

  const testConversion = () =>{
      /*const string = "ciao sono Ringo"
      const encode = new Buffer(string).toString("base64")
      console.log(string,"-",encode)
      const string2 ="Y2lhbyBhIHR1dHRpIHNvbm8gUmluZ28="
      const original = new Buffer(string2,"base64").toString("ascii")
      console.log(string2,"-",original)
      console.log(string.match(/ringo/gi))
      const number="0"
      const hex = Buffer(number).toString("hex")
      console.log(number,"==",hex)*/
      const enc = CryptoJS.MD5("Ringo").toString(CryptoJS.enc.Hex)
      console.log(enc)
      var options = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
      const key = CryptoJS.enc.Utf8.parse("Ringo Dinyan")
      const data = CryptoJS.enc.Utf8.parse("DunCANE")
      const encrypted = CryptoJS.AES.encrypt(data,key,options)

      console.log(encrypted.ciphertext.toString())
      var decrypted = CryptoJS.AES.decrypt(encrypted,key, options);
      var plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      console.log("decrypted ", plaintext);
  }

  /*const bleButtonLabel = () => {
    switch (status) {
      case 'scanning':   return 'Scansione...';
      case 'connecting': return 'Connessione...';
      case 'unlocking':  return 'Autenticazione...';
      case 'reading':    return 'Lettura slot...';
      case 'connected':  return 'Disconnetti';
      default:           return 'Connetti BLE';
    }
  };


  const handleBlePress = () => {
    if (status === 'connected') {
      disconnect();
    } else {
      scanAndConnect('BlueUp-01-021238');
    }
  };

  // Descrizione leggibile del valore Eddystone 0x8800
  const eddystoneLabel = (val: number | null) => {
    if (val === null) return 'N/D';
    switch (val) {
      case 0x01: return 'Evento 1';
      case 0x02: return 'Evento 2';
      case 0x03: return 'In movimento';
      default:   return `0x${val.toString(16).toUpperCase()}`;
    }
  };*/

  return (
      <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
              <Image
                source={require('@/assets/images/partial-react-logo.png')}
                style={styles.reactLogo}
              />
            }>

            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Welcome!</ThemedText>
              <HelloWave />
            </ThemedView>

            <ThemedView style={styles.stepContainer}>
              <ThemedText type="subtitle">Bluetooth</ThemedText>

              <TouchableOpacity onPress={handleBlePress} style={styles.buttonBle}>
                <Text style={styles.textbutton}>
                    Scansione
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={stopScanning} style={styles.buttonBle}>
                    <Text style={styles.textbutton}>
                                  Stoppa scandsione
                    </Text>
              </TouchableOpacity>

            </ThemedView>

            {/* ── Sezione Notifiche ─────────────────────────────────── */}
            <ThemedView style={styles.stepContainer}>
              <ThemedText type="subtitle">Notifiche</ThemedText>

              <TouchableOpacity onPress={testNotifica} style={styles.buttonNotifica}>
                <Text style={styles.textbutton}>Testa Notifica</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleExit} style={styles.button}>
                <Text style={styles.textbutton}>Esci</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={simulaNotificaRemota} style={styles.buttonNotifica}>
                <Text style={styles.textbutton}>Simula Notifica Remota</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={testConversion} style={styles.buttonNotifica}>
                <Text style={styles.textbutton}>Test conversione</Text>
              </TouchableOpacity>
            </ThemedView>
          </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepContainer: { gap: 8, marginBottom: 8 },
  reactLogo: { height: 178, width: 290, bottom: 0, left: 0, position: 'absolute' },
  button: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'green', height: 60, width: 200, borderRadius: 15,
  },
  buttonNotifica: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#007AFF', height: 60, width: 200, borderRadius: 15,
  },
  buttonBle: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#5856D6', height: 60, width: 200, borderRadius: 15,
  },
  textbutton: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardRow: { color: '#aaa', fontSize: 14 },
  cardValue: { color: '#fff', fontWeight: 'bold' },
});