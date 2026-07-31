import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import { List } from 'react-native-paper';
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExternOptionScreen(){
    const [typeload,setTypeLoad] = useState("")
    const verbLoad="Caricare"
    const verbLoad2="Carica"
    const verbUnload="Scaricare"
    const verbUnload2="Scarica"
    const [verb1,setVerb1] = useState("")
    const [verb2,setVerb2] = useState("")
    const getType = async () =>{
        const typel = await AsyncStorage.getItem("typeload")
        setTypeLoad(typel)
        if(typel==="load"){
            setVerb1(verbLoad)
            setVerb2(verbLoad2)
        }else{
            setVerb1(verbUnload)
            setVerb2(verbUnload2)
        }
    }
    useEffect(()=>{
        getType()
    },[])
    const router = useRouter()
    const comeBackToHome = async () => {
        router.replace("/")
    }
    const goToItem = () =>{
        if(typeload==="load"){
            router.replace("/activity/loading/loaditem")
        }else{
            router.replace("/activity/unloading/unloaditem")
        }
    }
    const goToStore = () =>{
        if(typeload==="load"){
            router.replace("/activity/loading/loadinstore")
        }else{
            router.replace("/activity/unloading/unloadinstore")
        }
    }
    return(
        <View style={styles.container}>
                <Text style={styles.start}>Seleziona cosa  vuoi {verb1}</Text>
                <List.Section>
                    <List.Item
                        title={verb2+" item"}
                        style={styles.buttonSup}
                        titleStyle={styles.modalText}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={goToItem}
                    />
                    <List.Item
                        title={verb2+" sostanza da deposito"}
                        style={styles.buttonInf}
                        titleStyle={styles.modalText2}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={goToStore}
                    />
               </List.Section>
               <TouchableOpacity style={styles.button} onPress={comeBackToHome}>
                    <Text style={styles.textbutton}>Torna alla home</Text>
               </TouchableOpacity>
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
  buttonCenter:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'gold',
    height: 60,
    width:300,
    //borderRadius:15
  },
  buttonSup:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'gold',
      height: 60,
      width:300,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
  },
  buttonInf:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'gold',
      height: 60,
      width:300,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
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
         fontWeight: 'bold',
         color: 'white'
     },
    modalText2:{
        fontSize: 18,
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