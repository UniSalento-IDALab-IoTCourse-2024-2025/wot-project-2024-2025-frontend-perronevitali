import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal,TextInput } from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import { useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
export default function ListWorker(){
    const router = useRouter()
    const endpointUS = API_BASE_URL+API_PORT_US
    const endpointOS = API_BASE_URL+API_PORT_OS
    const [workers,setWorkers] = useState([])
    const [selectedWorkers, setSelectedWorkers] = useState<number[]>([])
    const [isModalWaitVisible,setModalWaitVisible] = useState(false)
    const toggleWorker = (id: number) => {
        if (selectedWorkers.includes(id)) {
            setSelectedWorkers(selectedWorkers.filter(w => w !== id))
        } else {
            setSelectedWorkers([...selectedWorkers, id])
        }
    }
    const handleCancel = () =>{
        router.replace("/")
    }
    const addNewTask = async (token,bodyTask) => {
        setModalWaitVisible(true)
        const url = endpointOS+'/api/tasks/evaluate'
        try{
            const response = await fetch(url,{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                },
                body: JSON.stringify(bodyTask)
            })
            if(!response.ok){
                console.log("Errore",response.status)
                setModalWaitVisible(false)
            }else{
                const data = await response.json()
                setModalWaitVisible(false)
                if(data.result===0){
                  alert(data.message)
                  router.replace("/")
                }

            }
        }catch(e){
            console.log("Errore",e)
            setModalWaitVisible(false)
        }
    }
    const  addNewItem = async (token,body) =>{
        const url = endpointOS+'/api/items/'
        try{
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
                return null
            }else{
                const data = await response.json()
                const newItem = data.item
                if(data.result===0){
                    alert("Item creato con successo!")
                }
                return newItem
            }
        }catch(e){
            console.log("Errore",e)
            return null
        }
    }
    const handleCreateTask = async () => {
         const token = await AsyncStorage.getItem("token")
        if(selectedWorkers.length===0)
            alert("Seleziona almeno un lavoratore!")
        else{
            let body = JSON.parse(await AsyncStorage.getItem("bodyTask"))
            console.log(JSON.stringify(body,'',2))
            body.workerIds = selectedWorkers
            const operationType = body.operationType
            if(operationType==="UNLOADING"){
                const typeUnloading = await AsyncStorage.getItem("typeUnloading")
                if(typeUnloading==="item"){
                    const bodyItem = JSON.parse(await AsyncStorage.getItem("bodyItem"))
                    const response = await addNewItem(token,bodyItem)
                    if(!response){
                        return
                    }
                    body.itemId = response.id
               }
            }
            addNewTask(token,body)
        }
    }
    const getUsers = async () =>{
        const token =  await AsyncStorage.getItem("token")
        const url = endpointUS+"/api/workers/"
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore ",response.status)
            }else{
                const data = await response.json()
                const workers = data.workers.workersList
                setWorkers(workers)
            }

        }catch(e){
            console.log("Errore chimata API",url,":",e)
        }
    }
    useEffect(()=>{
        getUsers()
    },[])
    return(
        <View style={styles.container}>
            <ScrollView style={{backgroundColor:'#ffa420'}}>
                <Text style={styles.start}>Lista lavoratori</Text>
                {workers?.map((worker,key)=>
                    <View key={key} style={styles.boxMessage}>
                        <Checkbox
                            value={selectedWorkers.includes(worker.id)}
                            onValueChange={() => toggleWorker(worker.id)}
                        />
                        <Text style={styles.message}>Nome: <Text style={styles.infoText}>{worker.nome}</Text></Text>
                        <Text style={styles.message}>Cognome: <Text style={styles.infoText}>{worker.cognome}</Text></Text>
                         <Text style={styles.message}>email: <Text style={styles.infoText}>{worker.email}</Text></Text>
                    </View>
                )}
                <View style={styles.buttonlist}>
                    <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                        <Text style={styles.textbutton}>Annulla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonCreate} onPress={handleCreateTask}>
                        <Text style={styles.textbutton}>Crea Task</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
             <Modal
                visible={isModalWaitVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalWaitVisible(false)}
             >
                 <View style={styles.modalWaitOverlay}>
                 <View style={styles.modalWait}>
                    <Text style={styles.infoText}>Valutazione task in corso...</Text>
                </View>
                </View>
            </Modal>
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
    width: 125,
    marginRight:10,
    marginLeft:10,
    borderRadius:15
  },
  buttonCreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width: 125,
      marginRight:10,
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
      position: 'absolute',
      top: 10,
      right: 10,
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

        color: '#ffa420',
    },
    addButton:{
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxMessage: {
      width: 340,
      marginTop: 10,
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#2c2e52',
      borderRadius: 10,
      position: 'relative',
      //justifyContent: 'space-between',
  },
        modalWaitOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
       modalWait: {
           width: '85%',
           backgroundColor: '#2c2e52',
           borderRadius: 12,
           padding: 20,
       },
});
