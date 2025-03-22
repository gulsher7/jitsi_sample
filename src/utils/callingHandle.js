import { Alert, Platform } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { NavigationContainer, CommonActions } from '@react-navigation/native';

// Variable to store navigation ref
let navigationRef = null;

// Set up navigation reference to use outside of React components
export const setNavigationRef = (ref) => {
  navigationRef = ref;
};

// Initialize CallKeep
export const setupCallKeep = () => {
  alert("setupCallKeep")
  const options = {
    ios: {
      appName: 'VideoApp',
      supportsVideo: true,
      maximumCallGroups: '1',
      maximumCallsPerCallGroup: '1',
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'OK',
      additionalPermissions: [],
      foregroundService: {
        channelId: 'com.videoapp',
        channelName: 'Foreground service for video calls',
        notificationTitle: 'Video call is active',
      }
    }
  };

  try {
    RNCallKeep.setup(options);
    RNCallKeep.setAvailable(true);
    
    // Set event handlers
    RNCallKeep.addEventListener('answerCall', onAnswerCall);
    RNCallKeep.addEventListener('endCall', onEndCall);
    RNCallKeep.addEventListener('didPerformDTMFAction', onDTMFAction);
    RNCallKeep.addEventListener('didReceiveStartCallAction', onStartCallAction);
    RNCallKeep.addEventListener('didDisplayIncomingCall', onIncomingCallDisplayed);
    
    console.log('CallKeep initialized successfully');
  } catch (err) {
    console.error('Error setting up CallKeep', err);
  }
};



// Handle displaying incoming calls
export const handleTestCall = async (notification, data) => {


  try {
    // Generate a UUID for the call if not provided
    const callUUID = data?.callUUID || `call-${Date.now()}`;
    const callerName = data?.callerName || notification?.title || 'Unknown';
    const callerId = data?.callerId || 'unknown';
    const roomName = data?.roomName || `room-${callUUID}`;
    const isVideoCall = data?.isVideoCall === 'true' || false;
    
    // Store call data in global object for when call is answered
    global.currentCall = {
      callUUID,
      roomName,
      callerId,
      callerName,
      isVideoCall
    };
    
    // Display incoming call UI via CallKeep
    if (Platform.OS === 'android') {
      // For Android, we need to check if device supports CallKeep
      RNCallKeep.displayIncomingCall(
        callUUID,
        callerName,
        callerId,
        'generic',
        isVideoCall
      );
    } else {
      // For iOS
      RNCallKeep.displayIncomingCall(
        callUUID,
        callerName,
        callerId,
        'generic',
        isVideoCall
      );
    }
    
    // console.log('Incoming call displayed:', { callUUID, callerName, callerId, roomName });
  } catch (error) {
    console.error('Error displaying incoming call:', error);
    Alert.alert('Call Error', 'Failed to display incoming call');
    
    // If CallKeep fails, we can fall back to direct navigation
    navigateToMeeting(data?.roomName || `room-${Date.now()}`, data?.isVideoCall === 'true');
  }
};

// Handle when user answers the call
const onAnswerCall = ({ callUUID }) => {
  alert("onAnswerCall")
  console.log('Call answered:', callUUID);
  
  // Get call data from global object
  const callData = global.currentCall;
  if (!callData) {
    console.warn('No call data found for', callUUID);
    return;
  }
  
  // Navigate to the meeting screen
  navigateToMeeting(callData.roomName, callData.isVideoCall);
  
  // Update call status
  RNCallKeep.setCurrentCallActive(callUUID);
};

// Handle when call ends
const onEndCall = ({ callUUID }) => {
  console.log('Call ended:', callUUID);
  
  // If we're in a meeting, go back to home
  if (navigationRef && navigationRef.getCurrentRoute().name === 'Meeting') {
    navigationRef.navigate('Home');
  }
  
  // Clean up global call data
  if (global.currentCall && global.currentCall.callUUID === callUUID) {
    global.currentCall = null;
  }
};

// Navigate to the meeting screen
const navigateToMeeting = (room, isVideoCall) => {
  if (!navigationRef) {
    console.warn('Navigation ref not set, cannot navigate to meeting');
    return;
  }

  alert("navigateToMeeting")
  
  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'Meeting',
      params: {
        room,
        subject: `Call with ${global.currentCall?.callerName || 'User'}`,
        audioOnly: !isVideoCall
      },
    })
  );
};

// Other event handlers
const onDTMFAction = ({ callUUID, digits }) => {
  console.log('DTMF:', callUUID, digits);
};

const onStartCallAction = ({ callUUID, handle }) => {
  console.log('Start call action:', callUUID, handle);
};

const onIncomingCallDisplayed = ({ callUUID, handle, hasVideo, fromPushKit }) => {
  console.log('Incoming call displayed:', callUUID, handle, hasVideo, fromPushKit);
};