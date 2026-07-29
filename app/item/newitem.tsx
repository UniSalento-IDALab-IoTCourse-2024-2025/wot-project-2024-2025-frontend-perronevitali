import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, TextInput, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import {SelectList} from 'react-native-dropdown-select-list';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewItemScreen(){
    const [type,setType] = useState(null)
    const router = useRouter()
    const substances = ["sub1","sub2","sub3"]
    const [selected,setSelected] = useState(null)

    const getItem = async () =>{
        const typeItem = await AsyncStorage.getItem("typeItem")
        setType(typeItem)
    }
    useEffect(()=>{
        getItem()
    },[])
    const handleCancel = async () =>{
        router.push("/")
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Nuovo {type} </Text>
            <View>
                <Text style={styles.text}>  Nome</Text>
                <TextInput  style={styles.input} />
                <Text style={styles.text}>  Sostanza</Text>
                <SelectList data={substances} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona una sostanza" value={selected} setSelected={setSelected} save='key'/>
                <Text style={styles.text}>  Quantità</Text>
                <TextInput style={styles.input}  />
                <Text style={styles.text}>  Unità di misura</Text>
                <TextInput style={styles.input}  />
                <View style={styles.buttonlist}>
                    <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                        <Text style={styles.textbutton}>Annulla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonCreate}>
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