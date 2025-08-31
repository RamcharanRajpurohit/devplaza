

import './App.css'
import { useEffect } from 'react'
import {Routes,Route} from 'react-router-dom'

import DevPlazaForgotPassword from './components/auth/forgot' 

import DevPlazaRegister from './components/auth/singup'
import AuthPage from './auth/authContext'
import CodingProfileDashboard from './components/dashboard/profile'


declare global {
  interface Window {
    google: any;
  }
}

 const handleCredentialResponse = (response: any) => {
    console.log('JWT Token:', response.credential);
   
  };
function App() {

   useEffect(() => {
    window.google.accounts.id.initialize({
      client_id:"390014223246-stoo8o009sudlcl10c96vfcmbmqvf4co.apps.googleusercontent.com", // or process.env in Next.js
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.prompt();
  }, []);



  return (
    <>
      <Routes>
        <Route path="/" element={<CodingProfileDashboard />} />
        <Route path="/register" element={<DevPlazaRegister />} />
        <Route path="/forgot-password" element={<DevPlazaForgotPassword />} />
        <Route path ="/auth" element ={<AuthPage/>}/>
        <Route path ="/user" element={<CodingProfileDashboard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />

      </Routes>
     
    </>
  )
}

export default App
