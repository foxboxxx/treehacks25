declare module 'react-native-calendar-picker' {
    import { ComponentType } from 'react';
    
    interface CalendarPickerProps {
        onDateChange: (date: Date) => void;
        minDate?: Date;
        selectedDayColor?: string;
        selectedDayTextColor?: string;
        todayBackgroundColor?: string;
        width?: number;
    }

    const CalendarPicker: ComponentType<CalendarPickerProps>;
    export default CalendarPicker;
} 