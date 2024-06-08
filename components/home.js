import { SafeAreaView, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl, ImageBackground } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { get } from '../api';

export default function HomeScreen() {
    const [isLoading, setLoading] = useState(true);
    const [image, setImage] = useState("");
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await get(
                "api/message-of-the-day"
            );
            setImage(result.image);
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

    return (
        <SafeAreaView style={styles.container}>
            {isLoading ? <ActivityIndicator style={styles.loading} size="large" /> :
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    refreshControl={
                        <RefreshControl onRefresh={onRefresh} />
                    }>
                    <ImageBackground
                        style={styles.image}
                        source={{
                            uri: image,
                        }}
                    >
                        <Text style={styles.message}>
                            {message}
                        </Text>
                    </ImageBackground>
                </ScrollView>
            }
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
        flex: 1,
        justifyContent: 'center',
    },
    image: {
        height: 500,
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
});