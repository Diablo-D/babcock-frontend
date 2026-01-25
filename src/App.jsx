import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // This imports the Bootstrap styles

function App() {
  return (
    <Router>
      <div className="container mt-5">
        <div className="card shadow-sm">
          <div className="card-body text-center">
            <h1 className="text-primary fw-bold">Babcock Clearance System</h1>
            <p className="lead text-muted">Frontend is connected and running!</p>
            <button className="btn btn-primary">Test Bootstrap Button</button>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;