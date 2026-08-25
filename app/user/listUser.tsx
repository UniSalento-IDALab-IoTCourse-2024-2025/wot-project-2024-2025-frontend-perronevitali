import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal,TextInput } from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import { useRouter } from 'expo-router';
export default function ListUser(){
    const router = useRouter()
    const endpointUS = API_BASE_URL+API_PORT_US
    const [users,setUsers] = useState([])
    const [noAuthWorkers,setNoAuthWorkers] = useState([])
    const comeBackToHome = () =>{
        router.replace("/")
    }
    const getUsers = async () =>{
        const token =  await AsyncStorage.getItem("token")
        const area = JSON.parse(await AsyncStorage.getItem("infoArea"))
        setNoAuthWorkers(area.unauthorizedWorkersIds)
        const url = endpointUS+"/api/users/"
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",response.ok)
            }else{
                const data = await response.json()
                const usersList = data.users.usersList
                let personalArea = []
                for (let user in usersList){
                    if(usersList[user].currentAreaId===area.id)
                        personalArea.push(usersList[user])
                }
                setUsers(personalArea)
            }
        }catch(e){
            console.log("Errore chimata API",url,":",e)
        }
    }
    useEffect(()=>{
        getUsers()
    },[])
    const getBoxStyle=(user)=>{
            switch(user.role){
                case "ADMIN":
                    return styles.boxAreaAdmin
                case "WORKER":
                    if(noAuthWorkers===null || noAuthWorkers===undefined)
                        return styles.boxAreaAuth
                    else
                        for(let i=0;i<noAuthWorkers.length;i++){
                            if(user.id===noAuthWorkers[i])
                                return styles.boxAreaAuthNot
                        }
                        return styles.boxAreaAuth
            }
        }
    return(
        <View style={styles.container}>
            <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Lista utenti nell'area</Text>
                {users?.map( (user,key)=>
                    <View style={getBoxStyle(user)} key={key}>
                        <Text style={styles.message}>Nome: <Text style={styles.infoText}>{user.nome}</Text></Text>
                        <Text style={styles.message}>Cognome: <Text style={styles.infoText}>{user.cognome}</Text></Text>
                        <Text style={styles.message}>Ruolo aziendale: <Text style={styles.infoText}>{user.role}</Text></Text>
                    </View>
                )}
                <TouchableOpacity style={styles.button} onPress={comeBackToHome} >
                    <Text style={styles.textbutton}>Torna nella home</Text>
                </TouchableOpacity>
            </ScrollView>
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
  boxAreaAdmin: {
          width: 340,
          marginTop: 10,
          marginBottom: 10,
          padding: 10,
          backgroundColor: 'blue',
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
    alignSelf: 'center',
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
    addButton:{
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
