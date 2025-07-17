
import { use } from 'react'
import './App.css'
import { useEffect } from 'react'
import {Routes,Route} from 'react-router-dom'
import DevPlazaOTP from './components/auth/otp'
import DevPlazaForgotPassword from './components/auth/forgot' 
import DevPlazaLogin from './components/auth/login'
import DevPlazaRegister from './components/auth/singup'
import AuthPage from './auth/authContext'


function App() {

   


  return (
    <>
      <Routes>
        <Route path="/" element={<DevPlazaLogin />} />
        <Route path="/register" element={<DevPlazaRegister />} />
        <Route path="/forgot-password" element={<DevPlazaForgotPassword />} />
        <Route path ="/auth" element ={<AuthPage/>}/>
      </Routes>
     
    </>
  )
}

export default App
