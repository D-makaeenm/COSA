import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import routes from './routes';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';

// Component để áp dụng cấu hình routes
function AppRoutes() {
  const routing = useRoutes(routes); // Sử dụng routes.js để định nghĩa toàn bộ routes
  return routing;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AppRoutes /> {/* Áp dụng các routes */}
    </Router>
  </React.StrictMode>
);

reportWebVitals();
