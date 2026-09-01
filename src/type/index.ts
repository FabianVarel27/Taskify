export interface Task{
    id: string;
    title: string;
    date: string;
    is_completed: boolean;
    created_at: string;
}

export interface Habit{
    id: string;
    name: string;
    color_theme: string;
    created_at: string;
}

export interface HabitLog{
    id: string;
    habit_id: string;
    date: string;
    is_done: boolean;
}