// import { useEffect } from 'react';
// import { View, Text } from 'react-native';
// import { db } from '../utils/firebase/firebase.utils';
// import { collection, getDocs, Firestore } from 'firebase/firestore';

// export default function EventsScreen() {
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const eventsCollectionRef = collection(db as Firestore, 'events');
//         const querySnapshot = await getDocs(eventsCollectionRef);
//         querySnapshot.forEach((doc) => {
//           console.log('Event:', { id: doc.id, ...doc.data() });
//         });
//       } catch (error) {
//         console.error('Error fetching events:', error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Check console for events</Text>
//     </View>
//   );
// } 