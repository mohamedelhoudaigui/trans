'use client';

import { useState } from 'react';

export default function JSXPlayground() {
  // Variables in TypeScript/React
  const staticText = "This is a constant";
  const numbers = [1, 2, 3, 4, 5];
  const users = [
    { id: 1, name: "Alice", age: 25, active: true },
    { id: 2, name: "Bob", age: 30, active: false },
    { id: 3, name: "Charlie", age: 35, active: true }
  ];

  // React state (dynamic variables that trigger re-renders)
  const [counter, setCounter] = useState(0);
  const [inputText, setInputText] = useState("");
  const [showSection, setShowSection] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");

  // Functions
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  const handleButtonClick = () => {
    alert(`Counter is: ${counter}, Input is: "${inputText}"`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>JSX Playground - Learn by Breaking Things!</h1>

      {/* 1. BASIC TEXT AND VARIABLES */}
      <section style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
        <h2>1. Variables and Text</h2>
        <p>Static text: {staticText}</p>
        <p>Dynamic time: {getCurrentTime()}</p>
        <p>Math: 2 + 3 = {2 + 3}</p>
        <p>String interpolation: Hello {inputText || "World"}</p>
      </section>

      {/* 2. LISTS AND ARRAYS */}
      <section style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
        <h2>2. Lists and Arrays</h2>
        
        <h3>Simple Number List:</h3>
        <ul>
          {numbers.map(num => (
            <li key={num}>Number: {num}, Squared: {num * num}</li>
          ))}
        </ul>

        <h3>Object Array (Users):</h3>
        <div>
          {users.map(user => (
            <div 
              key={user.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '10px', 
                margin: '5px 0',
                backgroundColor: user.active ? '#e8f5e8' : '#f5e8e8'
              }}
            >
              <strong>{user.name}</strong> (Age: {user.age})
              <br />
              Status: {user.active ? '✅ Active' : '❌ Inactive'}
            </div>
          ))}
        </div>
      </section>

      {/* 3. CONDITIONAL RENDERING */}
      <section style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
        <h2>3. Conditional Rendering</h2>
        
        <button onClick={() => setShowSection(!showSection)}>
          {showSection ? 'Hide' : 'Show'} Section
        </button>
        
        {showSection && (
          <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
            <p>This section is conditionally shown!</p>
            <p>Counter is: {counter}</p>
            {counter > 5 ? (
              <p style={{ color: 'red' }}>Counter is high!</p>
            ) : (
              <p style={{ color: 'green' }}>Counter is low</p>
            )}
          </div>
        )}
      </section>

      {/* 4. INTERACTIVE ELEMENTS */}
      <section style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
        <h2>4. Interactive Elements</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => setCounter(counter + 1)}>
            Increment Counter ({counter})
          </button>
          <button onClick={() => setCounter(0)} style={{ marginLeft: '10px' }}>
            Reset
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text"
            placeholder="Type something..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ padding: '5px', marginRight: '10px' }}
          />
          <span>You typed: "{inputText}"</span>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ padding: '5px' }}
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.name}>
                {user.name} ({user.age} years old)
              </option>
            ))}
          </select>
          {selectedUser && <p>Selected: {selectedUser}</p>}
        </div>

        <button onClick={handleButtonClick} style={{ padding: '10px 20px' }}>
          Show Alert with Current Values
        </button>
      </section>

      {/* 5. STYLING EXAMPLES */}
      <section style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
        <h2>5. Styling (Inline vs Classes)</h2>
        
        <div style={{ 
          backgroundColor: counter % 2 === 0 ? '#e6f3ff' : '#ffe6e6',
          padding: '10px',
          borderRadius: '5px',
          transition: 'background-color 0.3s'
        }}>
          Dynamic background based on counter: {counter % 2 === 0 ? 'Even' : 'Odd'}
        </div>

        <div className="custom-class" style={{ marginTop: '10px' }}>
          This uses className (you'd need CSS for this to work)
        </div>
      </section>

      {/* 6. ADVANCED PATTERNS */}
      <section style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0' }}>
        <h2>6. Advanced Patterns</h2>
        
        <h3>Filter and Map:</h3>
        <div>
          Active users only:
          {users
            .filter(user => user.active)
            .map(user => (
              <span 
                key={user.id} 
                style={{ 
                  backgroundColor: '#d4edda', 
                  padding: '2px 8px', 
                  margin: '2px', 
                  borderRadius: '3px',
                  display: 'inline-block'
                }}
              >
                {user.name}
              </span>
            ))
          }
        </div>

        <h3>Nested Components Pattern:</h3>
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </section>

      {/* 7. DEBUG SECTION */}
      <section style={{ border: '2px solid #ff6b6b', padding: '15px', margin: '10px 0' }}>
        <h2>7. Debug Info (Current State)</h2>
        <pre style={{ backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify({
            counter,
            inputText,
            showSection,
            selectedUser,
            currentTime: getCurrentTime()
          }, null, 2)}
        </pre>
      </section>
    </div>
  );
}

// Separate component (good practice)
function UserCard({ user }: { user: { id: number; name: string; age: number; active: boolean } }) {
  return (
    <div style={{ 
      border: '1px solid #007bff', 
      padding: '8px', 
      margin: '4px 0', 
      borderRadius: '4px' 
    }}>
      <strong>{user.name}</strong> - {user.age} years old
      {user.active && <span style={{ color: 'green' }}> (Active)</span>}
    </div>
  );
}
