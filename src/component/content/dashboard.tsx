import React, { useEffect, useState } from 'react';
import type { Habit, HabitLog, Task } from '../../type/index';
import { Line, ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';

export default function Dashboard(){
    const getLocalYMD = (d: Date) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    
        const [task, setTask] = useState<Task[]>([]);
        const [habit, setHabit] = useState<Habit []>([]);
        const [todayLogHabit, setTodayLogHabit] = useState<HabitLog[]>([]);
        const [weeklyChartData, setWeeklyChartData] = useState<any[]>([]);

        const activeFileter = 'todo';
        const [searchQuery, setSearchQuery] = useState('');
    
        const today = new Date();
        const todayStr = getLocalYMD(today);
        const todayTasks = task.filter(t => t.date === todayStr);
        const checkTodayTasks = todayTasks.length > 0? true : false;
        const totalTodayTasks = checkTodayTasks ? todayTasks.length : 0;
        const uncompletedTodayTasks = checkTodayTasks ? todayTasks.filter(t => !t.is_completed).length : 0;
    
        const totalTodayHabits = habit.length;
        const completedHabitsToday = todayLogHabit.filter(t => t.is_done).length;
        const uncompletedHabitsToday = totalTodayHabits - completedHabitsToday;
    
        const todayFormat = today.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    
        useEffect(() => {
            fetchTask();
            fetchHabits();
        }, []);
    
    
        async function fetchHabits() {
            const lastWeek = new Date();
            lastWeek.setDate(today.getDate() - 6);
            const lastWeekStr = getLocalYMD(lastWeek);
    
            const { data: habitsData, error: habitsError} = await supabase
            .from('habits').select('*');
            if (!habitsError && habitsData) setHabit(habitsData as Habit[]);
    
    
            const { data: logData, error: logError} = await supabase.from('habit_log').select('*').eq('date', todayStr);
            if (!logError && logData) setTodayLogHabit(logData as HabitLog[]);
    
            const {data: weeklyLogs} = await supabase.from('habit_log').select('*').gte('date', lastWeekStr).lte('date', todayStr).order('date', { ascending: true});
    
            if (habitsData && weeklyLogs){
                formatChartData(habitsData as Habit[], weeklyLogs as HabitLog[]);
            }
        }
    
        function formatChartData(masterHabits: Habit[], logs: HabitLog[]) {
            const chartData = [];
    
            for (let i = 6; i >= 0; i--){
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = getLocalYMD(d);
                const dayName = d.toLocaleDateString('en-US', {weekday: 'short'});
    
                const dayData: any = {name: dayName};
    
                masterHabits.forEach(habit => {
                    const logRecord = logs.find(log => log.date === dateStr && log.habit_id === habit.id)?.is_done;
                    // const isComplete = logRecord?.is_done === true;
    
                    dayData[habit.name] = logRecord ? 100 : 0;
                });
    
                chartData.push(dayData);
            }
    
            setWeeklyChartData(chartData);
        }
    
        async function fetchTask(){
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
    
            const todayStr = today.toISOString().split('T')[0];
            const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    
            const {data, error} = await supabase
            .from('task')
            .select('*')
            .gte('date', todayStr)
            .lte('date', nextWeekStr)
            .order('date',{ascending: true});
    
            if (error){
                console.error("Error fetching task: ", error);
            }else {
                setTask(data as Task[]);
            }
        }
    return (
        <section className="dashbord-content">
                <div className="time-now">
                    <h1>Today,</h1>
                    <h1>{todayFormat}</h1>
                </div>
                <p>Ready for today's quests?</p>

                <div className="today-overview">
                    <div className="today-list today-toDo">
                        <h3>To Do List</h3>

                        <div className='total-list'>
                            <span className='score' id='score-current-todo'>{uncompletedTodayTasks}</span>
                            <span className='score divider'>/</span>
                            <span className='score' id='score-total-todo'>{totalTodayTasks}</span>
                        </div>

                        <p style={{textAlign: 'center', fontSize:'14px', marginTop: '-10px'}}> Tugas yang belum diselesaikan</p>
                    </div>

                    <div className="today-list today-habits">
                        <h3>Habits</h3>

                        <div className='total-list'>
                            <span className='score' id='score-current-habits'>{uncompletedHabitsToday}</span>
                            <span className='score divider'>/</span>
                            <span className='score' id='score-total-habits'>{totalTodayHabits}</span>
                        </div>

                        <p style={{textAlign: 'center', fontSize:'14px', marginTop: '-10px'}}> Habits yang belum diselesaikan</p>
                    </div>
                </div>

                <hr />

                <div className="upcoming-content">
                    <h1>Upcoming Task</h1>

                    <div className="upcoming-header">
                        <div className="upcoming-search">
                            <input type="text"
                            placeholder='Search...'
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}/>

                            <button>Search</button>
                        </div>
                    </div>

                    <div className="upcoming-box">
                        {activeFileter === 'todo' && (
                            task.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                task
                                .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((t) => (
                                    <div className="upcoming-card" key={t.id}>
                                        <div className="header-upcoming-card">
                                            <span>{t.title}</span>
                                            <span>{t.date}</span>
                                        </div>
                                        <div className="content-upcoming-card">
                                            Status: {t.is_completed ? "Selesai" : "Belum Selesai"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Belum ada Tugas untuk besok.</p>
                            )
                        )}
                    </div>
                </div>


                <div className="grafik-habits-content">
                    <h1>Grafik Habits</h1>

                    <div className="grafik-habits" style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyChartData}>
                                <CartesianGrid strokeDasharray="1 1" vertical={false}/>
                                <XAxis dataKey="name" axisLine={true} tickLine={true} />
                                <YAxis axisLine={true} tickLine={true} tickFormatter={(tick) => `${tick}%`} />
                                <Tooltip />
                                <Legend iconType="circle" />
                                
                                {/* Looping dinamis untuk membuat garis sebanyak habit yang dimiliki */}
                                {habit.map((habit, index) => {
                                    // Daftar warna agar tiap garis habit beda warna
                                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                                    return (
                                        <Line 
                                            key={habit.id} 
                                            type="monotone" 
                                            dataKey={habit.name} 
                                            stroke={colors[index % colors.length]} 
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
        </section>
    )
}