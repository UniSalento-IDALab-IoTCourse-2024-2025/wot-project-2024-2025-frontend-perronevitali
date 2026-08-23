import { useState,useEffect } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,View,ScrollView,Modal,Button, TextInput} from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';

export default function WorksScreen() {

    const endpointOS = API_BASE_URL + API_PORT_OS
    const [works,setWorks] = useState([])
    const [selectedWork,setSelectedWork] = useState(null)
    const getWorks = async () =>{
        const token = await AsyncStorage.getItem("token")
        const url = endpointOS + '/api/tasks/mine'
        try{
            const response = await fetch(url,{
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
                console.log("Le task:",tasks)
                //onsole.log( JSON.stringify(data,'',2) )
                //tasks.push({"name":"ciao","timestamp":"timestamp"})
                //tasks.push({"name":"ciao2","timestamp":"timestamp2"})
                //tasks.push({"name":"ciao3","timestamp":"timestamp3"})
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
    const [isModalRejectVisible,setModalRejectVisible] = useState(false)
    const [rejectWork,setRejectWork] = useState(null)
    const [rejectText,setRejectText] = useState("")
    const openModal = (work) =>{
        setSelectedWork(work)
        setModalVisible(true)
    }
    const closeModal = () =>{
        setRejectWork(null)
        setRejectText("")
        setModalVisible(false)
    }
    const openModalReject = (work) =>{
        setRejectWork(work)
        setModalRejectVisible(true)
    }
    const closeModalRegject = () =>{
        setModalRejectVisible(false)
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
    const cancelWork = async () =>{
        if(rejectText==="" || rejectText===null){
            alert("Inserisci la motivazione per favore!")
            return
        }
        const url = endpointOS+'/api/tasks/'+rejectWork+'/reject'
        const token = await AsyncStorage.getItem("token")
        console.log(url,rejectText)
       try{
            const response = await fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
               },
                body: JSON.stringify({"reason": rejectText})
            })
            if(!response.ok){
                console.log(response.status)
            }else{
                const data = await response.json()
                if(data.result===0){
                    closeModalRegject()
                    alert("Invio rifiuto eseguito!")
                    getWorks()
                }
            }
        }catch(e){
            console.log("Errore",e)
        }
    }
    const executeWork = async (idwork) =>{
        const url = endpointOS + '/api/tasks/'+idwork+'/complete'
        console.log(url)
        const token = await AsyncStorage.getItem("token")
        try{
            const response = await fetch(url,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log("Errore",response.status)
            }else{
                const data = await response.json()
                if(data.result===0){
                    alert("Task completata con successo!")
                    getWorks()
                }
            }
        }catch(e){
            console.log("Errore API",url,":",e)
        }
    }

    return (
       <View style={styles.container}>
            <ScrollView
                style={{backgroundColor:'#ffa420'}}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
            <Text style={styles.start}>Le tue task </Text>
                   {works.map((work,key)=>
                       <View style={styles.container} key={key}>
                           <TouchableOpacity style={styles.boxMessage} onPress={()=>{openModal(work)}}>
                               <View style={styles.textContainer}>
                                   <Text style={styles.message}>Nome:<Text style={styles.infoText}> {work.nome} </Text></Text>
                                   <Text style={styles.message}>Rischio calcolato: <Text style={styles.infoText}>{getRisk(work?.lwhi)} </Text></Text>
                                    <Text style={styles.message}>Valutazione IA: <Text style={styles.infoText}>{getMLVerditct(work?.mlVerdict)} </Text></Text>
                                   <Text style={styles.hourMessage}>{getDate(work.confirmedAt)}{"\t"}{"\t"}{"\t"}{"\t"}{getHour(work?.confirmedAt)}</Text>
                               </View>
                               <View style={styles.buttonlist}>
                                   <View style={{ marginHorizontal: 10, width:150 }}>
                                       <Button title="Rifiuta" color="red"  onPress={()=>{openModalReject(work?.id)}} />
                                   </View>
                                   <View style={{ marginHorizontal: 10, width:150 }}>
                                       <Button title="Svolto" color="green" onPress={()=>{executeWork(work?.id)}} />
                                   </View>
                               </View>
                           </TouchableOpacity>
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
                               <Text style={styles.modalText}>Tipo Operazione: <Text style={styles.infomodalText}>{getType(selectedWork?.operationType)}</Text></Text>
                               <Text style={styles.modalText}>Descrizione: <Text style={styles.infomodalText}>{selectedWork?.riskDescription}</Text></Text>
                           </View>
                       </View>
                   </Modal>
                   <Modal
                        visible={isModalRejectVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setModalRejectVisible(false)}
                   >
                       <View style={styles.modalRejectOverlay}>
                       <View style={styles.modalReject}>
                            <Text style={styles.modalText}> Spiega il motivo del rifiuto{"\n"} </Text>
                            <TextInput
                                multiline
                                value={rejectText}
                                onChangeText={setRejectText}
                                placeholder="Scrivi qui..."
                                style={styles.textArea}
                                textAlignVertical="top"
                            />
                            <View style={styles.buttonlist}>
                                <View style={{ marginHorizontal: 10 }}>
                                    <Button title="Annulla" color="red"  onPress={()=>{closeModalRegject()}} />
                                </View>
                                <View style={{ marginHorizontal: 10}}>
                                        <Button title="Invia" color="green" onPress={()=>{cancelWork()}} />
                                </View>
                            </View>
                       </View>
                       </View>
                   </Modal>
            </ScrollView>
       </View>
    )


}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
 textArea: {
     height: 120,
     borderWidth: 1,
     borderColor: '#ccc',
     backgroundColor: 'white',
     borderRadius: 8,
     padding: 10,
     marginBottom: 20,
   },

   modalRejectOverlay: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: 'rgba(0, 0, 0, 0.5)',
   },
   modalReject: {
       width: '85%',
       backgroundColor: '#2c2e52',
       borderRadius: 12,
       padding: 20,
     },
});