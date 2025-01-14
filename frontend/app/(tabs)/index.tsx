import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ViewProps,
  View,
  ScrollView,
  Image,
  Text,
  TextProps,
  ImageSourcePropType,
  Alert,
  Platform
} from 'react-native';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

import MacMarauders from '@/assets/images/Macmarauders.png';
import ProfilePicture from '@/assets/images/profile-picture.png';
import CircularProgressBar from '@/components/CircularProgressBar';
import Screen from '@/components/Screen';

// Define the base URL based on platform
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8383', // Android Emulator
  ios: 'http://localhost:8383',    // iOS Simulator
  default: 'http://localhost:8383' // Web/default
});


/*************************************HOME SCREEN TITLE*************************************/
type HomeScreenTitleProps = ViewProps & {
  username: string;
};

// Represents the Home Screen title section containing welcome text and MacMarauders image
function HomeScreenTitle({ username, ...rest }: HomeScreenTitleProps) {
  return (
    <View style={styles.titleContainer} {...rest}>
      <View style={styles.titleTextContainer}>
        <Text style={styles.titleText}>
          Welcome,
        </Text>
        <Text style={styles.titleText} numberOfLines={1} ellipsizeMode='tail'>
          {username}!
        </Text>
      </View>

      <Image style={styles.titleImage} source={MacMarauders} />
    </View>
  );
}

/*************************************HOME SCREEN SUB TITLE*************************************/
type HomeScreenSubTitleProps = TextProps & {
  text: string
}

// Represents the Text component for a section title
function HomeScreenSubTitle({ text, ...rest }: HomeScreenSubTitleProps) {
  return (
    <Text style={styles.subtitleText} {...rest}>
      {text}
    </Text>
  );
}

/*************************************HOME SCREEN SECTION*************************************/
type HomeScreenSectionProps = ViewProps & {
  text: string
}

// Represents a section within the home screen
function HomeScreenSection({ text, children, ...rest }: HomeScreenSectionProps) {
  return (
    <View style={styles.section} {...rest}>
      <HomeScreenSubTitle text={text} />

      <View style={styles.sectionView}>
        {children}
      </View>
    </View>
  );
}

/*************************************HOME SCREEN FRIEND BAR*************************************/
type FriendBarProps = ViewProps & {
  username: string,
  activityStr: string,
  profilePicture: ImageSourcePropType
}

// Represents the a bar that shows friend activity
function FriendBar({ username, activityStr, profilePicture }: FriendBarProps) {
  return (
    <View style={styles.friendBarView}>
      <Image source={profilePicture} style={styles.friendProfileImageStyle} />

      <Text numberOfLines={1} ellipsizeMode='tail' style={styles.friendTextStyle}>
        {username + ' ' + activityStr}
      </Text>
    </View>
  );
}

// Define types for our API response and request
interface PulseData {
  num_active_users: number;
  capacity: number;
}

interface FacilityRequest {
  facility: string;
}

