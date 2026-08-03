import { useState,useEffect,useRef } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,ScrollView,View,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import Feather from '@expo/vector-icons/Feather';
import {useStomp} from '@/hooks/use-stomp';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function EvaluateScreen(){
    const enpointOS = API_BASE_URL+API_PORT_OS
    const [managed,setManaged] = useState("")
    const [tasks,setTasks] = useState([])
    const [isModalVisible,setModalVisible] = useState(false);
    const router = useRouter()
    const fetchData = async () =>{
        const managedId = JSON.parse(await AsyncStorage.getItem("managedId"))
        const token =  await AsyncStorage.getItem("token")
        if(managedId){
            console.log("Task Area")
            getTasksArea(token,managedId)
        }else{
            getAllTasks(token)
        }
    }
    const getAllTasks = async (token,area) =>{
        const url = enpointOS+'/api/tasks/pending?areaid='+area
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
            }

        }catch(e){
            console.log("Errore",e)
        }

    }
    const getTasksArea = async (token) =>{
        const url = enpointOS+'/api/tasks/pending'
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
            }
        }catch(e){
            console.log("Errore",e)
        }
     }
            const openModal = () =>{
                setModalVisible(true)
            }
            const closeModal = () =>{
                setModalVisible(false)
            }
    useEffect(()=>{
        fetchData()
    },[])
    const comeBackToHome = async () =>{
        router.replace("/")
    }
    return(
        <View style={styles.container}>
            <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Valuta task </Text>
            {tasks.map((task,key)=>
                <View style={styles.container} key={key}>
                    <TouchableOpacity style={styles.boxMessage} onPress={openModal}>
                        <View style={styles.textContainer}>
                            <Text style={styles.message}> {task.nome} </Text>
                            <Text style={styles.hourMessage}>28/06/2026{"\t"}{"\t"}{"\t"}{"\t"}14:30</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.buttonlist}>
                    <TouchableOpacity style={styles.Cancelbutton}>
                        <Text style={styles.message}> Annulla </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.Perfbutton}>
                        <Text style={styles.message}> Svolto </Text>
                    </TouchableOpacity>
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
                        <Text style={styles.modalText}>Testo</Text>
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
      fontSize: 18,
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
});
