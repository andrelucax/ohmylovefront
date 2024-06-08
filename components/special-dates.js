import { SafeAreaView, Text, StyleSheet, ActivityIndicator, FlatList, RefreshControl, View, TouchableOpacity, TouchableWithoutFeedback, TextInput } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { get, post } from '../api';
import { Ionicons } from 'react-native-vector-icons';
import Dialog from "react-native-dialog";

export default function SpecialDatesScreen() {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState("");
    const [name, setName] = useState("");

    const dateInputRef = useRef(null);
    const nameInputRef = useRef(null);

    const onRefresh = useCallback(async () => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await get(
                "api/couple-specialdates"
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

    useEffect(() => {
        fetchData();
    }, []);

    formatDate = (date) => {
        let dateComponents = date.split('-');
        let year = dateComponents[0];
        let month = dateComponents[1];
        let day = dateComponents[2];
        return `${day}/${month}/${year}`;
    }

    formatTimeToDate = (date) => {
        const dateNow = new Date();

        const dateComponents = date.split('-');
        const year = dateComponents[0];
        const month = dateComponents[1] - 1;
        const day = dateComponents[2];
        const birthDate = new Date(year, month, day);
        const nextBirthDate = new Date(dateNow.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        if (nextBirthDate < dateNow) {
            nextBirthDate.setFullYear(dateNow.getFullYear() + 1);
        }

        const millisecondsDifference = nextBirthDate - dateNow;
        const secondsDifference = Math.floor(millisecondsDifference / 1000);
        const minutesDifference = Math.floor(secondsDifference / 60);
        const hoursDifference = Math.floor(minutesDifference / 60);
        const daysDifference = Math.floor(hoursDifference / 24);

        const monthsUntil = Math.floor(daysDifference / 30);
        const daysUntil = daysDifference % 30;
        const hoursUntil = hoursDifference % 24;
        const minutesUntil = minutesDifference % 60;
        const secondsUntil = secondsDifference % 60;

        if (dateNow.getDate() == birthDate.getDate() && dateNow.getMonth() == birthDate.getMonth()) {
            return "Feliz aniversário!";
        } else if (daysDifference == 0) {
            return `Faltam ${hoursUntil} horas e ${minutesUntil} minutos e ${secondsUntil} segundos`;
        } else if (daysDifference < 7) {
            return `Faltam ${daysDifference} dias, ${hoursUntil} horas e ${minutesUntil} minutos`;
        } else if (daysDifference <= 30) {
            return `Faltam ${daysDifference} dias`;
        } else {
            return `Faltam ${monthsUntil} meses e ${daysUntil} dias`;
        }
    }

    function showDialog() {
        setVisible(true);
    }

    function clearDialog() {
        setVisible(false);
        setName("");
        setDate("");
    }

    async function submitData() {
        if (!date || !name) {
            return;
        }

        try {
            await post(
                "api/couple-specialdates/create/",
                {
                    date: date,
                    name: name,
                },
            );
            clearDialog();
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
                <FlatList
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} />
                    }
                    data={data}
                    renderItem={({ item }) =>
                        <View
                            style={{
                                minHeight: 50,
                                backgroundColor: '#FFF',
                                justifyContent: 'center',
                                margin: 10,
                                padding: 10,
                                borderRadius: 5,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 22,
                                }}
                            >
                                {item.name}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 15,
                                }}
                            >
                                {formatDate(item.date)}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                }}
                            >
                                {formatTimeToDate(item.date)}
                            </Text>
                        </View>
                    }
                />

            }
            <SafeAreaView style={{
                position: 'absolute',
                bottom: 30,
                right: 5,
            }}>
                <TouchableOpacity
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={showDialog}
                >
                    <View
                        style={{
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
                        }}
                    >
                        <Ionicons name={'add'} size={35} color={'#FFF'} />
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
            <Dialog.Container visible={visible}>
                <Dialog.Title>Create new couple special date</Dialog.Title>
                <View style={styles.inputView}>
                    <TouchableWithoutFeedback onPress={() => nameInputRef.current.focus()}>
                        <View style={styles.inputContainer}>
                            <Text>Name</Text>
                            <TextInput ref={nameInputRef} style={styles.input} value={name} onChangeText={setName} autoCorrect={false} autoCapitalize='none' />
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => dateInputRef.current.focus()}>
                        <View style={styles.inputContainer}>
                            <Text>Date</Text>
                            <TextInput ref={dateInputRef} style={styles.input} value={date} onChangeText={setDate} autoCorrect={false} autoCapitalize='none' placeholder='YYYY-MM-DD' />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <Dialog.Button label="Cancel" onPress={clearDialog} />
                <Dialog.Button label="Enviar" onPress={submitData} />
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
    inputView: {
        gap: 20,
    },
});