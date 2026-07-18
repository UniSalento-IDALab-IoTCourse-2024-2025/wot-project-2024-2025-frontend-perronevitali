import { useState,useEffect,useRef } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,ScrollView,View,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import Feather from '@expo/vector-icons/Feather';
import {useStomp} from '@/hooks/use-stomp';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessageScreen() {

    const [isModalVisible,setModalVisible] = useState(false);
    const [user,setUser] = useState(null)
    const [areas,setAreas] = useState([])
    //const intervalRef = useRef(null);
    const { client, ready } = useStomp(user?.id,areas);
    let messages = new Array()
    const getUser = async ()  =>{
         const user_raw = await AsyncStorage.getItem("user")
        setUser(JSON.parse(user_raw))
    }
    const getAreas = async () =>{
        const raw_areas = await AsyncStorage.getItem("idAreas")
        setAreas(JSON.parse(raw_areas))
    }
    const readLastMessage = async () =>{
        let lastMessage = JSON.parse(await AsyncStorage.getItem("lastAreaMessage"))
        if(!lastMessage)
            return;
        if(!lastMessage.read){
            lastMessage["read"]=true
            await AsyncStorage.setItem("lastAreaMessage",JSON.stringify(lastMessage))
            messages = await AsyncStorage.getItem("messages")
            messages.push(lastMessage)
            await AsyncStorage.setItem("messages",JSON.stringify(messages))
        }
    }
    const getLastMessage = async() =>{
        //intervalRef.current = setInterval(readLastMessage,2000)
        readLastMessage()
    }
    useEffect(()=>{
        getUser()
        getAreas()
        getLastMessage()
        /*return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }*/
    },[])
    /*useEffect(() => {
      if (!ready || !client) return;
      console.log(areas)
      for(let idArea in areas){
          const sub = client.subscribe(
            '/exchange/faro.areas/area.'+areas[idArea],
            (message) => {
              console.log('Message ricevuto:', JSON.parse(message.body));
            }
          );
     }

      return () => sub.unsubscribe();
    }, [ready, client]);*/


    const openModal = () =>{
            setModalVisible(true)
    }
    const closeModal = () =>{
        setModalVisible(false)
    }
    return (
        <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>I tuoi messaggi</Text>
           <View style={styles.container}>
               {messages.map((message,key)=>
               <View key={key} style={styles.boxMessage}>
                   <View style={styles.textContainer}>
                       <Text style={styles.message}>
                           Messaggio {key+1}
                       </Text>

                       <Text style={styles.hourMessage}>
                          {message.timestamp}{"\t"}{"\t"}{"\t"}{"\t"}{"\t"}{"\t"}14:30
                       </Text>
                   </View>
                    <TouchableOpacity onPress={openModal}>
                   <Feather
                       name="external-link"
                       size={28}
                       color="#ff4700"

                   />
                    </TouchableOpacity>
               </View>)}
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
                        <Text style={styles.modalText}>Testo</Text>
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
  },
  boxMessage: {
      width: 340,
      height: 90,
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
   }
});