import { useState, useEffect, useCallback, useRef } from 'react';
import { Text, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl, TouchableWithoutFeedback, StyleSheet, TextInput } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view'
import { Ionicons } from 'react-native-vector-icons';
import Dialog from "react-native-dialog";
import { get, post, put } from '../api';

export default function SharedWishListScreen() {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");

    const inputRef = useRef(null);

    const onRefresh = useCallback(async () => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await get(
                "api/couple-wishlist/",
            );
            setData(result);
        }
        catch (e) {
            alert(e);
        }
        finally {
            setLoading(false);
        }
    };

    const showDialog = () => {
        setVisible(true);
    };

    const clearDialog = () => {
        setVisible(false);
        setName("");
    };

    const submitData = async () => {
        setLoading(true);
        try {
            await post(
                "api/couple-wishlist/create/",
                {
                    message: name,
                    completed: false,
                }
            );
            clearDialog();
            fetchData();
        }
        catch (e) {
            alert(e);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const markConcluded = async (item) => {
        setLoading(true);
        try {
            await put(
                `api/couple-wishlist/${item.id}/`,
                {
                    message: item.message,
                    completed: true,
                }
            );
            fetchData();
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
            {isLoading ? <ActivityIndicator size="large" /> :
                <SwipeListView
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} />
                    }
                    data={data}
                    renderItem={({ item }) =>
                        <View
                            style={styles.item}
                        >
                            <Text
                                style={styles.itemMessage}
                            >
                                {item.message}
                            </Text>
                        </View>
                    }
                    renderHiddenItem={({ item }) =>
                        <View style={styles.concludedContainer}>
                            <TouchableOpacity
                                style={styles.concludedButton}
                                onPress={() => markConcluded(item)}
                            >
                                <Text style={styles.concludedText}>Concluido</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    leftOpenValue={100}
                />
            }
            <SafeAreaView style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={showDialog}
                >
                    <View
                        style={styles.buttonIconContainer}
                    >
                        <Ionicons name={'add'} size={35} color={'#FFF'} />
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
            <Dialog.Container visible={visible}>
                <Dialog.Title>Adicionar novo item a lista de desejos</Dialog.Title>
                <TouchableWithoutFeedback onPress={() => inputRef.current.focus()}>
                    <View style={styles.inputContainer}>
                        <Text>Message</Text>
                        <TextInput ref={inputRef} style={styles.input} value={name} onChangeText={setName} autoCorrect={false} autoCapitalize='none' />
                    </View>
                </TouchableWithoutFeedback>
                <Dialog.Button label="Cancel" onPress={clearDialog} />
                <Dialog.Button label="Submit" onPress={submitData} />
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
    item: {
        minHeight: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        margin: 10,
        padding: 10,
        borderRadius: 5,
    },
    itemMessage: {
        fontSize: 15,
    },
    concludedContainer: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        margin: 10,
        borderRadius: 5,
    },
    concludedButton: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 110,
        backgroundColor: '#72BF6A',
        left: 0,
        borderRadius: 5,
    },
    concludedText: {
        color: '#FFF',
        marginLeft: -10
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        right: 5,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6A6A6A',
        shadowColor: '#6A6A6A',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
});