import { useState } from 'react'
import './App.css'
import {ChakraProvider, Text} from "@chakra-ui/react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import LogInPage from "./pages/LogInPage.jsx";
import Dashboard from "./components/DashBoard/DashBoard.jsx";
import EditProfil from "./components/DashBoard/EditProfil.jsx";
import WalletConnectorCli from "./components/WalletConnectorCli.jsx";
import SendFile from "./components/SendFile/SendFile.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import ReceivePage from "./components/SendFile/recieiveFile.jsx";
function App() {
  const [count, setCount] = useState(0)

  return (
      <ChakraProvider>
          <Router>
              <Routes>
                  <Route path="/recieve-file" element={<ReceivePage />} />
                  <Route path="/forget-password" element={<ForgetPassword />} />
                  <Route path="/" element={<LogInPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/edit-profile" element={<EditProfil />} />
                  <Route path={'/send-file'} element={<SendFile/>} />
                  <Route path={"/walletCli"} element={<WalletConnectorCli/>} />
              </Routes>
          </Router>
      </ChakraProvider>
  )
}

export default App
