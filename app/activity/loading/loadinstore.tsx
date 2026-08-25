import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, TextInput, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function LoadInStoreScreen(){
    const ACTION = "LOADING"
    const router = useRouter()
    const endpointOS = API_BASE_URL+API_PORT_OS
    const [stores,setStores] = useState([])
    const [areas,setAreas] = useState([])
    const [managedId,setManagedId] = useState([])
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const [quantity,setQuantity] = useState("")
    const getStores = async () =>{
        const token = await AsyncStorage.getItem("token")
        const user = JSON.parse(await AsyncStorage.getItem("user"))
        const area = JSON.parse(await AsyncStorage.getItem("managedId"))
        setManagedId(area)
        if(area){
            getStoresArea(token,area)
        }else{
            getAllStores(token)
            getAreas(token)
        }
    }
     const getAreas = async (token) =>{
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
                setAreas(areasobj)
            }
        }catch(e){
         console.log("Errore ",url,":",e)
        }
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
                for(let store in itemsList){
                    if(itemsList[store].deposito)
                        stores.push(itemsList[store])
                }
                setStores(stores)
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
                const items = []
                for(let item in itemsList){
                    if(itemsList[item].deposito)
                        items.push(itemsList[item])
                }
                setStores(items)
            }
        }catch(e){
            console.log("Errore ",e)
        }
    }
    useEffect(()=>{
        getStores()
    },[])
    const getNameArea = (idArea) =>{
        const areaChoise = areas.find(({id})=>id===idArea)
        if(areaChoise)
            return areaChoise.name
    }
    const handleCancel = async () =>{
        router.replace("/")
    }
    const handleProceed = async () =>{
            if(!selectedItem)
                alert("Seleziona almeno un item!")
            else if(quantity===null || quantity==="")
                alert("Inserisci la quantità da caricare!")
            else{
                const store = stores.find(({id})=>id===selectedItem)
                const requestedQuantity = Number(quantity)
                if(isNaN(requestedQuantity) || requestedQuantity<=0)
                    alert("La quantità deve essere un numero maggiore di zero!")
                else if(requestedQuantity>store.quantity)
                    alert("Quantità richiesta superiore alla giacenza disponibile ("+store.quantity+" "+store.unit+")!")
                else{
                    const bodyTask = {
                        "operationType": ACTION,
                        "itemId": selectedItem,
                        "originAreaId": store.areaId,
                        "destinationAreaId": null,
                        "substanceCas": store.substanceCas,
                        "substanceName": store.substanceName,
                        "workerIds": [],
                        "substanceQuantity": requestedQuantity
                    }
                    await AsyncStorage.setItem("bodyTask",JSON.stringify(bodyTask))
                    await AsyncStorage.setItem("typeLoading","store")
                    router.replace("/user/listWorker")
                }
            }
    }
    return(
        <View style={styles.container}>
            <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Carica in un deposito</Text>
            {stores.map((store,key)=>
                <View style={styles.boxMessage} key={key}>
                    <Text style={styles.message}>Nome:<Text style={styles.infoText}>{store?.nome}</Text></Text>
                    <Text style={styles.message}>Sostanza:<Text style={styles.infoText}>{store?.substanceName} </Text></Text>
                    <Text style={styles.message}>Quantità:<Text style={styles.infoText}>{store?.quantity} {store?.unit}</Text></Text>
                    {!managedId ? (
                        <Text style={styles.message}>
                            Area:<Text style={styles.infoText}>{getNameArea(store?.areaId)}</Text>
                        </Text>
                    ) : null}
                    <View style={styles.radioContainer}>
                        <RadioButton
                            value={String(store.id)}
                            status={selectedItem === store.id ? 'checked' : 'unchecked'}
                            onPress={() => setSelectedItem(store.id)}
                            color="white"
                            uncheckedColor="white"
                        />
                    </View>
                </View>
            )}
            {selectedItem ? (
                <View style={{alignSelf:"center"}}>
                    <Text style={styles.message}>Quantità da caricare</Text>
                    <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
                </View>
            ) : null}
            <View style={styles.buttonlist}>
                <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                    <Text style={styles.textbutton}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonCreate} onPress={handleProceed}>
                    <Text style={styles.textbutton}>Procedi</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#ffa420',
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
      flex: 1,
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
      fontSize: 18,
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
    width:140,
    marginRight:10,
    borderRadius:15
  },
  buttonCreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width:140,
      marginLeft:10,
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
        fontSize: 20,
        fontWeight: 'bold',
        alignItems: 'right',
        alignSelf: 'right',
        color: '#ffa420',
    },
    boxMessage: {
          width: 340,
          marginTop: 10,
          marginBottom: 10,
          alignSelf:"center",
          padding: 10,
          backgroundColor: '#2c2e52',
          borderRadius: 10,
      },
      message:{
          fontSize: 20,
          fontWeight: 'bold',
          color: 'white'
      },
});