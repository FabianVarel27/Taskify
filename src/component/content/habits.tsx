import './habits.css'
import React, { useEffect, useState } from 'react';

export default function Habits(){
    const days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Frid', 'Sat', 'Sun'];
    const dummyHabits = ['Reading a Book', 'Drink 1L Water', 'Workout 30 min', 'Study 1 Hour', 'makan babi', 'Doa pagi', 'gelok'];

    return(
        <div className="panel-content">
            <div className="hero-section">
                <h3>Your Days</h3>
                <p>Track your habits every day and achieve your goals.</p>
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
                            {days.map(day => (
                                <span key={day}>{day}</span>
                            ))}
                        </div>
                    </div>


                    <div className="checklist-body">
                        {dummyHabits.map(habit => (
                            <div className="card-habit" key={habit}>
                                <span>{habit}</span>

                                <div className="checkbox-row">
                                    {days.map(checkbox => (
                                        <input type="checkbox" key={checkbox} />
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
    )
}