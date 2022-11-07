import React, { useState, useEffect, useContext, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import '../styles/PrintDetails.css'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { PrintContext } from '../App'
import jwt from 'jsonwebtoken'
import { API_URL } from './GlobalConstant'

export default function PrintDetails () {
  const [showModal, setShowModal] = useState(false) // hook to handle add details modal
  const [companyName, setCompanyName] = useState('') // hook to store company name
  const [address, setAddress] = useState('') // hook to store address
  const [email, setEmail] = useState('') // hook to store email
  const [contact, setContact] = useState('') // hook to store contact
  const [enableButton, setEnableButton] = useState(false) // hook to handle disable button on input

  const context = useContext(PrintContext) // getting data from context api
  const navigate = useNavigate() // for changing the route
  const refToken = useRef() // useRef hook - here using for storing token

  useEffect(() => {
    const localToken = localStorage.getItem('token') // getting token from localStorage
    const decodedToken = jwt.decode(localToken) // decode the token from localStorage
    if (decodedToken.exp * 1000 <= Date.now()) { // check if token is expired or not
      navigate('/login')
    } else {
      refToken.current = localToken // store token in useRef hook to manipulate through request
      getDataFromDB()
    }
    // eslint-disable-next-line
  }, [])

  // getting data from database
  const getDataFromDB = async () => {
    const { data: [{ companyName, address, email, contact }] } =
        await axios.get(`${API_URL}/dashboard/print-details`, {
          // Destructured the data
          headers: {
            token: refToken.current // passing token in header to process request
          }
        })
    setCompanyName(companyName) // setting company name
    setAddress(address) // setting address
    setEmail(email) // setting email
    setContact(contact) // setting contact
    const dataToContext = () => {
      context.setData({
        companyName: companyName,
        address: address,
        email: email,
        contact: contact
      })
    }
    dataToContext() // pushing current details to context api to share data with multiple components
  }

  // function will run after submit button is clicked
  const handleSave = async (e) => {
    e.preventDefault() // to prevent page reload of form's default behavior
    await axios.put(`${API_URL}/dashboard/print-details`,
      {
        companyName: companyName,
        address: address,
        email: email,
        contact: parseInt(contact) // parsing the contact to a number
      },
      {
        headers: {
          token: refToken.current // store token in useRef hook to manipulate through request
        }
      })
    setEnableButton(true) // once input gets added, trigger the disable attribute
    setShowModal(false) // close print details modal
    navigate('/dashboard') // after all done, changing route to dashboard
  }
  const handleReset = async (e) => {
    e.preventDefault() // to prevent page reload of form's default behavior
    setEnableButton(false) // triggered to enable the input to edit
    navigate('/dashboard') // after all done, changing route to dashboard
  }

  return (
    <div className='printDetails__addDetails-btn'>
      <Link to='/dashboard/print-details'>
        <button className='add-details' onClick={() => setShowModal(true)}>Add Details</button>
      </Link>

      {/* for adding print details */}
      <Modal
        show={showModal} onHide={() => {
          navigate('/dashboard')
          setShowModal(false)
        }} backdrop='static' keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Do you want to add print details?
          </Modal.Title>
        </Modal.Header>

        <Modal.Body fluid='true'>
          <form className='dashboard-form'>
            <div>
              <FloatingLabel className='dashboard-amount p-1 mb-1' label='Company Name'>
                <Form.Control className='dashboard-amount' type='text' name='company name' placeholder='Enter Company Name' value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={enableButton} />
              </FloatingLabel>
            </div>
            <div className='dashboard-middle'>
              <div>
                <FloatingLabel className='dashboard-amount p-1 mb-1' label='Address'>
                  <Form.Control className='dashboard-amount' type='text' name='address' placeholder='Enter address' value={address} onChange={(e) => setAddress(e.target.value)} disabled={enableButton} />
                </FloatingLabel>
              </div>
              <div>
                <FloatingLabel className='p-1 mb-1' label='Email'>
                  <Form.Control className='dashboard-date' type='email' name='date' placeholder='Enter date' value={email} onChange={(e) => setEmail(e.target.value)} disabled={enableButton} />
                </FloatingLabel>
              </div>
            </div>
            <div>
              <FloatingLabel className='dashboard-amount p-1 mb-1' label='Contact No.'>
                <Form.Control className='dashboard-amount' type='number' name='contact' placeholder='Enter contact' value={contact} onChange={(e) => setContact(e.target.value)} disabled={enableButton} />
              </FloatingLabel>
            </div>
            <div className='d-flex justify-content-between'>
              <button type='submit' className='btn-primary' onClick={handleSave} >Submit</button>
              <button type='submit' className='btn-danger' onClick={handleReset} >Reset</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>

  )
}
