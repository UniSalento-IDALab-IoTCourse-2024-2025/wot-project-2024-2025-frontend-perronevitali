import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal,TextInput } from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import { useRouter } from 'expo-router';


export default function DeleteAreaScreen(){
    const [areaToDel,setAreaToDel] = useState(null)
    const getAreaToDel = async () =>{
        const area =JSON.parse(await AsyncStorage.getItem("infoArea"))
        console.log(area)
        setAreaToDel(area)
    }
    useEffect(()=>{
        getAreaToDel()
    },[])
    const handleCancel = async () =>{
        router.replace("/")
    }
    const router = useRouter()
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Sei sicuro di voler eliminare la seguente area?</Text>
            <View style={styles.boxMessage}>
                <Text style={styles.textbutton}>Nome: <Text style={styles.infoText}>{areaToDel?.name}</Text></Text>
                <Text style={styles.textbutton}>MAC del Beacon: <Text style={styles.infoText}>{areaToDel?.beaconMAC}</Text></Text>
                <Text style={styles.textbutton}>IP Rasperry: <Text style={styles.infoText}>{areaToDel?.ipRaspberry}</Text></Text>
                <Text style={styles.textbutton}>Soglia Temperatura: <Text style={styles.infoText}>{areaToDel?.thresholdTemperature} °C</Text></Text>
                <Text style={styles.textbutton}>Soglia Umidità: <Text style={styles.infoText}>{areaToDel?.thresholdHumidity} %</Text></Text>
                <Text style={styles.textbutton}>Soglia Pericolo: <Text style={styles.infoText}>{areaToDel?.dangerIndexThreshold}</Text></Text>
            </View>
            <View style={styles.buttonlist}>
                <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                    <Text style={styles.textbutton}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonConf}>
                    <Text style={styles.textbutton}>Elimina</Text>
                </TouchableOpacity>
            </View>
        </View>
    )

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ffa420'
  },
  boxMessage: {
        width: 340,
        //eight: 90,
        marginTop: 30,
        marginBottom: 30,
        padding: 10,
        backgroundColor: '#2c2e52',
        borderRadius: 10,
        //flexDirection: 'row',
        //alignItems: 'center',
        //justifyContent: 'space-between',
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
    width:100,
    marginLeft:15,
    marginRight:15,
    borderRadius:15
  },
  buttonConf:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width:100,
      marginLeft:15,
      marginRight:15,
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
    fontSize:24,
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
       // alignItems: 'right',
        //alignSelf: 'right',
        color: '#ffa420',
    },
    addButton:{
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
    }
});