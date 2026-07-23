import { useState,useEffect,useRef } from 'react';
import { Image } from 'expo-image';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import { RadioButton } from 'react-native-paper';
import {Divider} from "react-native-elements";
import * as Notifications from 'expo-notifications';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import BeaconService from "@/hooks/beacon-service"
import {Buffer} from "buffer";
import CryptoJS from "crypto-js";
import { PlatformConstants } from 'react-native';
import BeaconNativeScanner from '../../modules/beacon-native-scanner';
import BleManager from "react-native-ble-manager";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import {useStomp} from '@/hooks/use-stomp';

export default function HomeScreen() {
  const router = useRouter();
  const endpointUS = API_BASE_URL+API_PORT_US
  const endpointOS = API_BASE_URL+API_PORT_OS
  const [areas,setAreas] = useState([])
  const [beacons,setBeacons] = useState([])
  const [authorizedAreas,setAuthorizedAreas]  = useState([])
  const [idAreas,setIdAreas] = useState([])
  const intervalRefAreas = useRef(null);
  const intervalRefCurrArea= useRef(null);
  const [intervalID,setIntervalID] = useState(0)
  const [user,setUser] = useState(null)
  const [isModalVisible,setModalVisible] = useState(false);
  const { client, ready } = useStomp(user?.id);
  const [currentArea, setCurrentArea] = useState(null);
  const [selectedArea,setSelectedArea] = useState(null);
  const getCurrentArea = async () => {
      const currAreaID = await AsyncStorage.getItem("currAreaID")
      setCurrentArea(currAreaID)
  }
  const fetchData = async () =>{
   const token = await AsyncStorage.getItem("token")
   if(token==="" || token===null){
        router.replace("login")
        return;
   }
   setUser(JSON.parse(await AsyncStorage.getItem("user")))
   getAreas(token)
   setAuthorizedAreas(JSON.parse(await AsyncStorage.getItem("authArea")))
   //getAuthorizedAreas(token)
   intervalRefAreas.current = setInterval(() => getAreas(token), 10000)
   //intervalRefAuthAreas.current = setInterval(() => getAuthorizedAreas(token), 10000)
   intervalRefCurrArea.current = setInterval(() => getCurrentArea(), 1000)
  }
  const getAreas = async (token) =>{

      const url = endpointOS+'/api/areas/'
      try{
          const response = await fetch(url,{
              method: 'GET',
              headers:{
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+token
             }
          })
          if(!response.ok){
              console.log(response.status,": api/areas/")
              router.replace("/login")
          }else{
               const data = await response.json()
               const areas = data.areas.areasList
               areas.sort((a1,a2)=>{
                   const nameA1= a1.name.toUpperCase()
                   const nameA2= a2.name.toUpperCase()
                   if (nameA1 < nameA2) {
                       return -1;
                   }
                   if (nameA1 > nameA2) {
                       return 1;
                   }
                   return 0;
               })
               setAreas(areas)
               let idAreas = new Array()
               for( let idArea in areas){
                    const id = areas[idArea]["id"]
                    idAreas.push(id)
               }
               setIdAreas(idAreas)

               await AsyncStorage.setItem("idAreas",JSON.stringify(idAreas))
               await AsyncStorage.setItem("areas",JSON.stringify(areas))
               let zones = new Array()
               for(let area in areas){
                   //tutte le zone avranno inizializzata la potenza a 0
                   const zone = {
                       "mac": areas[area]["beaconMAC"],
                       "area": areas[area]["id"],
                       "power": 0
                   }
                   zones.push(zone)
               }
               setBeacons(zones)
          }
      }catch(e){
          console.log("Errore chiamata API GET AREAS:",e)
      }
   }
   const handleInfoArea = async (area) =>{
       await AsyncStorage.setItem("infoArea",JSON.stringify(area))
       router.push("/activity/activities")

    }
   useEffect(()=>{
     fetchData()
     return () => {
         if (intervalRefAreas.current) clearInterval(intervalRefAreas.current);
         //if (intervalRefAuthAreas.current) clearInterval(intervalRefAuthAreas.current);
         if (intervalRefCurrArea.current) clearInterval(intervalRefCurrArea.current);
     }

  },[])

  useEffect(()=>{
    if(beacons.length > 0 && ready && user?.id){
      BeaconService.startAll(beacons,user.id)
    }
  },[beacons, ready, user])

  useEffect(()=>{
    },[areas])

  useEffect(()=>{
  },[authorizedAreas])

  const handleExit = async () => router.replace('/login');

   const openModal = (area) =>{
       setModalVisible(true)
       setSelectedArea(area)
   }
   const closeModal = () =>{
       setModalVisible(false)
   }

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

  const getStatusString = (status) =>{
      switch(status){
        case 0: return "CALM";
        case 1: return "ALERT";
        case 99: return "DANGER";
        default: return "UNKNOWN";
      }
  }
  return (
      <View style={styles.container}>
        <Text style={styles.start}>Aree</Text>
        <ScrollView style={{backgroundColor:'#ffa420'}}>
        {areas?.map((area,index)=>
            <View style={authorizedAreas?.find((auth)=>auth==area.id) ? styles.boxAreaAuth : styles.boxAreaAuthNot} key={index}>
                <Text style={styles.message}> {area.name} </Text>
                <Text style={styles.textbutton}> Stato area: {getStatusString(area.status)}</Text>
                <Text style ={styles.textbutton}> Numero di lavoratori : {area.workerIdsInArea.length}</Text>
                 <View style={styles.radioContainer}>
                     <RadioButton
                         value={area.id}
                         status={currentArea === area.id ? 'checked' : 'unchecked'}
                         color="white"
                         uncheckedColor="white"
                     />
                 </View>
                <View style={styles.buttonlist}>
                    <View style={{ marginHorizontal: 20 }}>
                             <Button title="Vedi Task Area" color="#ffa420" onPress={()=>{handleInfoArea(area)}} />
                    </View>
                    <View style={{ marginHorizontal: 20 }}>
                         <Button title="Informazioni Area" color="#ffa420" onPress={()=>{openModal(area)}}/>
                    </View>
                </View>
            </View>
        )}
        <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                         <Text style={styles.closeButtonText}>X</Text>
                    </TouchableOpacity>
                    <Divider style={{ backgroundColor: '#ffa420', marginVertical: 1,  width:"30%",  alignSelf: 'center', height:5 }} />
                    <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
                    <Text style={styles.modalText}>Beacon: <Text style={styles.infoText}>{selectedArea?.beaconMAC}</Text> </Text>
                    <Text style={styles.modalText}>Temperatura: <Text style={styles.infoText}>{selectedArea?.currentTemperature}</Text> </Text>
                    <Text style={styles.modalText}>Umidità: <Text style={styles.infoText}>{selectedArea?.currentHumidity}</Text> </Text>
                </View>
            </View>
        </Modal>
         </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ffa420'
  },
  start:{
      fontSize: 30,
      fontWeight: 'bold',
      alignItems: 'left',
      alignSelf: 'left',
      color: 'white',
      marginTop:50,
      marginLeft: 10,
  },
  boxAreaAuth: {
      width: 340,
      marginTop: 10,
      marginBottom: 10,
      padding: 10,
      backgroundColor: 'green',
      borderRadius: 10,
      flexDirection: 'column',
      alignItems: 'left',
      justifyContent: 'space-between',
      position: 'relative'
  },
  boxAreaAuthNot: {
        width: 340,
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 10,
        flexDirection: 'column',
        alignItems: 'left',
        justifyContent: 'space-between',
        position: 'relative'
    },
  message:{
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white'
  },
  button:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'#ff4700',
    height: 60,
    width:200,
    borderRadius:15
  },
  buttonlog:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'red',
    height: 60,
    width:200,
    borderRadius:15
  },
  textContainer: {
      flex: 1,
  },
  hourMessage: {
      fontSize: 14,
      color: '#cfcfcf',
      marginTop: 4,
  },

  textbutton:{
    fontSize:18,
    fontWeight: 'bold',
    color:'white'
  },
  rightContainer: {
      alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
   subtitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'blue'
    },
  input: {
    width: 200,
    height: 40,
    margin: 10,
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 8,
    backgroundColor:'white'
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  checkboxContainer: {
      flexDirection: 'row',
      marginBottom: 20,
    },
  checkbox: {
      alignSelf: 'left',
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 10,
    },
  label: {
      margin: 8,
    },
  modalOverlay: {
        flex: 1,
        //backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
       backgroundColor: '#2c2e52',
       padding: 20,
       borderTopLeftRadius: 20,
       borderTopRightRadius: 20,
       minHeight: 200,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
    },
    closeButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'red',
     },
     modalText:{
         fontSize: 24,
         marginTop: 10,
         fontWeight: 'bold',
         color: 'white'
     },
    buttonlist:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
    },
    radioContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    infoText:{
        fontSize: 24,
        fontWeight: 'bold',
        alignItems: 'right',
        alignSelf: 'right',
        color: '#ffa420',
    },
});