import { useState,useEffect,useRef } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,ScrollView,View,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import Feather from '@expo/vector-icons/Feather';
import {SelectList} from 'react-native-dropdown-select-list';
import {useStomp} from '@/hooks/use-stomp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function ShiftScreen() {
    const ACTION = "TRANSFER"
    const endpointOS = API_BASE_URL+API_PORT_OS
    const router = useRouter()
    const [areaNames,setAreaNames] = useState([])
    const [areas,setAreas] = useState([])
    const [items,setItems] = useState([])
    const [selected,setSelected] = useState("")
    const [itemsArea,setItemsArea] = useState([])
    const [managedId,setManagedId] = useState("")
    const [idArea,setIdArea] = useState("")
    const [warning,setWarning] = useState("")
    const [selectedItem, setSelectedItem] = useState<number | null>(null);
    const fetchData = async () =>{
         const token = await AsyncStorage.getItem("token")
         getAreas(token)
         getItems(token)
    }
    const getItems = async (token) =>{
        let url = endpointOS+'/api/items/'
        const area = JSON.parse(await AsyncStorage.getItem("managedId"))
        setManagedId(area)
        getAllItems(token,url)
    }
    const getAllItems = async (token,url) =>{
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
                const items = []
                for(let item in itemsList)
                    items.push(itemsList[item])
                setItems(items)
            }
        }catch(e){
            console.log("Errore chiamata api",url,":",e)
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
                setAreaNames(names)
                setAreas(areasobj)
            }
        }catch(e){
            console.log("Errore ",url,":",e)
        }
    }
    const handleCancel = () =>{
        router.push("/")
    }
    const handleProceed = async () =>{
            if((selected===null || selected===""))
                alert("Per favore seleziona un area!")
            else if((selectedItem===null || selectedItem===""))
                alert("Seleziona un item!")
            else{
                const areaChoise = areas.find(({name})=>name===selected)
                const item = itemsArea.find(({id})=>id===selectedItem)
                let destination = areaChoise.id
                let origin = item.areaId
                const bodyTask = {
                    "operationType": ACTION,
                    "itemId": selectedItem,
                    "originAreaId": origin,
                    "destinationAreaId": destination,
                    "substanceCas": item.substanceCas,
                    "substanceName": item.substanceName,
                    "workerIds": []
                }
                await AsyncStorage.setItem("bodyTask",JSON.stringify(bodyTask))
                router.replace("/user/listWorker")
            }
    }
    useEffect(()=>{
        fetchData()
    },[])
    const getItemsArea =  (area) =>{
        let itemsArea = []
        for(let item in items){
            if(items[item].areaId===area){
                itemsArea.push(items[item])
           }
        }
        setItemsArea(itemsArea)
    }
    const getItemsFromOtherAreas =  (area) =>{
        let itemsArea = []
        for(let item in items){
            if(items[item].areaId!==area){
                itemsArea.push(items[item])
            }
        }
        setItemsArea(itemsArea)
    }
    const getNameArea = (idArea) =>{
        const areaChoise = areas.find(({id})=>id===idArea)
        if(areaChoise)
            return areaChoise.name

    }
    useEffect(()=>{
        const areaChoise = areas.find(({name})=>name===selected)
        if(areaChoise){
            setIdArea(areaChoise.id)
            if(managedId){
                if(areaChoise.id===managedId){
                    setWarning("D'ora in poi vedrai gli item di altre aree!")
                    getItemsFromOtherAreas(areaChoise.id)
                }else{
                    setWarning("")
                    getItemsArea(managedId)
                }
            }else{
                getItemsFromOtherAreas(areaChoise.id)
            }
        }
    },[selected])
    return (
        <View style={styles.container}>
            <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Spostamento di deposito/item</Text>
            <View>
                <Text style={styles.text}>  Destinazione:</Text>
                <SelectList data={areaNames}
                 boxStyles={{width: '70%',backgroundColor: 'white',marginLeft:5}} dropdownStyles={{ width: '70%', backgroundColor: 'white'}} placeholder="Seleziona un' area" value={selected} setSelected={setSelected} save='key'/>
            </View>
             <Text style={styles.text}>{warning}</Text>
            <Divider style={{ backgroundColor: '#ccc', marginVertical: 10, width:320 }} />
            {itemsArea?.map((item,key)=>
                 <View style={styles.boxMessage} key={key}>
                    <Text style={styles.message}>Nome:<Text style={styles.infoText}>{item?.nome}</Text></Text>
                    <Text style={styles.message}>Sostanza:<Text style={styles.infoText}>{item?.substanceName} </Text></Text>
                    <Text style={styles.message}>Quantità:<Text style={styles.infoText}>{item?.quantity} {item?.unit}</Text></Text>
                    {(!managedId ||  managedId===idArea) ? (
                      <Text style={styles.message}>
                        Area:<Text style={styles.infoText}>{getNameArea(item?.areaId)}</Text>
                      </Text>
                    ) : null}
                    <View style={styles.radioContainer}>
                        <RadioButton
                           value={String(item.id)}
                           status={selectedItem === item.id ? 'checked' : 'unchecked'}
                           onPress={() => setSelectedItem(item.id)}
                           color="white"
                           uncheckedColor="white"
                        />
                    </View>
                </View>
             )}
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
      fontSize: 20,
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
        fontSize: 20 ,
        fontWeight: 'bold',
        alignItems: 'right',
        alignSelf: 'right',
        color: '#ffa420',
  },
    boxMessage: {
      width: 340,
      marginTop: 10,
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#2c2e52',
      borderRadius: 10,
      alignSelf: 'center'
      //flexDirection: 'row',
      //alignItems: 'center',
      //justifyContent: 'space-between',
   },
  message:{
     fontSize: 20,
     fontWeight: 'bold',
     color: 'white',
  },
  text: {
     fontSize: 18,
     fontWeight: 'bold',
     alignSelf: 'flex-start',
     color: 'white',

   },
});