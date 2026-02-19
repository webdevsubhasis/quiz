import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/base.css'
import './styles/layout.css'
import './styles/navbar.css'
import './styles/sidebar.css'
import './styles/cards.css'
import './styles/forms.css'
import './styles/tables.css'
import './styles/modal.css'
import './styles/theme.css'
import './styles/dashboard.css'
import "./styles/subject.css";
import "./styles/EditQuestion.css";
import "./styles/addsubject.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById('root')).render(
   <React.StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  </React.StrictMode>
);