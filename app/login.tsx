import React, { useState } from 'react';
import { View, Label, Text, TextInput, StyleSheet, TouchableOpacity,Button } from 'react-native';
import { Divider } from 'react-native-elements';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {

    //const invokeUrl = 'https://auoobynp11.execute-api.us-east-1.amazonaws.com/ReviewSwapp'
    if(username==='' || username===null || password==='' || password===null){
        setError('Inserisci la mail o la password');
    }else{
        try{
            const userDTO = {
                'email':username,
                'password':password
            }
            const response = await fetch('http://100.81.116.116:8080/api/users/authenticate',{
                method: 'POST',
                headers:{
                   'Content-Type': 'application/json',
                },
                body: JSON.stringify(userDTO)
            })
            if(!response.ok){
                console.log(response.status)
                console.log('Credenziali errate')
                await AsyncStorage.setItem('userRole', 'admin');
                 router.push('/')
                setError('Credenziali errate')
            }else{
                 const data = await response.json();

                 const {jwt} = data;
                 if(jwt){
                     await AsyncStorage.setItem('userRole', 'worker');
                    router.push('/')
                 }
             }
        }catch(e){
            console.log('Errore nella chiamata API '+e)
        }
    }
  };

  return(
      <>
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.textbutton}>Accedi</Text>
          </TouchableOpacity>
          <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
          <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
            <Text style={styles.title}>Non hai un account?</Text>

        </View>
       </>
  );
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