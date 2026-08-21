import { useState,useEffect,useRef } from 'react';
import { View,Platform,ScrollView, Text, StyleSheet, TouchableOpacity,Button,Modal } from 'react-native';
import {Divider} from "react-native-elements";
import { List } from 'react-native-paper';
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TaksList(){
    const router = useRouter()
    const goToCreateTak = async () =>{
        router.replace("/activity/taskopt")
    }
    const goToEvaluateTask = async () =>{
        router.replace("/activity/valutation")
    }
    const goToTaskHistory = async () =>{
        router.replace("/activity/taskhistory")
    }
    return(
        <View style={styles.container}>
                <Text style={styles.start}>Task</Text>
                <List.Section>
                      <List.Item
                        title="Crea una nuova task"
                        style={styles.buttonSup}
                        titleStyle={styles.modalText}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => {goToCreateTak()}}
                      />

                      <List.Item
                        title="Valuta una task"
                        style={styles.buttonMid}
                        titleStyle={styles.modalText}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => {goToEvaluateTask()}}
                      />

                      <List.Item
                        title="Task completate e rifiutate"
                        style={styles.buttonInf}
                        titleStyle={styles.modalText}
                        right={() => <List.Icon icon="chevron-right" />}
                        onPress={() => {goToTaskHistory()}}
                      />
                </List.Section>
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
   button:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'#ff4700',
    height: 60,
    width:200,
    borderRadius:15
  },
  textbutton:{
    fontSize:18,
    fontWeight: 'bold',
    color:'white'
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
  buttonCenter:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'gold',
    height: 60,
    width:300,
  },
  buttonSup:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'gold',
      height: 60,
      width:300,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
  },
  buttonMid:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'gold',
      height: 60,
      width:300,
  },
  buttonInf:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'gold',
      height: 60,
      width:300,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
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
});