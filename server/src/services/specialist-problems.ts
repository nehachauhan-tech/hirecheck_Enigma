
export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'Medium' | 'Easy' | 'Hard'; // Handle mismatched cases just in case
  category: string;
  description: string;
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    [key: string]: string | undefined;
  };
  testCases: { input: string; output: string }[];
  solution?: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
}

export const specialistProblems: Problem[] = [
  // --- DEBUGGER MODE PROBLEMS ---
  {
    id: 'debug-react-hook-loop',
    title: 'Infinite Loop in useEffect',
    description: 'This component is crashing the browser with an infinite loop. Fix the effect dependency array and logic to only fetch data once.',
    difficulty: 'Medium',
    category: 'React',
    starterCode: {
      javascript: `import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // BUG: This effect runs infinitely
  useEffect(() => {
    fetch('/api/user/' + userId).then(data => setUser(data));
  }); // <--- Missing dependency array?

  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}`,
      python: `# Not supported for React tasks`,
      java: `// Not supported for React tasks`,
      cpp: `// Not supported for React tasks`
    },
    testCases: [],
    solution: {
      javascript: `useEffect(() => { ... }, [userId]);`
    }
  },
  {
    id: 'debug-node-memory-leak',
    title: 'Event Listener Memory Leak',
    description: 'This Node.js server keeps crashing with OOM errors. Identify and fix the memory leak in the connection handler.',
    difficulty: 'Hard',
    category: 'Node.js',
    starterCode: {
      javascript: `const EventEmitter = require('events');
const myEmitter = new EventEmitter();

function handleConnection(socket) {
  // BUG: Listener added on every connection but never removed
  myEmitter.on('data', (data) => {
    socket.write('Received: ' + data);
  });
}

// Imagine handleConnection is called 1000 times per second`,
      python: `# Node.js specific task`,
      java: `// Node.js specific task`,
      cpp: `// Node.js specific task`
    },
    testCases: [],
    solution: {
      javascript: `myEmitter.once('data', ...)`
    }
  },

  // --- CODE REVIEW MODE PROBLEMS ---
  {
    id: 'review-callback-hell',
    title: 'Refactor Callback Hell',
    description: 'This legacy code uses deep nesting. Refactor it to use modern Async/Await patterns for better readability.',
    difficulty: 'Easy',
    category: 'JavaScript',
    starterCode: {
      javascript: `function getUserData(id, callback) {
  getUser(id, function(err, user) {
    if (err) return callback(err);
    getPosts(user.id, function(err, posts) {
      if (err) return callback(err);
      getComments(posts[0].id, function(err, comments) {
        if (err) return callback(err);
        callback(null, { user, posts, comments });
      });
    });
  });
  });
}`,
      python: `# JavaScript specific task`,
      java: `// JavaScript specific task`,
      cpp: `// JavaScript specific task`
    },
    testCases: [],
    solution: {
      javascript: `async function getUserData(id) { ... }`
    }
  },

  // --- EXPERT / LEGACY SPECIALIST ---
  {
    id: 'react-custom-hook-memory',
    title: 'Memory Leaking Hook',
    difficulty: 'hard',
    category: 'React.js',
    description: `You are debugging a "useInterval" hook that is causing memory leaks in a production dashboard.
  
  The current implementation does not clear the interval when the component unmounts or when the delay changes.
  
  Task:
  1. Fix the memory leak.
  2. Ensure the callback is always fresh (referentially stable) without resetting the interval unnecessarily (hint: useRef).
  3. Handle the edge case where delay is null (to pause execution).`,
    starterCode: {
      javascript: `import { useEffect, useRef } from 'react';

function useInterval(callback, delay) {
// BUG: This implementation detects changes but has a leak
useEffect(() => {
  const id = setInterval(callback, delay);
  return () => {}; // Missing cleanup?
}, [delay]); // Missing callback dependency?
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'react-context-perf',
    title: 'Context Performance Optimization',
    difficulty: 'hard',
    category: 'React.js',
    description: `A large e-commerce app is lagging because the "CartContext" triggers a re-render of the entire App tree on every item add.
  
  Task:
  1. Split the Context into State and Dispatch to prevent unnecessary re-renders.
  2. Memoize the value prop passed to the Provider.
  3. Demonstrate usage of "useReducer" for complex state logic.`,
    starterCode: {
      javascript: `import React, { useState, useContext } from 'react';

const CartContext = React.createContext();

export function CartProvider({ children }) {
const [cart, setCart] = useState([]);

const addItem = (item) => setCart([...cart, item]);

// PROBLEM: This object is recreated on every render
return (
  <CartContext.Provider value={{ cart, addItem }}>
    {children}
  </CartContext.Provider>
);
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'node-stream-processing',
    title: 'Large File Stream Processing',
    difficulty: 'hard',
    category: 'Node.js',
    description: `You need to process a 10GB CSV file of user logs. Loading it into memory will crash the server.
  
  Task:
  1. Use Node.js Streams (fs.createReadStream) to read the file chunk by chunk.
  2. Parse lines manually or using a transform stream.
  3. Count the number of "ERROR" logs.
  4. Handle backpressure correctly.`,
    starterCode: {
      javascript: `const fs = require('fs');

function processLogs(filePath) {
// TODO: Implement stream processing
// const stream = fs.createReadStream(filePath);

}

// Example usage
// processLogs('./huge-log.csv');`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'node-middleware-auth',
    title: 'Secure Auth Middleware',
    difficulty: 'medium',
    category: 'Node.js',
    description: `Write an Express middleware that validates JWTs and handles edge cases securely.
  
  Requirements:
  1. Extract token from "Authorization: Bearer <token>" header.
  2. Verify token using jsonwebtoken.
  3. Attach user payload to req.user.
  4. Handle: Missing header, Malformed header, Expired token, Invalid signature.
  5. Return appropriate 401/403 status codes with JSON error messages.`,
    starterCode: {
      javascript: `const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
// Write your middleware logic

}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'mongo-aggregation-analytics',
    title: 'Sales Analytics Pipeline',
    difficulty: 'hard',
    category: 'MongoDB',
    description: `Construct an Aggregation Pipeline to generate a monthly sales report.
  
  Collection 'orders':
  { _id: 1, date: ISODate("2024-01-15"), amount: 100, status: "completed" }
  
  Task:
  1. Filter only "completed" orders.
  2. Group by Year and Month.
  3. Calculate: Total Revenue, Average Order Value, Count of Orders.
  4. Sort by Date descending.`,
    starterCode: {
      javascript: `const pipeline = [
// Stage 1: Match
{
  
},
// Stage 2: Group
{
  
},
// Stage 3: Sort
{
  
}
];`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'compass-behavioral-intro',
    title: 'Behavioral Strategy & Alignment',
    difficulty: 'medium',
    category: 'Behavioral',
    description: `This is a company-specific behavioral simulation. 
    
    The AI interviewer (Karan) will focus on:
    1. STAR method stories
    2. Leadership principles alignment
    3. Cultural fit and engineering judgment
    
    Prepare to discuss your past projects, conflict resolution, and technical decision-making. No code is required for this specific round.`,
    starterCode: {
      javascript: `// BEHAVIORAL MODE: No code required.
// Use the chat to respond to the interviewer.`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'microsoft-distributed-cache',
    title: 'Distributed Cache Optimization',
    difficulty: 'Hard',
    category: 'System Design',
    description: `Microsoft focus: Identify and fix a 'Cold Start' latency issue in a distributed caching layer.
    
    Task:
    1. Implement a stale-while-revalidate pattern.
    2. Ensure thread-safety (or async concurrency) when multiple requests hit a cold key.
    3. Minimize database load during cache misses.`,
    starterCode: {
      javascript: `async function getCachedValue(key, fetchFromDB) {
  const cached = await cache.get(key);
  if (cached) return cached;

  // PROBLEM: Thundering Herd / Cold Start
  const data = await fetchFromDB(key);
  await cache.set(key, data);
  return data;
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'deloitte-mece-case',
    title: 'Consultative Case: MECE Analysis',
    difficulty: 'Medium',
    category: 'Consulting',
    description: `Deloitte focus: Use the MECE framework to break down a client's "Declining Revenue" problem.
    
    Task:
    1. Break down the problem into Mutually Exclusive and Collectively Exhaustive categories.
    2. Propose a technical solution for each category (e.g., Frontend Optimization, Data Pipeline efficiency).
    3. Defend your logic against Karan's 'Consultant' persona.`,
    starterCode: {
      javascript: `// This is a structured logic exercise.
// Outline your MECE categories in the chat.`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'swiggy-vanilla-nested-comments',
    title: 'Machine Coding: Nested Comments',
    difficulty: 'Hard',
    category: 'Vanilla JS',
    description: `Swiggy Focus: Build a recursive, infinitely nested comments system without using any frameworks (Vanilla JS).
    
    Task:
    1. Render a list of comments from a JSON-like object.
    2. Implement "Reply", "Delete", and "Like" functionality.
    3. Ensure state is updated correctly without a full page reload.
    4. Focus on DOM efficiency and closure management.`,
    starterCode: {
      javascript: `// Initialize the comments app
const commentsData = [
  { id: 1, text: "Hello!", replies: [] }
];

function renderComments(container, data) {
  // Implement recursive rendering logic
}

renderComments(document.getElementById('comments-root'), commentsData);`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'zomato-rag-optimization',
    title: 'AI Engineering: RAG Context Optimizer',
    difficulty: 'Hard',
    category: 'MERN + AI',
    description: `Zomato Focus: Optimize a Retrieval-Augmented Generation (RAG) flow in a MERN stack.
    
    Task:
    1. Implement a function to select 'minimum viable context' for an LLM prompt.
    2. Manage token costs by pruning least relevant embeddings.
    3. Handle the fallback when the vector database latency exceeds 500ms.`,
    starterCode: {
      javascript: `async function generateAIResponse(userQuery) {
  const embeddings = await vectorDB.search(userQuery);
  
  // TODO: Implement 'Minimum Viable Context' logic
  // to stay within token limits and reduce latency.
  const optimizedContext = embeddings.slice(0, 5); 
  
  return await llm.complete(optimizedContext + userQuery);
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'razorpay-idempotency-key',
    title: 'Fintech: API Idempotency Logic',
    difficulty: 'Hard',
    category: 'Node.js',
    description: `Razorpay Focus: Implement a robust idempotency-key check for a billing API.
    
    Task:
    1. Validate the 'X-Idempotency-Key' from headers.
    2. Use Redis to cache the initial response and return it for duplicate requests.
    3. Ensure 'Transactional Integrity'—avoid double-billing even if the first request is still processing.`,
    starterCode: {
      javascript: `async function processPayment(req, res) {
  const key = req.headers['x-idempotency-key'];
  
  // TODO: Check Redis, handle "In-Progress" locking, 
  // and return cached responses correctly.
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'react19-rsc-boundary',
    title: 'React 19: RSC Boundary Fix',
    difficulty: 'Hard',
    category: 'React 19',
    description: `Fix a boundary violation where a Client Component is trying to import a Server-only module, or vice-versa.
    
    Task:
    1. Identify the 'use client' vs 'use server' mismatch.
    2. Refactor the data fetching to happen on the server.
    3. Pass only serializable data to the client component.`,
    starterCode: {
      javascript: `// Component A (Server)
import ClientButton from './ClientButton';
import { db } from './server-only-db';

export default async function Page() {
  const data = await db.raw(); // Non-serializable?
  return <ClientButton data={data} />;
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'node-backpressure-handler',
    title: 'Node.js: Stream Backpressure',
    difficulty: 'Hard',
    category: 'Node.js',
    description: `Handle backpressure in a custom Node.js stream pipeline to prevent memory overflow (OOM).
    
    Task:
    1. Monitor the 'drain' event.
    2. Pause the reader when the writable buffer is full.
    3. Resume when it's safe.`,
    starterCode: {
      javascript: `const reader = getLargeStream();
const writer = getSlowWriter();

reader.on('data', (chunk) => {
  // BUG: Not checking return value of write()
  writer.write(chunk);
});`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'faang-retry-storm-diag',
    title: 'Scenario: The Retry Storm',
    difficulty: 'Hard',
    category: 'System Design / SRE',
    description: `A downstream service is down, and your service is experience a CPU spike due to a 'Retry Storm'.
    
    Task:
    1. Diagnose why exponential backoff failed.
    2. Implement 'Jitter' to avoid synchronized retry waves.
    3. Propose a 'Circuit Breaker' state machine.`,
    starterCode: {
      javascript: `async function fetchWithRetry(url) {
  for(let i=0; i<3; i++) {
    try {
      return await fetch(url);
    } catch(e) {
      await sleep(Math.pow(2, i) * 1000); // Missing jitter?
    }
  }
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'google-lru-ttl',
    title: 'System Design: LRU Cache with TTL',
    difficulty: 'Hard',
    category: 'System Design / Logic',
    description: `Google Focus: Design a Least Recently Used (LRU) Cache that also supports Time-to-Live (TTL) for each entry.
    
    Task:
    1. Implement get(key) and put(key, value, ttl).
    2. Ensure get and put are O(1) average time complexity.
    3. Entries must be automatically or lazily removed after TTL expires.
    4. Focus on memory efficiency and concurrency safety.`,
    starterCode: {
      javascript: `class LRUCacheTTL {
  constructor(capacity) {
    this.capacity = capacity;
    // TODO: Initialize data structures
  }

  get(key) {
    // Implement O(1) retrieval with TTL check
  }

  put(key, value, ttl) {
    // Implement O(1) insertion with LRU eviction and TTL
  }
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'meta-feed-rendering',
    title: 'React Performance: Virtualized Feed',
    difficulty: 'Hard',
    category: 'React.js',
    description: `Meta Focus: Optimize a "News Feed" component that renders 10,000+ items.
    
    Task:
    1. Implement a virtualization window (only render items in viewport).
    2. Handle variable height items without layout thrashing.
    3. Optimize for "Infinite Scroll" with rapid scrolling (use IntersectionObserver or scroll-position logic).
    4. Minimize JS thread blockage during high-speed scrolls.`,
    starterCode: {
      javascript: `import React, { useState, useEffect, useRef } from 'react';

function NewsFeed({ items }) {
  const [visibleIndices, setVisibleIndices] = useState([0, 20]);
  
  // TODO: Implement windowing logic to only render 
  // items that are near the viewport.
  
  return (
    <div className="feed-container">
      {items.slice(visibleIndices[0], visibleIndices[1]).map(item => (
        <FeedItem key={item.id} data={item} />
      ))}
    </div>
  );
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  },
  {
    id: 'netflix-circuit-breaker',
    title: 'Resilience: Hystrix-style Circuit Breaker',
    difficulty: 'Hard',
    category: 'Node.js',
    description: `Netflix Focus: Implement a Circuit Breaker pattern to protect a service from cascading failures.
    
    Task:
    1. Implement three states: CLOSED, OPEN, HALF_OPEN.
    2. Track failure thresholds and timeout periods.
    3. Automatically transition between states based on real-time success/failure rates.
    4. Provide a 'fallback' mechanism for when the circuit is OPEN.`,
    starterCode: {
      javascript: `class CircuitBreaker {
  constructor(request, options = {}) {
    this.request = request;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.threshold = options.threshold || 5;
  }

  async execute(...args) {
    // TODO: Implement state-machine logic
  }
}`,
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  }
];
