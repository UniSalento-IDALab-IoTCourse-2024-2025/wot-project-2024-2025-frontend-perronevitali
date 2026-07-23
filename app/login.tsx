import React, { useState } from 'react';
import { View, Label, Text, TextInput, StyleSheet, TouchableOpacity,Button } from 'react-native';
import { Divider } from 'react-native-elements';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL,API_PORT_US } from '@/constants/api';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const endpoint = API_BASE_URL+API_PORT_US;

  const getExpoToken = async () =>{
      let token;
       try {
          const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          if (!projectId) {
            throw new Error('Project ID not found');
          }else{
            console.log(projectId)
          }
          token = (
            await Notifications.getExpoPushTokenAsync({
              projectId,
            })
          ).data;
          console.log("The token",token);
        } catch (e) {
          token = `${e}`;
          console.log("Errore token",token)
        }
  }
  const getAuthorizedAreas = async(token,emailUser) =>{
         try{
             const url = endpoint+"/api/workers/email?email="+emailUser

             const response = await fetch(url,{
                 method: 'GET',
                 headers:{
                     'Content-Type': 'application/json',
                     'Authorization': 'Bearer '+token
                 }
            })
            if(!response.ok){
                console.log(response.status,": api/workers/email?email")
            }else{
              const data = await response.json()
              const workAreaList = data.workers.workersList[0].authorizedAreaIds
              await AsyncStorage.setItem("authArea",JSON.stringify(workAreaList))
            }
        }catch(e){
          console.log("Errore chiamata API GET AREA WORKER",e)
        }
     }

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
            const url = endpoint+'/api/authenticate/'
            console.log(url)
            const response = await fetch(url,{
                method: 'POST',
                headers:{
                   'Content-Type': 'application/json',
                },
                body: JSON.stringify(userDTO)
            })
            if(!response.ok){
                console.log(response.status)
                console.log('Credenziali errate')
                setError('Credenziali errate')
            }else{
                 const data = await response.json();
                 const {token} = data;
                 if(token){
                     //console.log(token)
                     seeUser(token,username)
                     getExpoToken()
                     await AsyncStorage.setItem("token",token)
                 }
             }
        }catch(e){
            console.log('Errore nella chiamata API '+e)
        }
    }
  };

  const seeUser = async (token,emailUser) =>{
      let loggedUser = null
      try{
          const url = endpoint+'/api/users/email?email='+emailUser
          const response = await fetch(url,{
              method: 'GET',
              headers:{
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+token
              }
          })
          if(!response.ok){
              console.log(response.status)
          }else{
              const data = await response.json()
              const loggedUser = data.users.usersList[0]
              await AsyncStorage.setItem('user',JSON.stringify(loggedUser))
              if(loggedUser.role==="WORKER"){
                  await AsyncStorage.setItem('userRole', 'worker')
                  getAuthorizedAreas(token,emailUser)
                  router.push('/')
              }else if(loggedUser.role==="ADMIN"){
                  await AsyncStorage.setItem('userRole', 'admin')
                  router.push('/adminTabs/adminHome')
              }else{
                  console.log("Role unknow")
             }
          }
      }catch(e){
          console.log("Errore chiamata API GET WORKER:",e)
      }
  }
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