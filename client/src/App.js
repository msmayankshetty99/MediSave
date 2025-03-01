import './App.css';
import Expenses from './Expenses';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <Link to="/expenses">Expenses</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/expenses" element={<Expenses />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
