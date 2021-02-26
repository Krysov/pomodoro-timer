import React from 'react';
import { StyleSheet, Text, View, Button, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';

export interface Props {
  name: string;
}
  
const PomodoroTimerScreenViewController: React.FC<Props> = (props) => {
    const [_props, setProps] = React.useState(
    );
    
    return (
      <View style={styles.root}>
        <View style={styles.timerContainer}>
            <View style={{
              flexDirection:'row', 
              position:'absolute', 
              alignSelf:'center',
              width:timerContainerSize,
              justifyContent:'center'
              }}>
              <Text style={[styles.timerText, {textAlign:"right", marginRight:timerTextSpacing}]}>00</Text>
              <Text style={[styles.timerText, {marginBottom: 15}]}>:</Text>
              <Text style={[styles.timerText, {textAlign:"left", marginLeft:timerTextSpacing}]}>00</Text>
            </View>
            <View style={[styles.timerButtonContainer, {transform: [{ translateY:-75 }]}]}>
              <Icon
                name='ccw'
                color='#fff'
                size={timerButtonSize/2}
                style={{
                  width: timerButtonSize/1.8,
                  height: timerButtonSize/1.8,
                }}
              />
            </View>
            <View style={[styles.timerButtonContainer, {transform: [{ translateY:75 }]}]}>
              <Icon
                name='controller-play'
                color='#fff'
                size={timerButtonSize/2}
                style={{
                  width: timerButtonSize/2,
                  height: timerButtonSize/2,
                }}
              />
            </View>
        </View>
        
      </View>
    );
  };

  const timerTextSpacing = 16;
  const timerButtonSpacing = 8;
  const timerContainerSize = 256;
  const timerButtonSize = 64;
  const styles = StyleSheet.create({
    root: {
      alignItems: 'center',
      alignSelf: 'center'
    },
    timerContainer: {
      width: timerContainerSize,
      height: timerContainerSize,
      borderRadius: timerContainerSize / 2,
      backgroundColor: '#fff',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    timerText: {
      alignSelf: 'center',
      color: '#444',
      fontSize: 72
    },
    timerButtonContainer: {
      width: timerButtonSize,
      height: timerButtonSize,
      borderRadius: timerButtonSize / 2,
      backgroundColor: '#e20',
      justifyContent: "center",
      alignItems:'center',
      position: 'absolute',
      alignSelf:"center",
    }
  });
  
  export default PomodoroTimerScreenViewController;