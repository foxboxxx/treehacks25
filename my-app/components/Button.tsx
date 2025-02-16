import { TouchableOpacity, Text, GestureResponderEvent, StyleProp, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Fonts } from '@/constants/Fonts';

interface props {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>; 
}

const Button: React.FC<props> = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...Fonts.abel,
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default Button;