import { useState,useEffect,useRef } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,ScrollView,View,Modal,Button } from 'react-native';
import {Divider} from "react-native-elements";
import Feather from '@expo/vector-icons/Feather';
import {useStomp} from '@/hooks/use-stomp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function EvaluateScreen(){
    const endpointOS = API_BASE_URL+API_PORT_OS
    const [managed,setManaged] = useState("")
    const [tasks,setTasks] = useState([])
    const [selectedTask,setSelectedTask] = useState(null)
    const [isModalVisible,setModalVisible] = useState(false);
    const [token,setToken] = useState("")
    const router = useRouter()
    const fetchData = async () =>{
        const managedId = JSON.parse(await AsyncStorage.getItem("managedId"))
        const token =  await AsyncStorage.getItem("token")
        setToken(token)
        if(managedId){
            console.log("Task Area")
            getTasksArea(token,managedId)
        }else{
            const areas = await getAreas(token)
            let allTasks = []
            for(let area in areas){
                const tasks = await getAllTasks(token,areas[area].id)
                for(let task in tasks){
                    allTasks.push(tasks[task])
                }
            }
            setTasks(allTasks)
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
                let areasobj = []
                for(let area in areas){
                    const name = areas[area].name
                    const id = areas[area].id
                    const bodyArea = {
                        "id": id,
                        "name": name
                    }
                    areasobj.push(bodyArea)
                }
                return areasobj
            }
        }catch(e){
            console.log("Errore ",url,":",e)
        }
    }
    const getAllTasks = async (token,area) =>{
        const url = endpointOS+'/api/tasks/pending?areaid='+area
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                 },
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                const data = await response.json()
                const taskData = data.tasks.tasksList
                let tasks = []
                for(let task in taskData)
                    tasks.push(taskData[task])
                return tasks
            }

        }catch(e){
            console.log("Errore",e)
        }

    }
    const getTasksArea = async (token) =>{
        const url = endpointOS+'/api/tasks/pending'
        try{
            const response = await fetch(url,{
                method: 'GET',
                 headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                 },
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                const data = await response.json()
                setTasks(data.tasks.tasksList)
                console.log( JSON.stringify(data,'',2))
            }
        }catch(e){
            console.log("Errore",e)
        }
     }
    const openModal = (task) =>{
        setSelectedTask(task)
        setModalVisible(true)
    }
    const closeModal = () =>{
        setSelectedTask(null)
        setModalVisible(false)
    }
    useEffect(()=>{
        fetchData()
    },[])
    const comeBackToHome = async () =>{
        router.replace("/")
    }
    const getDate = (timestamp) =>{
        const date = new Date(timestamp)
        return date.toLocaleDateString("it-IT")
    }
    const getHour = (timestamp) =>{
        const date = new Date(timestamp)
        return date.toLocaleTimeString("it-IT")
    }
    const getType = (type) =>{
        switch(type){
            case "LOADING": return "CARICO"
            case "UNLOADING": return "SCARICO"
            case "INSPECTION": return "ISPEZIONE"
            case "MAINTENANCE": return "MANUTENZIONE"
            case "TRANSFER": return "SPOSTAMENTO"
        }
    }
    const getRisk=(risk)=>{
        if(risk<=10){
            return "BASSO"
        }else if(risk>10 && risk<=29){
                return "MEDIO"
        }else{
            return "ALTO"
        }
    }
    const getMLVerditct=(ml)=>{
        if(ml==="APPROVED")
            return "SICURO"
        else
            return "NON SICURO"
    }
    const handleConfirm = async (id) =>{
        const url=endpointOS+"/api/tasks/"+id+"/confirm"
        try{
            const response = await fetch(url,{
                method: "POST",
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",url,":",response.status)
            }else{
                const data = await response.json()
                console.log(JSON.stringify(data,'',2))
                if(data.result===0){
                    alert("Task presa in carico!")
                     router.replace("/")
                }
            }
        }catch(e){
            console.log("Errore",url,":",e)
        }
    }
    const handleCancel = async (id) =>{
        const url=endpointOS+"/api/tasks/"+id
        try{
            const response = await fetch(url,{
                method: "DELETE",
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",url,":",response.status)
            }else{
                const data = await response.json()
                console.log(JSON.stringify(data,'',2))
                if(data.result===0){
                    alert("Task eliminata con successo!")
                    router.replace("/")
                }
            }
        }catch(e){
            console.log("Errore",url,":",e)
        }
    }
    return(
        <View style={styles.container}>
            <ScrollView
                style={{backgroundColor:'#ffa420'}}
                contentContainerStyle={{ flexGrow: 1 }}
            >
            <Text style={styles.start}>Valuta task </Text>
            {tasks.map((task,key)=>
                <View style={styles.container} key={key}>
                    <TouchableOpacity style={styles.boxMessage} onPress={()=>{openModal(task)}}>
                        <View style={styles.textContainer}>
                            <Text style={styles.message}>Nome:<Text style={styles.infoText}> {task.nome} </Text></Text>
                            <Text style={styles.message}>Rischio calcolato: <Text style={styles.infoText}>{getRisk(task?.lwhi)} </Text></Text>
                             <Text style={styles.message}>Valutazione IA: <Text style={styles.infoText}>{getMLVerditct(task?.mlVerdict)} </Text></Text>
                            <Text style={styles.hourMessage}>{getDate(task.createdAt)}{"\t"}{"\t"}{"\t"}{"\t"}{getHour(task.createdAt)}</Text>
                        </View>
                        <View style={styles.buttonlist}>
                            <View style={{ marginHorizontal: 10, width:150 }}>
                                <Button title="Annulla" color="red"  onPress={()=>{handleCancel(task?.id)}} />
                            </View>
                            <View style={{ marginHorizontal: 10, width:150 }}>
                                <Button title="Accetta" color="green" onPress={()=>{handleConfirm(task?.id)}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.buttonlist}>
                    </View>
                </View>
            )}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Divider style={{ backgroundColor: '#ffa420', marginVertical: 1,  width:"30%",  alignSelf: 'center', height:5 }} />
                        <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
                        <Text style={styles.modalText}>Tipo Operazione: <Text style={styles.infomodalText}>{getType(selectedTask?.operationType)}</Text></Text>
                        <Text style={styles.modalText}>Descrizione: <Text style={styles.infomodalText}>{selectedTask?.riskDescription}</Text></Text>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity style={styles.button} onPress={comeBackToHome}>
                <Text style={styles.textbutton}>Torna alla home</Text>
            </TouchableOpacity>
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: 'left',
    padding: 1,
    alignItems: 'left',
    backgroundColor:'#ffa420',
    //flexDirection: 'row',
    alignItems: 'left',
    justifyContent: 'space-between',
  },
  start:{
      fontSize: 24,
      fontWeight: 'bold',
      marginTop:40,
      marginLeft: 10,
      color:'white',
  },
  boxMessage: {
      marginTop: 10,
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#2c2e52',
      borderRadius: 10,
      //flexDirection: 'center',
      //alignItems: 'center',
      //justifyContent: 'space-between',
  },
  message:{
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white'
  },
  Cancelbutton:{
    flex: 1,
    height:30,
    width:30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ff4700',
    marginLeft:30,
    marginRight:10,
    borderRadius:5,
  },
  Perfbutton:{
      flex: 1,
      height:30,
      width:30,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:'green',
      marginRight:30,
      marginLeft:10,
      borderRadius:5,
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
           fontSize: 20,
           marginTop: 10,
           fontWeight: 'bold',
           color: 'white'
       },
        infomodalText:{
              fontSize: 20,
              marginTop: 10,
              fontWeight: 'bold',
              color: '#ffa420'
          },
   buttonlist:{
           justifyContent: 'center',
           alignItems: 'center',
           flexDirection:'row',
   },
    button:{
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems:'center',
        marginTop:10,
        backgroundColor:'#ff4700',
        height: 60,
        width:200,
        borderRadius:15
      },
  infoText:{
          fontSize: 24,
          fontWeight: 'bold',
          alignItems: 'right',
          alignSelf: 'right',
          color: '#ffa420',
  },

});
