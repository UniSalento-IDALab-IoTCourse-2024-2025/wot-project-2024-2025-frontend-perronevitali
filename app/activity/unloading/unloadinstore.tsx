import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, TextInput, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import {SelectList} from 'react-native-dropdown-select-list';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function UnloadInStoreScreen(){

    const router = useRouter()
    const endpointOS = API_BASE_URL+API_PORT_OS
    const [areasName,setAreaNames] = useState([])
    const [areas,setAreas] = useState([])
    const [storesName,setStoreName] = useState([])
    const [stores,setStores] = useState([])
    const [start,setStart] = useState("")
    const [store,setStore] = useState("")
    const fetchData = async () =>{
        const areas = JSON.parse(await AsyncStorage.getItem("managedIds"))
        const token = await AsyncStorage.getItem("token")
        if(areas[0]){
            for(let area in areas){

            }

        }else{
            getAllAreas(token)
            getAllItems(token)
        }
    }
    const getAllAreas = async (token) =>{
        const url = endpointOS+'/api/areas/'

        try{
            const response = await fetch(url,{
                method : 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                const data = await response.json()
                const areas = data.areas.areasList
                let names = []
                let areasobj = []
                for(let area in areas){
                    const name = areas[area].name
                    const id = areas[area].id
                    const bodyArea = {
                        "id": id,
                        "name": name
                    }
                    names.push(name)
                    areasobj.push(bodyArea)
                }
            setAreaNames(names)
            setAreas(areasobj)
            }
        }catch(e){
            console.log("Errore ",url,":",e)
        }
    }
    const getAllItems = async (token) =>{
        const url = endpointOS+'/api/items/'
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                const data = await response.json()
                const itemsList = data.items.itemsList
                console.log(JSON.stringify(itemsList[0],'',2))
                let stores = []
                let storesName = []
                for(let item in itemsList){
                    if(itemsList[item].deposito){
                        const bodyStore = {
                            "id": itemsList[item].id,
                            "name": itemsList[item].nome
                        }
                        storesName.push(itemsList[item].nome)
                        stores.push(bodyStore)
                    }
                }
                setStores(stores)
                setStoreName(storesName)
            }
        }catch(e){
            console.log("Errore chiamata api",url,":",e)
        }
    }
    useEffect(()=>{
        fetchData()
    },[])
    const handleCancel = () =>{
        router.replace("/")
    }
    const handleProceed = async () =>{
        router.replace("/user/listWorker")
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Scarica in un deposito </Text>
            <View>
                <Text style={styles.text}> Area di partenza</Text>
                <SelectList data={areasName} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un' area" value={start} setSelected={setStart} save='key'/>
                <Text style={styles.text}> Deposito</Text>
                <SelectList data={storesName} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un deposito" value={store} setSelected={setStore} save='key'/>
                <Text style={styles.text}> Quantità</Text>
                <TextInput style={styles.input}  />
            </View>
            <View style={styles.buttonlist}>
                <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                    <Text style={styles.textbutton}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreate} onPress={handleProceed}>
                    <Text style={styles.textbutton}>Procedi</Text>
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
    text:{
            fontSize: 18,
            fontWeight: 'bold',
            color: 'white',
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
    width:125,
    marginRight:10,
    borderRadius:15
  },
  buttonCreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width: 125,
      marginTop:10,
      marginBottom:10,
      marginLeft:10,
      marginRight:10,
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