import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal,TextInput } from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import { useRouter } from 'expo-router';
export default function EditArea(){
    const router = useRouter()
    const comeToOption= async ()=>{
        router.push("/area/areaopt")
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Modifica area </Text>
             <Text style={styles.text}>  Nome</Text>
             <TextInput  style={styles.input}/>
             <Text style={styles.text}> MAC del Beacon</Text>
             <View style={styles.macContainer}>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputMAC} maxLength={2}/>
                    <Text style={styles.separator}>:</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputMAC} maxLength={2}/>
                    <Text style={styles.separator}>:</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputMAC} maxLength={2}/>
                    <Text style={styles.separator}>:</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputMAC} maxLength={2}/>
                    <Text style={styles.separator}>:</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputMAC} maxLength={2}/>
                </View>
             </View>
             <Text style={styles.text}> Indirizzo IP</Text>
             <View style={styles.macContainer}>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputIP}maxLength={3}/>
                    <Text style={styles.separator}>.</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputIP}maxLength={3}/>
                    <Text style={styles.separator}>.</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputIP}maxLength={3}/>
                    <Text style={styles.separator}>.</Text>
                </View>
                <View style={styles.macPart}>
                    <TextInput style={styles.inputIP}maxLength={3}/>
                </View>
             </View>
             <View style={styles.buttonlist}>
                <TouchableOpacity style={styles.buttonlog} onPress={comeToOption}>
                    <Text style={styles.textbutton}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttoncreate}>
                    <Text style={styles.textbutton}>Modifca dati Area</Text>
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
  start: {
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: 'white',
    marginTop: 50,
    marginLeft: 10,
  },
 text: {
   fontSize: 20,
   fontWeight: 'bold',
   alignSelf: 'flex-start',
   color: 'white',
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
    borderRadius:15,
    marginRight: 30
  },
  buttoncreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width:150,
      borderRadius:15,
      marginLeft: 30
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
    backgroundColor:'white',
    alignSelf:'left'
  },
  inputMAC: {
      width: 35,
      height: 40,
      margin: 9,
      borderWidth: 1,
      borderRadius: 5,
      //paddingLeft: 8,
      backgroundColor:'white'
  },
  inputIP: {
        width: 60,
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
        marginTop: 10
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
    macContainer:{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },
    macPart: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    separator: {
      fontSize: 22,
      fontWeight: 'bold',
      color: 'white',
      marginHorizontal: 2,
      textAlignVertical: 'center',
      includeFontPadding: false,
    },
});