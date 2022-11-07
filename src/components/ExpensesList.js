import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from 'react-bootstrap/Table'
import '../styles/ExpensesList.css'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Modal, Container, Row, Col, Button } from 'react-bootstrap'
import axios from 'axios'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import jwt from 'jsonwebtoken'
import { API_URL } from './GlobalConstant'

export default function ExpensesList ({ value }) {
  const [show, setShow] = useState(false) // hook to handle delete expense modal
  const [data, setData] = useState([]) // hook to save data from database
  const [passData, setPassData] = useState('') // hook to pass the data to modal
  const [totalAmount, setTotalAmount] = useState('') // hook to handle added total amount from database

  const navigate = useNavigate() // for changing the route
  const refToken = useRef() // useRef hook - here using for storing token

  useEffect(() => {
    const localToken = localStorage.getItem('token') // getting token from localStorage
    const decodedToken = jwt.decode(localToken) // decode the token from localStorage
    if (decodedToken.exp * 1000 <= Date.now()) { // check if token is expired or not
      navigate('/login')
    } else {
      refToken.current = localToken // store token in useRef hook to manipulate through request
      getData() // calling this function to get data from database
    }
    // eslint-disable-next-line
    }, [])

  // to trigger delete modal
  const handleShow = (item) => {
    setShow(true) // trigger delete modal
    setPassData(item) // passing data from the delete button to delete modal
  }

  // filter out the data using dates
  const dateRangePicker = async () => {
    const formatDate1 = new Date(value[0]).getTime()
    const formatDate2 = new Date(value[1]).getTime()
    if (!formatDate1 || !formatDate2) return // return nothing if no date is provided
    const dbData = await axios.get(`${API_URL}/expenses-list`, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    const dates = dbData.data // holding data from the database in date variable
    const result = dates.filter(data => { // storing only dates between the range specified in result variable
      const value = new Date(data.date).getTime()
      return value >= formatDate1 && value <= formatDate2
    })
    setData(result) // setting the data only between the range specified in result variable
    const amount = result.map(item => item.amount).reduce((previousValue, currentValue) => {
      return previousValue + currentValue
    })
    setTotalAmount(amount) // setting total amount between the range specified
  }

  // get data from database
  const getData = async () => {
    const data = await axios.get(`${API_URL}/expenses-list`, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    setData(data.data) // set data from database globally
    addingAmount(data.data) // passing data to add amount function to add total amount from database
  }

  // handle the delete operation
  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/expenses-list/` + id, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    setShow(false) // close the delete modal after delete operation
    getData() // trigger this function to re-render after delete operation
  }

  // function to add all the amount from database
  const addingAmount = async (item) => {
    const data = item
    const result = await data.map(item => item.amount).reduce((previousValue, currentValue) => {
      return previousValue + currentValue
    })
    if (result === 0 || isNaN(result) || result === null) return setTotalAmount(0) // setting 0 if amount doesn't not exist
    return setTotalAmount(result) // setting total amount
  }

  return (
    <>
      <div className='expensesList-date-picker-btn'>
        <IconButton className='expensesList-dp-btn' onClick={() => dateRangePicker()}>
          <CheckCircleOutlineIcon />
        </IconButton>
      </div>

      <div className='expensesListPage'>
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Expenses Category</th>
              <th>Description</th>
              <th>Amount(Rs.)</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {/* data from the database will render one by one with help of map function */}
            {data.map((item, key) => {
              return (
                <tr>
                  <td>{key + 1}</td>
                  <td>{item.date}</td>
                  <td>{item.expensesCategory}</td>
                  <td>{item.description}</td>
                  <td>{item.amount}</td>
                  <td className='text-center'>
                    <IconButton className='expensesList__delButton' onClick={() => handleShow(item)}>
                      <CloseIcon />
                    </IconButton>
                  </td>
                </tr>
              )
            })}
            <tr>
              <td />
              <td />
              <td />
              <td className='text-end text-muted'>Total Amount(Rs.): </td>
              <td>{totalAmount}</td>
            </tr>
          </tbody>
        </Table>

        {/* for deleting the expense */}
        <Modal show={show} size='lg' onHide={() => setShow(false)} backdrop='static' keyboard={false}>
          <Modal.Header closeButton>
            <Modal.Title>
              Do you want to delete this?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body fluid>
            <Container>
              <Row>
                <Col>
                  <Table responsive striped bordered hover>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Date</th>
                        <th>Expenses Category</th>
                        <th>Description</th>
                        <th>Amount(Rs.)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>{passData.date}</td>
                        <td>{passData.expensesCategory}</td>
                        <td>{passData.description}</td>
                        <td>{passData.amount}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='danger' onClick={() => handleDelete(passData._id)}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  )
}
