import { useState } from "react";
import { View, StyleSheet,TouchableOpacity,Text, ImageBackground } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function TabTwoScreen() {

  const [selectedRoom, setSelectedRoom] = useState("");
  const handleFunct = () =>{
      console.log("Ciao")
      setSelectedRoom("Sala")
  }
  return (
    <View style={styles.container}>
        <TouchableOpacity style={styles.lobby}>
            <ImageBackground
                  source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/atrio.png")}
                  style={styles.lobby}

                  resizeMode="contain"
            >
                <Text style={styles.textbutton}>Ciao</Text>
            </ImageBackground>
        </TouchableOpacity>
        <View style={styles.zoneContainer}>
        <TouchableOpacity style={styles.zone}>
            <ImageBackground
                source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/zonaA.png")}
                style={styles.zone}

                resizeMode="contain"
              >
            <Text style={styles.textbutton}>Ciao</Text>
            </ImageBackground>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zone}>
            <ImageBackground
                source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/zonaA.png")}
                style={styles.zone}

                resizeMode="contain"
            >
                <Text style={styles.textbutton}>Ciao</Text>
            </ImageBackground>
       </TouchableOpacity>
       <TouchableOpacity style={styles.zone}>
            <ImageBackground
                source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/zonaA.png")}
                style={styles.zone}

                resizeMode="contain"
            >
            <Text style={styles.textbutton}>Ciao</Text>
            </ImageBackground>
       </TouchableOpacity>
       </View>
      <Svg width={320} height={260}>

        {/* SALA */}
        <Path
          d="M10 10 H310 V140 H10 Z"
          fill={selectedRoom === "Sala" ? "#00b894" : "#3498db"}
          stroke="black"
          strokeWidth={2}
          onPress={handleFunct}
        />

        {/* BAGNO */}
        <Path
          d="M10 140 H150 V250 H10 Z"
          fill={selectedRoom === "Bagno" ? "#00b894" : "#f39c12"}
          stroke="black"
          label="Bagno"
          labelX={80}
          labelY={195}
          strokeWidth={2}
          onPress={handleFunct}
        />

        {/* UFFICIO */}
        <Path
          d="M150 140 H310 V250 H150 Z"
          fill={selectedRoom === "Ufficio" ? "#00b894" : "#e74c3c"}
          stroke="black"
          strokeWidth={2}
          onPress={handleFunct}
        />

      </Svg>
       <View style={styles.zoneContainer}>
       <TouchableOpacity style={styles.hallway}>
            <ImageBackground
                source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/corridoio.png")}
                style={styles.hallway}
                resizeMode="contain"
            >
                <Text style={styles.textbutton}>Ciao</Text>
            </ImageBackground>
       </TouchableOpacity>
       <View style={styles.zoneContainer2}>
              <TouchableOpacity style={styles.zone}>
                  <ImageBackground
                      source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/zonaA.png")}
                      style={styles.zone}

                      resizeMode="contain"
                    >
                  <Text style={styles.textbutton}>Ciao</Text>
                  </ImageBackground>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zone}>
                  <ImageBackground
                      source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/zonaA.png")}
                      style={styles.zone}

                      resizeMode="contain"
                  >
                      <Text style={styles.textbutton}>Ciao</Text>
                  </ImageBackground>
             </TouchableOpacity>
             <TouchableOpacity style={styles.zone}>
                  <ImageBackground
                      source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/zonaA.png")}
                      style={styles.zone}

                      resizeMode="contain"
                  >
                  <Text style={styles.textbutton}>Ciao</Text>
                  </ImageBackground>
             </TouchableOpacity>
             </View>
             <TouchableOpacity style={styles.hallway}>
                    <ImageBackground
                        source={require("/Users/micheleviitali/Desktop/React-native/appmobilefaro/assets/images/zone/corridoio.png")}
                        style={styles.hallway}
                        resizeMode="contain"
                    >
                        <Text style={styles.textbutton}>Ciao</Text>
                    </ImageBackground>
             </TouchableOpacity>
             </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffa420",
    justifyContent: "center",
    alignItems: "center",
  },
  zoneContainer: {
    flexDirection: 'row',
  },
  zoneContainer2:{
    flexDirection: 'column'
  },
  lobby: {
      width: 312,
      height: 100,
      justifyContent: "flex-start",
      alignItems: "center",
       paddingTop: 8
  },
  zone: {
    padding: 1,
    marginLeft: 2,
    marginRight: 2,
    width: 100,
    height: 60,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  hallway:{
      padding: 1,
      paddingTop: 4,
      width: 90,
      height: 175,
      justifyContent: "flex-start",
      alignItems: "center",
  },
  textbutton:{
      fontSize:18,
      fontWeight: 'bold',
      color:'red',
  },
  divider:{
        fontSize:5,
        fontWeight: 'bold',
        color:'red'
    }
});