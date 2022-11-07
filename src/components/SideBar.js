import React, { useEffect, useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/SideBar.css'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import image from '../images/app-icon.png'
import Dashboard from './Dashboard'
import AddExpenses from './AddExpenses'
import ExpensesList from './ExpensesList'
import { Modal, Button } from 'react-bootstrap'
import TransferredAmount from './TransferredAmount'
import PaidIcon from '@mui/icons-material/Paid'
import DateRangePicker from '@mui/lab/DateRangePicker'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import Stack from '@mui/material/Stack'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import { TextField } from '@mui/material'
import PrintDetails from './PrintDetails'
import { PrintContext } from '../App'

export default function SideBar () {
  const [show, setShow] = useState() // hook to handle the routes
  const [modelOpen, setModelOpen] = useState(false) // hook to handle logout modal
  const [value, setValue] = useState([null, null]) // hook to handle date range provided by the user

  const navigate = useNavigate() // for changing the route
  const context = useContext(PrintContext) // getting the data(print details) from context api

  useEffect(() => {
    // hovering effect on the links
    const list = document.querySelectorAll('.sidebar__navigation li')
    function activeLink () {
      list.forEach((item) => {
        item.classList.remove('hovered')
        this.classList.add('hovered')
      })
    }
    list.forEach(item => {
      item.addEventListener('mouseover', activeLink)
    })
    setShow('dashboard')
  }, [])

  const navigation = document.querySelector('.sidebar__navigation')
  const header = document.querySelector('.sidebar__header')

  // Menu toggle
  const toggleHandler = () => {
    navigation.classList.toggle('active')
    header.classList.toggle('active')
    navigation.classList.remove('mbScreen') // while on the desktop screen, removing class name "mbscreen"
    header.classList.remove('mbScreen')
    navigation.classList.toggle('tabScreen')
    header.classList.toggle('tabScreen')
  }

  // run for mobile screens
  const mobileScreenHandler = () => {
    navigation.classList.toggle('mbScreen')
    header.classList.toggle('mbScreen')
    navigation.classList.remove('active') // while on the mobile screen, removing class name "active" & "tabScreen"
    header.classList.remove('active')
    navigation.classList.remove('tabScreen')
    header.classList.remove('tabScreen')
  }

  return (
    <>
      <div className='sidebarPage'>
        <div className='sidebar__navigation'>
          <ul>
            <li>
              <Link to='#' className='sidebar__links'>
                <span className='sidebar__icons'> <img className='sidebar__logo' src={image} alt='logo' /></span>
                <span className='sidebar__title'>Expense-Note</span>
              </Link>
            </li>
            <li>
              <Link
                to='/dashboard' className='sidebar__links' onClick={() => {
                  setShow('dashboard')
                  return mobileScreenHandler()
                }}
              >
                <span className='sidebar__icons'><DashboardIcon /> </span>
                <span className='sidebar__title'>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to='/add-expenses' className='sidebar__links' onClick={() => {
                  setShow('add-expenses')
                  return mobileScreenHandler()
                }}
              >
                <span className='sidebar__icons'><AddShoppingCartIcon /> </span>
                <span className='sidebar__title'>Add Expenses </span>
              </Link>
            </li>
            <li>
              <Link
                to='/expenses-list' className='sidebar__links' onClick={() => {
                  setShow('expenses-list')
                  setValue([null, null])
                  return mobileScreenHandler()
                }}
              >
                <span className='sidebar__icons'><ListAltIcon /></span>
                <span className='sidebar__title'>Expenses List</span>
              </Link>
            </li>
            <li>
              <Link
                to='/transferred-amount' className='sidebar__links' onClick={() => {
                  setShow('transferred-amount')
                  setValue([null, null])
                  return mobileScreenHandler()
                }}
              >
                <span className='sidebar__icons'><PaidIcon /></span>
                <span className='sidebar__title'>Transferred Amount</span>
              </Link>
            </li>
            <li>
              <Link to='#' onClick={() => setModelOpen(true)} className='sidebar__links'>
                <span className='sidebar__icons'><LogoutIcon /></span>
                <span className='sidebar__title'>Log Out </span>

              </Link>
            </li>

            {/* LogOut Page */}
            <Modal show={modelOpen} onHide={() => setModelOpen(false)}>
              <Modal.Header closeButton>
                <Modal.Title>LOG OUT</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Do you want to Log Out?

              </Modal.Body>
              <Modal.Footer>
                <Button variant='secondary' onClick={() => setModelOpen(false)}>
                  NO
                </Button>
                <Button
                  variant='primary' onClick={() => {
                    localStorage.removeItem('token')
                    navigate('/login')
                  }}
                >
                  YES
                </Button>
              </Modal.Footer>
            </Modal>

          </ul>
        </div>
      </div>

      <div className='sidebar__header'>
        <div className='sidebar__topbox'>
          <div className='sidebar__toggle' onClick={toggleHandler}>
            <MenuIcon fontSize='large' />
          </div>
          <div className='sidebar__toggle2'>
            {show === 'dashboard' ? <PrintDetails /> : ''}
          </div>

          {/* display the date range input after the respective route is triggered */}
          {show === 'transferred-amount' || show === 'expenses-list'
            ? <div className='date-range-picker me-4'>

              <LocalizationProvider size='sm' dateAdapter={AdapterDateFns}>
                <Stack size='sm'>
                  <DateRangePicker
                    size='sm' value={value} onChange={newvalue => setValue(newvalue)} renderInput={(startProps, endProps) => (
                      <>
                        <TextField {...startProps} size='sm' />
                        <TextField {...endProps} className='ms-1' size='sm' />
                      </>
                    )}
                  />
                </Stack>
              </LocalizationProvider>
            </div>
            : ''}
        </div>

        {/* Printing the company details */}
        <div className='sidebar__printDetails'>
          <h6>{context.data.companyName}</h6>
          <p>Address: {context.data.address}</p>
          <p>Email: {context.data.email}</p>
          <p>Contact No: {context.data.contact}</p>
        </div>
        <>
          {show === 'dashboard' ? <Dashboard /> : ''}
          {show === 'add-expenses' ? <AddExpenses /> : ''}
          {show === 'expenses-list' ? <ExpensesList value={value} /> : ''}
          {show === 'transferred-amount' ? <TransferredAmount value={value} /> : ''}
        </>
      </div>

    </>
  )
}
