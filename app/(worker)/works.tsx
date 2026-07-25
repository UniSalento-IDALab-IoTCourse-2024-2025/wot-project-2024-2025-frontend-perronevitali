import { useState,useEffect } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,View,ScrollView,Modal} from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function WorksScreen() {

    const url = API_BASE_URL
    const [works,setWorks] = useState([])
    const getWorks = async () =>{
        const token = await AsyncStorage.getItem("token")
        const endpoint = url + API_PORT_OS + '/api/tasks/mine'
        try{
            const response = await fetch(endpoint,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }

            })
            if(!response.ok){
                console.log(response.status)
            }else{
                const data = await response.json()
                let tasks = data.tasks.tasksList
                tasks.push({"name":"ciao","timestamp":"timestamp"})
                tasks.push({"name":"ciao2","timestamp":"timestamp2"})
                tasks.push({"name":"ciao3","timestamp":"timestamp3"})
                setWorks(tasks)
            }
        }catch(e){
            console.log("Error API tasks/mine",e)
        }
    }
    useEffect(()=>{
        getWorks()
    },[])

    const [isModalVisible,setModalVisible] = useState(false);
        const openModal = () =>{
            setModalVisible(true)
        }
        const closeModal = () =>{
            setModalVisible(false)
        }
    const cancelWork = () =>{
        console.log("Ho deciso di annullare il compito")
    }
    const executeWork = () =>{
        console.log("Ho deciso di eseguire il compito")
    }
    return (
        <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Compiti da svolgere</Text>
                {works?.map((work,key)=><View style={styles.container} key={key}>
                    <TouchableOpacity style={styles.boxMessage} onPress={openModal}>
                        <View style={styles.textContainer}>
                            <Text style={styles.message}> Compito 1 </Text>
                            <Text style={styles.hourMessage}>28/06/2026{"\t"}{"\t"}{"\t"}{"\t"}14:30</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.Cancelbutton} onPress={cancelWork}>
                        <Text style={styles.message}> Annulla </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.Perfbutton} onPress={executeWork}>
                        <Text style={styles.message}> Svolto </Text>
                    </TouchableOpacity>
               </View>)}
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
    //justifyContent: 'left',
    padding: 1,
    alignItems: 'left',
    backgroundColor:'#ffa420',
    flexDirection: 'row',
    alignItems: 'left',
    //justifyContent: 'space-between',
  },
  start:{
      fontSize: 24,
      fontWeight: 'bold',
      marginTop:40,
      marginLeft: 10
  },
  boxMessage: {
      width: 200,
      marginTop: 10,
      marginBottom: 10,
      padding: 10,
      backgroundColor: '#2c2e52',
      borderRadius: 10,
      flexDirection: 'center',
      alignItems: 'center',
      //justifyContent: 'space-between',
  },
  message:{
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white'
  },
  Cancelbutton:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ff4700',
    marginTop: 10,
    marginBottom: 10,
    marginLeft:10,
    width:30,
    borderRadius:5,
  },
  Perfbutton:{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:'green',
      marginTop: 10,
      marginBottom: 10,
      marginLeft:10,
      width:30,
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
       }
});