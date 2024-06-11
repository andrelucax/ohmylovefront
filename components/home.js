import { SafeAreaView, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, ImageBackground, TouchableOpacity, View, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { get, post } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from 'react-native-vector-icons';
import Dialog from "react-native-dialog";
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
    const [isLoading, setLoading] = useState(false);

    const [imageUrl, setImageUrl] = useState("");
    const [imageName, setImageName] = useState("");
    const [message, setMessage] = useState("");

    const [createFileVisible, setCreateFileVisible] = useState(false);
    const [createFileImage, setCreateFileImage] = useState("");
    const [createFileName, setCreateFileName] = useState("");

    const [createMessageVisible, setCreateMessageVisible] = useState(false);
    const [createMessage, setCreateMessage] = useState("");

    const createFileNameInputRef = useRef(null);
    const createMessageInputRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        let lastMessage = await AsyncStorage.getItem("lastMessage");
        if (lastMessage) {
            lastMessage = JSON.parse(lastMessage);
        }

        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        if (lastMessage && lastMessage.date == currentDate.getTime()) {
            setImageUrl(lastMessage.imageUrl);
            setImageName(lastMessage.imageName);
            setMessage(lastMessage.message);
            setLoading(false);
            return;
        }

        try {
            const result = await get(
                "api/message-of-the-day/"
            );

            await AsyncStorage.setItem("lastMessage", JSON.stringify({
                imageUrl: result.image?.url,
                imageName: result.image?.name,
                message: result.message?.message,
                date: currentDate.getTime(),
            }));

            setImageUrl(result.image?.url);
            setImageName(result.image?.name);
            setMessage(result.message?.message);
        }
        catch (e) {
            alert(e);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(async () => {
        fetchData();
    }, []);

    async function submitFile() {
        if (!createFileName || !createFileImage) {
            return;
        }

        const formData = new FormData();
        formData.append('file', {
            uri: createFileImage.uri,
            name: createFileImage.fileName,
            type: createFileImage.mimeType
        });
        formData.append('name', createFileName);

        setLoading(true);
        try {
            await post(
                "api/couple-images/create/",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            clearCreateFile();
        }
        catch (e) {
            alert(e);
        }
        finally {
            setLoading(false);
        }
    }

    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
        });
        
        let image = result?.assets[0];

        if (image) {
            setCreateFileImage(image);
        }
    }

    function clearCreateFile() {
        setCreateFileVisible(false);
        setCreateFileImage("");
        setCreateFileName("");
    }

    function clearCreateMessage() {
        setCreateMessageVisible(false);
        setCreateMessage("");
    }

    async function submitMessage() {
        if (!createMessage) {
            return;
        }

        setLoading(true);
        try {
            await post(
                "api/couple-messages/create/",
                {
                    message: createMessage,
                },
            );
            clearCreateMessage();
        }
        catch (e) {
            alert(e);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? <ActivityIndicator style={styles.loading} size="large" /> :
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} />
                    }>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => setCreateFileVisible(true)}>
                            <Ionicons name={'image'} size={25} color={"black"} />
                            <Text style={styles.buttonText}>Create file</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setCreateMessageVisible(true)}>
                            <Ionicons name={'text'} size={25} color={"black"} />
                            <Text style={styles.buttonText}>Create message</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.imageContainer}>
                        <ImageBackground
                            style={styles.image}
                            source={{
                                uri: imageUrl,
                            }}
                        >
                            <Text style={styles.message}>
                                {message}
                            </Text>
                            <Text style={styles.imageName}>
                                {imageName}
                            </Text>
                        </ImageBackground>
                    </View>
                </ScrollView>
            }
            <Dialog.Container visible={createFileVisible}>
                <Dialog.Title style={styles.dialogTitle}>Create new couple file</Dialog.Title>
                <View style={styles.inputView}>
                    <TouchableOpacity onPress={pickImage}><Text style={styles.pickImage}>{createFileImage ? "Change image" : "Pick image"}</Text></TouchableOpacity>
                    <TouchableWithoutFeedback onPress={() => createFileNameInputRef.current.focus()}>
                        <View style={styles.inputContainer}>
                            <Text>Name</Text>
                            <TextInput ref={createFileNameInputRef} style={styles.input} value={createFileName} onChangeText={setCreateFileName} autoCorrect={false} autoCapitalize='none' />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <Dialog.Button label="Cancel" onPress={clearCreateFile} />
                <Dialog.Button label="Submit" disabled={isLoading} onPress={submitFile} />
            </Dialog.Container>
            <Dialog.Container visible={createMessageVisible}>
                <Dialog.Title style={styles.dialogTitle}>Create new couple message</Dialog.Title>
                <TouchableWithoutFeedback onPress={() => createMessageInputRef.current.focus()}>
                    <View style={styles.inputContainer}>
                        <Text>Message</Text>
                        <TextInput ref={createMessageInputRef} style={styles.input} value={createMessage} onChangeText={setCreateMessage} autoCorrect={false} autoCapitalize='none' />
                    </View>
                </TouchableWithoutFeedback>
                <Dialog.Button label="Cancel" onPress={clearCreateMessage} />
                <Dialog.Button label="Submit" disabled={isLoading} onPress={submitMessage} />
            </Dialog.Container>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loading: {
        position: "absolute",
        zIndex: 1,
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
        flex: 1,
        backgroundColor: "#F4F3FB",
    },
    scrollContainer: {
        display: 'flex',
        height: "100%",
        width: "100%",
    },
    image: {
        height: 350,
        width: '100%',
        alignItems: 'center',
    },
    message: {
        fontSize: 30,
        color: '#FFF',
        textShadowColor: '#000',
        textShadowRadius: 4,
        textAlign: 'center',
        bottom: 10,
        position: 'absolute',
    },
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 20,
    },
    imageContainer: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center'
    },
    button: {
        borderColor: "#6A6A6A",
        borderWidth: 1,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
    },
    buttonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
    },
    imageName: {
        fontSize: 20,
        color: '#FFF',
        textShadowColor: '#000',
        textShadowRadius: 4,
        textAlign: 'center',
        top: 10,
        position: 'absolute'
    },
    pickImage: {
        color: "blue"
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 5,
        maxWidth: "100%",
    },
    input: {
        width: "100%",
    },
    inputView: {
        gap: 20,
    },
    dialogTitle: {
        color: 'black',
    },
});