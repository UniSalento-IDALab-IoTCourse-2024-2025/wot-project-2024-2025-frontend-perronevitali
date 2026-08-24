import { useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View, Modal } from 'react-native';
import { Divider } from "react-native-elements";
import { SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL, API_PORT_OS } from '@/constants/api';

export default function TaskHistoryScreen() {
    const endpointOS = API_BASE_URL + API_PORT_OS;
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState("");
    const [isGeneralAdmin, setIsGeneralAdmin] = useState(false);
    const [viewMode, setViewMode] = useState("mine");
    const [areaNames, setAreaNames] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedAreaName, setSelectedAreaName] = useState("");
    const router = useRouter();

    const fetchData = async () => {
        const managedId = JSON.parse(await AsyncStorage.getItem("managedId"));
        const currentToken = await AsyncStorage.getItem("token");
        const user = JSON.parse(await AsyncStorage.getItem("user"));
        setToken(currentToken);
        setIsGeneralAdmin(!managedId);
        if (!managedId) {
            getAreas(currentToken);
        }
        const closed = await getClosedTasksByAdmin(currentToken, user.id);
        setTasks(closed);
    };

    const getAreas = async (currentToken) => {
        const url = endpointOS + '/api/areas/';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + currentToken
                },
            });
            if (!response.ok) {
                console.log("Errore", url, ":", response.status);
                return;
            }
            const data = await response.json();
            const areasList = data.areas.areasList || [];
            let names = [];
            let areasObj = [];
            for (let area in areasList) {
                const name = areasList[area].name;
                const id = areasList[area].id;
                names.push(name);
                areasObj.push({ id, name });
            }
            setAreaNames(names);
            setAreas(areasObj);
        } catch (e) {
            console.log("Errore", url, ":", e);
        }
    };

    const getClosedTasksByAdmin = async (currentToken, id) => {
        const url = endpointOS + '/api/tasks/?adminId=' + id + '&active=false';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + currentToken
                },
            });
            if (!response.ok) {
                console.log("Errore", url, ":", response.status);
                return [];
            }
            const data = await response.json();
            const allTasks = data.tasks.tasksList || [];
            return allTasks.filter(t => t.status === "CLOSED");
        } catch (e) {
            console.log("Errore", url, ":", e);
            return [];
        }
    };

    const getClosedTasksByArea = async (currentToken, areaId) => {
        const url = endpointOS + '/api/tasks/?areaId=' + areaId + '&active=false';
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + currentToken
                },
            });
            if (!response.ok) {
                console.log("Errore", url, ":", response.status);
                return [];
            }
            const data = await response.json();
            const allTasks = data.tasks.tasksList || [];
            return allTasks.filter(t => t.status === "CLOSED");
        } catch (e) {
            console.log("Errore", url, ":", e);
            return [];
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const loadAreaTasks = async () => {
            if (viewMode === "area" && selectedAreaName && token) {
                const areaChoise = areas.find(({ name }) => name === selectedAreaName);
                if (areaChoise) {
                    const closed = await getClosedTasksByArea(token, areaChoise.id);
                    setTasks(closed);
                }
            }
        };
        loadAreaTasks();
    }, [selectedAreaName]);

    const toggleViewMode = async () => {
        if (viewMode === "mine") {
            setViewMode("area");
            setTasks([]);
        } else {
            setViewMode("mine");
            setSelectedAreaName("");
            const user = JSON.parse(await AsyncStorage.getItem("user"));
            const closed = await getClosedTasksByAdmin(token, user.id);
            setTasks(closed);
        }
    };

    const comeBackToHome = async () => {
        router.replace("/");
    };

    const getDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleDateString("it-IT");
    };

    const getHour = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString("it-IT");
    }
    const getType = (type) => {
        switch (type) {
            case "LOADING": return "CARICO";
            case "UNLOADING": return "SCARICO";
            case "INSPECTION": return "ISPEZIONE";
            case "MAINTENANCE": return "MANUTENZIONE";
            case "TRANSFER": return "SPOSTAMENTO";
            default: return type;
        }
    };

    const isFullyRejected = (task) => {
        const total = task.workerIds ? task.workerIds.length : 0;
        const rejected = task.rejectedByWorkerIds ? task.rejectedByWorkerIds.length : 0;
        return total > 0 && rejected === total;
    };

    const openModal = (task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };
    const closeModal = () => {
        setSelectedTask(null);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={{ backgroundColor: '#ffa420' }}
               // contentContainerStyle={{ flexGrow: 1 }}
            >
                <Text style={styles.start}>Task completate e rifiutate</Text>

                {isGeneralAdmin && (
                    <View>
                        <TouchableOpacity style={styles.button} onPress={toggleViewMode}>
                            <Text style={styles.textbutton}>
                                {viewMode === "mine" ? "Vedi task per area" : "Vedi le mie task assegnate"}
                            </Text>
                        </TouchableOpacity>
                        {viewMode === "area" && (
                            <View>
                                <Text style={styles.text}>  Area:</Text>
                                <SelectList
                                    data={areaNames}
                                    boxStyles={{ width: '90%', backgroundColor: 'white', marginLeft: 10 }}
                                    dropdownStyles={{ width: '90%', backgroundColor: 'white', marginLeft: 10 }}
                                    placeholder="Seleziona un'area"
                                    value={selectedAreaName}
                                    setSelected={setSelectedAreaName}
                                    save='key'
                                />
                            </View>
                        )}
                        <Divider style={{ backgroundColor: '#ccc', marginVertical: 10, marginHorizontal: 10 }} />
                    </View>
                )}

                {viewMode === "area" && !selectedAreaName && (
                    <Text style={styles.emptyText}>Seleziona un'area per visualizzare le task</Text>
                )}
                {tasks.map((task, key) => {
                    const rejected = isFullyRejected(task);
                    return (
                        <View style={styles.container} key={key}>
                            <TouchableOpacity
                                style={styles.boxMessage}
                                onPress={() => { openModal(task) }}
                            >
                                <View style={styles.textContainer}>
                                    <Text style={styles.message}>Nome: <Text style={styles.infoText}>{task.nome}</Text></Text>
                                    <Text style={styles.message}>Tipo: <Text style={styles.infoText}>{getType(task.operationType)}</Text></Text>
                                    <Text style={styles.message}>Esito: <Text style={styles.infoText}>{rejected ? "RIFIUTATA" : "COMPLETATA"}</Text></Text>
                                    <Text style={styles.hourMessage}>{getDate(task.closedAt)}{"\t"}{"\t"}{"\t"}{"\t"}{getHour(task.closedAt)}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                            <Divider style={{ backgroundColor: '#ffa420', marginVertical: 1, width: "30%", alignSelf: 'center', height: 5 }} />
                            <Divider style={{ backgroundColor: '#ccc', marginVertical: 10 }} />
                            <Text style={styles.modalText}>Tipo Operazione: <Text style={styles.infomodalText}>{getType(selectedTask?.operationType)}</Text></Text>
                            <Text style={styles.modalText}>Descrizione: <Text style={styles.infomodalText}>{selectedTask?.riskDescription}</Text></Text>
                            <Text style={styles.modalText}>Esito: <Text style={styles.infomodalText}>{selectedTask && isFullyRejected(selectedTask) ? "RIFIUTATA DA TUTTI I WORKER" : "COMPLETATA"}</Text></Text>
                            {selectedTask?.rejectedByWorkerIds?.length > 0 && (
                                <Text style={styles.modalText}>
                                    Motivazioni: <Text style={styles.infomodalText}>
                                        {selectedTask.rejectedByWorkerIds
                                            .map(wid => selectedTask.rejectionReasons?.[wid])
                                            .filter(Boolean)
                                            .join(", ") || "Nessuna motivazione fornita"}
                                    </Text>
                                </Text>
                            )}
                        </View>
                    </View>
                </Modal>
                <TouchableOpacity style={styles.button} onPress={comeBackToHome}>
                    <Text style={styles.textbutton}>Torna alla home</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'left',
        padding: 1,
        alignItems: 'left',
        backgroundColor: '#ffa420',
        justifyContent: 'space-between',
    },
    start: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 40,
        marginLeft: 10,
        color: 'white',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    emptyText: {
        fontSize: 18,
        color: 'white',
        marginTop: 20,
        marginLeft: 10,
    },
    boxMessage: {
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#2c2e52',
        borderRadius: 10,
    },
    message: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white'
    },
    textContainer: {
        flex: 1,
    },
    hourMessage: {
        fontSize: 14,
        color: '#cfcfcf',
        marginTop: 4,
    },
    textbutton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    infoText: {
        fontSize: 24,
        fontWeight: 'bold',
        alignItems: 'right',
        alignSelf: 'right',
        color: '#ffa420',
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
    modalText: {
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
        color: 'white'
    },
    infomodalText: {
        fontSize: 20,
        marginTop: 10,
        fontWeight: 'bold',
        color: '#ffa420'
    },
    button: {
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#ff4700',
        height: 60,
        width: 200,
        borderRadius: 15
    },
    buttonToggle: {
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: '#2c2e52',
        height: 55,
        width: 280,
        borderRadius: 15
    },
});
