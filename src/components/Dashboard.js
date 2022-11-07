import React, { useState, useEffect, useRef } from 'react'
import '../styles/Dashboard.css'
import { format } from 'date-fns'
import { ProgressBar, Card, Button, Container, Row, Col, Modal } from 'react-bootstrap'
import { currencyFormatter, ErrorMessage } from './Utils'
import axios from 'axios'
import { IconButton } from '@mui/material'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import { useFormik } from 'formik'
import * as yup from 'yup'

import { useNavigate } from 'react-router-dom'
import jwt from 'jsonwebtoken'
import { API_URL } from './GlobalConstant'

export default function Dashboard () {
  const [month, setMonth] = useState('') // hook to change name on month basis
  const [updateAmt, setUpdateAmt] = useState('') // hook to save expenses on month basis
  const [getVariant, setGetVariant] = useState('') // hook to change color of progress bar
  const [changeColor, setChangeColor] = useState('') // hook to change color of card background
  const [removeModalOpen, setremoveModalOpen] = useState(false) // hook to handle reset amount modal
  const [addModalOpen, setAddModalOpen] = useState(false) // hook to handle add amount modal
  const [creditModalOpen, setCreditModalOpen] = useState(false) // hook to handle credit amount modal
  const [getValuesFromInputModal, setValuesFromInputModal] = useState('') // hook to save amount from the add amount modal
  const [dbAddValue, setDbAddValue] = useState('') // hook to save data from the data base

  const navigate = useNavigate() // for changing the route
  const refToken = useRef() // useRef hook - here using for storing token

  useEffect(() => {
    const localToken = localStorage.getItem('token') // getting token from localStorage
    const decodedToken = jwt.decode(localToken) // decode the token from localStorage
    if (decodedToken.exp * 1000 <= Date.now()) { // check if token is expired or not
      navigate('/login')
    } else {
      refToken.current = localToken // store token in useRef hook to manipulate through request
      getDataFromDB() // getting data from database
      setMonth(getMonth()) // setting current month
    }
    // eslint-disable-next-line
    }, [])

  // displaying the month on total expenses card
  const getMonth = () => {
    const date = new Date()
    const month = date.getMonth()
    return new Intl.DateTimeFormat('usd', { month: 'long' }).format(month)
  }

  // formik for handling form validation
  const formik = useFormik({
    initialValues: {
      bankName: '',
      accountNumber: '',
      date: '',
      amount: ''
    },
    validationSchema: yup.object({
      bankName: yup.string().required('Please add bank name!'),
      accountNumber: yup.number().test('len', 'Enter a valid bank Account Number!', (val) => { if (val) return val.toString().length >= 6 }).required('Please add account number!'),
      date: yup.date().required('Please add date!'),
      amount: yup.number().min(1).required('Please enter amount!')
    }),
    onSubmit: (values) => {
      handleSave(values)
      formik.resetForm() // resetform function clear the values in the form after validation is passed
    }
  })

  // It will trigger once formik validation get passed
  const handleSave = async (data) => {
    await axios.post(`${API_URL}/transferred-amount`, {
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      date: format(new Date(data.date), 'dd/MM/yyyy'), // formatting date using date-fns package
      amount: data.amount
    }, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    setCreditModalOpen(false) // trigger credit amount modal
  }

  // getting data from db by adding amount from add amount button
  const getDataFromDB = async () => {
    const data = await axios.get(`${API_URL}/expenses-list`, {
      headers: {
        token: refToken.current
      }
    })
    addingTotalAmt(data.data)
  }

  // filtering data per month
  const addingTotalAmt = (item) => {
    let data = item
    const date = new Date()
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    data = data.filter(item => {
      const value = Date.parse(item.createdAt)
      return value >= new Date(firstDay).getTime() && value <= new Date(lastDay).getTime()
    })
    if (!data) {
      getProgressBarVariant(0)
      changeBgColor(0)
      return 0
    };
    const result = data.map(item => item.amount).reduce((previousValue, currentValue) => {
      return previousValue + currentValue
    }, 0)
    setUpdateAmt(result) // setting the amount from db
    getAmtFromDB(result) // triggered to get data from database
  }

  // resetting amount in the expenses card
  const resetAmtHandler = async () => {
    await axios.delete(`${API_URL}/dashboard`, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    getAmtFromDB() // calling this function to re-render the data
  }

  // to add amount in expenses card
  const addAmtHandler = async () => {
    setAddModalOpen(false) // handle to close add amount modal
    await axios.post(`${API_URL}/dashboard`, { amount: getValuesFromInputModal }, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    setValuesFromInputModal('') // once data get added to database then removing values in the input
    getAmtFromDB() // calling this function to re-render the data
  }

  // get data from database
  const getAmtFromDB = async (amount) => {
    const data = await axios.get(`${API_URL}/dashboard`, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    const result = await data.data.map(data => data.amount).reduce((prev, cur) => {
      return prev + cur
    }, 0)
    setDbAddValue(result) // setting values global
    getProgressBarVariant(amount, result) // trigger color change in the progress bar
    changeBgColor(amount, result) // trigger color change in the card background
  }

  // for changing card color by comparing total expenses / total amount added
  const getProgressBarVariant = (amount, result) => {
    if (!updateAmt || !dbAddValue) {
      const ratio = amount / result // if rendering doesn't happens, taking amount/result from database
      if (ratio < 0.5) return setGetVariant('primary')
      if (ratio < 0.75) return setGetVariant('warning')
      return setGetVariant('danger')
    }
    const ratio = updateAmt / dbAddValue
    if (ratio < 0.5) return setGetVariant('primary')
    if (ratio < 0.75) return setGetVariant('warning')
    return setGetVariant('danger')
  }

  // changing background color for total expenses card
  const changeBgColor = (amount, result) => {
    if (!dbAddValue) { // if rendering doesn't happens, taking amount/result from database
      if (amount < result) return setChangeColor('')
      if (amount > result) return setChangeColor('bg-danger bg-opacity-10')
    }
    if (updateAmt < dbAddValue) {
      setChangeColor('')
    } else if (updateAmt > dbAddValue) {
      setChangeColor('bg-danger bg-opacity-10')
    }
  }

  return (
    <div className='dashboardPage'>
      <Container fluid>
        <Row className='mt-2 justify-content-around overflow-auto'>
          <Col className='d-flex justify-content-center gap-2 mb-2 ' xl={6} lg='auto' md='auto'>
            <Card className={`dashboard__card ${changeColor}`} style={{ width: '26rem' }}>
              <Card.Body>
                <Card.Title className='d-flex justify-content-between align-items-baseline fw-normal mb-4'>
                  <div className='fw-bold me-2 p-2'>
                    Total Expenses
                  </div>

                  <div className='p-2'>
                    ₹{currencyFormatter.format(updateAmt)}
                    <span className='text-muted '> / ₹{currencyFormatter.format(dbAddValue)}</span>
                  </div>
                </Card.Title>

                <ProgressBar min={0} max={dbAddValue} now={updateAmt} variant={getVariant} className='rounded-pill' />

                <div className='dashboard__addAmt'>
                  <span className='text-muted fw-normal fs-10 ms-1'>{month}</span>
                  <div>
                    <button className='btn-primary' onClick={() => setAddModalOpen(true)}>Add Amount</button>
                    <button className='btn-danger ms-2' variant='outline-danger' onClick={() => setremoveModalOpen(true)}>Reset</button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col className='d-flex justify-content-center align-items-start gap-2 mb-2' xl={4} lg='auto' md='auto'>
            <Card className='dashboard__card' style={{ width: '26rem' }}>
              <Card.Body>
                <Card.Title className='d-flex justify-content-between align-items-baseline fw-normal mb-4'>
                  <div className='fw-bold me-2 p-2'>Credit Amount</div>
                  <button className='btn-primary' onClick={() => setCreditModalOpen(true)}>Add Amount</button>
                </Card.Title>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* for resetting amount in expenses card */}
      <Modal show={removeModalOpen} onHide={() => setremoveModalOpen(false)} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Do you want to Reset amount?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body fluid>
          <div class='d-flex justify-content-between align-items-baseline ms-2 me-2'>
            <div>Total credit =</div>
            <div>
              ₹{currencyFormatter.format(dbAddValue)}
              <span>
                <IconButton className='dashboard__deleteBtn ms-3' onClick={resetAmtHandler}>
                  <RestartAltIcon />
                </IconButton>
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='outline-primary' onClick={() => setremoveModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* for adding amount to expenses card */}
      <Modal show={addModalOpen} onHide={() => setAddModalOpen(false)} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Do you want to Add amount?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body fluid>
          <div class='d-flex justify-content-between align-items-baseline ms-2 me-2'>
            <div>Add amount =</div>
            <div>₹ <input type='number' placeholder='Enter credit' onChange={(e) => setValuesFromInputModal(e.target.value)} /></div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='outline-primary' onClick={addAmtHandler}>Submit</Button>
        </Modal.Footer>
      </Modal>

      {/* to credit amount in credit card */}
      <Modal show={creditModalOpen} onHide={() => setCreditModalOpen(false)} backdrop='static' keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            Do you want to Credit amount?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body fluid='true'>
          <form onSubmit={formik.handleSubmit} className='dashboard-form'>
            <div>
              <FloatingLabel className='dashboard-amount p-1 mb-1' label='Bank Name'>
                <Form.Control className='dashboard-amount' type='text' name='bankName' placeholder='Enter Bank Name' onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.bankName} />
              </FloatingLabel>
              {formik.touched.bankName && formik.errors.bankName ? <ErrorMessage>{formik.errors.bankName}</ErrorMessage> : null}
            </div>

            <div className='dashboard-middle'>
              <div>
                <FloatingLabel className='dashboard-amount p-1 mb-1' label='Account No.'>
                  <Form.Control className='dashboard-amount' type='number' name='accountNumber' placeholder='Enter account number' onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.accountNumber} />
                </FloatingLabel>
                {formik.touched.accountNumber && formik.errors.accountNumber ? <ErrorMessage>{formik.errors.accountNumber}</ErrorMessage> : null}
              </div>

              <div>
                <FloatingLabel className='p-1 mb-1' label='Date'>
                  <Form.Control className='dashboard-date' type='date' name='date' placeholder='Enter date' onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.date} />
                </FloatingLabel>
                {formik.touched.date && formik.errors.date ? <ErrorMessage>{formik.errors.date}</ErrorMessage> : null}
              </div>
            </div>

            <div>
              <FloatingLabel className='dashboard-amount p-1 mb-1' label='Amount(Rs.)'>
                <Form.Control className='dashboard-amount' type='number' name='amount' placeholder='Enter amount' onBlur={formik.handleBlur} onChange={formik.handleChange} value={formik.values.amount} />
              </FloatingLabel>
              {formik.touched.amount && formik.errors.amount ? <ErrorMessage>{formik.errors.amount}</ErrorMessage> : null}
            </div>

            <div>
              <button type='submit' onClick={handleSave} className='btn btn-primary'>Submit</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
