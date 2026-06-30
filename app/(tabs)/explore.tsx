import { useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function TabTwoScreen() {

  const [selectedRoom, setSelectedRoom] = useState("");

  return (
    <View style={styles.container}>

      <Svg width={320} height={260}>

        {/* SALA */}
        <Path
          d="M10 10 H310 V140 H10 Z"
          fill={selectedRoom === "Sala" ? "#00b894" : "#3498db"}
          stroke="black"
          strokeWidth={2}
          onPress={() => setSelectedRoom("Sala")}
        />

        {/* BAGNO */}
        <Path
          d="M10 140 H150 V250 H10 Z"
          fill={selectedRoom === "Bagno" ? "#00b894" : "#f39c12"}
          stroke="black"
          strokeWidth={2}
          onPress={() => setSelectedRoom("Bagno")}
        />

        {/* UFFICIO */}
        <Path
          d="M150 140 H310 V250 H150 Z"
          fill={selectedRoom === "Ufficio" ? "#00b894" : "#e74c3c"}
          stroke="black"
          strokeWidth={2}
          onPress={() => setSelectedRoom("Ufficio")}
        />

      </Svg>

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
});