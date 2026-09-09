import { useEffect, useState } from 'react';
import './habits.css';
import type { Habit, HabitLog } from '../../type';
import { supabase } from '../../lib/supabase';

export default function Habits() {
    const [habitsData, setHabitsData] = useState<Habit[]>([]);
    const [habitLogData, setHabitLogData] = useState<HabitLog[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');

    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editHabitName, setEditHabitName] = useState('');

    const getWeekDays = () => {
        
            const today = new Date();
            const currentDayOfWeek = today.getDay();
            const monday = new Date(today);

            
            monday.setDate(today.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));

            return ['Mon', 'Tues', 'Wed', 'Thurs', 'Frid', 'Sat', 'Sun'].map((dayName, index) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + index);
                
                const formattedDate = date.toISOString().split('T')[0];
                const isPassed = date < new Date(new Date().setHours(0, 0, 0, 0));
                
                return { name: dayName, date: formattedDate, isPassed};
            });       
    };

    const weekDays = getWeekDays();

    useEffect(() => {
        async function initHaabits() {
            const fetchedHabit = await fetchHabitDataAndHabitLogs();

            if (habitsData && habitsData.length > 0){
                await addHabitLog(fetchedHabit);
            }
        }

        initHaabits();
    }, []);

    // Tambahkan parameter renameValue = ''
    async function actionModalButton(id: string, isDelete: boolean, renameValue: string = '') {
        try{
            if (isDelete === true){
                const {error: errorHabitLog} = await supabase.from('habit_log').delete().eq('habit_id', id);
                if(errorHabitLog) throw errorHabitLog

                const {error} = await supabase.from('habits').delete().eq('id', id);
                if(error) throw error
                
            } else if (isDelete === false && newHabitName.length > 0 && id.length === 0){
                const {error} = await supabase.from('habits').insert([{name: newHabitName}]).select();
                if (error) throw error;

                setIsAddModalOpen(false);
                setNewHabitName('');
            } else {
                // BAGIAN RENAME DIPERBARUI
                if (renameValue.trim() === '') return; // Jangan simpan jika kosong

                const {data, error} = await supabase.from('habits').update({name: renameValue}).eq('id', id);
                if (error) throw error;

                setEditingHabitId(null); 
            }

            const updatedHabit = await fetchHabitDataAndHabitLogs();
            await addHabitLog(updatedHabit);
        } catch (error){
            console.log("Gagal Melakukan aksi: ", error);
        }
    }

    async function fetchHabitDataAndHabitLogs() {
        const { data: habit, error: habitError } = await supabase.from('habits').select('*');

        if (!habitError && habit) {
            setHabitsData(habit as Habit[]);
        }
        const startDate = weekDays[0].date;
        const endDate = weekDays[6].date;

        const {data: habitLog, error: logError} = await supabase.from('habit_log').select('*').gte('date', startDate).lte('date', endDate);

        if(habitLog && !logError){
            setHabitLogData(habitLog as HabitLog[]);
        }

        return habit as Habit[];
    }

    async function changeCheckbox(id: string | number, date: string, currentIsDone: boolean) {
        if (!id || !date) return;

        const newStatus = !currentIsDone;
        const existingLog = habitLogData.find(log => log.habit_id == id && log.date === date);

        if (existingLog) {
            // Jika sudah ada, lakukan UPDATE
            const { error: updateError } = await supabase
                .from('habit_log')
                .update({ is_done: newStatus })
                .eq('habit_id', id)
                .eq('date', date);

            if (updateError) throw updateError;
        } else {
            // Jika belum ada (misal klik hari lain yang belum ada row-nya), lakukan INSERT baru
            const { error: insertError } = await supabase
                .from('habit_log')
                .insert([{ habit_id: id, date: date, is_done: newStatus }]);

            if (insertError) throw insertError;
        }
        await fetchHabitDataAndHabitLogs();
    }

    async function addHabitLog(masterHabit: Habit[]) {
        try{
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];

            const {data: todayHabitLog, error: err} = await supabase.from('habit_log').select('habit_id').eq('date', formattedDate);

            if (err) throw err;

            const existingIds = todayHabitLog ? todayHabitLog.map(log => log.habit_id) : [];
            const missingHabits = masterHabit.filter(habit => !existingIds.includes(habit.id as never));
            
            if (missingHabits.length === 0){
                const tempHabitLog = missingHabits.map(habit => ({
                    habit_id: habit.id,
                    date: formattedDate,
                    is_done: false
                }));

                const {error: inserErr} = await supabase.from('habit_log').insert(tempHabitLog);
                if (inserErr) throw inserErr;

                await fetchHabitDataAndHabitLogs();
            }else{
                console.log('data sudah ada di database');
            }
        }catch (err){
            console.error("gagal memproses data hari ini: ", err);
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
                            {weekDays.map(day => (
                                <span key={day.name}>{day.name}</span>
                            ))}
                        </div>
                    </div>
                            
                    <div className="checklist-body">
                        {habitsData.map((habit) => (
                            <div className="card-habit" key={habit.id}>
                                <span>{habit.name}</span>

                                <div className="checkbox-row">
                                    {weekDays.map(day => {
                                        const currentLog = habitLogData.find(log => log.habit_id === habit.id && log.date === day.date)
                                        const isDoneStatus = currentLog? currentLog.is_done : false;

                                        return(
                                            <input type="checkbox"
                                            key={day.name}
                                            disabled={day.isPassed}
                                            checked={isDoneStatus} 
                                            onChange={() => changeCheckbox(habit.id, day.date, isDoneStatus)}/>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bottom-panel">
                    <div className="controller-habits">
                        <button className="btn-controller" onClick={() => setIsAddModalOpen(true)}>+ Add</button>
                        <button className="btn-controller" onClick={() => setIsEditModalOpen(true)}>+ Edit</button>
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

                {isAddModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>New Add Habit</h4>
                                <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>&times;</button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="">Habit Name</label>
                                    <input 
                                    type="text"
                                    placeholder='e.g., Drink 2L Water' 
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}/>
                                </div>

                                <button className="btn-save-habit" onClick={() => actionModalButton('', false)}>save Habit</button>
                            </div>
                        </div>
                    </div>
                )}

                {isEditModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h4>Edit habit</h4>
                                <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="">List Habits</label>

                                    <div className="list-habit-container">
                                        {habitsData.map(habit => (
                                            <div className="card-habits" key={habit.id}>
                                                {/* Jika ID sedang diedit, munculkan Input. Jika tidak, munculkan teks biasa */}
                                                {editingHabitId === habit.id ? (
                                                    <input 
                                                        type="text" 
                                                        value={editHabitName}
                                                        onChange={(e) => setEditHabitName(e.target.value)}
                                                        autoFocus
                                                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '60%' }}
                                                    />
                                                ) : (
                                                    <h4>{habit.name}</h4>
                                                )}

                                                {/* Tombol berubah sesuai mode */}
                                                <div>
                                                    {editingHabitId === habit.id ? (
                                                        <>
                                                            <button className="rename-btn" onClick={() => actionModalButton(habit.id, false, editHabitName)}>Save</button>
                                                            <button className="delete-btn" onClick={() => setEditingHabitId(null)}>Cancel</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className="delete-btn" onClick={() => {actionModalButton(habit.id, true)}}>Delete</button>
                                                            <button className="rename-btn" onClick={() => {
                                                                setEditingHabitId(habit.id);
                                                                setEditHabitName(habit.name); // Isi input dengan nama lama otomatis
                                                            }}>Rename</button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}