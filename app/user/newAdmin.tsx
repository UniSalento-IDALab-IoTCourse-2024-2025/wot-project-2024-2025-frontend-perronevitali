import { useState,useEffect } from 'react';
import { StyleSheet,View, Button, Text, TextInput, TouchableOpacity,ScrollView} from 'react-native';
import { Divider } from 'react-native-elements';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SelectList} from 'react-native-dropdown-select-list';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function CreateAdmin () {
    const router = useRouter()
    const endpointOS = API_BASE_URL+API_PORT_OS
    const [areaNames,setAreaNames] = useState([])
    const [areas,setAreas] = useState([])
    const [selected,setSelected] = useState("")
    const [managed,setManaged] =  useState(null)
    const [nome,setNome] = useState("")
    const [cognome,setCognome] = useState("")
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [confirm,setConfirm] = useState("")
    const handleCancel = async () =>{
        router.push("/")
    }
    const handleRegistration = async () =>{
        if((nome==="" || nome===null) || (cognome==="" || cognome===null) || (email==="" || email===null) || (password==="" || password===null) || (confirm==="" || confirm===null)){
            alert("Per favore riempi tutti i campi!")
            return
        }
        if(password!==confirm){
            alert("Le 2 password non corrispondono!")
            return
        }
        let managed = []
        if(!selected){
            alert("Seleziona un area!")
            return
        }
        if(selected==="Tutte")
             managed=null
        else{
            const area =  areas.find(({value})=>value===selected)
            managed = area.key
        }
        const body={
            "nome": nome,
            "cognome": cognome,
            "email": email,
            "password": password,
            "managedAreaId": managed,
            "role": "ADMIN"
        }
        const token = await AsyncStorage.getItem("token")
        const url = API_BASE_URL+API_PORT_US+'/api/admins/'
        try{
            const response = await fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                },
                body: JSON.stringify(body)
            })
            if(!response.ok){
                console.log("Errore",url,":",response.status)
                const error = await response.json()
                if(response.status===409){
                    if(error.result===2)
                        alert("Email già presente!")
                }
            }else{
                const data = await response.json()
                if(data.result===0){
                    alert("Amminstratore creato con successo!")
                    router.push("/")
                }
            }
        }catch(e){
            console.log("Errore api registration",e)
        }
    }
    const getAreas = async () =>{
        const token = await AsyncStorage.getItem("token")
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
                let names = ["Tutte"]
                let areasobj = []
                for(let area in areas){
                    const name = areas[area].name
                    const id = areas[area].id
                    const bodyArea = {
                        "key": id,
                        "value": name
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
    useEffect(()=>{
        getAreas()
    },[])
     useEffect(() => {
         if (selected) {
             console.log("Nuovi valori:", selected)
             if(selected==="Tutte"){
                 alert("Se selezioni l'opzione \"Tutte\" tutte le altre aree  saranno selezionate in automatico!")
             }
         }
      }, [selected]);
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Crea un nuovo amminstratore</Text>
            <View>
                <Text style={styles.text}>  Nome</Text>
                <TextInput  style={styles.input} value={nome} onChangeText={setNome} />
                <Text style={styles.text}>  Cognome</Text>
                <TextInput style={styles.input} value={cognome} onChangeText={setCognome} />
                <Text style={styles.text}>  Email</Text>
                <View style={styles.emailContainer}>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} />
                </View>
                <Text style={styles.text}>  Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={password} onChangeText={setPassword}
                />
                <Text style={styles.text}>  Conferma Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={confirm} onChangeText={setConfirm}
                />
                <Text style={styles.text}>  Aree da amministrare:</Text>
                <SelectList data={areaNames} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un' area" value={selected} setSelected={setSelected} save='key'/>
            </View>
            <View style={styles.buttonlist}>
                <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                    <Text style={styles.textbutton}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttoncreate} onPress={handleRegistration}>
                    <Text style={styles.textbutton}>Crea </Text>
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
      fontSize: 24,
      fontWeight: 'bold',
      marginTop:60,
      color: 'white'
    },
    text:{
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonlist:{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
        marginTop: 20,
    },
   button:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'#ff4700',
    marginTop:10,
    marginBottom:10,
    height: 60,
    width:200,
    borderRadius:15
  },
  buttonCreate:{
        justifyContent: 'center',
        alignItems:'center',
        backgroundColor:'green',
        height: 60,
        width:270,
        marginTop:10,
        marginBottom:10,
        borderRadius:15
  },
  buttonlog:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'red',
    height: 60,
    width:100,
    borderRadius:15
  },
  textbutton:{
    fontSize:18,
    fontWeight: 'bold',
    color:'white'
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suffix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
  buttoncreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width:100,
      borderRadius:15,
      marginLeft: 30
  }
});
