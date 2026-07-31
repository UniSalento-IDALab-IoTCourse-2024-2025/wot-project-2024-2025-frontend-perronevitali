import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_OS,API_PORT_US } from '@/constants/api';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminHome () {
    const endpointUS = API_BASE_URL+API_PORT_US
    const endpointOS = API_BASE_URL+API_PORT_OS
    const router = useRouter()
    const insets = useSafeAreaInsets();
    const [user,setUser] = useState(null)
    const [managedAreas,setManagedAreas] = useState([])
    const [isModalVisible,setModalVisible] = useState(false)
    const [selectedArea,setSelectedArea] = useState(null)
    const getManagedAreas = async (user,token) =>{
        const url = endpointUS+'/api/admins/'+user.id
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                console.log(response.status)
                router.replace("/login")
            }else{
                const data = await response.json()
                const managedID = data.admins.adminsList[0].managedAreaId
                let managedAreas = []
                if(managedID){
                    const managedArea = await getArea(managedID,token)
                    if(managedArea)
                           managedAreas.push(managedArea)

                }else{
                    managedAreas = await getAllAreas(token)
                }
                setManagedAreas(managedAreas)
                await AsyncStorage.setItem("managedId",JSON.stringify(managedID))
                await AsyncStorage.setItem("manageAreas",JSON.stringify(managedAreas))
            }
        }catch(e){
            console.log("Errore api/admins/idadmin",e)
        }
    }
    const getAllAreas = async (token) =>{
        const url = endpointOS+'/api/areas/'
        try{
            const response = await fetch(url,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+token
                }
            })
            if(!response.ok){
                response("Errore api/areas/",response.status)
                return null
            }else{
                const data = await response.json()
                const areas = data.areas.areasList
                return areas
            }
        }catch(e){
            console.log("Errore chiamata  API /api/areas/",e)
            return null
        }
    }
    const getArea = async (managed,token) =>{
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
    const fetchData = async () =>{
        const user = JSON.parse(await AsyncStorage.getItem("user"))
        const token = await AsyncStorage.getItem("token")
        getManagedAreas(user,token)
    }
    useEffect(() => {
        fetchData()
    },[])
    const getStatusString = (status) =>{
        switch(status){
            case 0: return "CALM";
            case 1: return "ALERT";
            case 99: return "DANGER";
            default: return "UNKNOWN";
        }
    }
    const openModal = (area) =>{
        setModalVisible(true)
        setSelectedArea(area)
    }
    const closeModal = () =>{
        setModalVisible(false)
    }
    const goToOption = async (area) =>{
         await AsyncStorage.setItem("infoArea",JSON.stringify(area))
         router.push("/area/areaopt")
    }
    const goToCreateArea = async () =>{
        router.push("/area/newarea")
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>
                Gestione Aree{"\t"}{"\t"}{"\t"}
                <TouchableOpacity style={styles.addButton} onPress={goToCreateArea}>
                    <AntDesign name="plus" size={24} color="white" />
                </TouchableOpacity>
            </Text>
            <ScrollView
            style={{backgroundColor:'#ffa420'}}
            contentContainerStyle={{
                paddingBottom: insets.bottom + 80,
            }}
            >
                {managedAreas?.map((managed,key)=>
                    <TouchableOpacity style={styles.boxAreaAuth} key={key}>
                        <Text style={styles.message}> {managed?.name} </Text>
                        <Text style={styles.textbutton}> Stato area: {getStatusString(managed?.status)}</Text>
                        <Text style ={styles.textbutton}> Numero di lavoratori : {managed?.userIdsInArea?.length}</Text>
                        <Text style ={styles.textbutton}> Temperatura attuale : {managed?.currentTemperature} °C </Text>
                         <Text style ={styles.textbutton}> Umidità attuale : {managed?.currentHumidity} % {"\n"}</Text>
                        <View style={styles.buttonlist}>
                            <View style={{ marginHorizontal: 20 }}>
                                <Button title="Informazioni Area" color="#ffa420" onPress={()=>{openModal(managed)}} />
                            </View>
                            <View style={{ marginHorizontal: 20 }}>
                                <Button title="Opzioni Area" color="#ffa420" onPress={()=>{goToOption(managed)}}/>
                            </View>
                        </View>
                    </TouchableOpacity>
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
                            <Text style={styles.modalText}>Beacon: <Text style={styles.infoText}>{selectedArea?.beaconMAC}</Text> </Text>
                            <Text style={styles.modalText}>Indirizzo IP: <Text style={styles.infoText}>{selectedArea?.ipRaspberry}</Text> </Text>
                            <Text style={styles.modalText}>Soglia Temperatura: <Text style={styles.infoText}>{selectedArea?.thresholdTemperature} °C</Text> </Text>
                            <Text style={styles.modalText}>Soglia Umidità : <Text style={styles.infoText}>{selectedArea?.thresholdHumidity} %</Text> </Text>
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
        fontSize: 24,
        fontWeight: 'bold',
        alignItems: 'right',
        alignSelf: 'right',
        color: '#ffa420',
    },
    addButton:{
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
    }
});