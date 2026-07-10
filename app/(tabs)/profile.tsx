import { useState,useEffect } from 'react';
import { StyleSheet,View, Button, Text, TextInput, TouchableOpacity,ScrollView} from 'react-native';
import { Divider } from 'react-native-elements';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {

    const  router = useRouter();
    const [name,setName] = useState('');
    const [id,setId] = useState('')
    const [surname,setSurname] = useState('');
    const [email,setEmail] = useState('');
    const [phone,setPhone] = useState('');

    const getInfoUser = async () =>{
        const user = JSON.parse(await AsyncStorage.getItem("user"))
        setName(user.nome)
        setSurname(user.cognome)
        setEmail(user.email)
        setPhone("1234567890")
    }
    useEffect(()=>{
        getInfoUser()
    },[])


      const logout = async() =>{
          try{
              router.push('login')
          }catch(error){
              console.log('Si è verificato un errore durante la cancellazione del token: ',error)
          }
      }


    return (
        <View style={styles.container}>
              <Text style={styles.start}> Le tue infromazioni personali </Text>
                <View style={styles.infotab1}>
                    <Text style={styles.text}>  Nome</Text>
                    <TextInput  style={styles.input}  onChangeText={setName} editable={false} value={name}/>
                    <Text style={styles.text}>  Cognome</Text>
                    <TextInput style={styles.input}  onChangeText={setSurname} editable={false} value={surname}/>
                    <Text style={styles.text}>  Telefono</Text>
                    <TextInput style={styles.input}  onChangeText={setPhone} editable={false} value={phone}/>
                    <Text style={styles.text}>  Email</Text>
                    <TextInput style={styles.input} onChangeText={setEmail} editable={false} value={email}/>
                </View>
                <View>
                    <TouchableOpacity onPress={logout} style={styles.buttonlog}>
                        <Text style={styles.textbutton}>Logout</Text>
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
      marginTop:60
    },
    text:{
        fontSize: 18,
        fontWeight: 'bold',
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
});