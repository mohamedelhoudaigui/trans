
## React Mental Model (for C++ devs)

Think of React components like **C++ classes with automatic re-rendering**:

```jsx
// This is like a class that auto-updates the UI when data changes
function MyComponent() {
  const [count, setCount] = useState(0); // Like a member variable
  
  return <div>{count}</div>; // Like a render() method
}
```

**Key concepts:**
- **State** = member variables that trigger re-renders when changed
- **Props** = function parameters passed from parent components
- **JSX** = HTML-like syntax that compiles to function calls
- **Hooks** = functions that start with `use` (useState, useEffect, etc.)

## Essential Patterns You'll Need

### 1. **State Management** (like managing object state)
```jsx
const [data, setData] = useState(null);    // Like MyClass* data = nullptr;
const [loading, setLoading] = useState(true); // Like bool loading = true;
```

### 2. **API Calls** (similar to your FastAPI client code)
```jsx
useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => console.error(err));
}, []); // Empty array = run once (like constructor)
```

### 3. **Conditional Rendering** (like if statements)
```jsx
return (
  <div>
    {loading ? <div>Loading...</div> : <div>{data}</div>}
    {error && <div>Error: {error}</div>}
  </div>
);
```

## Quick Frontend Stack Overview

Since you're using **Next.js** (I can tell from your original code):
- **Next.js** = React framework (like a web framework for React)
- **Tailwind CSS** = Utility-first CSS (like Bootstrap but more granular)
- **React** = Component library for building UIs

## Practical Debugging Tips

**Coming from C++ debugging, here's what you need:**

1. **Browser DevTools** = your GDB
   - F12 → Console tab (like printf debugging)
   - Network tab (see API calls)
   - React DevTools extension (inspect component state)

2. **Common Debug Patterns:**
```jsx
console.log('Debug:', variable); // Your printf
console.table(arrayData);        // Pretty print arrays/objects
```

## Authentication Pattern (practical)

Since your original code had auth, here's the typical pattern:

```jsx
// Custom hook (like a utility class)
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (hit your FastAPI backend)
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        setUser(user);
        setLoading(false);
      });
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
```

## CSS/Styling Quick Wins

**Tailwind classes you'll use 90% of the time:**
```jsx
<div className="
  flex items-center justify-center  // Flexbox centering
  p-4 m-2                          // Padding/margin
  bg-blue-500 text-white           // Colors
  rounded-lg shadow-lg             // Borders/shadows
  hover:bg-blue-600               // Hover states
">
```

## Form Handling (practical)

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      // Redirect or update state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Your Next Steps (2-day timeline)

1. **Fix your current component** - replace the missing imports with actual implementations
2. **Get authentication working** - connect to your FastAPI backend
3. **Build your core pages** - dashboard, login, register
4. **Copy/paste UI patterns** - don't reinvent, adapt existing components

Need me to help you implement any specific part? I can give you copy-paste ready code for common patterns like login forms, protected routes, or API integration.

What's your immediate blocker right now?
