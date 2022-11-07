import React, { useState } from 'react'
import '../styles/Login.css'
import { TextField } from '@mui/material'
import image from '../images/app-icon.png'
import { useFormik } from 'formik'
import { ErrorMessage } from './Utils'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from './GlobalConstant'

function Login () {
  const navigate = useNavigate() // for changing the route
  const [error, setError] = useState(null) // hook to display error message from the server
  const validateForm = (values) => {
    const errors = {} // setting errors initially with empty object
    if (values.email.length < 3) {
      errors.email = 'Please provide a valid email!'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid Email address'
    }
    if (values.password.length < 1) {
      errors.password = 'Please provide a password!'
    } else if (values.password.length < 6) {
      errors.password = 'Invalid Password!'
    }
    if (values.password.length > 18) {
      errors.password = 'Password is too long!'
    }
    return errors // return errors if any of the errors are triggered
  }

  // function will run after validation get passed
  const onSubmit = async (values) => {
    const response = await axios.post(`${API_URL}/login`, {
      email: values.email,
      password: values.password
    }).catch((err) => {
      if (err && err.response) { setError(err.response.data.message) } // setting the error message from the server to display on UI
    })

    if (response.data) {
      await localStorage.setItem('token', response.data) // storing the token in localStorage
      navigate('/dashboard') // if data is available it will navigate to dashboard
    }
  }

  // formik for handling form validation
  const formik = useFormik({ // Destructured the formik attribute
    initialValues: { email: '', password: '' },
    validate: validateForm,
    onSubmit

  })

  const handleDemo = () => {
    formik.setValues({"email": "newdemotest@gmail.com","password": "test123"}) 
  }

  return (
    <>
      <div className='loginPage'>
        <div className='login-logo'>
          <img src={image} alt='Logo' />
        </div>

        <form className='login-form' onSubmit={formik.handleSubmit}>
          <h2 className='title'>Log In</h2>
          <div className='error__message'>{error ? (<ErrorMessage>{error}</ErrorMessage>) : ''}</div>

          <div className='input-field'>
            <i className='fas fa-envelope' />
            <TextField type='text' label='Email' name='email' variant='standard' size='sm' fullWidth value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          </div>
          <div className='error__message'><ErrorMessage>{formik.errors.email && formik.touched.email && formik.errors.email}</ErrorMessage></div>

          <div className='input-field'>
            <i className='fas fa-lock' />
            <TextField type='password' label='Password' name='password' variant='standard' fullWidth value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} />
          </div>
          <div className='error__message'><ErrorMessage>{formik.errors.password && formik.touched.password && formik.errors.password}</ErrorMessage></div>

          <button type='submit' className='btn-success'><span className='text'>Login</span></button>
        </form>

        <div className='footer1'>
          <Link to='/forgot-password' className='links'>Forgot password?</Link>
        </div>
        <div className='footer'>
          Don't have an account yet? <Link to='/signup' className='links'>Sign Up</Link>
        </div>
        <p>
          Demo Credentials: &nbsp;
          <button className='btn-primary' onClick={handleDemo}>Demo Login</button>
        </p>
      </div>
    </>
  )
}

export default Login
