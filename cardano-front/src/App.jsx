import { useState } from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import LogInPage from "./pages/LogInPage.jsx";
import Dashboard from "./components/DashBoard/DashBoard.jsx";
import EditProfil from "./components/DashBoard/EditProfil.jsx";
import WalletConnectorCli from "./components/WalletConnectorCli.jsx";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import ReceivePage from "./components/SendFile/recieiveFile.jsx";
import FileReceiver from "./components/SendFile/ReceiveFile.jsx";
import SendFilePage from "./pages/SendFilePage.jsx";
import HistorySent from "./pages/HistorySent.jsx";
import HistoryReceived from "./pages/HistoryReceived.jsx";
import AuthWrapper from "./components/AuthWrapper.jsx";
import WalletInfo from "./components/WalletInfo.jsx";
import Check from "./components/DashBoard/check.jsx";
function App() {
    return (

          <Router>
              <Routes>
                  <Route path="/check" element={<Check />} />
                  <Route path="/recieve-file" element={<ReceivePage />} />
                  <Route path="/forget-password" element={<ForgetPassword />} />
                  <Route path="/" element={<LogInPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/dashboard" element={ <AuthWrapper> <Dashboard/> </AuthWrapper>} />
                  <Route path="/edit-profile" element={<AuthWrapper> <EditProfil/> </AuthWrapper> } />
                  <Route path={'/send-file'} element={<AuthWrapper> <SendFilePage/> </AuthWrapper>} />
                  <Route path={'/receive-file2'} element={<AuthWrapper> <FileReceiver/> </AuthWrapper>} />
                  <Route path={"/walletCli"} element={<AuthWrapper> <WalletConnectorCli/> </AuthWrapper>} />
                  <Route path={"/historySent"} element={<AuthWrapper> <HistorySent/> </AuthWrapper>} />
                  <Route path={"/WalletInfo"} element={<AuthWrapper> <WalletInfo/> </AuthWrapper>} />
                  <Route path={"/historyReceived"} element={<AuthWrapper> <HistoryReceived/> </AuthWrapper>} />
              </Routes>
          </Router>




  )
}

export default App