const fetchPulseData = async (): Promise<PulseData> => {
  const networkState = await NetInfo.fetch();

  if (!networkState.isConnected) {
    throw new Error('No internet connection');
  }

  try {
    // Use GET with query parameters instead of POST with body
    const response = await axios.get<PulseData>(
      `${BASE_URL}/facility/user_capacity`, {
      params: {
        facility: 'pulse'
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch facility data');
    }
    throw error;
  }
};

// Calculate percentage from occupancy data
const calculatePulsePercentage = (current: number, max: number): number => {
  return Math.min((current / max) * 100, 100); // Ensure we don't exceed 100%
};


/*************************************HOME SCREEN*************************************/
export default function HomeScreen() {
  let [username, setUsername] = useState("Username")

  let [pulseVal, setPulseVal] = useState(67.5);
  const [isLoading, setIsLoading] = useState(true);
  let [pulseData, setPulseData] = useState<PulseData>({
    num_active_users: 0,
    capacity: 500
  });
  let [pulseCardioVal, setPulseCardioVal] = useState(20.5);
  let [pulseFreeWeightsVal, setPulseFreeWeightsVal] = useState(90.5);
  let [pulseMachinesVal, setPulseMachinesVal] = useState(60.5);

  let [dropInsBasketballVal, setDropInsBasketballVal] = useState(84.3);
  let [dropInsTabelTennisVal, setDropInsTabelTennisVal] = useState(63.2);
  let [dropInsgSoccerVal, setDropInsSoccerVal] = useState(20.5);
  let [dropInsVolleyBallVal, setDropInsVolleyBallVal] = useState(43.2);

  let [friends, _] = useState([
    {
      username: 'Friend 1',
      activitySentence: 'is playing badminton'
    },
    {
      username: 'Friend 2',
      activitySentence: 'is using a power rack'
    }
  ]);

  useEffect(() => {
    const loadPulseData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPulseData();
        setPulseData(data);
        const percentage = calculatePulsePercentage(
          data.num_active_users,
          data.capacity
        );
        setPulseVal(percentage);
      } catch (error) {
        Alert.alert(
          'Error',
          'Unable to load Pulse occupancy data. Please try again later.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    loadPulseData();

    // Set up polling every 5 minutes
    const pollInterval = setInterval(loadPulseData, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  return (
    <Screen style={styles.container}>
      {/* Transparent background for the scroll view */}
      <ScrollView>
        <View style={styles.container}>
          <HomeScreenTitle username={username} />

          { /* The pulse home screen section */}
          <HomeScreenSection text='The Pulse'>
            <View style={styles.pulseViewContainer}>
              <View style={styles.pulseLeftCol}>
                <CircularProgressBar
                  style={{ width: "100%" }}
                  strokeWidth={10}
                  label='Total'
                  progress={pulseVal}
                />
              </View>

              <View style={styles.pulseRightCol}>
                <CircularProgressBar
                  style={{ width: "100%", marginBottom: 5 }}
                  strokeWidth={7}
                  label='Cardio'
                  progress={pulseCardioVal}
                />
                <CircularProgressBar
                  style={{ width: "100%", marginBottom: 5 }}
                  strokeWidth={7}
                  label='Free Weights'
                  progress={pulseFreeWeightsVal}
                />
                <CircularProgressBar
                  style={{ width: "100%" }}
                  strokeWidth={7}
                  label='Machines'
                  progress={pulseMachinesVal}
                />
              </View>
            </View>
          </HomeScreenSection>

          {/* The Drop Ins home screen section */}
          <HomeScreenSection text='Drop-Ins'>
            <View style={styles.dropInsViewContainer}>
              <View style={styles.dropInsPart}>
                <CircularProgressBar
                  style={{ width: "50%" }}
                  strokeWidth={7}
                  label='Basketball'
                  progress={dropInsBasketballVal}
                />
              </View>
              <View style={styles.dropInsPart}>
                <CircularProgressBar
                  style={{ width: "50%" }}
                  strokeWidth={7}
                  label='Table Tennis'
                  progress={dropInsTabelTennisVal}
                />
              </View>
              <View style={styles.dropInsPart}>
                <CircularProgressBar
                  style={{ width: "50%" }}
                  strokeWidth={7}
                  label='Soccer'
                  progress={dropInsgSoccerVal}
                />
              </View>
              <View style={styles.dropInsPart}>
                <CircularProgressBar
                  style={{ width: "50%" }}
                  strokeWidth={7}
                  label='Volley Ball'
                  progress={dropInsVolleyBallVal}
                />
              </View>
            </View>
          </HomeScreenSection>

          {/* The Friends home screen section */}
          <HomeScreenSection text='Friends'>
            <View style={{ padding: 10, gap: 10 }}>
              { /* Render friends list */}
              {friends.length > 0 && friends.map(
                (friend) => (
                  <FriendBar
                    key={friend.username}
                    username={friend.username}
                    activityStr={friend.activitySentence}
                    profilePicture={ProfilePicture} />
                )
              )}
            </View>
          </HomeScreenSection>
        </View>
      </ScrollView>
    </Screen>
  );
}

// Home screen component style sheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  titleContainer: {
    flexDirection: 'row',
    padding: 10
  },
  titleTextContainer: {
    flex: 3
  },
  titleImage: {
    flex: 1.25,
    width: 140,
    height: 140,
    resizeMode: 'contain'
  },
  titleText: {
    fontFamily: 'Source Sans Pro',
    fontSize: 48,
    fontWeight: "bold",
    lineHeight: 56,
    color: '#000000'
  },
  subtitleText: {
    fontFamily: 'Source Sans Pro',
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 56,
    color: '#000000'
  },
  section: {
    padding: 10,
    backgroundColor: '#FFFFFF'
  },
  sectionView: {
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 10
  },
  pulseViewContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  pulseLeftCol: {
    flex: 3,
    alignContent: 'center',
    justifyContent: 'center',
    padding: 10
  },
  pulseRightCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 10,
    padding: 10
  },
  dropInsViewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dropInsPart: {
    flexBasis: '45%',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  friendBarView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  friendProfileImageStyle: {
    width: '10%',
    height: '100%',
    aspectRatio: 1,
    resizeMode: 'cover'
  },
  friendTextStyle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16
  }
});
