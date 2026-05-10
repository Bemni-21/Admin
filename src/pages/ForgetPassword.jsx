import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const fakeToken = Math.random().toString(36).substring(2, 15);
    const resetLink = `http://localhost:5173/reset-password?token=${fakeToken}`;
    setLink(resetLink);
    console.log("Reset link:", resetLink);
    alert(`Reset link: ${resetLink}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Forgot Password?</h1>
        
        {link ? (
          <div className="bg-green-50 p-4 rounded mb-4">
            <p className="text-green-800 text-sm">Reset link generated!</p>
            <p className="text-xs break-all mt-2">{link}</p>
            <button 
              onClick={() => setLink("")}
              className="mt-4 text-blue-600 text-sm"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded"
            >
              Send Reset Link
            </button>
          </form>
        )}
        
        <Link to="/login" className="block text-center text-sm text-gray-500 mt-4">
          Back to Login
        </Link>
      </div>
    </div>
  );
}