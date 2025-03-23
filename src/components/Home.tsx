import React, { useState } from 'react';
import { Button, TextInput, View, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNCallKeep from 'react-native-callkeep';

const Home = () => {
    const navigation = useNavigation();
    const [room, onChangeRoom] = useState('');

    const handleTestCall = async () => {
        try {
            // Generate a unique UUID for the call
            const callUUID = Platform.OS === 'ios'
                ? '11111116-2226-3336-4446-555555555556' // Proper UUID format for iOS
                : "1234567890"; // S
            const callerName = 'Test Caller';
            const callerId = 'test-caller-id';
            const roomName = room || 'test-room';

            // Display incoming call UI
            RNCallKeep.displayIncomingCall(
                callUUID,
                callerName,
                callerId,
                'generic',
                false
            );

            // Store call data in global object for when call is answered
            global.currentCall = {
                callUUID,
                roomName,
                callerId,
                callerName
            };

            Alert.alert('Test Call', 'Simulating an incoming call...');
        } catch (error) {
            console.error('Error displaying incoming call:', error);
            Alert.alert('Error', 'Failed to simulate incoming call');
        }
    };

    return (
        <View style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center'
        }}>
            <TextInput
                // @ts-ignore
                onChangeText={onChangeRoom}
                placeholder="Enter room name here"
                style={{ color: 'black', padding: 32 }}
                value={room} />
            <Button
                color="blue"
                disabled={!room}
                // @ts-ignore
                onPress={() => navigation.navigate('Meeting', { room })}
                // @ts-ignore
                style={{ height: 32, width: 32 }}
                title="Join" />

            <View style={{ marginTop: 20 }}>
                <Button
                    color="green"
                    onPress={handleTestCall}
                    title="Simulate Incoming Call" />
            </View>
        </View>
    );
};

export default Home;