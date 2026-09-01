import { useState } from 'react'
import './App.css'
import Content from './component/content'
import Navbar from './component/navbar'

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className='page-container'>
      <Navbar setActivePage = {setActivePage}/>

      <Content activePage = {activePage}/>
    </div>
  )
}

export default App
