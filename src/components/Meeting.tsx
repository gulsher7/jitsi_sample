import React, {useCallback, useRef, useState, useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Alert, Platform, Button} from 'react-native';
import {JitsiMeeting} from '@jitsi/react-native-sdk';
import {useNavigation} from '@react-navigation/native';


interface MeetingProps {
  route: {
    params: {
      room?: string;
      url?: string;
      subject?: string;
      audioOnly?: boolean;
    };
  };
}

const Meeting = ( { route }: MeetingProps ) => {
  const jitsiMeeting = useRef(null);
  const navigation = useNavigation();

  // Extract parameters from route
  // Support both direct room name and URL format from CallKeep
  const { room, url, subject, audioOnly } = route.params;
  
  // State to track loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Hide loading indicator after a timeout
  useEffect(() => {
    // Hide loading indicator after 10 seconds, even if conference join event is not triggered
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Clean up the room name to ensure it's valid
  // If URL is provided (from CallKeep), extract the room name from it
  // Ensure we always have a valid room name
  const meetingRoom = (url ? url.split('/').pop() : room) || 'default-room';
  
  // Sanitize the room name to remove any special characters
  const sanitizedRoom = meetingRoom.replace(/[^a-zA-Z0-9-_]/g, '');
  
  // For demo purposes, we'll use a hardcoded room name if none is provided
  const demoRoom = 'demo-room-123';

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
    console.log('Conference joined successfully');
    setIsLoading(false);
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
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Connecting to meeting...</Text>
        </View>
      )}
      
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