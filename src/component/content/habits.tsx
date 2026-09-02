import { useEffect, useState } from 'react';
import './habits.css';
import type { Habit } from '../../type';
import { supabase } from '../../lib/supabase';

export default function Habits() {
    const [habitsData, setHabitsData] = useState<Habit[]>([]);

    const getWeekDays = () => {
        
            const today = new Date();
            const currentDayOfWeek = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() + 1);
            
            monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));

            return ['Mon', 'Tues', 'Wed', 'Thurs', 'Frid', 'Sat', 'Sun'].map((dayName, index) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + index);
                
                const formattedDate = date.toISOString().split('T')[0];
                const isPassed = date < new Date(new Date().setHours(0, 0, 0, 0));

                return { name: dayName, date: formattedDate, isPassed };
            });       
    };

    useEffect(() => {
        fetchHabitData();
    }, []);

    async function fetchHabitData() {
        const { data: habit, error: habitError } = await supabase.from('habits').select('*');

        if (!habitError && habit) {
            setHabitsData(habit as Habit[]);
        }
    }

    return (
        <div className="panel-content">
            <div className="hero-section">
                <h3>Your Days</h3>
                <p>Track your habits every day and achieve your goal.</p>
            </div>

            <div className="content-habits">
                <div className="month-panel">
                    <button className="btn prev">&#10094;</button>
                    <h4>Nama Bulan</h4>
                    <button className="btn next">&#10095;</button>
                </div>

                <div className="checklist-panel">
                    <div className="checklist-header">
                        <div className="week-badge">WEEK 1</div>
                        <div className="days-row">
                            {getWeekDays().map(day => (
                                <span key={day.name}>{day.name}</span>
                            ))}
                        </div>
                    </div>
                            
                    <div className="checklist-body">
                        {habitsData.map((habit) => (
                            <div className="card-habit" key={habit.id}>
                                <span>{habit.name}</span>
                                <div className="checkbox-row">
                                    {getWeekDays().map(day => (
                                        <input 
                                            type="checkbox" 
                                            key={day.name} 
                                            disabled={day.isPassed} 
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bottom-panel">
                    <div className="controller-habits">
                        <button className="btn-controller">+ Add</button>
                        <button className="btn-controller">+ Edit</button>
                    </div>

                    <div className="conclusion-habits">
                        <div className="percent-panel">
                            50%
                        </div>

                        <div className="information-percent">
                            <span>Judul Kesimpulan</span>
                            <p>Penjelasan mengenai kesimpulan tersebut</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}