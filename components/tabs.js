import { TouchableWithoutFeedback, View, Text, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SpecialDatesScreen from './special-dates'
import HomeScreen from './home'
import SharedWishListScreen from './shared-wish-list'
import { Ionicons } from 'react-native-vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

const Tab = createBottomTabNavigator();

export function LogoutButton({ navigation }) {
    function logout() {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {
                text: 'Cancel',
            },
            {
                text: 'Yes, logout', onPress: () => {
                    AsyncStorage.removeItem("token");
                    api.defaults.headers.common['Authorization'] = null;
                    navigation.navigate('Login');
                }
            },
        ]);
    }

    return (
        <TouchableWithoutFeedback onPress={logout}>
            <Ionicons name={'exit'} size={25} color={"black"} style={{ marginRight: 20 }} />
        </TouchableWithoutFeedback>
    )
}

export function HomeTabBarButton({ children, onPress }) {
    return (
        <TouchableWithoutFeedback
            onPress={onPress}
        >
            <View style={styles.centerButtonContainer}>
                <View
                    style={styles.centerButton}
                >
                    {children}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

export function Tabs({ navigation }) {
    return (
        <Tab.Navigator
            initialRouteName="Home"
        >
            <Tab.Screen name="SpecialDates" component={SpecialDatesScreen}
                options={{
                    title: "Datas especiais",
                    tabBarLabel: ({ focused }) => (
                        <Text style={{ fontSize: 12, color: focused ? '#E31B23' : '#6A6A6A' }}>Datas especiais</Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={'calendar'} size={25} color={focused ? '#E31B23' : '#6A6A6A'} />
                    ),
                    headerRight: () => <LogoutButton navigation={navigation} />
                }}
            />
            <Tab.Screen name="Home" component={HomeScreen}
                options={{
                    title: "Oh my Love!",
                    tabBarLabel: () => null,
                    tabBarIcon: () => (
                        <Ionicons name={'heart'} size={35} color={'#FFF'} />
                    ),
                    tabBarButton: (props) => (
                        <HomeTabBarButton {...props} />
                    ),
                    headerRight: () => <LogoutButton navigation={navigation} />
                }}
            />
            <Tab.Screen name="SharedWishList" component={SharedWishListScreen}
                options={{
                    title: "Lista de desejos",
                    tabBarLabel: ({ focused }) => (
                        <Text style={{ fontSize: 12, color: focused ? '#E31B23' : '#6A6A6A' }}>Lista de desejos</Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Ionicons name={'list'} size={25} color={focused ? '#E31B23' : '#6A6A6A'} />
                    ),
                    headerRight: () => <LogoutButton navigation={navigation} />
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    centerButtonContainer: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#E31B23',
        shadowColor: '#E31B23',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
});