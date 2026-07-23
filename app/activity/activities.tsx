import { useState,useEffect } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,ScrollView,View, Modal } from 'react-native';
import {Divider} from "react-native-elements";
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function ActivitiesAreaScreen() {
    const [area,setArea] = useState(null)
    const [activites,setActivities] = useState([])
    const [selectedActivity,setSelectedActivity] = useState(null)
    const router = useRouter()
    const getInfoArea = async () =>{
        const area = JSON.parse(await AsyncStorage.getItem("infoArea"))
        const token = await AsyncStorage.getItem("token")
        setArea(area)
        const endpoint = API_BASE_URL+API_PORT_OS+'/api/tasks?areaId='+area.id
        try{
            const response = await fetch(endpoint,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                },
           })

           if(!response.ok){
               console.log("Errore risposta /api/tasks?",response.status)
           }else{
               const data = await response.json()
               console.log(data.tasks.tasksList[0])
               setActivities(data.tasks.tasksList)
           }
        }catch(e){
            console.log("Errore chiamata API /api/tasks",e)

        }
    }
    useEffect(()=>{
        getInfoArea()
    },[])

    const [isModalVisible,setModalVisible] = useState(false);
    const openModal = (activity) =>{
        setModalVisible(true)
        setSelectedActivity(activity)
    }
    const closeModal = () =>{
        setModalVisible(false)
    }

    const getDate = (timestamp) =>{
        const date = new Date(timestamp)
        return date.toLocaleDateString("it-IT")
    }
    const getHour = (timestamp) =>{
        const date = new Date(timestamp)
        return date.toLocaleTimeString("it-IT")
    }

    const comeBackToHome = () =>{
        router.push("/")
    }
    return (
        <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Attività area {area?.name}</Text>
            <View style={styles.container}>
           {activites?.map((activity,key)=>
               <View style={styles.boxMessage} key={key}>
                   <View style={styles.textContainer}>
                        <Text style={styles.message}>
                            {activity.nome}
                        </Text>
                        <Text style={styles.hourMessage}>
                            {getDate(activity.createdAt)}{"\t"}{"\t"}{"\t"}{"\t"}{"\t"}{"\t"}{getHour(activity.createdAt)}
                        </Text>
                   </View>

                   <TouchableOpacity onPress={()=>{openModal(activity)}}>
                        <Feather
                            name="external-link"
                            size={28}
                            color="#ff4700"
                        />
                   </TouchableOpacity>
               </View>
           )}
           <TouchableOpacity  style={styles.buttonlog} onPress={comeBackToHome}>
                <Text style={styles.textbutton}>Torna alla Home</Text>
           </TouchableOpacity>
           </View>
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
                        <Text style={styles.modalText}>Descrizione:</Text><Text style={styles.infoText}>{selectedActivity?.descrizione}</Text>
                        <Text style={styles.modalText}>Sostanza:</Text><Text style={styles.infoText}>{selectedActivity?.substanceName}</Text>
                        <Text style={styles.modalText}>Quantità:</Text><Text style={styles.infoText}>{selectedActivity?.substanceQuantity} litri</Text>
                        <Text style={styles.modalText}>Indice pericolo:</Text><Text style={styles.infoText}>{Math.round(selectedActivity?.lwhi)}</Text>
                    </View>
                </View>
           </Modal>
        </ScrollView>
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
      marginTop:40,
      marginLeft: 10,
      color: 'white'
  },
  boxMessage: {
      width: 340,
      marginTop: 30,
      marginBottom: 30,
      padding: 10,
      backgroundColor: '#2c2e52',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    backgroundColor:'#ff4700',
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
         fontSize: 19,
         marginTop: 10,
         fontWeight: 'bold',
         color: 'white'
     },
    infoText:{
        fontSize: 19,
        fontWeight: 'bold',
        alignItems: 'right',
        alignSelf: 'right',
        color: '#ffa420',
    },
});