import './content.css'
import Dashboard from './content/dashboard'
import Habits from './content/habits';
import Todo from './content/todo';

interface ContentProps {
    activePage: string;
}

export default function Content({ activePage }: ContentProps){
    return(
        <div className="main-content">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'todo' && <Todo />}
            {activePage === 'habits' && <Habits />}
        </div>  
    )
}
