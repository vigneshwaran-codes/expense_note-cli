import React, { useState } from 'react'
import '../styles/ResetPassword.css'
import { TextField } from '@mui/material'
import image from '../images/app-icon.png'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { ErrorMessage } from './Utils'
import { useParams, Link } from 'react-router-dom'

import { API_URL } from './GlobalConstant'

export default function ResetPassword () {
  const [error, setError] = useState(null) // hook to handle error message from the server
  const [show, setShow] = useState(false) // hook to display sign in button after success message from the database
  const [disabled, setDisabled] = useState(false) // hook to handle save button disable attribute
  const { id } = useParams() // useParams hook to get unique id on endpoint

  // function will run after validation get passed
  const onSubmit = async (values) => {
    await fetch(`${API_URL}/reset-password`, { // handled put request with fetch
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        newPassword: values.newPassword,
        resetLink: id // passing unique id from params to database
      })
    })
      .then(data => data.json())
      .then(data => {
        setError(data.message) // setting error message from the database to UI
        if (data.message === 'Your password has been changed successfully!') {
          setDisabled(true) // trigger disable attribute
          setShow(true) // display the sign in button after success message
        }
      }
      )
  }

  // regex for password validation
  const PASSWORD_REGEX = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/

  // formik for handling form validation
  const { handleBlur, handleChange, handleSubmit, errors, touched, values } = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: yup.object({
      newPassword: yup.string().required('Please enter password!').matches(PASSWORD_REGEX,
        'Password must follow pattern (Aa#1)'
      ),
      confirmPassword: yup.string().required('Please confirm your password!').when('newPassword', {
        is: val => !!(val && val.length > 0),
        then: yup.string().oneOf([yup.ref('newPassword')], 'Password does not match!')
      })
    }),
    onSubmit
  })

  return (
    <>
      <div className='resetpasswordPage'>
        <div className='resetpassword-logo'>
          <img src={image} alt='' />
        </div>

        {/* display error message from server */}
        <div className='error__message'>{error ? (<ErrorMessage>{error}</ErrorMessage>) : ''}</div>

        <form className='resetpassword-form' onSubmit={handleSubmit}>
          <h2 className='title'>Reset Your Password</h2>
          <div className='input-field'>
            <i className='fas fa-envelope' />
            <TextField type='Password' label='New Password' name='newPassword' variant='standard' fullWidth onChange={handleChange} onBlur={handleBlur} value={values.newPassword} />
          </div>
          <div className='error__message'> {touched.newPassword && errors.newPassword ? (<ErrorMessage>{errors.newPassword}</ErrorMessage>) : null}</div>

          <div className='input-field'>
            <i className='fas fa-lock' />
            <TextField type='password' label='Confirm Your Password' name='confirmPassword' variant='standard' fullWidth onChange={handleChange} onBlur={handleBlur} value={values.confirmPassword} />
          </div>
          <div className='error__message'>{touched.confirmPassword && errors.confirmPassword ? (<ErrorMessage>{errors.confirmPassword}</ErrorMessage>) : null}</div>

          <button type='submit' className='rpBtn' disabled={disabled}>Save Changes</button>
        </form>
        {show ? <div className='footer'>Sign in to your account: <Link className='links' to='/login'>Sign In</Link></div> : ''}
      </div>
    </>
  )
}
