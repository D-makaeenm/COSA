import React, { useState } from "react";
import axios from "axios";

function TestPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:5000/auth/register", {
                username,
                password,
            });
            setMessage(response.data.message); // Hiển thị thông báo từ backend
            setUsername("");
            setPassword("");
        } catch (error) {
            setMessage(error.response?.data?.error || "An error occurred");
        }
    };

    return (
        <div>
            <h1>Welcome to the Test Page!</h1>
            <p>This is the page you see after successful login.</p>
            
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}

export default TestPage;
