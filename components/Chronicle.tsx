
import React from 'react';
import HistoryCalendar from './HistoryCalendar';
import { DailyStats } from '../types';

interface ChronicleProps {
    stats?: Record<string, DailyStats>;
    onDayClick?: (date: string) => void;
}

const Chronicle: React.FC<ChronicleProps> = ({ stats, onDayClick }) => {
    // Convert map to array for calendar
    const statsArray = stats ? Object.values(stats) : [];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-light text-stone-800 mb-2">The Chronicle</h2>
                <div className="text-stone-400 italic font-serif">"A thousand miles begins with a single step."</div>
            </div>

            <HistoryCalendar stats={statsArray} onDayClick={onDayClick} />
        </div>
    );
};

export default Chronicle;
