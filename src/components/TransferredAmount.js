import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from 'react-bootstrap/Table'
import '../styles/ExpensesList.css'
import axios from 'axios'
import { IconButton } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import jwt from 'jsonwebtoken'
import { API_URL } from './GlobalConstant'

export default function TransferredAmount ({ value }) {
  const [data, setData] = useState([]) // hook to store data from the database
  const [totalAmount, setTotalAmount] = useState('') // hook to add the amount from the database

  const navigate = useNavigate() // for changing the route
  const refToken = useRef() // useRef hook - here using for storing token

  useEffect(() => {
    const localToken = localStorage.getItem('token') // getting the token from localStorage
    const decodedToken = jwt.decode(localToken) // decode the token from localStorage
    if (decodedToken.exp * 1000 <= Date.now()) { // check if token is expired or not
      navigate('/login')
    } else {
      refToken.current = localToken // store token in useRef hook to manipulate through request
      getData() // getting data from the database
    }
    // eslint-disable-next-line
    }, [])

  // function to get data from database
  const getData = async () => {
    const data = await axios.get(`${API_URL}/transferred-amount`, {
      headers: {
        token: refToken.current
      }
    })
    setData(data.data)
    addingAmount(data.data)
  }

  // function to add only all the amount from database
  const addingAmount = async (item) => {
    const data = item
    const result = await data.map(item => item.amount).reduce((previousValue, currentValue) => {
      return previousValue + currentValue
    })
    if (result === 0 || isNaN(result) || result === null) return setTotalAmount(0)
    return setTotalAmount(result) // setting total amount
  }

  const dateRangePicker = async () => {
    const formatDate1 = new Date(value[0]).getTime()
    const formatDate2 = new Date(value[1]).getTime()
    if (!formatDate1 || !formatDate2) return // return nothing if date doesn't provide
    const dbData = await axios.get(`${API_URL}/transferred-amount`, {
      headers: {
        token: refToken.current // passing token in header to process request
      }
    })
    const dates = dbData.data
    const result = dates.filter(data => { // filtering out the data between the date range
      const value = new Date(data.date).getTime()
      return value >= formatDate1 && value <= formatDate2
    })
    setData(result) // setting the data between the date range provided
    const amount = result.map(item => item.amount).reduce((previousValue, currentValue) => {
      return previousValue + currentValue
    })
    setTotalAmount(amount) // setting the total amount from data range specified by user
  }

  return (
    <div>
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
              <th>Bank Name</th>
              <th>Account Number</th>
              <th>Amount(Rs.)</th>
            </tr>
          </thead>
          <tbody>

            {/* display the data from the database one by one with the help of map function */}
            {data.map((item, key) => {
              return (
                <tr>
                  <td>{key + 1}</td>
                  <td>{item.date}</td>
                  <td>{item.bankName}</td>
                  <td>{item.accountNumber}</td>
                  <td>{item.amount}</td>
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
      </div>
    </div>
  )
}
