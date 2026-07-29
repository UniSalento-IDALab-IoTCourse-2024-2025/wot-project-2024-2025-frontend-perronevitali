import { useState,useEffect } from 'react';
import { StyleSheet,View, Button, Text, TextInput, TouchableOpacity,ScrollView} from 'react-native';
import { Divider } from 'react-native-elements';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SelectList} from 'react-native-dropdown-select-list';

export default function CreateAdmin () {
    const router = useRouter()
    const data =["Area1","Area2","Area3"]
    const [selected,setSelected] = useState(null)
    const handleCancel = async () =>{
        router.push("/")
    }
    return(
        <View style={styles.container}>
            <Text style={styles.start}>Crea un nuovo amminstratore</Text>
            <View>
                <Text style={styles.text}>  Nome</Text>
                <TextInput  style={styles.input} />
                <Text style={styles.text}>  Cognome</Text>
                <TextInput style={styles.input}  />
                <Text style={styles.text}>  Email</Text>
                <View style={styles.emailContainer}>
                    <TextInput style={styles.input} />
                </View>
                <Text style={styles.text}>  Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                />
                <Text style={styles.text}>  Conferma Password</Text>
                <TextInput
                    style={styles.input}
                    secureTextEntry
                />
                <Text style={styles.text}>  Aree da amministrare:</Text>
                <SelectList data={data} style={{width:500, height:500, marginVertical:10}} boxStyles={{backgroundColor:'white'}} placeholder="Seleziona un' area" value={selected} setSelected={setSelected} save='key'/>
            </View>
            <View style={styles.buttonlist}>
                <TouchableOpacity style={styles.buttonlog} onPress={handleCancel}>
                    <Text style={styles.textbutton}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttoncreate}>
                    <Text style={styles.textbutton}>Crea </Text>
                </TouchableOpacity>
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
      fontSize: 24,
      fontWeight: 'bold',
      marginTop:60,
      color: 'white'
    },
    text:{
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    buttonlist:{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
        marginTop: 20,
    },
   button:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'#ff4700',
    marginTop:10,
    marginBottom:10,
    height: 60,
    width:200,
    borderRadius:15
  },
  buttonCreate:{
        justifyContent: 'center',
        alignItems:'center',
        backgroundColor:'green',
        height: 60,
        width:270,
        marginTop:10,
        marginBottom:10,
        borderRadius:15
  },
  buttonlog:{
    justifyContent: 'center',
    alignItems:'center',
    backgroundColor:'red',
    height: 60,
    width:100,
    borderRadius:15
  },
  textbutton:{
    fontSize:18,
    fontWeight: 'bold',
    color:'white'
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
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suffix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
  buttoncreate:{
      justifyContent: 'center',
      alignItems:'center',
      backgroundColor:'green',
      height: 60,
      width:100,
      borderRadius:15,
      marginLeft: 30
  }
});