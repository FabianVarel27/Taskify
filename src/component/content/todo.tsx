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
        <div className="container">
            <div className="header">
                <div className="title-header">
                    <h1>List Task</h1>
                    <h4>Manage your task, stay focused, get things done.</h4>
                </div>

                <input type="search" placeholder="search task..." className="search"/>
            </div>

            <div className="container-btn-filter">
                <div className="list-btn-filter">
                    <button className="btn-filter btn-activated">All</button>
                    <button className="btn-filter">Today</button>
                    <button className="btn-filter">Upcoming</button>
                    <button className="btn-filter">Completed</button>
                </div>

                <button className="btn-add-task">
                    + Add Task
                </button>
            </div>

            <div className="container-task">
                <div className="list-filter">
                    <div className="filter">
                        <span>Category</span>
                    </div>
                    <div className="filter">
                        <span>Sort By</span>
                    </div>
                </div>

                <div className="container-card-task">
                    <div className="card-task">Card name</div>
                    <div className="card-task">Card name</div>
                    <div className="card-task">Card name</div>
                </div>
            </div>
        </div>
    )
}