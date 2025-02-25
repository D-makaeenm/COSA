import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/output.html')
      .then(response => response.text())
      .then(data => setContent(data))
      .catch(error => console.error("Lỗi tải dữ liệu:", error));
  }, []);

  return (
    <div>
      <h2>Hiển thị nội dung file .docx</h2>
      <div id="output" style={{ border: '1px solid #000', padding: '10px', marginTop: '10px' }}>
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </div>
  );
}

export default App;
