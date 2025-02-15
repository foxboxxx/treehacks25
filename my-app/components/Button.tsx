import { TouchableOpacity, Text } from 'react-native';

const Button = () => {
  return (
    <TouchableOpacity onPress={() => console.log('Button Pressed!')}>
      <Text>Click Me!</Text>
    </TouchableOpacity>
  );
};

export default Button;