import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal,Alert } from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import { useRouter } from 'expo-router'
import EvilIcons from '@expo/vector-icons/EvilIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
export default function InventoryScreen(){
    const FIRST_ELEMENT="Nessun area"
    const [managedAreas,setManagedAreas] = useState([])
    const [selected,setSelected] = useState('');
    const [stores,setStores] = useState([])
    const [items,setItems] = useState([])
    const [nameAreas,setNameAreas] = useState([])
    const endpointOS = API_BASE_URL+API_PORT_OS
    const router = useRouter()
    const getItems = async (id) =>{
        const token = await AsyncStorage.getItem("token")
        const url = endpointOS+'/api/items?areaId='+id
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log(response.status)
            }else{
                const data = await response.json()
                const itemsData = data.items.itemsList
                let stores = []
                let items = []
                for(let item in itemsData){
                    let object = itemsData[item]
                    if(object.deposito)
                        stores.push(object)
                    else
                        items.push(object)
                }
                setItems(items)
                setStores(stores)

            }
        }catch(e){
            console.log("Errore API /api/items?areaId=",e)
        }
    }
    useEffect(() => {
      if (selected) {
        console.log("Nuovo valore:", selected);
        if(selected===FIRST_ELEMENT){
            setItems([])
            setStores([])
            return;
        }
        const selectedArea = managedAreas.find(({name})=>name===selected)
        getItems(selectedArea.id)
      }
    }, [selected]);
    const getInventoryAreas = async () =>{
        const managedAreas = JSON.parse(await AsyncStorage.getItem("manageAreas"))
        console.log(JSON.stringify(managedAreas,'',2))
        let areaNames = []
        setManagedAreas(managedAreas)
        areaNames.push(FIRST_ELEMENT)
        for( let managedArea in managedAreas){
            const areaName =managedAreas[managedArea].name
            console.log(areaName)
            areaNames.push(areaName)
        }
        setNameAreas(areaNames)

    }
    const goToItemOpt = async () =>{
        router.push("/item/itemopt")
    }
    useEffect(()=>{
        getInventoryAreas()
    },[])
    const deleteItem = async (id) =>{
        const url = endpointOS +'/api/items/'+id
        const token = await AsyncStorage.getItem("token")
        try{
            const response = await fetch(url,{
                method: 'DELETE',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                alert("Eliminazione eseguita con successo!")
                getInventoryAreas()
                setSelected('')
            }

        }catch(e){
            console.log("Errroe DELETE /api/items/id:",e)
        }
    }
    const confirmDeleteItem = (id) =>{
        Alert.alert(
            "Conferma eliminazione",
            "Sei sicuro di voler eliminare questo elemento?",
            [
                { text: "Annulla", style: "cancel" },
                { text: "Elimina", style: "destructive", onPress: () => deleteItem(id) }
            ]
        )
    }
    return(
        <View style={styles.container}>
        <ScrollView style={{backgroundColor:'#ffa420'}} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={styles.containerSup}>
                <Text style={styles.start}>
                    Gestione Inventario{"\t"}{"\t"}{"\t"}
                    <TouchableOpacity style={styles.addButton} onPress={goToItemOpt}>
                        <AntDesign name="plus" size={24} color="white" />
                    </TouchableOpacity>
                </Text>
                <Text style={styles.selectArea}>Seleziona area:{"\n"} </Text>
                <SelectList data={nameAreas} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un' area" value={selected} setSelected={setSelected} save='key'/>
                <Divider style={{ backgroundColor: '#ccc', marginVertical: 10, width:320 }} />
                <Text style={styles.selectAreaData}>Depositi:{"\n"} </Text>
                {stores?.map((store,key)=>
                    <View style={styles.containerMap} key={key}>
                        <View style={styles.boxMessage}>
                            <Text style={styles.message}>Nome: <Text style={styles.infoText}>{store.nome}</Text></Text>
                            <Text style={styles.message}>Sostanza: <Text style={styles.infoText}>{store.substanceName}</Text></Text>
                            <Text style={styles.message}>Quantità: <Text style={styles.infoText}> {store.quantity} {store.unit} </Text></Text>
                        </View>
                        <TouchableOpacity style={styles.boxAreaAuthNot} onPress={()=>{confirmDeleteItem(store.id)}}>
                            <EvilIcons name="trash" size={32} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                <Divider style={{ backgroundColor: '#ccc', marginVertical: 10, width:320 }} />
                <Text style={styles.selectAreaData}>Item:{"\n"} </Text>
                {items?.map((item,key)=>
                    <View style={styles.containerMap} key={key}>
                        <View style={styles.boxMessage}>
                            <Text style={styles.message}>Nome: <Text style={styles.infoText}>{item.nome}</Text></Text>
                            <Text style={styles.message}>Sostanza: <Text style={styles.infoText}>{item.substanceName}</Text></Text>
                            <Text style={styles.message}>Quantità: <Text style={styles.infoText}> {item.quantity} {item.unit} </Text></Text>
                        </View>
                        <TouchableOpacity style={styles.boxAreaAuthNot} onPress={()=>{confirmDeleteItem(item.id)}}>
                            <EvilIcons name="trash" size={32} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
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
    backgroundColor:'#ffa420'
  },
  containerMap: {
      alignItems: 'left',
      alignSelf: 'left',
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor:'#ffa420'
  },

  boxMessage: {
    width: 250,
    height: 100,
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#2c2e52',
    borderRadius: 10,
    flexDirection: 'column',
    alignSelf: 'left',
    alignItems: 'left',
    justifyContent: 'left',
  },
  containerSup : {
      flex: 1,
      marginTop: 5,
      justifyContent: 'top',
      alignItems: 'center',
  },
  start:{
      fontSize: 30,
      fontWeight: 'bold',
      alignItems: 'left',
      alignSelf: 'left',
      color: 'white',
      marginTop:50,
      marginLeft: 5,
  },
  selectArea:{
      fontSize: 24,
      fontWeight: 'bold',
      alignItems: 'left',
      alignSelf: 'left',
      color: 'white',
      marginTop:20,
      marginLeft: 5,
  },
  selectAreaData:{
      fontSize: 24,
      fontWeight: 'bold',
      alignItems: 'left',
      alignSelf: 'left',
      color: 'white',
      marginTop:10,
      marginLeft: 5,
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
        width: 50,
        height: 100,
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        //alignSelf: 'right',
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
        fontSize: 18,
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
