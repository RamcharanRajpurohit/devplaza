
import { use } from 'react'
import './App.css'
import { useEffect } from 'react'
import {Routes,Route} from 'react-router-dom'
import DevPlazaOTP from './components/auth/otp'
import DevPlazaForgotPassword from './components/auth/forgot' 
import DevPlazaLogin from './components/auth/login'
import DevPlazaRegister from './components/auth/singup'
import AuthPage from './auth/authContext'


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
        <Route path="/" element={<DevPlazaLogin />} />
        <Route path="/register" element={<DevPlazaRegister />} />
        <Route path="/forgot-password" element={<DevPlazaForgotPassword />} />
        <Route path ="/auth" element ={<AuthPage/>}/>
      </Routes>
     
    </>
  )
}

export default App
