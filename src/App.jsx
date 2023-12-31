import './App.css';
import Login from './Login'
import Home from './Home'
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
  );
}

export default App;
