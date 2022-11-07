import './App.css';
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from './components/Login';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SideBar from './components/SideBar';
import 'bootstrap/dist/css/bootstrap.min.css';

export const PrintContext = React.createContext('')       //context api for getting print details

function App() {
  const [data, setData] = useState([])                    //hook to store print details
  return (
    <PrintContext.Provider value={{ data, setData }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id" element={<ResetPassword />} />
        </Routes>
        <Routes>
          <Route exact path="/dashboard" element={<SideBar />} />
          <Route exact path="/add-expenses" element={<SideBar />} />
          <Route exact path="/expenses-list" element={<SideBar />} />
          <Route exact path="/transferred-amount" element={<SideBar />} />
          <Route exact path="/dashboard/print-details" element={<SideBar />} />
        </Routes>
      </BrowserRouter >
    </PrintContext.Provider>
  );
}

export default App;