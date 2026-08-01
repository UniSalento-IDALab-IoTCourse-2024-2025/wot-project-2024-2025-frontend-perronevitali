import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, TextInput, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import {SelectList} from 'react-native-dropdown-select-list';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function UpdateStoreScreen(){
    const endpointOS = API_BASE_URL+API_PORT_OS
    const router = useRouter()
    const [selectedStore,setSelectedStore] = useState(null)
    const [substance,setSubstance] = useState(null)
    const [startQuantity,setStartQuantity] = useState(null)
    const [unit,setUnit] = useState(null)
    const [final,setFinal] = useState(null)
    const [storesName,setStoresName] = useState([])
    const [stores,setStores] = useState([])
    const handleCancel = async () =>{
        router.replace("/")
    }
    const fetchData = async () =>{
        const token = await AsyncStorage.getItem("token")
        const managed = JSON.parse(await AsyncStorage.getItem("managedId"))
        if(managed)
            getStoresArea(token,managed)
        else
            getAllStores(token)
    }

    const getAllStores = async (token) =>{
        const url = endpointOS+"/api/items/"
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
                const stores = []
                const storesName = []
                for(let store in itemsList){
                    if(itemsList[store].deposito){
                        stores.push(itemsList[store])
                        storesName.push(itemsList[store].nome)
                    }
                }
                setStores(stores)
                setStoresName(storesName)
            }
        }catch(e){
            console.log("Errore chiamata api",url,":",e)
        }
    }
    const getStoresArea = async (token,area) =>{
        const url = endpointOS+'/api/items?areaId='+area
        let storeArea = []
        try{
            const response = await fetch(url,{
                method:'GET',
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
                const itemName = []
                for(let item in itemsList){
                    if(itemsList[item].deposito){
                        storeArea.push(itemsList[item])
                        itemName.push(itemsList[item].nome)
                    }
                }
                setStores(storeArea)
                setStoresName(itemName)
            }
        }catch(e){
            console.log("Errore ",e)
        }
    }
    useEffect(()=>{
        fetchData()
    },[])
    useEffect(()=>{
        const store = stores.find(({nome})=>nome===selectedStore)
        console.log(store)
        if(store){
            setSubstance(store.substanceName)
            setStartQuantity(""+store.quantity)
            setUnit(store.unit)
        }
     },[selectedStore])
    const handleUpdate = async () =>{
        if((selectedStore===null || selectedStore==="") || (substance===null || substance==="") || (startQuantity==="" || startQuantity==="") || (unit===null || unit===""))
            alert("Per favore seleziona un area!")
        if(final===null || final==="")
            alert("Seleziona la quantità finale!")
        else{
            const store = stores.find(({nome})=>nome===selectedStore)
            store.quantity=final
            const url = endpointOS+'/api/items/'+store.id
            const token = await AsyncStorage.getItem("token")
            try{
                const response = await fetch(url,{
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+token
                    },
                    body: JSON.stringify(store)
                })
                if(!response.ok){
                    console.log("Errore",response.status)
                }else{
                    const data = await response.json()
                    if(data.result===0){
                        alert("Aggiornamento quantità eseguito con suceesso!!")
                        router.push("/")
                    }
                }
            }catch(e){
                console.log("Errore",url,":",e)
            }
        }
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Aggiorna deposito </Text>
            <View>
                <Text style={styles.text}>{"\n"}Deposito {"\n"}</Text>
                <SelectList data={storesName} style={{width:500, height:500, marginVertical:10,}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un deposito" value={selectedStore} setSelected={setSelectedStore} save='key'/>
                <Text style={styles.text}>{"\n"}Sostanza {"\n"}</Text>
                <TextInput style={styles.input} editable={false}  value={substance}/>
                <Text style={styles.text}>{"\n"}  Quantità iniziale:</Text>
                <TextInput style={styles.input} editable={false} value={startQuantity} />
                <Text style={styles.text}>  Unità di misura</Text>
                <TextInput style={styles.input} editable={false} value={unit} />
                <Text style={styles.text}>{"\n"}  Quantità finale:</Text>
                <TextInput style={styles.input} keyboardType="number-pad" value={final} onChangeText={setFinal} />
                <View style={styles.buttonlist}>
                    <TouchableOpacity style={styles.buttonlog} onPress={handleCancel} >
                        <Text style={styles.textbutton}>Annulla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonCreate} onPress={handleUpdate}>
                        <Text style={styles.textbutton}>Aggiorna </Text>
                    </TouchableOpacity>
                </View>
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
    marginLeft: 10,
    marginRight: 10,
  },
  buttonCreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width:100,
      borderRadius:15,
      marginLeft: 10,
      marginRight: 10,
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
        marginTop: 20
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