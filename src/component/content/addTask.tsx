import React, { useState } from "react";
import { supabase } from "../../lib/supabase";

interface AddTaskProps{
    onClose: () => void;
    selectedDate: Date | null;
    refreshTasks: () => void;
};

export default function AddTask({onClose, selectedDate, refreshTasks} : AddTaskProps){
    const [title, setTitle] = useState('');

    const getLocalYMD = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title ||  !selectedDate) {
            alert('Kosong')
            return;
        }

        const dateStr = getLocalYMD(selectedDate);

        const {error} = await supabase.from('task').insert([{title: title, date: dateStr, is_completed: false}]);

        if (!error) {
            refreshTasks();
            onClose();
        }else{
            console.error(error)
        }
    }
    
    return(
        <div className="modal-overlay"> 
            <div className="modal-content">
                <h3>Tambah Tugas</h3>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Ketik tugas baru..." 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px' }}
                        autoFocus
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px', flex: 1 }}>Batal</button>
                        <button type="submit" style={{ padding: '10px', flex: 1, backgroundColor: '#6e590e', color: 'white'}}>Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}