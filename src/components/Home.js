import React from 'react'
import '../styles/Home.css'
import image from '../images/app-icon.png'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate()
    const handleSubmit = () => {
        navigate('/login')
    }
    return(
        <div className='home col-md-4'>
            <h1 className='col-md-6 mb-2 home-title'>Welcome to <br /> Expense tracker {<img src={image} alt='expense-app-logo' />} </h1>
            <br />
            <button className='btn btn-success btn-lg home-btn' onClick={handleSubmit}>Get Started</button>
        </div>
    )
}