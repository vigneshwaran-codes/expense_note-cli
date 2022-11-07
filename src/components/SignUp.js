import React, { useState } from 'react';
import "../styles/SignUp.css"
import { TextField } from "@mui/material";
import image from "../images/app-icon.png";
import { Link } from 'react-router-dom';
import * as yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { ErrorMessage } from "./Utils";
import { API_URL } from "./GlobalConstant"

function SignUp() {
    const [error, setError] = useState(null)            //hook to display error message from the server
    const [disabled, setDisabled] = useState(false)     //hook to handle sign up button

    const onSubmit = async (values) => {
        const { confirmPassword, ...data } = values;            //Destructured the values from formik
        const response = await axios
            .post(`${API_URL}/signup`, data)
            .catch((err) => {
                if (err && err.response)
                    setError(err.response.data.message);        //setting the error message from the server to display on UI
            });
        setError(response.data.message)
        if (response.data.message === "Successfully Registered!") {
            return setDisabled(true)                    //disable the sign up button once it gets success message from server
        }
    }

    //regex for password validation
    const PASSWORD_REGEX = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/

    //formik for handling form validation
    const { handleBlur, handleChange, handleSubmit, errors, touched, values } = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: yup.object({
            name: yup.string().required("Please enter name!"),
            email: yup.string().required("Please enter email!").email("Email must be a valid email!"),
            password: yup.string().required("Please enter password!").matches(PASSWORD_REGEX,
                "Password must follow pattern (Aa#1)"
            ),
            confirmPassword: yup.string().required("Please confirm your password!").when("password", {
                is: val => val && val.length > 0 ? true : false,
                then: yup.string().oneOf([yup.ref("password")], "Password does not match!")
            })
        }),
        onSubmit,
    })

    return (
        <>
            <div className="signup">
                <div className="signup-logo">
                    <img src={image} alt='logo' />
                </div>
                <form className="signup-form" onSubmit={handleSubmit}>
                    <h2 className="title">Sign Up</h2>

                    {/* display the error message from the server*/}
                    <div className="error__message">{error ? (<ErrorMessage>{error}</ErrorMessage>) : ""}</div>

                    <div className="input-field">
                        <i className="fas fa-user"></i>
                        <TextField type="text" label="Name" name="name" variant="standard" fullWidth onChange={handleChange} onBlur={handleBlur} value={values.name} />
                    </div>
                    <div className="error__message">{touched.name && errors.name ? (<ErrorMessage>{errors.name}</ErrorMessage>) : null}</div>

                    <div className="input-field">
                        <i className="fas fa-envelope"></i>
                        <TextField type="text" label="Email" name="email" variant="standard" fullWidth onChange={handleChange} onBlur={handleBlur} value={values.email} />
                    </div>
                    <div className="error__message">{touched.email && errors.email ? (<ErrorMessage>{errors.email}</ErrorMessage>) : null}</div>

                    <div className="input-field">
                        <i className="fas fa-lock"></i>
                        <TextField type="password" label="Password" name="password" variant="standard" fullWidth onChange={handleChange} onBlur={handleBlur} value={values.password} />
                    </div>
                    <div className="error__message"> {touched.password && errors.password ? (<ErrorMessage>{errors.password}</ErrorMessage>) : null}</div>

                    <div className="input-field">
                        <i className="fas fa-lock"></i>
                        <TextField type="password" label="Confirm Password" name="confirmPassword" variant="standard" fullWidth onChange={handleChange} onBlur={handleBlur} value={values.confirmPassword} />
                    </div>
                    <div className="error__message">{touched.confirmPassword && errors.confirmPassword ? (<ErrorMessage>{errors.confirmPassword}</ErrorMessage>) : null}</div>
                    <button type='submit' className='btn-success' disabled={disabled}><span className='text'>Sign Up</span></button>
                </form>
                <div className="footer">
                    Already have an account? <Link className="links" to='/login'>Sign In</Link>
                </div>
            </div>
        </>
    )
}

export default SignUp
