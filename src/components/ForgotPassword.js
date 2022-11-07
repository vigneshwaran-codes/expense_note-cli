import React, { useState } from 'react'
import '../styles/ForgotPass.css'
import { TextField } from '@mui/material'
import image from '../images/app-icon.png'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { ErrorMessage } from './Utils'
import { API_URL } from './GlobalConstant'

export default function ForgotPassword () {
  const [error, setError] = useState(null) // hook to display the error message from the server
  const [disabled, setDisabled] = useState(false) // hook to handle disable attribute on send button

  // function will run after validation get passed
  const onSubmit = async (values) => {
    await fetch(`${API_URL}/forgot-password`, { // handled the update request with fetch
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: values.email
      })
    })
      .then(data => data.json())
      .then(data => setError(data.message)) // setting the error message from the server
      .catch((err) => setError(err.message))
    if (error === 'Email has been sent, kindly follow the instructions.') return setDisabled(true) // disable button after the success message
  }

  // formik for handling form validation
  const { handleBlur, handleChange, handleSubmit, errors, touched, values } = useFormik({ // Destructuring the formik attribute
    initialValues: {
      email: ''
    },
    validationSchema: yup.object({
      email: yup.string().required('Please enter email!').email('Email must be a valid email!')
    }),
    onSubmit
  })

  return (
    <>
      <div className='forgotpasswordPage'>
        <div className='forgotpassword-logo'>
          <img src={image} alt='' />
        </div>

        {/* div for displaying error message from server */}
        <div className='error__message'>{error ? (<ErrorMessage>{error}</ErrorMessage>) : ''}</div>

        <form className='forgotpassword-form' onSubmit={handleSubmit}>
          <h2 className='titles'>Forgot Password</h2>
          <p>Please enter your email address and we'll send you a link to reset your password!</p>

          <div className='input-field'>
            <i className='fas fa-envelope' />
            <TextField type='text' label='Email' name='email' variant='standard' fullWidth value={values.email} onChange={handleChange} onBlur={handleBlur} />
          </div>
          <div className='error__message'>{touched.email && errors.email ? (<ErrorMessage>{errors.email}</ErrorMessage>) : null}</div>

          <button type='submit' className='fpBtn' disabled={disabled}>Send Link</button>
        </form>
      </div>
    </>
  )
}
