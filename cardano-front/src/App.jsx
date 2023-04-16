import { useState } from 'react'
import './App.css'
import {ChakraProvider, Text} from "@chakra-ui/react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import LogInPage from "./pages/LogInPage.jsx";
import Dashboard from "./components/DashBoard/DashBoard.jsx";
import EditProfil from "./components/DashBoard/EditProfil.jsx";
import SendFilePage from "./pages/SendFilePage.jsx";
import SendFile from "./components/SendFile.jsx";
import WalletConnectorCli from "./components/WalletConnectorCli.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
      <ChakraProvider>
          <Router>
              <Routes>
                  <Route path="/" element={<LogInPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/edit-profile" element={<EditProfil />} />
                  <Route path="/wallet" element={<SendFile />} />
                  <Route path={"/send-file"} element={<SendFilePage />} />
                  <Route path={"/walletCli"} element={<WalletConnectorCli/>} />
              </Routes>
          </Router>
      </ChakraProvider>
  )
}

export default App
