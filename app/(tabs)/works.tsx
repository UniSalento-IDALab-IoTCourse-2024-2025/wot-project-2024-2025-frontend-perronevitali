import { useState,useEffect } from 'react';
import { Platform, Text, StyleSheet, TouchableOpacity,View,ScrollView} from 'react-native';

export default function WorksScreen() {

    return (
        <ScrollView style={{backgroundColor:'#ffa420'}}>
            <Text style={styles.start}>Compiti da svolgere</Text>
            <View style={styles.container}>
                <TouchableOpacity style={styles.boxMessage}>
                     <View style={styles.textContainer}>
                        <Text style={styles.message}> Compito 1 </Text>
                        <Text style={styles.hourMessage}>28/06/2026{"\t"}{"\t"}{"\t"}{"\t"}14:30</Text>
                     </View>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.Cancelbutton}>
                    <Text style={styles.message}> Annulla </Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.Perfbutton}>
                    <Text style={styles.message}> Svolto </Text>
                 </TouchableOpacity>
            </View>
        </ScrollView>
    )


}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'left',
    padding: 5,
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
      marginTop: 30,
      marginBottom: 30,
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
    marginTop: 30,
    marginBottom: 30,
    marginLeft:10,
    width:30,
    borderRadius:5,
  },
  Perfbutton:{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:'green',
      marginTop: 30,
      marginBottom: 30,
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
});