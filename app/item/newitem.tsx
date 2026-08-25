import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, TextInput, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import {SelectList} from 'react-native-dropdown-select-list';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
export default function NewItemScreen(){
    const [type,setType] = useState(null)
    const [nome,setNome] = useState("")
    const [managedAreas,setManagedAreas] = useState([])
    const [quantity,setQuantity] = useState("")
    const [deposito,isDeposito] = useState(false)
    const [unit,setUnit] = useState("")
    const [startQuantity,setStartQuantity] = useState("")
    const router = useRouter()
    const [areaNames,setAreaNames] = useState([])
    const [areas,setAreas] = useState([])
    const [substances,setSubstances] = useState([])
    const [substancesName,setSubstancesName] = useState([])
    const [selectedSub,setSelectedSub] = useState(null)
    const [selectedArea,setSelectedArea] = useState(null)
    const endpointOS = API_BASE_URL+API_PORT_OS
    const fetchData = async () =>{
        getItem()
        getSubstances()
        const managed = JSON.parse(await AsyncStorage.getItem("managedId"))
        if(managed){
            const area =await getArea(managed)
            const body={
                "id": area.id,
                "name": area.name
            }
            setAreas([body])
            setAreaNames([area.name])

        }
        else
            getAreas()
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
    const getItem = async () =>{
        const typeItem = await AsyncStorage.getItem("typeItem")
        setType(typeItem)
        if(typeItem==="Item")
            isDeposito(false)
        else{
            isDeposito(true)
            setStartQuantity("iniziale")
        }
    }
    const getSubstances = async () =>{
        const token = await AsyncStorage.getItem("token")
        const url =  endpointOS+'/api/substances/'
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
                const substances = data.substances.substancesList
                const names = []
                const subobj = []
                for(let sub in substances){
                    names.push(substances[sub].nomeIt)
                    const bodyObj = {
                        "cas": substances[sub].casNumber,
                        "nome": substances[sub].nomeIt,
                    }
                    subobj.push(bodyObj)
                }
                setSubstances(subobj)
                setSubstancesName(names)
            }
        }catch(e){
            console.log("Errore chiamta API",url,":",e)
        }

    }
    useEffect(()=>{
        fetchData()
    },[])
    const handleCancel = async () =>{
        router.push("/")
    }
    const addItem = async () =>{
        if((nome===null || nome==="") || (selectedSub===null || selectedSub==="") || (selectedArea===null || selectedArea==="") || (quantity===null || quantity==="") || (unit===null || unit==="")){
            alert("Per favore inserisci tutti i campi!")
            return
        }
        const subChoise = substances.find(({nome})=>nome===selectedSub)
        const areaChoise = areas.find(({name})=>name===selectedArea)
        if(!subChoise){
            alert("Sostanza non trovata!")
            return
        }
        if(!areaChoise){
            alert("Area non trovata!")
        }
        else{
            const token = await AsyncStorage.getItem("token")
            const url = endpointOS+'/api/items/'
            try{
                const body ={
                    "substanceCas": subChoise.cas,
                    "substanceName": subChoise.nome,
                    "nome": nome,
                    "quantity": quantity,
                    "unit": unit,
                    "deposito": deposito,
                    "areaId": areaChoise.id
                }
                const response = await fetch(url,{
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer '+token
                    },
                    body: JSON.stringify(body)
                })
                if(!response.ok){
                    console.log("Errore",response.status)
                }else{
                    const data = await response.json()
                    if(data.result===0){
                        alert(type+" creato con successo!")
                        router.push("/")
                    }
                }
            }catch(e){
                console.log("Errore",e)
            }

        }
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Nuovo {type} </Text>
            <View>
                <Text style={styles.text}>  Nome</Text>
                <TextInput  style={styles.input} value={nome} onChangeText={setNome} />
                <Text style={styles.text}>  Sostanza</Text>
                <SelectList data={substancesName} style={{width:500, height:500, marginVertical:10, margin:20}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona una sostanza" value={selectedSub} setSelected={setSelectedSub} save='key'/>
                <Text style={styles.text}>  Area</Text>
                <SelectList data={areaNames} style={{width:500, height:500, marginVertical:10, margin:20}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona una area" value={selectedArea} setSelected={setSelectedArea} save='key'/>
                <Text style={styles.text}>  Quantità {startQuantity}</Text>
                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
                <Text style={styles.text}>  Unità di misura</Text>
                <TextInput style={styles.input} value={unit} onChangeText={setUnit} />
                <View style={styles.buttonlist}>
                    <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                        <Text style={styles.textbutton}>Annulla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonCreate} onPress={addItem}>
                        <Text style={styles.textbutton}>Crea nuovo {type} </Text>
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
    width:100,
    marginRight:10,
    borderRadius:15
  },
  buttonCreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width: 165,
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
