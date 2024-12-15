import React from 'react';
import {
  View,
  Text as RNText,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';
import { Svg, G, Path, Text, TSpan } from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import color from 'randomcolor';
import { snap } from '@popmotion/popcorn';
import { StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('screen');
const wheelSize = Math.min(width, height) * 0.95;
const fontSize = 14;
const oneTurn = 360;
const knobFill = color({ hue: 'purple' });

type WheelPath = {
  path: string | null;
  color: string;
  value: string;
  centroid: [number, number];
};

type WheelState = {
  enabled: boolean;
  finished: boolean;
  winner: string | null;
  colors: string[];
  isFirstSpin: boolean;
};


type WheelProps = {
  segments: string[];
  darkMode: boolean;
  language: string;
  onEdit?: () => void;
};

export default class Wheel extends React.Component<WheelProps, WheelState> {
  _angle = new Animated.Value(0);
  angle = 0;
  scaleAnim: Animated.Value;

  constructor(props: WheelProps) {
    super(props);
    this.scaleAnim = new Animated.Value(1);
  }

  state: WheelState = {
    enabled: true,
    finished: false,
    winner: null,
    colors: [],
    isFirstSpin: false,
  };
  

  componentDidMount() {
    this._angle.addListener((event) => {
      this.angle = event.value;
    });

    const colors = color({ luminosity: 'dark', count: this.numberOfSegments });
    this.setState({ colors });
  }

  componentWillUnmount() {
    this._angle.removeAllListeners();
  }

  componentDidUpdate(prevProps: WheelProps, prevState: WheelState) {
    if (prevProps.segments !== this.props.segments) {
      this._angle.setValue(0);
      this.setState({ winner: null, finished: false, enabled: true, isFirstSpin: true });
      const colors = color({ luminosity: 'dark', count: this.numberOfSegments });
      this.setState({ colors });
    }

    if (prevState.winner !== this.state.winner && this.state.winner) {
      // Animacja pulsowania dla zwycięzcy
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(this.scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }

  get numberOfSegments() {
    return this.props.segments.length;
  }

  get angleBySegment() {
    return oneTurn / this.numberOfSegments;
  }

  get angleOffset() {
    return this.angleBySegment / 2;
  }

  makeWheel = (): WheelPath[] => {
    const data: number[] = new Array(this.numberOfSegments).fill(1);
    const arcs = d3Shape.pie<number>()(data);

    return arcs.map((arc, index) => {
      const instance = d3Shape
        .arc<d3Shape.DefaultArcObject>()
        .padAngle(0.01)
        .outerRadius(wheelSize / 2)
        .innerRadius(20);

      const arcData: d3Shape.DefaultArcObject = {
        ...arc,
        innerRadius: 20,
        outerRadius: wheelSize / 2,
      };

      return {
        path: instance(arcData) || '',
        color: this.state.colors[index],
        value: this.props.segments[index % this.numberOfSegments],
        centroid: instance.centroid(arcData) as [number, number],
      };
    });
  };

  _getWinnerIndex = () => {
    if (this.state.isFirstSpin) {
      return 0;
    }
  
    const deg = Math.abs(Math.round(this.angle % oneTurn));
    return this.angle < 0
      ? Math.floor(deg / this.angleBySegment)
      : (this.numberOfSegments - Math.floor(deg / this.angleBySegment)) % this.numberOfSegments;
  };

  _onPan = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (this.state.isFirstSpin) {
      if (nativeEvent.state === State.END) {
        const firstSegmentAngle = -this.angleOffset;
        const totalRotations = 4;
        const targetAngle = firstSegmentAngle + totalRotations * oneTurn;
        
        const snapTo = snap(oneTurn / this.numberOfSegments);
        Animated.timing(this._angle, {
          toValue: snapTo(targetAngle),
          duration: 4000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          const winnerIndex = this._getWinnerIndex();
          this.setState({
            enabled: true,
            finished: true,
            winner: this.props.segments[winnerIndex],
            isFirstSpin: false,
          });
        });
      }
    } else {
      if (nativeEvent.state === State.END) {
        const { velocityY } = nativeEvent;
        Animated.decay(this._angle, {
          velocity: velocityY / 1000,
          deceleration: 0.999,
          useNativeDriver: true,
        }).start(() => {
          this._angle.setValue(this.angle % oneTurn);
          const snapTo = snap(oneTurn / this.numberOfSegments);
          Animated.timing(this._angle, {
            toValue: snapTo(this.angle),
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            const winnerIndex = this._getWinnerIndex();
            this.setState({
              enabled: true,
              finished: true,
              winner: this.props.segments[winnerIndex],
              isFirstSpin: false,
            });
          });
        });
      }
    }
  };

  _renderKnob = () => {
    const knobSize = 30;
    const YOLO = Animated.modulo(
      Animated.divide(
        Animated.modulo(Animated.subtract(this._angle, this.angleOffset), oneTurn),
        new Animated.Value(this.angleBySegment)
      ),
      1
    );

    return (
      <Animated.View
        style={{
          //top: (height - knobSize) / 2 - 225,
          width: knobSize,
          height: knobSize * 2,
          justifyContent: 'flex-end',
          zIndex: 1,
          transform: [
            {
              rotate: YOLO.interpolate({
                inputRange: [-1, -0.5, -0.0001, 0.0001, 0.5, 1],
                outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg'],
              }),
            },
          ],
        }}
      >
        <Svg width={knobSize} height={(knobSize * 100) / 57} viewBox="0 0 57 100" style={{ transform: [{ translateY: 8 }] }}>
          <Path
            d="M28.034,0C12.552,0,0,12.552,0,28.034S28.034,100,28.034,100s28.034-56.483,28.034-71.966S43.517,0,28.034,0z   M28.034,40.477c-6.871,0-12.442-5.572-12.442-12.442c0-6.872,5.571-12.442,12.442-12.442c6.872,0,12.442,5.57,12.442,12.442  C40.477,34.905,34.906,40.477,28.034,40.477z"
            fill={knobFill}
          />
        </Svg>
      </Animated.View>
    );
  };

  _renderWinner = () => {
    const textColor = this.props.darkMode ? '#fff' : '#000';
    const textLang = this.props.language;
    return (
      <Animated.Text
        style={[
          styles.winnerText,
          {
            color: textColor,
            transform: [{ scale: this.scaleAnim }],
          },
        ]}
      >
        🎉 {textLang === "pl" ? "Wybrano:" : "Selected:"} {this.state.winner} 🎉
      </Animated.Text>
    );
  };

  _renderSvgWheel = () => {
    const wheelPaths = this.makeWheel();
    const darkMode = this.props.darkMode;

    return (
      <View style={[darkMode ? styles.darkContainer : styles.lightContainer]}>
        {this._renderKnob()}
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [
              {
                rotate: this._angle.interpolate({
                  inputRange: [-oneTurn, 0, oneTurn],
                  outputRange: [`-${oneTurn}deg`, '0deg', `${oneTurn}deg`],
                }),
              },
            ],
          }}
        >
          <Svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${width} ${width}`} style={{ transform: [{ rotate: `-${this.angleOffset}deg` }] }}>
            <G y={width / 2} x={width / 2}>
              {wheelPaths.map((arc, i) => {
                const [x, y] = arc.centroid;
                const label = arc.value;

                return (
                  <G key={`arc-${i}`}>
                    <Path d={arc.path || ''} fill={arc.color} />
                    <G rotation={(i * oneTurn) / this.numberOfSegments + this.angleOffset} origin={`${x}, ${y}`}>
                      <Text x={x} y={y - Math.min(width, height) * 0.2} fill="white" textAnchor="middle" fontSize={fontSize}>
                        {Array.from({ length: label.length }).map((_, j) => (
                          <TSpan x={x} dy={fontSize} key={`arc-${i}-slice-${j}`}>
                            {label.charAt(j)}
                          </TSpan>
                        ))}
                      </Text>
                    </G>
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  };

  render() {
    const darkMode = this.props.darkMode;
    return (
      <GestureHandlerRootView style={[darkMode ? styles.darkContainer : styles.lightContainer]}>
        <PanGestureHandler onHandlerStateChange={this._onPan} enabled={this.state.enabled}>
          <View style={[darkMode ? styles.darkContainer : styles.lightContainer]}>
            {this._renderSvgWheel()}
            {this.state.finished && this._renderWinner()}
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  lightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  winnerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});
