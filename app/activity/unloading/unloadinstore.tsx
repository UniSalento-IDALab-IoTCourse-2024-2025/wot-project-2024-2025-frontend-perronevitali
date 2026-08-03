import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, TextInput, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import {SelectList} from 'react-native-dropdown-select-list';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function UnloadInStoreScreen(){
    const ACTION = "UNLOADING"
    const router = useRouter()
    const endpointOS = API_BASE_URL+API_PORT_OS
    const [managed,setManaged] = useState("")
    const [areasName,setAreaNames] = useState([])
    const [areas,setAreas] = useState([])
    const [storesName,setStoreName] = useState([])
    const [stores,setStores] = useState([])
    const [start,setStart] = useState("")
    const [store,setStore] = useState("")
    const [selectableStores,setSelecatable] = useState([])
    const [selectableNames,setSelecatableNames] = useState([])
    const [quantity,setQuantity] = useState("")
    const fetchData = async () =>{
        getStores()
        const managed = JSON.parse(await AsyncStorage.getItem("managedId"))
        setManaged(managed)
        if(managed){
            const area =await getArea(managed)
            const body={
                "id": area.id,
                "name": area.name
            }
            setAreas([body])
            setAreaNames([area.name])
        }else
            getAreas()
    }
    const getStores = async () =>{
        const token = await AsyncStorage.getItem("token")
        const user = JSON.parse(await AsyncStorage.getItem("user"))
        const area = JSON.parse(await AsyncStorage.getItem("managedId"))
        if(area){
            getStoresArea(token,area)
        }else{
            getAllStores(token)
        }
    }
    const getStoresArea = async (token,area) =>{
        const url = endpointOS+'/api/items?areaId='+area
        let itemArea = []
        try{
            const response = await fetch(url,{
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                const data = await response.json()
                const itemsList = data.items.itemsList
                let items=[]
                let names=[]
                for(let item in itemsList){
                    if(itemsList[item].deposito){
                        items.push(itemsList[item])
                        names.push(itemsList[item].nome)
                    }
                }
                setStores(items)
                //setSelecatable(items)
                setStoreName(names)
                //setSelecatableNames(names)
            }
        }catch(e){
            console.log("Errore ",e)
        }
    }
    const getArea = async (managed) =>{
        const token =  await AsyncStorage.getItem("token")
        const url = endpointOS+'/api/areas/'+managed
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore /api/areas/"+managed,response.status)
                return null
            }else{
                const data = await response.json()
                if(data.result===0){
                    const area = data.areas.areasList[0]
                    return area
                }else{
                    return null
                }
            }
        }catch(e){
            console.log("Errore chiamata  API /api/areas/:"+managed,e)
            return null
        }
    }

    const getAreas = async () =>{
        const token =  await AsyncStorage.getItem("token")
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
    const getAllStores = async (token) =>{
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
                let stores = []
                let storesName = []
                for(let item in itemsList){
                    if(itemsList[item].deposito){
                        storesName.push(itemsList[item].nome)
                        stores.push(itemsList[item])
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
    useEffect(()=>{
        const areaChoise = areas.find(({name})=>name===start)
        let newstores=[]
        let names=[]
        for(let store in stores){
            if(areaChoise.id===stores[store].areaId){
                newstores.push(stores[store])
                names.push(stores[store].nome)
            }
        }
        setSelecatable(newstores)
        setSelecatableNames(names)
    },[start])
    const handleCancel = () =>{
        router.replace("/")
    }
    const handleProceed = async () =>{
        if((start===null || start==="") || (store===null || store==="") || (quantity===null || quantity===""))
            alert("Per favore compila tutti i campi!")
        else{
            const areaChoise = areas.find(({name})=>name===start)
            const store = selectableStores.find(({name})=>name===store)
            const bodyTask = {
                "operationType": ACTION,
                "itemId": store.id,
                "originAreaId": null,
                "destinationAreaId": store.areaId,
                "substanceCas": store.substanceCas,
                "substanceName": store.substanceName,
                "workerIds": [],
                "substanceQuantity": quantity
            }
            await AsyncStorage.setItem("typeUnloading","store")
            await AsyncStorage.setItem("bodyTask",JSON.stringify(bodyTask))
            router.replace("/user/listWorker")
        }
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Scarica in un deposito </Text>
            <View>
                <Text style={styles.text}> Area di partenza</Text>
                <SelectList data={areasName} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un' area" value={start} setSelected={setStart} save='key'/>
                <Text style={styles.text}> Deposito</Text>
                <SelectList data={selectableNames} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un deposito" value={store} setSelected={setStore} save='key'/>
                <Text style={styles.text}> Quantità</Text>
                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
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