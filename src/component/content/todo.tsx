import {  useEffect, useState } from "react";
import type { Task } from "../../type";
import { supabase } from "../../lib/supabase";

import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './todo.css'
// import { Link } from "react-router-dom";
import AddTask from "./addTask";


export default function Todo(){
    const [isAdding, setIsAdding] = useState(false);
    const [tanggal, setTanggal] = useState<Date | null>(new Date());


    const handleTanggalChange = (value: any) => {
        if (Array.isArray(value)){
            setTanggal(value[0]);

            handleShowTaskCalendar(value[0])
        }else{
            setTanggal(value);
            handleShowTaskCalendar(value)
        }
    };

    const [listTask, setListTask] = useState<Task[]>([]);

    useEffect(() => {
        handleShowTaskCalendar(new Date());
    }, []);

    async function handleShowTaskCalendar(dateClick : Date) {
        if (!dateClick) {
            return;
        }

        const localYear = dateClick.getFullYear();
        const localMonth = String(dateClick.getMonth() + 1).padStart(2, '0');
        const localDay = String(dateClick.getDate()).padStart(2, '0');
        const formatDate = `${localYear}-${localMonth}-${localDay}`


        const {data : taskData, error: taskError} = await supabase.from('task').select('*').eq('date', formatDate)

        if (taskData && !taskError) {
            // setListTask(taskData as Task[])
            const incompletedTask = taskData.filter((task) => task.is_completed === false);

            setListTask(incompletedTask as Task[]);
        };
    }

    
    async function handleActionTask(action : string, data : Task) {
        if (!action || !data) return;

        
        if (action === 'delete'){
            const {data: taskData, error} = await supabase.from('task').delete().eq('id', data.id);

            if (error) {
                console.error('Gagal menghapus   data', error.message);
            }else{
                console.log('Berhasil menghapus data!');
            }
        }else if (action === 'done'){
            const {data: taskData, error} = await supabase.from('task').update({is_completed: true}).eq('id', data.id);

            if (error){
                console.error('Gagal mengubah menjadi status completed', error.message);
            }else{
                console.log('Berhasil diubah');
            }
        }

        handleShowTaskCalendar(tanggal!);
    }

    return(
        <div className="calendar-content">
            <Calendar onChange={handleTanggalChange} value={tanggal} className='calendar'/>

            <div className="list-tasks-calendar">
                <button className="add-task" onClick={() => setIsAdding(true)}>+ Add Task</button>

                <div className="list-task-calendar-content">
                    {listTask.length > 0? (listTask.map((task) => (
                        <div className="task" key={task.id}>
                            <div className="task-btn-filter">
                                <button onClick={() => handleActionTask('delete', task)}>-</button>
                                <button onClick={() => handleActionTask('done', task)}>V</button>
                                <button>edit</button>
                            </div>

                            <div className="task-header">
                                <span>{task.title}</span>
                                <p>this is The Description of task</p>
                            </div>
                        </div>

                       
                    ))
                    ) : (
                        <p>Tidak ada</p>
                    )}
                    
                </div>
            </div>

            {isAdding && (
                <AddTask 
                    onClose={() => setIsAdding(false)}
                    selectedDate = {tanggal}
                    refreshTasks = {() => handleShowTaskCalendar(tanggal!)}/>
            )}
        </div>
    )
}