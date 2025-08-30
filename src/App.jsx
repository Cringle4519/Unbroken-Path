import React from 'react';

// The main App component
function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
          Welcome to Unbroken-Path!
        </h1>
        <p className="text-xl text-gray-600 mb-6 animate-slide-in">
          This project uses React, Vite, and Tailwind CSS.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
          <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-transform transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Learn More
          </button>
          <a href="#" className="text-indigo-600 font-semibold py-3 px-6 transition-colors hover:text-indigo-800">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}

// Custom animation keyframes
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 1s ease-out forwards;
  }

  .animate-slide-in {
    animation: slide-in 1s ease-out 0.5s forwards;
    opacity: 0; /* Initially hidden */
  }
`;
document.head.appendChild(style);


export default App;
    
