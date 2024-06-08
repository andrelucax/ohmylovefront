import { useState, useEffect, useRef } from 'react'
import { SafeAreaView, Text, Image, StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, post } from '../api';
const logo = require("../assets/logo.png")

export default function LoginScreen({ navigation }) {
    const [isLoading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const passwordInputRef = useRef(null);
    const emailInputRef = useRef(null);

    async function login() {
        if (!email || !password) {
            return;
        }
        setLoading(true);
        try {
            const result = await post(
                "api/login/",
                {
                    "email": email,
                    "password": password
                }
            );
            await AsyncStorage.setItem('token', result.token);
            await AsyncStorage.setItem('email', email);
            navigateToHome(result.token);
        }
        catch (e) {
            alert(e);
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const loadToken = async () => {
            let token = await AsyncStorage.getItem('token')
            if (token) {
                navigateToHome(token);
            }
        };

        const loadEmail = async () => {
            let email = await AsyncStorage.getItem('email')
            if (email) {
                setEmail(email);
            }
        };

        loadToken();
        loadEmail();
    }, []);

    function navigateToHome(token) {
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        setPassword("");
        navigation.navigate('Oh my Love!');
    }

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? <ActivityIndicator style={styles.loading} size="large" /> : <></>}
            <Image source={logo} style={styles.image} resizeMode='contain' />
            <View style={styles.inputView}>
                <TouchableWithoutFeedback onPress={() => emailInputRef.current.focus()}>
                    <View style={styles.inputContainer}>
                        <Text>Email</Text>
                        <TextInput ref={emailInputRef} style={styles.input} value={email} onChangeText={setEmail} autoCorrect={false} autoCapitalize='none' />
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => passwordInputRef.current.focus()}>
                    <View style={styles.inputContainer}>
                        <Text>Password</Text>
                        <TextInput ref={passwordInputRef} style={styles.input} secureTextEntry value={password} onChangeText={setPassword} autoCorrect={false} autoCapitalize='none' />
                    </View>
                </TouchableWithoutFeedback>
            </View>
            <View style={styles.buttonView}>
                <TouchableOpacity style={styles.button} onPress={login}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
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
        backgroundColor: "#F4F3FB",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        height: "100%",
    },
    image: {
        height: 200,
        width: 200,
    },
    inputView: {
        paddingTop: 20,
        width: "100%",
        paddingHorizontal: 50,
        gap: 20,
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 5,
    },
    input: {
        width: "100%",
    },
    button: {
        backgroundColor: "#E31B23",
        height: 45,
        borderColor: "#6A6A6A",
        borderWidth: 1,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    buttonView: {
        width: "100%",
        paddingHorizontal: 50,
        marginTop: 20,
    },
})