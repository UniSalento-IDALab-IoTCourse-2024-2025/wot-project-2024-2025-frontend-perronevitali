import { useState,useEffect } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,ScrollView,View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

export default function MessageScreen() {
    const clickMessage = () =>{
        console.log("Mi ha cliccato")
     }
    return (
        <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>I tuoi messaggi</Text>
           <View style={styles.container}>
               <View style={styles.boxMessage}>
                   <View style={styles.textContainer}>
                       <Text style={styles.message}>
                           Zona 1
                       </Text>
                   </View>
                    <TouchableOpacity onPress={clickMessage}>
                   <Feather
                       name="external-link"
                       size={28}
                       color="#ff4700"

                   />
                    </TouchableOpacity>
               </View>
           </View>
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
      marginLeft: 10
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
});