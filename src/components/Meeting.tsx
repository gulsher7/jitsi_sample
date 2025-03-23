import React, {useCallback, useRef, useState, useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Alert, Platform, Button} from 'react-native';
import {JitsiMeeting} from '@jitsi/react-native-sdk';
import {useNavigation} from '@react-navigation/native';
import RNCallKeep, { CONSTANTS } from 'react-native-callkeep';


interface MeetingProps {
  route: {
    params: {
      room?: string;
      url?: string;
      subject?: string;
      audioOnly?: boolean;
      callUUID?: string;
    };
  };
}

const Meeting = ( { route }: MeetingProps ) => {
  const jitsiMeeting = useRef(null);
  const navigation = useNavigation();

  // Extract parameters from route
  // Support both direct room name and URL format from CallKeep
  const { room, url, subject, audioOnly, callUUID } = route.params;


  useEffect(() => {
    // Extract parameters from route
    const { room, url, subject, audioOnly, callUUID } = route.params;
    
    // Handle the CallKit session if it exists
    if (callUUID) {
      // Add event listeners

      console.log("callUUID Meeting", callUUID)
      const endCallListener = RNCallKeep.addEventListener('didDeactivateAudioSession', () => {
        console.log('Audio session deactivated');
        // Clean up call resources here
      });
      
      // Set a timer to end the CallKit call after the UI is ready
      const timer = setTimeout(() => {
        if (Platform.OS === 'ios') {
          // For iOS, use the specific reason
          RNCallKeep.reportEndCallWithUUID(
            callUUID, 
            CONSTANTS.END_CALL_REASONS.ANSWERED_ELSEWHERE
          );
        } else {
          // For Android, simply end the call
          RNCallKeep.endCall(callUUID);
        }
      }, 1500);
      
      // Clean up
      return () => {
        clearTimeout(timer);
        endCallListener.remove();
      };
    }
  }, []);
  
  // State to track loading
  const [isLoading, setIsLoading] = useState(false);
 
  // Clean up the room name to ensure it's valid
  // If URL is provided (from CallKeep), extract the room name from it
  // Ensure we always have a valid room name
  const meetingRoom = (url ? url.split('/').pop() : room) || 'default-room';
  
  // Sanitize the room name to remove any special characters
  const sanitizedRoom = meetingRoom.replace(/[^a-zA-Z0-9-_]/g, '');


  const onReadyToClose = useCallback(() => {
    // @ts-ignore
    navigation.navigate('Home');
    // @ts-ignore
    jitsiMeeting.current.close();
  }, [navigation]);

  const onEndpointMessageReceived = useCallback(() => {
      console.log('You got a message!');
  }, []);

  const onConferenceJoined = useCallback(() => {

  }, []);
  
  const onConferenceTerminated = useCallback(() => {
    console.log('Conference terminated');
    // @ts-ignore
    navigation.navigate('Home');
  }, [navigation]);

  const eventListeners = {
    onReadyToClose,
    onEndpointMessageReceived,
    onConferenceJoined,
    onConferenceTerminated
  };

  return (
    <View style={{ flex: 1 }}>
  
      
      {/* @ts-ignore */}
      <JitsiMeeting
        userInfo={{
          displayName: 'Test User',
          email: 'test@example.com',
          avatarURL: 'https://avatars.githubusercontent.com/u/3171503'
        }}
        config={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          subject: subject || `Meeting: ${sanitizedRoom}`
        }}
        eventListeners={eventListeners as any}
        ref={jitsiMeeting}
        style={{ flex: 1 }}
        room={sanitizedRoom}
        serverURL={"https://alpha.jitsi.net"} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
  }
});

export default Meeting;