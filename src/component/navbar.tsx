import './navbar.css'

interface NavbarProps{
    setActivePage: (page: string) => void;
}

function Navbar({setActivePage}: NavbarProps){
    return(
        <nav className="sidebar">
            <ul>
                    <li><a href="#" onClick={ (e) => { e.preventDefault(); setActivePage('dashboard'); }}>Dashboard</a></li>
                    <li><a href="#" onClick={(e) => {e.preventDefault(); setActivePage('todo'); }}>To Do List</a></li>
                    <li><a href="#" onClick={(e) => {e.preventDefault(); setActivePage('habits'); }}>Habit</a></li>
                    <li><a href="#" onClick={(e) => {e.preventDefault(); setActivePage('settings'); }}>Settings</a></li>
            </ul>
        </nav>
    )
}

export default Navbar