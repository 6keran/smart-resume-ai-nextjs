var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/empty.js
var require_empty = __commonJS({
  "scripts/empty.js"(exports, module) {
    "use strict";
    module.exports = {};
  }
});

// src/server/db/adapter.ts
var adapter_exports = {};
__export(adapter_exports, {
  getDb: () => getDb,
  toPostgresSql: () => toPostgresSql
});
import path from "node:path";
import fs from "node:fs";
import dns from "node:dns";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";
function toPostgresSql(sql) {
  let i = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let output = "";
  for (let idx = 0; idx < sql.length; idx++) {
    const char = sql[idx];
    if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote && sql[idx + 1] === "'") {
        output += "''";
        idx++;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      output += char;
    } else if (char === '"' && !inSingleQuote) {
      if (inDoubleQuote && sql[idx + 1] === '"') {
        output += '""';
        idx++;
        continue;
      }
      inDoubleQuote = !inDoubleQuote;
      output += char;
    } else if (char === "?" && !inSingleQuote && !inDoubleQuote) {
      output += `$${i++}`;
    } else {
      output += char;
    }
  }
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(output)) {
    output = output.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, "INSERT INTO");
    if (!/ON\s+CONFLICT/i.test(output)) {
      output += " ON CONFLICT DO NOTHING";
    }
  }
  output = output.replace(/ROUND\(\s*AVG\(([^)]+)\)\s*,\s*(\d+)\s*\)/gi, "ROUND(CAST(AVG($1) AS numeric), $2)");
  return output;
}
function getDb() {
  if (dbClientInstance) {
    return dbClientInstance;
  }
  const postgresUrl = (process.env.POSTGRES_URL || process.env.DATABASE_URL || "").trim();
  const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (postgresUrl) {
    if (!postgresPoolInstance) {
      postgresPoolInstance = new Pool({
        connectionString: postgresUrl,
        max: 10,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 1e4,
        ssl: postgresUrl.includes("localhost") || postgresUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
      });
      postgresPoolInstance.on("error", (err) => {
        console.error("[Smart Resume AI] PostgreSQL Pool error:", err.message);
      });
    }
    const pool = postgresPoolInstance;
    dbClientInstance = {
      isPostgres: true,
      async exec(sql) {
        if (/^\s*PRAGMA/i.test(sql)) {
          return;
        }
        await pool.query(toPostgresSql(sql));
      },
      prepare(sql) {
        if (/^\s*PRAGMA/i.test(sql)) {
          return {
            get: async () => void 0,
            all: async () => [],
            run: async () => ({ changes: 0 })
          };
        }
        const pgSql = toPostgresSql(sql);
        return {
          async get(...params) {
            const res = await pool.query(pgSql, params);
            return res.rows[0] ?? void 0;
          },
          async all(...params) {
            const res = await pool.query(pgSql, params);
            return res.rows;
          },
          async run(...params) {
            const res = await pool.query(pgSql, params);
            return {
              changes: res.rowCount ?? 0,
              lastInsertRowid: 0
            };
          }
        };
      },
      async close() {
        if (postgresPoolInstance) {
          await postgresPoolInstance.end();
          postgresPoolInstance = null;
        }
      }
    };
    return dbClientInstance;
  }
  if (isVercel) {
    const errorMsg = "[Smart Resume AI] Production Database Error: Running in serverless/Vercel environment without a persistent database configured. Please configure POSTGRES_URL or DATABASE_URL in Vercel Project Environment Variables.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[Smart Resume AI] Could not create local data directory:", err?.message);
  }
  const sqliteDb = new DatabaseSync(DB_PATH);
  try {
    sqliteDb.exec("PRAGMA journal_mode = WAL;");
    sqliteDb.exec("PRAGMA foreign_keys = ON;");
  } catch (err) {
    console.warn("[Smart Resume AI] PRAGMA initialization notice:", err?.message);
  }
  dbClientInstance = {
    isPostgres: false,
    exec(sql) {
      sqliteDb.exec(sql);
    },
    prepare(sql) {
      const stmt = sqliteDb.prepare(sql);
      return {
        get(...params) {
          return stmt.get(...params);
        },
        all(...params) {
          return stmt.all(...params);
        },
        run(...params) {
          return stmt.run(...params);
        }
      };
    },
    close() {
      try {
        sqliteDb.close();
      } catch {
      }
    }
  };
  return dbClientInstance;
}
var import_server_only, Pool, types, dbClientInstance, postgresPoolInstance, DB_DIR, DB_PATH;
var init_adapter = __esm({
  "src/server/db/adapter.ts"() {
    "use strict";
    import_server_only = __toESM(require_empty());
    try {
      dns.setDefaultResultOrder?.("ipv4first");
    } catch {
    }
    ({ Pool, types } = pg);
    types.setTypeParser(20, (val) => parseInt(val, 10));
    dbClientInstance = null;
    postgresPoolInstance = null;
    DB_DIR = path.join(process.cwd(), "data");
    DB_PATH = path.join(DB_DIR, "smart_resume.db");
  }
});

// src/server/db/seedQuestions.ts
var SEED_SKILLS, INITIAL_ASSESSMENT_QUESTIONS;
var init_seedQuestions = __esm({
  "src/server/db/seedQuestions.ts"() {
    "use strict";
    SEED_SKILLS = [
      { name: "Python", category: "Programming", description: "Core Python, data structures, OOP, list comprehensions, generators, and standard library." },
      { name: "React", category: "Frontend", description: "Component lifecycle, hooks (useState, useEffect, useMemo), virtual DOM, and modern React patterns." },
      { name: "SQL", category: "Database", description: "Relational querying, JOINs, indexing, grouping, aggregations, subqueries, and transactions." },
      { name: "JavaScript", category: "Programming", description: "Event loop, closures, promises, async/await, prototypes, and ES6+ syntax." },
      { name: "TypeScript", category: "Programming", description: "Static typing, generics, interfaces, union types, utility types, and type narrowing." },
      { name: "AWS", category: "Cloud & DevOps", description: "EC2, S3, IAM roles, Lambda serverless, VPC networking, CloudFront, and RDS." },
      { name: "Git", category: "Cloud & DevOps", description: "Branching, rebasing, merge conflicts, commits, staging area, stashes, and cherry-picking." },
      { name: "Machine Learning", category: "AI / Data", description: "Supervised vs unsupervised learning, loss functions, overfitting, regularization, evaluation metrics." },
      { name: "Java", category: "Programming", description: "JVM architecture, memory management, OOP, multithreading, and Java Collections Framework." },
      { name: "C++", category: "Programming", description: "Memory management, pointers, RAII, templates, STL containers, and virtual functions." },
      { name: "C#", category: "Programming", description: ".NET runtime, LINQ, async/await, memory allocation, interfaces, and dependency injection." },
      { name: "Data Analysis", category: "AI / Data", description: "Pandas, NumPy, data cleaning, exploratory data analysis, statistics, and visualization." }
    ];
    INITIAL_ASSESSMENT_QUESTIONS = [
      // --- PYTHON ---
      {
        skill: "Python",
        question_text: "What is the output of `bool([])` and `bool([0])` in Python?",
        question_type: "Code Output",
        difficulty: "Easy",
        options: ["False, False", "False, True", "True, False", "True, True"],
        correct_answer_index: 1,
        explanation: "An empty list `[]` evaluates to False in a boolean context, whereas a non-empty list `[0]` evaluates to True regardless of the elements it contains.",
        topic: "Types & Truthiness"
      },
      {
        skill: "Python",
        question_text: "What is the key difference between a Python tuple and a list?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Tuples are mutable; lists are immutable",
          "Tuples are immutable; lists are mutable",
          "Lists can only store numbers, while tuples store any type",
          "Tuples execute in O(n^2) time while lists execute in O(1)"
        ],
        correct_answer_index: 1,
        explanation: "Tuples are immutable sequences whose contents cannot be altered once created, whereas lists are mutable arrays that support item assignment and modification.",
        topic: "Data Structures"
      },
      {
        skill: "Python",
        question_text: "What does the `yield` statement do in a Python function?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Terminates function execution and clears local variable memory immediately",
          "Converts the function into a generator, pausing execution and returning a value",
          "Throws an unhandled GeneratorExit exception to the caller",
          "Spawns a new background thread in the operating system kernel"
        ],
        correct_answer_index: 1,
        explanation: "`yield` turns a regular function into a generator iterator. When reached, execution pauses, yielding the value, and can be resumed upon the next `next()` invocation.",
        topic: "Generators & Iterators"
      },
      {
        skill: "Python",
        question_text: "In Python, what is the purpose of the `__init__` method in a class definition?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "It destroys the class instance when garbage collection runs",
          "It serves as the constructor to initialize newly created object state",
          "It registers the class into global module namespace as a singleton",
          "It compiles Python bytecode into machine instructions"
        ],
        correct_answer_index: 1,
        explanation: "`__init__` is Python\u2019s initializer method called automatically immediately after a new instance has been allocated by `__new__`.",
        topic: "Object-Oriented Programming"
      },
      {
        skill: "Python",
        question_text: "What is the Global Interpreter Lock (GIL) in CPython?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "A hardware lock that locks access to disk storage",
          "A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecode simultaneously",
          "A security sandbox that disables network requests in untrusted code",
          "A compiler optimization flag that inlines mathematical operations"
        ],
        correct_answer_index: 1,
        explanation: "The GIL is a mutex used by CPython to ensure only one thread executes Python bytecode at any given moment, simplifying memory management.",
        topic: "Concurrency & Internal Architecture"
      },
      {
        skill: "Python",
        question_text: "What will be the output of `[x * 2 for x in range(5) if x % 2 == 0]`?",
        question_type: "Code Output",
        difficulty: "Easy",
        options: ["[0, 4, 8]", "[0, 2, 4]", "[2, 6, 10]", "[0, 1, 2, 3, 4]"],
        correct_answer_index: 0,
        explanation: "Even numbers in range(5) are 0, 2, 4. Multiplying each by 2 yields [0, 4, 8].",
        topic: "List Comprehensions"
      },
      {
        skill: "Python",
        question_text: "Which built-in Python module is used to measure execution time of small code snippets?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: ["datetime", "timeit", "benchmark", "sys.timer"],
        correct_answer_index: 1,
        explanation: "The `timeit` module provides a simple way to time small bits of Python code while avoiding common traps in timing execution.",
        topic: "Performance & Profiling"
      },
      {
        skill: "Python",
        question_text: "What happens when a default mutable argument like `def append_to(val, target=[])` is modified inside the function?",
        question_type: "Debugging",
        difficulty: "Medium",
        options: [
          "A new list is created every time the function is called",
          "The same list is reused across subsequent function invocations",
          "Python throws a TypeError on the second call",
          "The function raises an UnboundLocalError exception"
        ],
        correct_answer_index: 1,
        explanation: "Default parameter values are evaluated once at function definition time, so mutable objects like lists or dicts persist across multiple invocations.",
        topic: "Function Scope & Parameters"
      },
      {
        skill: "Python",
        question_text: "What is the time complexity of looking up a key in a Python dictionary on average?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correct_answer_index: 0,
        explanation: "Python dictionaries are implemented as hash tables, providing O(1) average-time complexity for lookups, insertions, and deletions.",
        topic: "Algorithms & Complexity"
      },
      {
        skill: "Python",
        question_text: "What does the `@property` decorator achieve in Python classes?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Converts an instance method into a read-only getter attribute",
          "Locks the class from being subclassed by external modules",
          "Converts the method into a static utility function",
          "Forces the method to execute asynchronously on an event loop"
        ],
        correct_answer_index: 0,
        explanation: "The `@property` decorator allows a method to be accessed like an attribute without explicit parentheses while encapsulating getter logic.",
        topic: "Object-Oriented Programming"
      },
      {
        skill: "Python",
        question_text: "How does Python handle memory management and garbage collection?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "Manual allocation and deallocation via malloc and free",
          "Reference counting supplemented by a cyclic garbage collector",
          "Deterministic mark-and-sweep triggered every 60 seconds",
          "Operating system kernel-level paging only"
        ],
        correct_answer_index: 1,
        explanation: "CPython relies primarily on reference counting for immediate reclamation, complemented by a generational cyclic garbage collector for cyclic references.",
        topic: "Memory Management"
      },
      {
        skill: "Python",
        question_text: "Which statement correctly handles context management for file operations?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          'using open("file.txt") as f:',
          'with open("file.txt") as f:',
          'try open("file.txt") into f:',
          'catch open("file.txt") as f:'
        ],
        correct_answer_index: 1,
        explanation: "The `with` statement leverages the context management protocol (`__enter__` and `__exit__`), ensuring files are closed even if exceptions occur.",
        topic: "File I/O & Context Managers"
      },
      // --- REACT ---
      {
        skill: "React",
        question_text: "What is the primary purpose of the `useEffect` hook in functional React components?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Directly mutating component DOM elements before reconciliation",
          "Executing side effects such as data fetching, subscriptions, or manual DOM interactions",
          "Defining global Redux store reducers inside component scope",
          "Preventing the component from ever re-rendering"
        ],
        correct_answer_index: 1,
        explanation: "`useEffect` lets you synchronize a component with external systems and execute side effects like data fetching and event listeners after rendering.",
        topic: "Hooks"
      },
      {
        skill: "React",
        question_text: "Why should you NOT update state directly using `state.count = 5` in React?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Direct mutation does not trigger a re-render because React relies on state setter calls for reconciliation",
          "JavaScript throws a syntax error when assigning to object properties in JSX",
          "State is automatically wiped from memory if mutated directly",
          "Direct mutation immediately crashes the browser process"
        ],
        correct_answer_index: 0,
        explanation: "React compares state references to detect changes. Direct mutations bypass the setState mechanism and fail to trigger re-renders.",
        topic: "State Management"
      },
      {
        skill: "React",
        question_text: "What is the significance of the `key` prop when rendering dynamic lists in React?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "It encrypts child component props over HTTPS",
          "It helps React identify which items have changed, been added, or been removed during reconciliation",
          "It dictates the z-index CSS layer of the rendered DOM node",
          "It forces every list item to re-render on every state change"
        ],
        correct_answer_index: 1,
        explanation: "Unique and stable keys allow React\u2019s reconciliation algorithm to distinguish elements between renders, minimizing DOM modifications.",
        topic: "Reconciliation & Virtual DOM"
      },
      {
        skill: "React",
        question_text: "What does the `useMemo` hook return in React?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "A memoized callback function reference",
          "A memoized calculated value that is only recomputed when dependencies change",
          "A mutable ref object with a `.current` property",
          "A new React DOM portal container"
        ],
        correct_answer_index: 1,
        explanation: "`useMemo` caches the result of a calculation between renders, recalculating only when one of its specified dependencies changes.",
        topic: "Optimization & Performance"
      },
      {
        skill: "React",
        question_text: "What problem does `useCallback` solve compared to standard function declarations inside components?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "It runs functions inside a separate Web Worker thread",
          "It caches a function instance across renders to prevent unnecessary re-renders of memoized child components",
          "It binds `this` permanently to the window object",
          "It automatically cancels long-running HTTP network requests"
        ],
        correct_answer_index: 1,
        explanation: "In JavaScript, functions have new identity on every render. `useCallback` returns a memoized version that preserves identity between renders unless dependencies change.",
        topic: "Hooks & Optimization"
      },
      {
        skill: "React",
        question_text: "How does React Virtual DOM differ from the real browser DOM?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "The Virtual DOM is rendered using WebGL in the GPU",
          "The Virtual DOM is a lightweight in-memory JavaScript representation of the actual DOM",
          "The Virtual DOM only works in React Native mobile apps",
          "The Virtual DOM replaces HTML completely with binary web assembly"
        ],
        correct_answer_index: 1,
        explanation: "The Virtual DOM is an in-memory tree of JavaScript objects. React updates this tree, diffs it against previous state, and batches minimal real DOM updates.",
        topic: "Virtual DOM & Architecture"
      },
      {
        skill: "React",
        question_text: "What happens when you return a cleanup function from `useEffect`?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "The cleanup function is called before the component unmounts and before re-running the effect on dependency change",
          "The cleanup function deletes all component state from localStorage",
          "The cleanup function executes once when the page reloads",
          "The cleanup function cancels all pending browser promises"
        ],
        correct_answer_index: 0,
        explanation: "React invokes the returned cleanup function when the component unmounts and prior to executing the effect again when dependencies change.",
        topic: "Hooks Lifecycle"
      },
      {
        skill: "React",
        question_text: "In React 18 and 19, what is the purpose of `useTransition`?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "Creating CSS keyframe transitions for modal animations",
          "Marking state updates as non-urgent transitions to keep the UI responsive during expensive renders",
          "Migrating Redux stores to Zustand stores automatically",
          "Handling server HTTP redirects inside client layouts"
        ],
        correct_answer_index: 1,
        explanation: "`useTransition` allows developers to prioritize urgent updates (like typing in an input) while deferring non-urgent transitions (like rendering a large list).",
        topic: "Concurrent Features"
      },
      {
        skill: "React",
        question_text: "What is a key rule regarding React Hooks calling conventions?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Hooks can be called inside loops and conditional if statements",
          "Hooks must only be called at the top level of React function components or custom hooks",
          "Hooks can only be called from inside class component `render` methods",
          "Hooks must be registered inside `package.json` before use"
        ],
        correct_answer_index: 1,
        explanation: "Hooks must be called unconditionally at the top level of React functional components or custom hooks to ensure order of execution is preserved.",
        topic: "Rules of Hooks"
      },
      {
        skill: "React",
        question_text: "What is the primary use case of `useRef` besides accessing DOM nodes?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Triggering component re-renders without altering visual output",
          "Storing a mutable value that persists across renders without causing a re-render when updated",
          "Creating encrypted cookies on the client side",
          "Handling URL query string parameters in Next.js"
        ],
        correct_answer_index: 1,
        explanation: "`useRef` returns a mutable object whose `.current` property persists for the full lifetime of the component without triggering a re-render upon mutation.",
        topic: "Hooks & State"
      },
      {
        skill: "React",
        question_text: "What is prop drilling and how is it commonly resolved in large React applications?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "A technique to bundle CSS modules; resolved using Webpack loaders",
          "Passing props through multiple intermediate components that do not need them; resolved with Context API or state management libraries",
          "Overriding browser HTTP headers; resolved with service workers",
          "Writing unit tests with Jest; resolved by mocking props"
        ],
        correct_answer_index: 1,
        explanation: "Prop drilling occurs when data is threaded through intermediate components solely to reach a deeply nested child; Context or state stores solve this.",
        topic: "Component Architecture"
      },
      // --- SQL ---
      {
        skill: "SQL",
        question_text: "What is the difference between `INNER JOIN` and `LEFT JOIN` in SQL?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "INNER JOIN returns all rows from the right table; LEFT JOIN returns all rows from both tables",
          "INNER JOIN returns only rows with matches in both tables; LEFT JOIN returns all rows from left table plus matching rows from right",
          "LEFT JOIN deletes non-matching rows from disk permanently",
          "INNER JOIN creates a duplicate copy of the primary key index"
        ],
        correct_answer_index: 1,
        explanation: "INNER JOIN selects records that have matching values in both tables. LEFT JOIN returns all records from the left table and matched records from the right table (NULL if no match).",
        topic: "Joins"
      },
      {
        skill: "SQL",
        question_text: "What clause is used to filter the results of an aggregate function like `COUNT()` or `AVG()`?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["WHERE", "HAVING", "ORDER BY", "GROUP FILTER"],
        correct_answer_index: 1,
        explanation: "`WHERE` filters individual rows before aggregation occurs, while `HAVING` filters aggregated summary groups created by `GROUP BY`.",
        topic: "Aggregation & Filtering"
      },
      {
        skill: "SQL",
        question_text: "In database management, what does the ACID acronym stand for?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Atomicity, Consistency, Isolation, Durability",
          "Accuracy, Concurrency, Indexing, Decoupling",
          "Allocation, Clustering, Integrity, Distribution",
          "Authentication, Cryptography, Identity, Delegation"
        ],
        correct_answer_index: 0,
        explanation: "ACID properties guarantee database transactions are processed reliably: Atomicity (all or nothing), Consistency (valid states), Isolation (concurrent execution), Durability (persisted).",
        topic: "Transactions & Theory"
      },
      {
        skill: "SQL",
        question_text: "What is the primary benefit of creating an index on a database table column?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "It encrypts column data so unauthorized users cannot read it",
          "It speeds up data retrieval (`SELECT` queries with `WHERE` clauses) at the cost of additional storage and slower writes",
          "It automatically formats strings into uppercase",
          "It removes duplicate records automatically from tables"
        ],
        correct_answer_index: 1,
        explanation: "Indexes (like B-Tree indexes) enable rapid lookup without scanning every row in a table, improving read speed while adding overhead to INSERT, UPDATE, and DELETE.",
        topic: "Indexing & Performance"
      },
      {
        skill: "SQL",
        question_text: "What is the difference between `DELETE` and `TRUNCATE` in SQL?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "DELETE is DDL while TRUNCATE is DML",
          "DELETE removes rows one by one and logs each row deletion; TRUNCATE deallocates data pages, is faster, and cannot filter with WHERE",
          "TRUNCATE deletes the table schema definition itself from the catalog",
          "DELETE only works on view tables"
        ],
        correct_answer_index: 1,
        explanation: "`DELETE` is a DML statement that removes rows conditionally and records deletions in transaction logs. `TRUNCATE` is a faster DDL operation that resets the table by deallocating pages.",
        topic: "Data Manipulation"
      },
      {
        skill: "SQL",
        question_text: "What does the `COALESCE(val1, val2, ...)` function do in standard SQL?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Returns the sum of all non-null values",
          "Returns the first non-null expression among its arguments",
          "Converts strings into lowercase timestamps",
          "Forces a transaction commit immediately"
        ],
        correct_answer_index: 1,
        explanation: "`COALESCE` evaluates its arguments in order and returns the first non-null value encountered, useful for providing fallbacks for NULL fields.",
        topic: "Built-in Functions"
      },
      {
        skill: "SQL",
        question_text: "What is a SQL Injection vulnerability and how is it best prevented?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Corrupting disk storage; prevented by installing SSDs",
          "Attackers altering query structure via untrusted input; prevented by parameterized queries / prepared statements",
          "Memory leak in PostgreSQL server; prevented by restarting daily",
          "Syntax error in stored procedures; prevented by linting"
        ],
        correct_answer_index: 1,
        explanation: "SQL injection occurs when user input is concatenated directly into query strings. Parameterized queries / prepared statements treat parameters as literal data, eliminating injection.",
        topic: "Security & Best Practices"
      },
      {
        skill: "SQL",
        question_text: "What is a Common Table Expression (CTE) in SQL?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "A permanent table stored in system catalog",
          "A temporary named result set defined using the `WITH` clause that can be referenced within a single query execution",
          "An encrypted database trigger",
          "A network protocol for PostgreSQL remote connections"
        ],
        correct_answer_index: 1,
        explanation: "A CTE is specified with `WITH` and creates a named temporary result set available during execution of a `SELECT`, `INSERT`, `UPDATE`, or `DELETE`.",
        topic: "Advanced Querying"
      },
      {
        skill: "SQL",
        question_text: "Which SQL constraint guarantees that all values in a column are distinct across the table?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["NOT NULL", "UNIQUE", "CHECK", "FOREIGN KEY"],
        correct_answer_index: 1,
        explanation: "The `UNIQUE` constraint ensures that all values in a column or set of columns are different, preventing duplicates.",
        topic: "Constraints & Schemas"
      },
      {
        skill: "SQL",
        question_text: "What is a database transaction rollback?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Reverting all changes made within an uncommitted transaction back to the initial state",
          "Restoring the database from a tape backup tape archive",
          "Deleting the oldest rows when disk space drops below 10%",
          "Compacting indexes after bulk inserts"
        ],
        correct_answer_index: 0,
        explanation: "A `ROLLBACK` cancels and undoes all modifications performed in the current uncommitted transaction, preserving data integrity.",
        topic: "Transactions"
      },
      // --- TYPESCRIPT ---
      {
        skill: "TypeScript",
        question_text: "What is the difference between `interface` and `type` alias in TypeScript?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Interfaces can only declare primitive strings; types can declare objects",
          "Interfaces support declaration merging (extending across multiple definitions); type aliases cannot be merged once defined",
          "Types compile to JavaScript functions; interfaces are erased",
          "Interfaces only work inside Node.js while types work in browsers"
        ],
        correct_answer_index: 1,
        explanation: "Interfaces support declaration merging, making them ideal for public APIs and libraries, whereas type aliases cannot be re-opened for merging.",
        topic: "Type System Fundamentals"
      },
      {
        skill: "TypeScript",
        question_text: "What does the `unknown` type represent in TypeScript compared to `any`?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "unknown is identical to any in every aspect",
          "unknown is a type-safe counterpart of any; you cannot access properties or methods on it without type narrowing/checking first",
          "unknown disables all TypeScript compile-time checking completely",
          "unknown represents a value that is always undefined"
        ],
        correct_answer_index: 1,
        explanation: "`unknown` represents any value, but unlike `any`, TypeScript prevents you from calling methods or accessing properties on it until you narrow its type.",
        topic: "Type Safety & Narrowing"
      },
      {
        skill: "TypeScript",
        question_text: "What does the utility type `Partial<T>` do in TypeScript?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Removes all properties from T",
          "Constructs a type with all properties of T set to optional (`?`)",
          "Makes all properties of T read-only",
          "Converts all properties of T into strings"
        ],
        correct_answer_index: 1,
        explanation: "`Partial<T>` maps over all properties in `T` and marks each property as optional.",
        topic: "Utility Types"
      },
      {
        skill: "TypeScript",
        question_text: "What is a type predicate in TypeScript?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "A function return type of the form `parameter is Type` that instructs the compiler to narrow the argument type when returning true",
          "A comment that disables compiler type errors",
          "A regular expression used to validate JSON schemas",
          "A compiler flag that enables strict null checks"
        ],
        correct_answer_index: 0,
        explanation: "A user-defined type guard uses a type predicate return signature `param is Type` to tell the TypeScript compiler that the argument is of that type whenever the function returns true.",
        topic: "Advanced Type Guards"
      },
      {
        skill: "TypeScript",
        question_text: "What does the `keyof` operator produce when applied to an object type?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "An array of runtime object keys",
          "A union type of all string or numeric property names of that type",
          "A boolean indicating if the object has keys",
          "The number of properties declared on the interface"
        ],
        correct_answer_index: 1,
        explanation: "The `keyof` operator takes an object type and produces a string or numeric literal union of its keys.",
        topic: "Type Operators"
      },
      {
        skill: "TypeScript",
        question_text: "What does the `readonly` modifier enforce on an array type `readonly number[]`?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "The array can never be read by other functions",
          "Methods that mutate the array (like push, pop, splice) are forbidden at compile-time",
          "The array is automatically allocated in ROM memory",
          "The array length must always equal zero"
        ],
        correct_answer_index: 1,
        explanation: "`readonly T[]` creates an array whose mutating methods (`push`, `pop`, `splice`, index assignment) are disallowed by the compiler.",
        topic: "Immutability"
      },
      // --- AWS ---
      {
        skill: "AWS",
        question_text: "What AWS service provides resizable, scalable virtual server compute instances in the cloud?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["Amazon S3", "Amazon EC2", "Amazon SQS", "Amazon DynamoDB"],
        correct_answer_index: 1,
        explanation: "Amazon Elastic Compute Cloud (EC2) provides secure and resizable virtual servers to run applications on AWS cloud infrastructure.",
        topic: "Compute"
      },
      {
        skill: "AWS",
        question_text: "What is Amazon S3 primarily designed for?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Running relational SQL database servers",
          "Highly durable, scalable object storage for files, media, and backups",
          "Hosting real-time WebSocket game servers",
          "Hardware firewalls for on-premise networks"
        ],
        correct_answer_index: 1,
        explanation: "Amazon Simple Storage Service (S3) is an object storage service offering 99.999999999% (11 9s) of data durability for unstructured data.",
        topic: "Storage"
      },
      {
        skill: "AWS",
        question_text: "What is the execution model of AWS Lambda?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Dedicated bare-metal servers billed 24/7 on an annual contract",
          "Event-driven serverless compute that executes code in response to events and scales automatically without provisioning servers",
          "A container orchestration tool like Kubernetes",
          "A physical router installed in an AWS Direct Connect location"
        ],
        correct_answer_index: 1,
        explanation: "AWS Lambda is a serverless compute service that runs code in response to triggers (HTTP requests, S3 uploads, DynamoDB streams) and bills strictly for compute time consumed.",
        topic: "Serverless"
      },
      {
        skill: "AWS",
        question_text: "In AWS Identity and Access Management (IAM), what is the principle of least privilege?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Granting full AdministratorAccess to all developers to minimize ticket delays",
          "Granting users and services only the minimum permissions required to perform their specific tasks",
          "Never using passwords on AWS accounts",
          "Storing IAM root credentials in public GitHub repositories"
        ],
        correct_answer_index: 1,
        explanation: "Least privilege is a fundamental security practice where users and services are granted only the minimum permissions necessary to accomplish their assigned work.",
        topic: "Security & IAM"
      },
      {
        skill: "AWS",
        question_text: "What AWS service acts as a global Content Delivery Network (CDN) to deliver content with low latency?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["Amazon CloudWatch", "Amazon CloudFront", "Amazon Route 53", "AWS Shield"],
        correct_answer_index: 1,
        explanation: "Amazon CloudFront is a fast content delivery network (CDN) service that securely delivers data, videos, applications, and APIs to customers globally with low latency.",
        topic: "Networking & Content Delivery"
      },
      // --- GIT ---
      {
        skill: "Git",
        question_text: "What is the command to create and immediately switch to a new branch named `feature/auth`?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "git branch feature/auth",
          "git checkout -b feature/auth (or git switch -c feature/auth)",
          "git merge feature/auth",
          "git commit -b feature/auth"
        ],
        correct_answer_index: 1,
        explanation: "`git checkout -b <branch>` or the modern `git switch -c <branch>` creates a new branch pointing to HEAD and switches to it in one command.",
        topic: "Branching"
      },
      {
        skill: "Git",
        question_text: "What is the difference between `git merge` and `git rebase`?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Merge permanently deletes commits; rebase encrypts them",
          "Merge creates a merge commit preserving historical branches; rebase replays commits on top of another branch creating a linear history",
          "Rebase only works on remote repositories",
          "Merge cannot handle conflicts while rebase resolves all conflicts automatically without human intervention"
        ],
        correct_answer_index: 1,
        explanation: "`git merge` creates a dedicated merge commit joining two branches. `git rebase` moves or applies commits on top of another base tip, producing a clean linear history.",
        topic: "History & Merging"
      },
      {
        skill: "Git",
        question_text: "What does `git stash` do in Git?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Permanently deletes all modified files",
          "Temporarily shelves (saves) uncommitted local changes so you can work on a clean working directory",
          "Pushes your branch to origin with force",
          "Rolls back your Git version to an older release"
        ],
        correct_answer_index: 1,
        explanation: "`git stash` takes uncommitted changes (both staged and unstaged) and saves them on a temporary stack, reverting working directory to matching the HEAD commit.",
        topic: "Worktree & Staging"
      },
      {
        skill: "Git",
        question_text: "What command is used to apply a specific commit from another branch into your current branch?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: ["git clone", "git cherry-pick <commit-hash>", "git fetch --all", "git rebase --abort"],
        correct_answer_index: 1,
        explanation: "`git cherry-pick <commit-hash>` applies the changes introduced by a specific existing commit from any branch and creates a new commit on the current branch.",
        topic: "Advanced Git Operations"
      },
      // --- JAVASCRIPT ---
      {
        skill: "JavaScript",
        question_text: "What is the output of `typeof NaN` in JavaScript?",
        question_type: "Code Output",
        difficulty: "Easy",
        options: ['"undefined"', '"number"', '"nan"', '"object"'],
        correct_answer_index: 1,
        explanation: 'In JavaScript, `NaN` (Not-a-Number) represents a numeric value representing an undefined or unrepresentable mathematical result, so `typeof NaN === "number"`.',
        topic: "Types & Coercion"
      },
      {
        skill: "JavaScript",
        question_text: "What is a closure in JavaScript?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "A method to close browser tabs using JavaScript window.close()",
          "A combination of a function bundled together with references to its surrounding lexical state (lexical scope)",
          "A syntax error caused by unmatched curly braces",
          "A built-in garbage collection routine that clears memory"
        ],
        correct_answer_index: 1,
        explanation: "A closure gives an inner function access to an outer function\u2019s scope even after the outer function has finished executing.",
        topic: "Scope & Closures"
      },
      {
        skill: "JavaScript",
        question_text: "In the JavaScript event loop, what executes first after the current synchronous execution context: microtasks or macrotasks?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "Macrotasks (e.g. setTimeout) execute before any microtasks",
          "Microtasks (e.g. Promise.then, queueMicrotask) execute completely before the next macrotask is processed",
          "They execute randomly depending on operating system thread scheduling",
          "Macrotasks only execute when the browser tab is minimized"
        ],
        correct_answer_index: 1,
        explanation: "The event loop processes all pending microtasks in the microtask queue after each synchronous tick before picking the next macrotask (such as setTimeout) from the task queue.",
        topic: "Event Loop & Asynchrony"
      },
      {
        skill: "JavaScript",
        question_text: "What is the difference between `==` and `===` operators in JavaScript?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "`==` performs type coercion before comparison; `===` checks both value and type strictly without coercion",
          "`===` converts numbers to strings automatically",
          "`==` can only be used with numbers",
          "`===` is deprecated in modern ECMAScript standards"
        ],
        correct_answer_index: 0,
        explanation: "`==` is the abstract equality operator which converts operands to a common type before comparing. `===` is strict equality without type coercion.",
        topic: "Operators"
      },
      // --- MACHINE LEARNING ---
      {
        skill: "Machine Learning",
        question_text: "What is overfitting in machine learning and how is it characterized?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "The model performs poorly on training data and well on test data",
          "The model performs exceptionally well on training data but fails to generalize to unseen test data",
          "The model has too few parameters to capture underlying trends",
          "The model converges in zero training epochs"
        ],
        correct_answer_index: 1,
        explanation: "Overfitting occurs when a model learns noise and specific details of the training data rather than underlying patterns, leading to poor generalization on test data.",
        topic: "Model Evaluation"
      },
      {
        skill: "Machine Learning",
        question_text: "Which evaluation metric is best suited for assessing a classifier on a heavily imbalanced dataset (e.g. fraud detection)?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Raw Accuracy",
          "Precision-Recall AUC or F1-Score",
          "Mean Squared Error (MSE)",
          "R-squared (Coefficient of Determination)"
        ],
        correct_answer_index: 1,
        explanation: "Raw accuracy can be misleading in imbalanced datasets (predicting all negatives yields high accuracy). Precision, Recall, and F1-score evaluate true positive performance reliably.",
        topic: "Metrics"
      },
      {
        skill: "Machine Learning",
        question_text: "What is the purpose of regularization techniques like L1 (Lasso) and L2 (Ridge)?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Accelerating data loading from hard drives",
          "Penalizing large weights to prevent overfitting and encourage simpler model complexity",
          "Converting regression models into classification trees",
          "Replacing missing values with dataset median"
        ],
        correct_answer_index: 1,
        explanation: "Regularization adds a penalty term proportional to model weights to the loss function, constraining model complexity to reduce variance and mitigate overfitting.",
        topic: "Optimization & Regularization"
      },
      {
        skill: "Machine Learning",
        question_text: "What is the fundamental difference between supervised and unsupervised learning?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Supervised learning requires GPU acceleration while unsupervised does not",
          "Supervised learning trains on labeled data (input-output pairs); unsupervised finds patterns in unlabeled data",
          "Unsupervised learning can only be used for classification problems",
          "Supervised learning never suffers from overfitting"
        ],
        correct_answer_index: 1,
        explanation: "Supervised algorithms are trained on inputs paired with known ground-truth targets, whereas unsupervised algorithms discover inherent cluster structures without labels.",
        topic: "Core Concepts"
      },
      {
        skill: "Machine Learning",
        question_text: "What does the Bias-Variance tradeoff describe in predictive modeling?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "The conflict between training speed and GPU memory allocation",
          "The tension between underfitting (high bias due to overly simple assumptions) and overfitting (high variance due to sensitivity to training fluctuations)",
          "The trade-off between database read speed and write throughput",
          "The difference between precision and recall in regression analysis"
        ],
        correct_answer_index: 1,
        explanation: "Bias measures error from erroneous assumptions (underfitting), while variance measures error from sensitivity to training noise (overfitting). Total test error is minimized at an optimal balance.",
        topic: "Bias-Variance Tradeoff"
      },
      {
        skill: "Machine Learning",
        question_text: "What is the primary benefit of K-Fold Cross Validation over a single train-test split?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "It reduces model training time by 90%",
          "It ensures every data point is used for both training and validation, providing a more reliable and lower-variance estimate of generalization performance",
          "It eliminates the need for feature engineering",
          "It guarantees 100% test accuracy"
        ],
        correct_answer_index: 1,
        explanation: "K-Fold cross-validation trains and tests across K distinct folds, preventing sampling bias and yielding a robust metric of model generalization.",
        topic: "Validation Strategies"
      },
      {
        skill: "Machine Learning",
        question_text: "What happens if the learning rate in Gradient Descent is set excessively high?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "The model converges to the global minimum in fewer than 2 iterations",
          "The optimization steps can overshoot the minimum and diverge (loss grows uncontrollably)",
          "The model gradients automatically drop to zero",
          "Training memory usage exceeds available RAM"
        ],
        correct_answer_index: 1,
        explanation: "A learning rate that is too high causes updates to overshoot the loss valley, causing oscillations or divergence away from optimal parameter values.",
        topic: "Optimization"
      },
      {
        skill: "Machine Learning",
        question_text: "How does a Random Forest ensemble model reduce the variance of individual Decision Trees?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "By converting all trees into linear regression equations",
          "Through bagging (bootstrap aggregating) and random feature subspace selection across multiple decorrelated trees",
          "By pruning every tree down to a single decision root node",
          "By sharing identical weight matrices between trees"
        ],
        correct_answer_index: 1,
        explanation: "Random Forest trains multiple deep trees on bootstrap samples with random feature subsets; averaging their predictions cancels individual tree variances.",
        topic: "Ensemble Learning"
      },
      {
        skill: "Machine Learning",
        question_text: "What does an Area Under the ROC Curve (AUC-ROC) score of 0.5 indicate for a binary classifier?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Perfect classification accuracy",
          "Performance no better than random guessing (chance)",
          "Complete model inversion with 0% error",
          "High confidence with zero false positives"
        ],
        correct_answer_index: 1,
        explanation: "An AUC-ROC score of 0.5 represents a model with no discriminatory capability, equivalent to flipping a coin.",
        topic: "Evaluation Metrics"
      },
      {
        skill: "Machine Learning",
        question_text: "What is data leakage and why is it dangerous in machine learning workflows?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "A cyber-security breach leaking user passwords onto the dark web",
          "Information from outside the training dataset (such as test set target distributions or future data) inadvertently leaking into the model training pipeline, creating artificially inflated metrics",
          "Memory leaks caused by improper Python garbage collection during epoch iterations",
          "Loss of CSV headers during Pandas file ingestion"
        ],
        correct_answer_index: 1,
        explanation: "Data leakage occurs when test or future data inappropriately influences training preprocessing (e.g. scaling before splitting), masking severe degradation in actual production.",
        topic: "Pipeline Integrity"
      },
      // --- JAVASCRIPT (ADDITIONAL) ---
      {
        skill: "JavaScript",
        question_text: "How does `this` keyword resolution differ in an arrow function compared to a standard function declaration?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Arrow functions have their own dynamic this bound at execution time",
          "Arrow functions do not have their own this binding; they inherit this lexically from their enclosing scope",
          "Arrow functions always bind this to global window/globalThis",
          "Arrow functions throw a TypeError if this is referenced inside their body"
        ],
        correct_answer_index: 1,
        explanation: "Arrow functions do not define their own `this`; they retain the lexical scope value of `this` from the surrounding context where they were created.",
        topic: "Functions & Binding"
      },
      {
        skill: "JavaScript",
        question_text: "What is the purpose of debouncing a user input handler (e.g. search autocomplete)?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "To execute the handler immediately on every single keystroke",
          "To postpone execution until a specified delay has elapsed since the last time the event was fired, preventing excessive API calls",
          "To compress the input string into a binary buffer",
          "To encrypt sensitive keystroke characters"
        ],
        correct_answer_index: 1,
        explanation: "Debouncing delays invoking a function until after N milliseconds of inactivity, drastically reducing redundant calls during rapid typing.",
        topic: "Performance & Optimization"
      },
      {
        skill: "JavaScript",
        question_text: "What will `[1, 2, 3].map(n => n * 2)` return, and does it mutate the original array?",
        question_type: "Code Output",
        difficulty: "Easy",
        options: [
          "[2, 4, 6], and it mutates the original array",
          "[2, 4, 6], and it returns a new array without mutating the original",
          "[1, 2, 3], leaving both unchanged",
          "undefined"
        ],
        correct_answer_index: 1,
        explanation: "`Array.prototype.map()` creates and returns a brand-new array containing the transformed values, leaving the source array untouched.",
        topic: "Array Methods & Immutability"
      },
      {
        skill: "JavaScript",
        question_text: "What is the main limitation of using `JSON.parse(JSON.stringify(obj))` for deep cloning in JavaScript?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "It cannot clone string or numeric properties",
          "It drops functions, undefined values, Symbols, circular references, and converts Dates to ISO strings",
          "It runs only on 64-bit operating systems",
          "It requires asynchronous Promises to resolve"
        ],
        correct_answer_index: 1,
        explanation: "JSON serialization cannot serialize functions, undefined, Symbols, or handles circular references (throws TypeError), and loses custom object prototypes.",
        topic: "Data Manipulation"
      },
      {
        skill: "JavaScript",
        question_text: "What does `Promise.allSettled()` do when one of the passed Promises rejects?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Immediately rejects the outer Promise with that rejection reason",
          "Waits for all input Promises to settle (either fulfill or reject) and returns an array of status objects for every promise",
          "Cancels all other pending promises",
          "Retries the failed promise up to 3 times automatically"
        ],
        correct_answer_index: 1,
        explanation: "Unlike `Promise.all()` which short-circuits on the first rejection, `Promise.allSettled()` waits until all promises finish regardless of fulfillment or rejection.",
        topic: "Asynchronous Programming"
      },
      {
        skill: "JavaScript",
        question_text: "What is the output of `0.1 + 0.2 === 0.3` in standard JavaScript?",
        question_type: "Code Output",
        difficulty: "Easy",
        options: ["true", "false", "TypeError", "NaN"],
        correct_answer_index: 1,
        explanation: "Due to IEEE 754 binary floating-point representation, `0.1 + 0.2` equals `0.30000000000000004`, so the strict equality check evaluates to false.",
        topic: "Numbers & Precision"
      },
      // --- TYPESCRIPT (ADDITIONAL) ---
      {
        skill: "TypeScript",
        question_text: "What does a mapped type `type ReadonlyUser<T> = { readonly [P in keyof T]: T[P] }` achieve in TypeScript?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Deletes all properties from T at runtime",
          "Iterates over each property key of T and constructs a new type where every property has a readonly modifier applied",
          "Converts all values of T into strings",
          "Checks whether T is a database entity"
        ],
        correct_answer_index: 1,
        explanation: "Mapped types iterate over property keys using `[P in keyof T]` to transform property attributes such as adding or removing modifiers.",
        topic: "Mapped Types"
      },
      {
        skill: "TypeScript",
        question_text: "How does TypeScript\u2019s `never` type help achieve exhaustive type checking in a switch statement?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "It automatically terminates the Node process when a case fails",
          "Assigning the unhandled variable to a `const _exhaustiveCheck: never = x` inside the default case triggers a compile error if any union member was omitted",
          "It optimizes the switch statement into a binary lookup table",
          "It prevents undefined variables from entering the switch block"
        ],
        correct_answer_index: 1,
        explanation: "Because `never` cannot accept any value, assigning an unhandled union case to a `never` variable causes a compile-time error if all variants are not explicitly handled.",
        topic: "Advanced Type Checking"
      },
      {
        skill: "TypeScript",
        question_text: "What is a conditional type in TypeScript?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "A runtime if-statement written inside a TypeScript class constructor",
          "A type relationship expressed as `T extends U ? X : Y` that resolves to type X or Y based on type assignability",
          "A compiler setting configured in tsconfig.json",
          "A type that can only be evaluated on Linux servers"
        ],
        correct_answer_index: 1,
        explanation: "Conditional types follow the ternary pattern `T extends U ? X : Y`, allowing types to adapt dynamically based on their generic type constraints.",
        topic: "Conditional Types"
      },
      {
        skill: "TypeScript",
        question_text: "What is the purpose of the `as const` assertion on an object literal in TypeScript?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Freezes the object at runtime using Object.freeze()",
          "Instructs the compiler to infer deeply readonly properties and narrow literal types rather than widening to string/number",
          "Exports the object as a global constant",
          "Prevents the file from being compiled by Babel"
        ],
        correct_answer_index: 1,
        explanation: "`as const` informs TypeScript to infer the narrowest possible literal types and assign `readonly` to all nested properties without runtime overhead.",
        topic: "Const Assertions"
      },
      // --- AWS (ADDITIONAL) ---
      {
        skill: "AWS",
        question_text: "What is the primary architectural difference between Amazon SQS and Amazon SNS?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "SQS is for video streaming; SNS is for file storage",
          "SQS is a pull-based point-to-point message queuing service; SNS is a push-based pub/sub notification and fan-out service",
          "SNS can only send SMS messages to cellular phones",
          "SQS requires relational SQL database connections"
        ],
        correct_answer_index: 1,
        explanation: "SQS stores messages in queues polled by consumers (pull), while SNS broadcasts messages immediately to multiple subscribed endpoints (push/pub-sub).",
        topic: "Messaging & Integration"
      },
      {
        skill: "AWS",
        question_text: "In Amazon DynamoDB, what constitutes a composite primary key?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Two different tables linked together with foreign keys",
          "A Partition Key (hash key) combined with a Sort Key (range key)",
          "An auto-incrementing integer and a timestamp",
          "A SHA-256 hash of the entire JSON document"
        ],
        correct_answer_index: 1,
        explanation: "A composite primary key in DynamoDB consists of a Partition Key (determines physical storage partition) and a Sort Key (orders items within that partition).",
        topic: "NoSQL Databases"
      },
      {
        skill: "AWS",
        question_text: "In an Amazon VPC, what allows EC2 instances in a private subnet to initiate outbound internet connections for software updates while blocking inbound traffic?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "An Internet Gateway attached directly to the private subnet route table",
          "A NAT Gateway (or NAT instance) deployed in a public subnet with an Elastic IP",
          "A CloudFront distribution",
          "An IAM role with S3FullAccess"
        ],
        correct_answer_index: 1,
        explanation: "Network Address Translation (NAT) Gateways allow private subnet instances to connect outbound to the internet while preventing external hosts from initiating inbound connections.",
        topic: "VPC Networking"
      },
      {
        skill: "AWS",
        question_text: "What is the primary benefit of deploying Amazon RDS in a Multi-AZ configuration?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Doubles SQL query read throughput by routing SELECT queries to the standby instance",
          "Provides high availability and automated synchronous failover to a standby replica in a different Availability Zone during outages",
          "Reduces storage pricing by 50%",
          "Eliminates the need for database backups"
        ],
        correct_answer_index: 1,
        explanation: "Multi-AZ maintains a synchronous standby replica in another AZ for automated failover during hardware failure or planned maintenance, maximizing availability.",
        topic: "Databases & Resilience"
      },
      {
        skill: "AWS",
        question_text: "What AWS tool allows you to define and provision cloud infrastructure using code templates (Infrastructure as Code)?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["AWS CloudFormation (or AWS CDK)", "AWS Elastic Beanstalk", "Amazon Athena", "AWS QuickSight"],
        correct_answer_index: 0,
        explanation: "AWS CloudFormation enables modeling, provisioning, and managing AWS resources safely and predictably through declarative YAML/JSON code templates.",
        topic: "Infrastructure as Code"
      },
      // --- GIT (ADDITIONAL) ---
      {
        skill: "Git",
        question_text: "What is the difference between `git revert` and `git reset --hard`?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "`git revert` destroys the commit history; `git reset` preserves it",
          "`git revert` creates a new commit that inverts the changes of an older commit (safe for shared branches); `git reset --hard` moves HEAD backwards and discards commits from history",
          "`git reset` only affects the remote origin repository",
          "`git revert` is an alias for git checkout"
        ],
        correct_answer_index: 1,
        explanation: "`git revert` is non-destructive and appends a new compensating commit, making it safe for public branches. `git reset --hard` rewrites history and discards uncommitted work.",
        topic: "Undo & History"
      },
      {
        skill: "Git",
        question_text: 'What does "Detached HEAD" mean in Git?',
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "The Git repository database has suffered file corruption",
          "HEAD is pointing directly to a specific commit hash rather than a named branch reference",
          "The local branch has been deleted on the remote server",
          "A merge conflict has destroyed the working tree"
        ],
        correct_answer_index: 1,
        explanation: "When checking out a specific commit or tag rather than a branch, HEAD points directly to that commit; any new commits will not belong to any branch.",
        topic: "HEAD & References"
      },
      {
        skill: "Git",
        question_text: "What is `git bisect` used for?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "Splitting a single repository into two separate micro-repos",
          "Using binary search across commit history to rapidly identify the exact commit that introduced a bug",
          "Encrypting commit messages with public keys",
          "Deleting duplicate Git branches in bulk"
        ],
        correct_answer_index: 1,
        explanation: "`git bisect` conducts a binary search between a known good commit and bad commit, checking out midpoints until the regression commit is isolated.",
        topic: "Debugging Tools"
      },
      {
        skill: "Git",
        question_text: "What is the purpose of `git reflog` in Git?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "A public audit log transmitted to GitHub every hour",
          "A local record of every update made to the tip of branches and HEAD, allowing recovery of deleted commits and lost branches",
          "A configuration file that replaces .gitignore",
          "A command to format commit messages with markdown"
        ],
        correct_answer_index: 1,
        explanation: "`git reflog` tracks every movement of HEAD locally (commits, checkouts, rebase steps), enabling restoration of commits that were accidentally reset or lost.",
        topic: "Recovery & Safety"
      },
      {
        skill: "Git",
        question_text: "What does the `--force-with-lease` flag do during `git push`?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Bypasses all GitHub branch protection rules permanently",
          "Safely force-pushes by checking that the remote ref has not been updated by someone else since your last fetch",
          "Leases a dedicated EC2 instance to compile Git bundles",
          "Encrypts your SSH key before pushing commits"
        ],
        correct_answer_index: 1,
        explanation: "`--force-with-lease` ensures you do not inadvertently overwrite someone else\u2019s commits that were pushed to the remote branch after your last fetch.",
        topic: "Remote Operations"
      },
      {
        skill: "Git",
        question_text: "What is a fast-forward merge in Git?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "A merge that automatically resolves syntax errors using AI",
          "A merge where the target branch has no divergent commits, allowing Git to simply move the branch pointer forward without creating a merge commit",
          "A merge executed over a high-speed fiber-optic connection",
          "A merge that skips pre-commit hooks"
        ],
        correct_answer_index: 1,
        explanation: "When the incoming branch has a linear history from the target branch, Git simply advances the target branch pointer to the incoming tip without creating a new merge commit.",
        topic: "Branch Merging"
      },
      // --- JAVA ---
      {
        skill: "Java",
        question_text: "What is the difference between JDK, JRE, and JVM?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "JDK runs the code; JRE compiles it; JVM is the documentation",
          "JVM executes bytecode; JRE provides the runtime environment (JVM + standard libraries); JDK is the development kit (JRE + compiler/tools)",
          "They are identical acronyms for the same software package",
          "JDK is exclusively for Android; JRE is exclusively for desktop apps"
        ],
        correct_answer_index: 1,
        explanation: "JVM executes Java bytecode. JRE bundles the JVM and class libraries to run programs. JDK includes the JRE plus tools like `javac` to develop Java applications.",
        topic: "Architecture"
      },
      {
        skill: "Java",
        question_text: "Why are String objects immutable in Java?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Because Java does not support memory management",
          "For security, thread-safety, performance caching in the String Constant Pool, and hashcode caching for HashMaps",
          "Because Strings cannot store Unicode characters",
          "Because the JVM automatically stores Strings in read-only hardware registers"
        ],
        correct_answer_index: 1,
        explanation: "Immutability allows safe sharing across threads, enables the String Constant Pool to save memory, prevents unauthorized parameter mutation, and caches hashCodes.",
        topic: "Core Language"
      },
      {
        skill: "Java",
        question_text: "How does a `java.util.HashMap` handle key collisions internally in Java 8 and above?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "It discards the older key-value pair and keeps the newest one",
          "It stores entries in a linked list bucket, converting it to a balanced red-black tree when the bucket size exceeds 8 (TREEIFY_THRESHOLD)",
          "It throws a RuntimeException",
          "It performs linear probing in an open-addressing table"
        ],
        correct_answer_index: 1,
        explanation: "In Java 8+, HashMap stores collision entries in linked list nodes. When a bucket exceeds 8 nodes and capacity >= 64, it transforms into a red-black tree, improving lookup from O(n) to O(log n).",
        topic: "Collections Framework"
      },
      {
        skill: "Java",
        question_text: "What is the difference between a checked and an unchecked exception in Java?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Checked exceptions are verified at compile-time (subclasses of Exception excluding RuntimeException); unchecked exceptions occur at runtime (subclasses of RuntimeException)",
          "Unchecked exceptions crash the entire operating system",
          "Checked exceptions only occur in multi-threaded programs",
          "There is no difference in modern Java"
        ],
        correct_answer_index: 0,
        explanation: "Checked exceptions must be explicitly declared in a `throws` clause or caught in a `try-catch` block at compile time, whereas unchecked exceptions (RuntimeException, Error) do not require explicit handling.",
        topic: "Exception Handling"
      },
      {
        skill: "Java",
        question_text: "What does the `volatile` keyword guarantee when applied to a variable in Java?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "Atomic increment operations (like count++) without synchronization",
          "Visibility: changes made by one thread are immediately visible to all other threads, and prevents compiler instruction reordering",
          "Automatic object garbage collection prevention",
          "Storage of the variable in L1 CPU cache exclusively"
        ],
        correct_answer_index: 1,
        explanation: "`volatile` ensures that reads and writes go directly to main memory rather than thread CPU caches, establishing a happens-before relationship and guaranteeing visibility.",
        topic: "Concurrency"
      },
      {
        skill: "Java",
        question_text: "Which Java Stream method is an intermediate (lazy) operation rather than a terminal operation?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["collect()", "filter()", "count()", "forEach()"],
        correct_answer_index: 1,
        explanation: "`filter()` is an intermediate operation that returns a new stream lazily; `collect()`, `count()`, and `forEach()` are terminal operations that trigger pipeline execution.",
        topic: "Streams API"
      },
      {
        skill: "Java",
        question_text: "What is the contract between `equals()` and `hashCode()` in Java?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "If two objects have equal hash codes, they must be equal according to equals()",
          "If two objects are equal according to equals(), they must produce the exact same hashCode() integer",
          "equals() and hashCode() should never be overridden in the same class",
          "hashCode() must always return a unique positive prime number for every object instance"
        ],
        correct_answer_index: 1,
        explanation: "If `a.equals(b)` is true, then `a.hashCode() == b.hashCode()` must strictly hold true. The reverse is not required (hash collisions are permitted).",
        topic: "Object Methods"
      },
      {
        skill: "Java",
        question_text: "What is the purpose of the Generational Garbage Collection hypothesis in the HotSpot JVM?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Most objects die shortly after creation (Young Generation), so collecting young objects frequently is vastly more efficient than scanning the entire heap",
          "Garbage collection is only executed after a program generates 1,000,000 objects",
          "Generational GC requires manual memory allocation using malloc()",
          "Objects survive indefinitely unless explicitly marked with finalize()"
        ],
        correct_answer_index: 0,
        explanation: "Empirical studies prove that the vast majority of Java objects have short lifespans, so dividing the heap into Young and Old generations optimizes GC pauses.",
        topic: "Memory & Garbage Collection"
      },
      {
        skill: "Java",
        question_text: "What is the difference between `final`, `finally`, and `finalize()` in Java?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "They are synonyms introduced across different Java versions",
          "`final` is an access modifier for immutability; `finally` is a block executed after try-catch; `finalize()` was a deprecated Object cleanup method called before GC",
          "`finally` terminates JVM execution; `final` creates static variables",
          "`finalize()` executes on every thread creation"
        ],
        correct_answer_index: 1,
        explanation: "`final` defines constants or non-overridable methods/classes; `finally` ensures guaranteed cleanup execution in exception handling; `finalize()` was a legacy GC hook.",
        topic: "Keywords & Syntax"
      },
      {
        skill: "Java",
        question_text: "Why should you prefer using an `ExecutorService` rather than manually calling `new Thread().start()` in production Java?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Manually creating threads is forbidden by the Java compiler",
          "ExecutorService manages a reusable thread pool, avoiding the massive operating system overhead and memory footprint of continuously creating and destroying OS threads",
          "Threads created with `new Thread()` cannot throw exceptions",
          "ExecutorService automatically translates Java code to CUDA for GPU execution"
        ],
        correct_answer_index: 1,
        explanation: "Creating OS threads is resource-heavy. Thread pools reuse existing threads, throttle concurrent concurrency limits, and manage task lifecycle cleanly.",
        topic: "Multithreading & Concurrency"
      },
      // --- C++ ---
      {
        skill: "C++",
        question_text: "What is RAII (Resource Acquisition Is Initialization) in C++?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "A design pattern where resources are acquired in a constructor and automatically released in the destructor when the object goes out of scope",
          "A compiler flag that enables hardware acceleration for initialization routines",
          "A method to initialize global variables before main() executes",
          "A manual memory allocation library used in legacy C89 programs"
        ],
        correct_answer_index: 0,
        explanation: "RAII binds resource management (memory, file handles, mutex locks) to object lifetime, ensuring deterministic exception-safe cleanup via destructors.",
        topic: "Memory & Resource Management"
      },
      {
        skill: "C++",
        question_text: "What is the difference between `std::unique_ptr` and `std::shared_ptr` in modern C++?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "`unique_ptr` stores arrays while `shared_ptr` stores primitive integers",
          "`std::unique_ptr` enforces exclusive single ownership (non-copyable, movable only); `std::shared_ptr` implements reference-counted shared ownership",
          "`shared_ptr` cannot be used with custom deleters",
          "`unique_ptr` requires manual deletion with `delete` keyword"
        ],
        correct_answer_index: 1,
        explanation: "`unique_ptr` maintains sole ownership with zero overhead over a raw pointer. `shared_ptr` shares ownership across multiple owners using an atomic reference count.",
        topic: "Smart Pointers"
      },
      {
        skill: "C++",
        question_text: "Why does a base class with virtual functions require a virtual destructor in C++?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "To prevent the base class from being instantiated",
          "To ensure that deleting a derived object through a pointer to the base class invokes the derived class destructor, preventing undefined behavior and memory leaks",
          "Because C++ does not allow non-virtual destructors in any class",
          "To speed up compile times by inlining destruction logic"
        ],
        correct_answer_index: 1,
        explanation: "If a base class destructor is non-virtual, calling `delete` on a `Base*` pointing to a `Derived` instance only runs `~Base()`, leaking derived members and causing undefined behavior.",
        topic: "Polymorphism & OOP"
      },
      {
        skill: "C++",
        question_text: "What does `std::move` actually do in C++11 and later?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "It physically moves bytes across memory addresses using memmove",
          "It unconditionally casts an expression to an rvalue reference (`T&&`), enabling move constructors and move assignments without copying data",
          "It deletes the original object immediately",
          "It moves object execution to another CPU core"
        ],
        correct_answer_index: 1,
        explanation: "`std::move` is simply a compile-time static cast to an rvalue reference (`static_cast<T&&>(val)`), signaling that the object\u2019s resources can be transferred or pilfered.",
        topic: "Move Semantics"
      },
      {
        skill: "C++",
        question_text: "What is the Rule of Five in modern C++?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "A rule that functions cannot have more than five parameters",
          "If you explicitly define or delete any of: Destructor, Copy Constructor, Copy Assignment, Move Constructor, or Move Assignment, you should generally define or delete all five",
          "A rule that header files must not be included more than five times",
          "A template metaprogramming recursion depth limit"
        ],
        correct_answer_index: 1,
        explanation: "The Rule of Five dictates that managing resource ownership requires explicitly handling all five special member functions to maintain consistent ownership semantics.",
        topic: "Class Design & Semantics"
      },
      {
        skill: "C++",
        question_text: "How does `std::vector` manage its capacity when adding elements with `push_back()`?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "It creates a singly-linked node in heap memory for each individual element",
          "When size reaches capacity, it allocates a new contiguous buffer (typically 1.5x or 2x larger), moves or copies existing elements, and frees the old buffer, achieving amortized O(1) insertion",
          "It writes overflow elements directly to temporary swap files on disk",
          "It throws a std::bad_alloc exception whenever capacity is exceeded"
        ],
        correct_answer_index: 1,
        explanation: "`std::vector` maintains contiguous elements. Upon exhausting capacity, it reallocates a geometrically growing array (often 2x growth factor), giving amortized constant time per insertion.",
        topic: "STL Containers"
      },
      {
        skill: "C++",
        question_text: "What is undefined behavior (UB) in C++?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "A compiler warning that can be ignored safely in release builds",
          "Code execution where the C++ standard imposes no requirements, allowing crashes, corrupted data, or unpredictable results",
          "A function whose return type is void",
          "A syntax error caught by the preprocessor"
        ],
        correct_answer_index: 1,
        explanation: "Undefined behavior occurs when code violates standard rules (e.g. out-of-bounds access, dereferencing nullptr, signed integer overflow); compilers assume UB never happens, leading to miscompilation.",
        topic: "Safety & Standard"
      },
      {
        skill: "C++",
        question_text: "What does the `constexpr` specifier indicate when applied to a function or variable in C++?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "The function must be compiled in debug mode only",
          "The function or variable can be evaluated at compile-time if all arguments are constant expressions",
          "The variable cannot be read by other compilation units",
          "The function must not contain any loops"
        ],
        correct_answer_index: 1,
        explanation: "`constexpr` designates that the entity can be computed at compile-time, enabling zero-runtime-cost calculations and constant array sizing.",
        topic: "Modern C++ Features"
      },
      {
        skill: "C++",
        question_text: "What is the difference between a reference `int&` and a pointer `int*` in C++?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "References can be null; pointers can never be null",
          "A reference is an alias that must be initialized upon declaration and cannot be reseated to point to another object; a pointer holds a memory address, can be null, and can be reassigned",
          "Pointers do not support arithmetic operations",
          "References are only supported inside class member functions"
        ],
        correct_answer_index: 1,
        explanation: "References provide an alias to an existing object, cannot be null, and cannot be reseated. Pointers hold addresses, support arithmetic, can be null, and can be redirected.",
        topic: "Pointers & References"
      },
      {
        skill: "C++",
        question_text: "What is a vtable (virtual method table) in C++?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "A standard library container for storing virtual memory pointers",
          "A lookup table generated by the compiler containing function pointers used to resolve virtual member function calls dynamically at runtime (dynamic dispatch)",
          "A thread-safe hash map used in multi-threaded C++ applications",
          "A configuration table in the CMake build system"
        ],
        correct_answer_index: 1,
        explanation: "For classes with virtual functions, the compiler creates a vtable containing pointers to the most-derived implementations; objects contain a hidden `vptr` referencing this table.",
        topic: "Dynamic Dispatch & Virtual Functions"
      },
      // --- C# ---
      {
        skill: "C#",
        question_text: "What is the fundamental difference between a `class` and a `struct` in C#?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Classes are value types allocated on the stack; structs are reference types allocated on the managed heap",
          "Classes are reference types allocated on the managed heap; structs are value types typically allocated on the stack or inline within containing types",
          "Structs support multiple inheritance; classes do not",
          "Classes cannot have constructors in modern C#"
        ],
        correct_answer_index: 1,
        explanation: "`class` is a reference type copied by reference and collected by GC; `struct` is a value type copied by value and suited for lightweight, immutable data structures.",
        topic: "Types & Memory"
      },
      {
        skill: "C#",
        question_text: "What is the difference between `IEnumerable<T>` and `IQueryable<T>` in LINQ?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "`IEnumerable` translates expressions to SQL; `IQueryable` runs in-memory only",
          "`IEnumerable<T>` executes in-memory filtering (LINQ to Objects); `IQueryable<T>` constructs an Expression Tree translated into provider queries (e.g. SQL in Entity Framework)",
          "`IQueryable` is deprecated in .NET 8",
          "`IEnumerable` does not support foreach loops"
        ],
        correct_answer_index: 1,
        explanation: "`IQueryable` passes expression trees to remote data sources (like SQL databases) so filtering happens server-side, whereas `IEnumerable` operates in client memory.",
        topic: "LINQ & Data Access"
      },
      {
        skill: "C#",
        question_text: "What is the purpose of the `IDisposable` interface and the `using` statement in C#?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "To force immediate garbage collection of the entire .NET heap",
          "To provide deterministic release of unmanaged resources (file handles, database connections, sockets) via the `Dispose()` method",
          "To import external namespaces into the C# source file",
          "To mark classes that cannot be inherited"
        ],
        correct_answer_index: 1,
        explanation: "`IDisposable` allows prompt deterministic cleanup of unmanaged resources; the `using` statement guarantees `Dispose()` is invoked even if exceptions occur.",
        topic: "Resource Cleanup"
      },
      {
        skill: "C#",
        question_text: "What is boxing and unboxing in C#, and what is its performance impact?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Packaging code into Docker containers",
          "Boxing converts a value type to `object` (allocating memory on the heap); unboxing extracts the value back to the stack; frequent boxing causes GC allocation pressure and performance degradation",
          "Encrypting strings using standard .NET cryptography",
          "Converting asynchronous Tasks to synchronous Threads"
        ],
        correct_answer_index: 1,
        explanation: "Boxing wraps a value type in a heap-allocated object instance. Unboxing casts it back. This induces allocation overhead and GC pressure if done repeatedly.",
        topic: "Type System & Performance"
      },
      {
        skill: "C#",
        question_text: "How does `async` and `await` work under the hood in C#?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "It creates a new operating system thread for every await expression",
          "The compiler transforms the method into a state machine structure (`IAsyncStateMachine`) that yields control without blocking the thread and resumes upon task completion",
          "It blocks the thread while showing a Windows loading spinner",
          "It translates C# code to JavaScript async callbacks"
        ],
        correct_answer_index: 1,
        explanation: "The Roslyn compiler rewrites async methods into state machines that hook continuations to Tasks, freeing caller threads (like UI or ASP.NET thread pool threads) during I/O waits.",
        topic: "Asynchronous Programming"
      },
      {
        skill: "C#",
        question_text: "What does the `record` keyword introduce in C# 9+?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "A method for recording microphone audio input",
          "A reference type or value type with built-in value-based equality semantics, non-destructive mutation (`with` expressions), and concise positional syntax",
          "A database table generator for SQLite",
          "A keyword to disable reflection"
        ],
        correct_answer_index: 1,
        explanation: "Records provide concise immutability, value-based `Equals()` and `GetHashCode()` comparisons, and `with` expression cloning out-of-the-box.",
        topic: "Modern C# Features"
      },
      {
        skill: "C#",
        question_text: "What is the difference between `Task.Run` and `Task.Yield` in C#?",
        question_type: "MCQ",
        difficulty: "Hard",
        options: [
          "`Task.Run` queues work to the ThreadPool; `Task.Yield` yields execution back to the current context and immediately schedules the rest asynchronously",
          "`Task.Yield` deletes the running task",
          "They are identical and interchangeable",
          "`Task.Run` only runs on background UI threads"
        ],
        correct_answer_index: 0,
        explanation: "`Task.Run` offloads CPU-bound operations to the .NET ThreadPool. `await Task.Yield()` creates an asynchronous point that yields execution back to the caller/synchronization context.",
        topic: "Threading & Tasks"
      },
      {
        skill: "C#",
        question_text: "What are nullable reference types in C# 8.0 and above?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Reference types that are automatically initialized to empty strings",
          "Static analysis compiler checks that distinguish non-nullable types (`string`) from nullable types (`string?`), emitting warnings to eliminate NullReferenceExceptions",
          "A runtime exception thrown whenever an object is null",
          "A database constraint in SQL Server"
        ],
        correct_answer_index: 1,
        explanation: "Nullable reference types help developers detect and prevent null reference bugs at compile time by distinguishing types intended to hold null from those that must not.",
        topic: "Null Safety"
      },
      {
        skill: "C#",
        question_text: 'In ASP.NET Core Dependency Injection, what is the lifetime of a "Scoped" service?',
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "A single instance created once for the entire application lifespan",
          "A new instance created per client HTTP request and disposed when the request finishes",
          "A new instance created every single time the service is requested from the container",
          "An instance that survives across web server reboots"
        ],
        correct_answer_index: 1,
        explanation: "Scoped services are created once per client request (connection) and shared across all dependencies injected within that same HTTP request scope.",
        topic: "Dependency Injection"
      },
      {
        skill: "C#",
        question_text: "What does the `yield return` statement do in a C# method returning `IEnumerable<T>`?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Aborts enumeration and throws an exception",
          "Produces elements lazily on-demand one at a time as the caller iterates through the collection, without materializing the full list in memory",
          "Runs the method on multiple CPU cores in parallel",
          "Saves the collection to an Excel spreadsheet"
        ],
        correct_answer_index: 1,
        explanation: "`yield return` produces an iterator state machine that evaluates elements one-by-one lazily, providing significant memory savings when processing large data streams.",
        topic: "Iterators & Generators"
      },
      // --- DATA ANALYSIS ---
      {
        skill: "Data Analysis",
        question_text: "What is the difference between `.loc[]` and `.iloc[]` in Pandas?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "`.loc[]` is for sorting; `.iloc[]` is for grouping",
          "`.loc[]` is label-based indexing (uses row/column names); `.iloc[]` is integer position-based indexing (0 to n-1)",
          "`.iloc[]` only works on CSV files while `.loc[]` works on SQL tables",
          "There is no functional difference in Pandas 2.0"
        ],
        correct_answer_index: 1,
        explanation: "`df.loc[]` selects data by index and column labels. `df.iloc[]` selects data by integer positional index regardless of labels.",
        topic: "Pandas Indexing"
      },
      {
        skill: "Data Analysis",
        question_text: "What does the `df.groupby('department')['salary'].mean()` operation compute?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Sorts salaries across the whole company in ascending order",
          "Splits the dataframe by department groups, extracts the salary column, and calculates the average salary for each department",
          "Replaces missing salaries with the department median",
          "Deletes all rows where department is null"
        ],
        correct_answer_index: 1,
        explanation: "This split-apply-combine operation partitions data by department categories and computes the mean salary for each group.",
        topic: "Aggregations"
      },
      {
        skill: "Data Analysis",
        question_text: "Why are vectorized operations in NumPy significantly faster than standard Python `for` loops?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "NumPy operations are executed in pre-compiled C/Fortran code with contiguous memory arrays and SIMD CPU vectorization, avoiding Python interpreter overhead",
          "NumPy compresses data using gzip compression in memory",
          "NumPy skips floating-point precision checks",
          "NumPy converts all data to strings before processing"
        ],
        correct_answer_index: 0,
        explanation: "NumPy executes operations on contiguous memory buffers in compiled C with CPU SIMD instructions, eliminating per-element type-checking and interpreter overhead.",
        topic: "NumPy & Vectorization"
      },
      {
        skill: "Data Analysis",
        question_text: "How is an outlier typically defined using the Interquartile Range (IQR) method?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Values below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR",
          "Any value that is negative",
          "Values located within 1 standard deviation of the median",
          "Any data point recorded on a weekend"
        ],
        correct_answer_index: 0,
        explanation: "The classic Tukey outlier rule flags any observation lower than `Q1 - 1.5 * IQR` or higher than `Q3 + 1.5 * IQR` as an outlier.",
        topic: "Statistics & Outliers"
      },
      {
        skill: "Data Analysis",
        question_text: "What does a Pearson correlation coefficient (r) of -0.85 indicate between two continuous variables?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "A weak positive linear relationship",
          "A strong negative linear relationship (as one variable increases, the other decreases)",
          "That one variable causes the other to decline",
          "That 85% of data points are outliers"
        ],
        correct_answer_index: 1,
        explanation: "A Pearson r value close to -1.0 indicates a strong inverse linear relationship. (Note: correlation does not establish causation).",
        topic: "Statistics & Correlation"
      },
      {
        skill: "Data Analysis",
        question_text: "What is the purpose of `pd.melt()` in Pandas?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "To dissolve rows containing NaN values",
          "To transform a DataFrame from wide format to long (tidy) format by unpivoting column headers into variable-value pairs",
          "To calculate heat dissipation from GPU calculations",
          "To convert integers into floating-point numbers"
        ],
        correct_answer_index: 1,
        explanation: "`pd.melt()` unpivots columns into rows, transitioning messy wide tables into clean tidy long-format data suitable for analysis and visualization.",
        topic: "Data Reshaping"
      },
      {
        skill: "Data Analysis",
        question_text: "When handling missing values (NaN) in a skewed continuous variable, why is median imputation often preferred over mean imputation?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "Because mean computation requires external libraries",
          "Because the median is robust to extreme outliers and skewness, whereas the mean can be heavily distorted",
          "Because median imputation is 100x faster to calculate",
          "Because the median always produces integer values"
        ],
        correct_answer_index: 1,
        explanation: "The mean is sensitive to extreme values in skewed distributions, while the median represents the true 50th percentile without being pulled by tail extremes.",
        topic: "Data Cleaning & Imputation"
      },
      {
        skill: "Data Analysis",
        question_text: "What chart type is most effective for visualizing the distribution, quartiles, and potential outliers of a numerical variable across multiple categories?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: ["Pie Chart", "Box Plot (Box-and-Whisker Plot)", "Line Chart with markers", "Radar Chart"],
        correct_answer_index: 1,
        explanation: "A Box Plot displays median, IQR, whiskers, and individual outlier points side-by-side across groups with high visual clarity.",
        topic: "Data Visualization"
      },
      {
        skill: "Data Analysis",
        question_text: "What does `df.drop_duplicates(subset=['email'], keep='last')` do in Pandas?",
        question_type: "MCQ",
        difficulty: "Easy",
        options: [
          "Deletes all email addresses from the dataset",
          "Removes duplicate rows based on the `email` column, keeping only the final occurrence of each duplicate",
          "Sorts rows by email address in descending order",
          "Encrypts duplicate email records"
        ],
        correct_answer_index: 1,
        explanation: "It evaluates uniqueness based on the `email` column and drops earlier duplicates while preserving the last observed record.",
        topic: "Data Deduplication"
      },
      {
        skill: "Data Analysis",
        question_text: "What is the purpose of the `resample()` method on a Pandas DataFrame with a DatetimeIndex?",
        question_type: "MCQ",
        difficulty: "Medium",
        options: [
          "To randomly shuffle time series observations",
          "To perform frequency conversion and aggregation (e.g. converting hourly transactions into daily or monthly totals)",
          "To re-train machine learning models at runtime",
          "To validate timezone Daylight Saving adjustments"
        ],
        correct_answer_index: 1,
        explanation: "`df.resample()` is the time-series equivalent of groupby, bucketizing timestamps into specified frequency bins (e.g. '1D', '1M') and applying aggregations.",
        topic: "Time Series Analysis"
      }
    ];
  }
});

// src/server/db/index.ts
var db_exports = {};
__export(db_exports, {
  SEED_COURSES: () => SEED_COURSES,
  addUserSkill: () => addUserSkill,
  changeUserPassword: () => changeUserPassword,
  createJobApplication: () => createJobApplication,
  createOrUpdateUserProfile: () => createOrUpdateUserProfile,
  createQuestion: () => createQuestion,
  createSessionToken: () => createSessionToken,
  deleteJobApplication: () => deleteJobApplication,
  deleteUserSkill: () => deleteUserSkill,
  formatAuditEventTitle: () => formatAuditEventTitle,
  getAdminAssessmentAttempts: () => getAdminAssessmentAttempts,
  getAdminAssessments: () => getAdminAssessments,
  getAdminByEmail: () => getAdminByEmail,
  getAdminFeedback: () => getAdminFeedback,
  getAdminJobMatches: () => getAdminJobMatches,
  getAdminJobSearches: () => getAdminJobSearches,
  getAdminQuestions: () => getAdminQuestions,
  getAdminResumeAnalyses: () => getAdminResumeAnalyses,
  getAdminUserDetail: () => getAdminUserDetail,
  getAdminUsers: () => getAdminUsers,
  getAdminVerifiedSkills: () => getAdminVerifiedSkills,
  getAdminVisitors: () => getAdminVisitors,
  getAssessmentAttemptDetail: () => getAssessmentAttemptDetail,
  getAssessmentConfigs: () => getAssessmentConfigs,
  getCertificateByCode: () => getCertificateByCode,
  getDb: () => getDb2,
  getDetailedAnalytics: () => getDetailedAnalytics,
  getProctoringEvents: () => getProctoringEvents,
  getProctoringSummary: () => getProctoringSummary,
  getQuestionById: () => getQuestionById,
  getRealAdminStats: () => getRealAdminStats,
  getRealAuditEvents: () => getRealAuditEvents,
  getSkillsCatalogWithMetrics: () => getSkillsCatalogWithMetrics,
  getUserAnalyses: () => getUserAnalyses,
  getUserAssessments: () => getUserAssessments,
  getUserById: () => getUserById,
  getUserBySession: () => getUserBySession,
  getUserBySessionToken: () => getUserBySessionToken,
  getUserCertificates: () => getUserCertificates,
  getUserCourses: () => getUserCourses,
  getUserDashboardData: () => getUserDashboardData,
  getUserImprovements: () => getUserImprovements,
  getUserJobApplications: () => getUserJobApplications,
  getUserJobMatches: () => getUserJobMatches,
  getUserNameById: () => getUserNameById,
  getUserResumes: () => getUserResumes,
  getUserSingleAnalysis: () => getUserSingleAnalysis,
  getUserSkills: () => getUserSkills,
  getUserSkillsStatus: () => getUserSkillsStatus,
  getVisitorActivity: () => getVisitorActivity,
  hashPassword: () => hashPassword,
  logAuditEvent: () => logAuditEvent,
  loginUser: () => loginUser,
  logoutUser: () => logoutUser,
  recordAdminLogin: () => recordAdminLogin,
  recordAssessmentEvent: () => recordAssessmentEvent,
  recordFeedbackEvent: () => recordFeedbackEvent,
  recordJobMatchEvent: () => recordJobMatchEvent,
  recordJobSearchEvent: () => recordJobSearchEvent,
  recordProctoringEvent: () => recordProctoringEvent,
  recordResumeAnalysis: () => recordResumeAnalysis,
  recordResumeUpload: () => recordResumeUpload,
  registerUser: () => registerUser,
  softDeleteQuestion: () => softDeleteQuestion,
  startAssessmentAttempt: () => startAssessmentAttempt,
  submitAssessmentAttempt: () => submitAssessmentAttempt,
  syncUserSkillVerification: () => syncUserSkillVerification,
  toggleQuestionStatus: () => toggleQuestionStatus,
  toggleSkillStatus: () => toggleSkillStatus,
  trackVisitor: () => trackVisitor,
  updateAssessmentConfig: () => updateAssessmentConfig,
  updateFeedbackStatus: () => updateFeedbackStatus,
  updateJobApplication: () => updateJobApplication,
  updateQuestion: () => updateQuestion,
  updateSkill: () => updateSkill,
  updateUserCourseProgress: () => updateUserCourseProgress,
  updateUserProfile: () => updateUserProfile,
  verifyAdminToken: () => verifyAdminToken,
  verifyPassword: () => verifyPassword,
  verifySessionToken: () => verifySessionToken
});
import crypto from "node:crypto";
function getDb2() {
  if (dbInstance && isInitialized) {
    return dbInstance;
  }
  dbInstance = getDb();
  if (isInitialized) {
    return dbInstance;
  }
  isInitialized = true;
  if (!dbInstance.isPostgres) {
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'ADMIN',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT,
      is_active INTEGER DEFAULT 1
    );
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      session_token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_token ON users(session_token);
    CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      anonymous_id TEXT UNIQUE NOT NULL,
      first_seen_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      total_sessions INTEGER DEFAULT 1,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_visitors_anon ON visitors(anonymous_id);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      parsed_successfully INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_resumes_visitor ON resumes(visitor_id);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS resume_analyses (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      resume_id TEXT,
      file_type TEXT NOT NULL,
      analyzed_at TEXT NOT NULL,
      ats_score REAL NOT NULL,
      keyword_score REAL NOT NULL,
      formatting_score REAL NOT NULL,
      section_score REAL NOT NULL,
      analysis_status TEXT NOT NULL,
      detected_keywords TEXT,
      missing_keywords TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_analyses_date ON resume_analyses(analyzed_at);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS verified_skills (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      skill_name TEXT NOT NULL,
      status TEXT NOT NULL,
      assessment_id TEXT,
      verified_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_skills_name ON verified_skills(skill_name);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      skill TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      status TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      started_at TEXT,
      completed_at TEXT,
      proctoring_violation_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_assessments_skill ON assessments(skill);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS job_searches (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      query TEXT NOT NULL,
      location TEXT,
      provider TEXT NOT NULL,
      results_count INTEGER NOT NULL,
      searched_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_job_searches_date ON job_searches(searched_at);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS job_matches (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      resume_id TEXT,
      job_id TEXT,
      job_title TEXT,
      company TEXT,
      match_score REAL NOT NULL,
      matched_skills TEXT,
      partial_skills TEXT,
      missing_skills TEXT,
      created_at TEXT NOT NULL
    );
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      rating INTEGER NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      suggestions TEXT,
      status TEXT DEFAULT 'new',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(created_at);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS skills_catalog (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_skills_cat_slug ON skills_catalog(slug);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessment_configs (
      id TEXT PRIMARY KEY,
      skill_slug TEXT UNIQUE NOT NULL,
      questions_count INTEGER DEFAULT 10,
      pass_percentage INTEGER DEFAULT 70,
      time_limit_minutes INTEGER DEFAULT 20,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id TEXT PRIMARY KEY,
      skill_slug TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'MCQ',
      difficulty TEXT NOT NULL DEFAULT 'Medium',
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      time_limit_seconds INTEGER DEFAULT 120,
      is_active INTEGER DEFAULT 1,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_aq_skill ON assessment_questions(skill_slug);
    CREATE INDEX IF NOT EXISTS idx_aq_status ON assessment_questions(is_active, is_deleted);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assessment_question_snapshots (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_order INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      options_json TEXT NOT NULL,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      selected_answer TEXT,
      is_correct INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_snap_assessment ON assessment_question_snapshots(assessment_id);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      actor_id TEXT,
      description TEXT NOT NULL,
      metadata_json TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      job_id TEXT,
      job_title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      source TEXT,
      job_url TEXT,
      applied_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Applied',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_job_app_user ON job_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_job_app_status ON job_applications(status);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS resume_improvements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      resume_id TEXT,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      before_text TEXT NOT NULL,
      after_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_improvements_user ON resume_improvements(user_id);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      certificate_code TEXT UNIQUE NOT NULL,
      issue_date TEXT NOT NULL,
      verification_status TEXT DEFAULT 'VERIFIED',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      total_lessons INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      level TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS course_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      lessons_completed INTEGER DEFAULT 0,
      total_lessons INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Not Started',
      completion_date TEXT,
      last_accessed_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cp_user ON course_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_cp_course ON course_progress(course_id);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS proctoring_events (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      details TEXT,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_proctor_assessment ON proctoring_events(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_proctor_type ON proctoring_events(event_type);
  `);
    dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not-verified',
      score INTEGER,
      certificate_id TEXT,
      verified_date TEXT,
      claimed_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, skill_name)
    );
    CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(skill_name);
  `);
    const migrateColumns = [
      "ALTER TABLE visitors ADD COLUMN user_id TEXT;",
      "ALTER TABLE resumes ADD COLUMN user_id TEXT;",
      "ALTER TABLE resume_analyses ADD COLUMN user_id TEXT;",
      "ALTER TABLE verified_skills ADD COLUMN user_id TEXT;",
      "ALTER TABLE assessments ADD COLUMN user_id TEXT;",
      "ALTER TABLE assessments ADD COLUMN termination_reason TEXT;",
      "ALTER TABLE assessments ADD COLUMN proctoring_events_json TEXT;",
      "ALTER TABLE job_searches ADD COLUMN user_id TEXT;",
      "ALTER TABLE job_matches ADD COLUMN user_id TEXT;",
      "ALTER TABLE feedback ADD COLUMN user_id TEXT;",
      "ALTER TABLE users ADD COLUMN password_hash TEXT;",
      "ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'USER';",
      "ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1;",
      "ALTER TABLE users ADD COLUMN last_login_at TEXT;"
    ];
    for (const sql of migrateColumns) {
      try {
        dbInstance.exec(sql);
      } catch {
      }
    }
    ensureAdminUserExists(dbInstance);
    ensureSeedQuestionsAndSkills(dbInstance);
    ensureSeedCourses(dbInstance);
  }
  return dbInstance;
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}
function createSessionToken(admin) {
  const payload = {
    sub: admin.id,
    email: admin.email,
    role: admin.role,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}
function verifySessionToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
function verifyAdminToken(token) {
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified || verified.role !== "ADMIN") return null;
  return verified;
}
function ensureAdminUserExists(db) {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPass) return;
  const existingStmt = db.prepare("SELECT id, password_hash FROM admin_users WHERE email = ?");
  const existing = existingStmt.get(adminEmail);
  const hash = hashPassword(adminPass);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!existing) {
    const insertStmt = db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, role, created_at, updated_at, is_active)
      VALUES (?, ?, ?, 'ADMIN', ?, ?, 1)
    `);
    insertStmt.run(`adm_${Date.now()}`, adminEmail, hash, now, now);
    console.info(`[Smart Resume AI] Initialized admin account from environment: ${adminEmail}`);
  } else {
    const isMatching = verifyPassword(adminPass, existing.password_hash);
    if (!isMatching) {
      db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE id = ?").run(hash, now, existing.id);
      console.info(`[Smart Resume AI] Refreshed password hash for admin: ${adminEmail}`);
    }
  }
}
function ensureSeedQuestionsAndSkills(db) {
  try {
    const skillCount = db.prepare("SELECT COUNT(*) as c FROM skills_catalog").get().c;
    if (skillCount === 0) {
      const insertSkill = db.prepare(`
        INSERT INTO skills_catalog (id, name, slug, category, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `);
      const insertConfig = db.prepare(`
        INSERT INTO assessment_configs (id, skill_slug, questions_count, pass_percentage, time_limit_minutes, created_at, updated_at)
        VALUES (?, ?, 10, 70, 20, ?, ?)
      `);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const s of SEED_SKILLS) {
        const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const skillId = `skl_${slug}`;
        insertSkill.run(skillId, s.name, slug, s.category, s.description, now, now);
        insertConfig.run(`cfg_${slug}`, slug, now, now);
      }
      console.info(`[Smart Resume AI] Initialized skills catalog with ${SEED_SKILLS.length} skills`);
    }
    const qCount = db.prepare("SELECT COUNT(*) as c FROM assessment_questions").get().c;
    if (qCount === 0) {
      const insertQ = db.prepare(`
        INSERT INTO assessment_questions (
          id, skill_slug, skill_name, question_text, question_type,
          difficulty, options_json, correct_answer, explanation,
          time_limit_seconds, is_active, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 120, 1, 0, ?, ?)
      `);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      INITIAL_ASSESSMENT_QUESTIONS.forEach((q, idx) => {
        const slug = q.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const qId = `qst_${slug}_${idx + 1}`;
        const correctLetter = `Option ${String.fromCharCode(65 + q.correct_answer_index)}`;
        insertQ.run(
          qId,
          slug,
          q.skill,
          q.question_text,
          q.question_type,
          q.difficulty,
          JSON.stringify(q.options),
          correctLetter,
          q.explanation,
          now,
          now
        );
      });
      console.info(`[Smart Resume AI] Initialized assessment question bank with ${INITIAL_ASSESSMENT_QUESTIONS.length} questions`);
    }
  } catch (err) {
    console.error("[Smart Resume AI] Error initializing seed questions/skills:", err);
  }
}
function ensureSeedCourses(db) {
  try {
    const count = db.prepare("SELECT COUNT(*) as c FROM courses").get().c;
    if (count === 0) {
      const stmt = db.prepare(`
        INSERT INTO courses (id, slug, title, category, description, total_lessons, duration_minutes, level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const c of SEED_COURSES) {
        stmt.run(c.id, c.slug, c.title, c.category, c.description, c.totalLessons, c.durationMinutes, c.level, now);
      }
      console.info(`[Smart Resume AI] Initialized career courses catalog with ${SEED_COURSES.length} courses`);
    }
  } catch (err) {
    console.error("[Smart Resume AI] Error initializing seed courses:", err);
  }
}
async function logAuditEvent(data) {
  const db = getDb2();
  const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await db.prepare(`
      INSERT INTO audit_events (id, event_type, actor_type, actor_id, description, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.eventType,
      data.actorType || "SYSTEM",
      data.actorId || null,
      data.description,
      data.metadata ? JSON.stringify(data.metadata) : null,
      now
    );
  } catch (err) {
    console.error("[DB Audit Event Error] Failed to record audit event:", err);
  }
  return id;
}
function formatAuditEventTitle(eventType) {
  switch (eventType) {
    case "RESUME_ANALYZED":
      return "Resume Analyzed";
    case "ASSESSMENT_STARTED":
      return "Assessment Started";
    case "ASSESSMENT_COMPLETED":
      return "Assessment Completed";
    case "SKILL_VERIFIED":
      return "Skill Badge Verified";
    case "JOB_SEARCHED":
      return "Job Search Executed";
    case "JOB_MATCHED":
      return "Job Match Recorded";
    case "FEEDBACK_SUBMITTED":
      return "User Feedback Received";
    case "ADMIN_LOGIN":
      return "Admin Session Initialized";
    case "QUESTION_CREATED":
      return "Question Added to Bank";
    case "QUESTION_UPDATED":
      return "Question Updated";
    case "QUESTION_STATUS_CHANGED":
      return "Question Status Updated";
    case "QUESTION_DELETED":
      return "Question Soft-Deleted";
    case "SKILL_STATUS_CHANGED":
      return "Skill Status Updated";
    case "ASSESSMENT_CONFIG_UPDATED":
      return "Assessment Config Updated";
    default:
      return eventType.replace(/_/g, " ");
  }
}
async function getRealAuditEvents(limit = 20) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT id, event_type, actor_type, actor_id, description, metadata_json, created_at
    FROM audit_events
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
  return rows.map((r) => ({
    id: r.id,
    eventType: r.event_type,
    actorType: r.actor_type,
    actorId: r.actor_id,
    description: r.description,
    metadata: r.metadata_json ? JSON.parse(r.metadata_json) : null,
    createdAt: r.created_at,
    timeAgo: formatTimeAgo(r.created_at)
  }));
}
async function getUserNameById(userId) {
  if (!userId) return null;
  const db = getDb2();
  try {
    const row = await db.prepare("SELECT name FROM users WHERE id = ?").get(userId);
    return row?.name || null;
  } catch {
    return null;
  }
}
async function registerUser(data) {
  const db = getDb2();
  const trimmedName = (data.name || "").trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Please enter a valid full name (at least 2 characters).");
  }
  if (trimmedName.length > 70) {
    throw new Error("Full name cannot exceed 70 characters.");
  }
  const trimmedEmail = (data.email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    throw new Error("Please provide a valid email address.");
  }
  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
  const existing = await db.prepare("SELECT id, email, password_hash, role, is_active, created_at FROM users WHERE LOWER(email) = ?").get(trimmedEmail);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let userId;
  let createdAt = now;
  if (existing) {
    if (existing.password_hash) {
      throw new Error("An account with this email already exists. Please sign in instead.");
    }
    userId = existing.id;
    createdAt = existing.created_at || now;
    const passwordHash2 = hashPassword(data.password);
    const sessionToken2 = createSessionToken({ id: userId, email: trimmedEmail, role: "USER" });
    await db.prepare(`
      UPDATE users
      SET name = ?, password_hash = ?, role = 'USER', is_active = 1,
          session_token = ?, updated_at = ?, last_login_at = ?, last_active_at = ?
      WHERE id = ?
    `).run(trimmedName, passwordHash2, sessionToken2, now, now, now, userId);
    await logAuditEvent({
      eventType: "USER_REGISTERED",
      actorType: "USER",
      actorId: userId,
      description: `${trimmedName} registered an account`,
      metadata: { userId, email: trimmedEmail, name: trimmedName }
    });
    return {
      user: {
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
        role: "USER",
        isActive: true,
        createdAt,
        updatedAt: now,
        lastLoginAt: now,
        lastActiveAt: now
      },
      sessionToken: sessionToken2
    };
  }
  userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const passwordHash = hashPassword(data.password);
  const sessionToken = createSessionToken({ id: userId, email: trimmedEmail, role: "USER" });
  await db.prepare(`
    INSERT INTO users (
      id, name, email, password_hash, role, is_active, session_token,
      created_at, updated_at, last_login_at, last_active_at
    ) VALUES (?, ?, ?, ?, 'USER', 1, ?, ?, ?, ?, ?)
  `).run(userId, trimmedName, trimmedEmail, passwordHash, sessionToken, now, now, now, now);
  if (data.visitorId) {
    try {
      await db.prepare("UPDATE visitors SET user_id = ? WHERE id = ? OR anonymous_id = ?").run(userId, data.visitorId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - visitors]:", e?.message);
    }
    try {
      await db.prepare("UPDATE resumes SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - resumes]:", e?.message);
    }
    try {
      await db.prepare("UPDATE resume_analyses SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - analyses]:", e?.message);
    }
    try {
      await db.prepare("UPDATE verified_skills SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - skills]:", e?.message);
    }
    try {
      await db.prepare("UPDATE assessments SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - assessments]:", e?.message);
    }
    try {
      await db.prepare("UPDATE job_searches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - searches]:", e?.message);
    }
    try {
      await db.prepare("UPDATE job_matches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - matches]:", e?.message);
    }
    try {
      await db.prepare("UPDATE feedback SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(userId, data.visitorId);
    } catch (e) {
      console.log("[visitor migration error - feedback]:", e?.message);
    }
  }
  await logAuditEvent({
    eventType: "USER_REGISTERED",
    actorType: "USER",
    actorId: userId,
    description: `${trimmedName} registered an account`,
    metadata: { userId, email: trimmedEmail, name: trimmedName }
  });
  return {
    user: {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      role: "USER",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      lastActiveAt: now
    },
    sessionToken
  };
}
async function loginUser(data) {
  const db = getDb2();
  const trimmedEmail = (data.email || "").trim().toLowerCase();
  const trimmedPass = data.password || "";
  if (!trimmedEmail || !trimmedPass) {
    throw new Error("Please enter both email and password.");
  }
  const user = await db.prepare(`
    SELECT id, name, email, password_hash, role, is_active, created_at, updated_at, last_login_at, last_active_at
    FROM users
    WHERE LOWER(email) = ?
  `).get(trimmedEmail);
  if (!user || !user.password_hash) {
    throw new Error("Invalid email or password.");
  }
  if (user.is_active === 0) {
    throw new Error("This account has been deactivated. Please contact support.");
  }
  const isValid = verifyPassword(trimmedPass, user.password_hash);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const sessionToken = createSessionToken({
    id: user.id,
    email: user.email,
    role: user.role || "USER"
  });
  await db.prepare(`
    UPDATE users
    SET session_token = ?, last_login_at = ?, last_active_at = ?, updated_at = ?
    WHERE id = ?
  `).run(sessionToken, now, now, now, user.id);
  console.log("[DEBUG loginUser] 9. updated session_token");
  await logAuditEvent({
    eventType: "USER_LOGGED_IN",
    actorType: "USER",
    actorId: user.id,
    description: `${user.name} logged into their dashboard`,
    metadata: { userId: user.id, email: user.email }
  });
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "USER",
      isActive: true,
      createdAt: user.created_at,
      updatedAt: now,
      lastLoginAt: now,
      lastActiveAt: now
    },
    sessionToken
  };
}
async function getUserBySession(token) {
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified || !verified.sub) return null;
  const db = getDb2();
  try {
    const row = await db.prepare(`
      SELECT id, name, email, role, is_active, session_token, created_at, updated_at, last_login_at, last_active_at
      FROM users
      WHERE id = ?
    `).get(verified.sub);
    if (!row || row.is_active === 0) return null;
    if (!row.session_token || row.session_token.startsWith("revoked_")) return null;
    if (row.session_token !== token) return null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      await db.prepare("UPDATE users SET last_active_at = ? WHERE id = ?").run(now, row.id);
    } catch {
    }
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || "USER",
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastActiveAt: now
    };
  } catch (err) {
    console.error("Error fetching user by session:", err);
    return null;
  }
}
async function logoutUser(token) {
  if (!token) return;
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const verified = verifySessionToken(token);
    const randSuffix = Math.random().toString(36).substring(2, 10);
    const revokedToken = `revoked_${verified?.sub || randSuffix}_${Date.now()}`;
    if (verified && verified.sub) {
      await db.prepare(`
        UPDATE users
        SET session_token = ?, updated_at = ?
        WHERE id = ?
      `).run(revokedToken, now, verified.sub);
    } else {
      await db.prepare(`
        UPDATE users
        SET session_token = ?, updated_at = ?
        WHERE session_token = ?
      `).run(revokedToken, now, token);
    }
  } catch (err) {
    console.log("[Auth logoutUser Error]:", err?.message || String(err));
  }
}
async function getUserBySessionToken(sessionToken) {
  if (!sessionToken) return null;
  if (sessionToken.includes(".")) {
    return await getUserBySession(sessionToken);
  }
  const db = getDb2();
  try {
    const row = await db.prepare("SELECT id, name, email, role, is_active, created_at, updated_at, last_login_at, last_active_at FROM users WHERE session_token = ?").get(sessionToken);
    if (!row || row.is_active === 0) return null;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      await db.prepare("UPDATE users SET last_active_at = ? WHERE id = ?").run(now, row.id);
    } catch {
    }
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || "USER",
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastActiveAt: now
    };
  } catch (err) {
    console.error("Error fetching user by session token:", err);
    return null;
  }
}
async function getUserById(id) {
  if (!id) return null;
  const db = getDb2();
  try {
    const row = await db.prepare("SELECT id, name, email, role, is_active, created_at, updated_at, last_login_at, last_active_at FROM users WHERE id = ?").get(id);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role || "USER",
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastLoginAt: row.last_login_at,
      lastActiveAt: row.last_active_at
    };
  } catch {
    return null;
  }
}
async function updateUserProfile(userId, data) {
  const db = getDb2();
  const trimmedName = (data.name || "").trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }
  if (trimmedName.length > 70) {
    throw new Error("Name cannot exceed 70 characters.");
  }
  const existingUser = await db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  if (!existingUser) {
    throw new Error("User not found.");
  }
  let finalEmail = existingUser.email;
  if (data.email) {
    const trimmedEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error("Please enter a valid email address.");
    }
    const emailCheck = await db.prepare("SELECT id FROM users WHERE LOWER(email) = ? AND id != ?").get(trimmedEmail, userId);
    if (emailCheck) {
      throw new Error("Email address is already in use by another account.");
    }
    finalEmail = trimmedEmail;
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(`
    UPDATE users
    SET name = ?, email = ?, updated_at = ?, last_active_at = ?
    WHERE id = ?
  `).run(trimmedName, finalEmail, now, now, userId);
  return {
    id: userId,
    name: trimmedName,
    email: finalEmail,
    role: existingUser.role || "USER",
    isActive: Boolean(existingUser.is_active),
    createdAt: existingUser.created_at,
    updatedAt: now,
    lastLoginAt: existingUser.last_login_at,
    lastActiveAt: now
  };
}
async function changeUserPassword(userId, currentPass, newPass) {
  const db = getDb2();
  const user = await db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId);
  if (!user || !user.password_hash) {
    throw new Error("User account not found.");
  }
  if (!verifyPassword(currentPass, user.password_hash)) {
    throw new Error("Current password does not match.");
  }
  if (!newPass || newPass.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }
  const newHash = hashPassword(newPass);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(newHash, now, userId);
  return true;
}
async function createOrUpdateUserProfile(data) {
  const db = getDb2();
  const trimmedName = (data.name || "").trim();
  if (!trimmedName || trimmedName.length < 2) {
    throw new Error("Please enter a valid full name with at least 2 characters.");
  }
  if (trimmedName.length > 60) {
    throw new Error("Full name cannot exceed 60 characters.");
  }
  const trimmedEmail = data.email && typeof data.email === "string" ? data.email.trim().toLowerCase() : null;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (data.sessionToken) {
    const existing = await db.prepare("SELECT id, session_token FROM users WHERE session_token = ?").get(data.sessionToken);
    if (existing) {
      await db.prepare(`
        UPDATE users
        SET name = ?, email = COALESCE(?, email), updated_at = ?, last_active_at = ?
        WHERE id = ?
      `).run(trimmedName, trimmedEmail, now, now, existing.id);
      return {
        id: existing.id,
        name: trimmedName,
        email: trimmedEmail,
        sessionToken: existing.session_token
      };
    }
  }
  const id = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const sessionToken = crypto.randomBytes(24).toString("hex");
  await db.prepare(`
    INSERT INTO users (id, name, email, session_token, created_at, updated_at, last_active_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, trimmedName, trimmedEmail, sessionToken, now, now, now);
  if (data.visitorId) {
    try {
      await db.prepare("UPDATE visitors SET user_id = ? WHERE id = ? OR anonymous_id = ?").run(id, data.visitorId, data.visitorId);
      await db.prepare("UPDATE resumes SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      await db.prepare("UPDATE resume_analyses SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      await db.prepare("UPDATE verified_skills SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      await db.prepare("UPDATE assessments SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      await db.prepare("UPDATE job_searches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      await db.prepare("UPDATE job_matches SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
      await db.prepare("UPDATE feedback SET user_id = ? WHERE visitor_id = ? AND (user_id IS NULL OR user_id = '')").run(id, data.visitorId);
    } catch (e) {
      console.error("Error linking visitor activity to user:", e);
    }
  }
  return {
    id,
    name: trimmedName,
    email: trimmedEmail,
    sessionToken
  };
}
async function trackVisitor(anonymousId, userAgent = "") {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await db.prepare("SELECT id, total_sessions FROM visitors WHERE anonymous_id = ?").get(anonymousId);
  if (existing) {
    await db.prepare("UPDATE visitors SET last_seen_at = ?, total_sessions = total_sessions + 1, updated_at = ? WHERE id = ?").run(now, now, existing.id);
    return existing.id;
  }
  const id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.prepare(`
    INSERT INTO visitors (id, anonymous_id, first_seen_at, last_seen_at, total_sessions, user_agent, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?, ?)
  `).run(id, anonymousId, now, now, userAgent.slice(0, 255), now, now);
  return id;
}
async function recordResumeUpload(data) {
  const db = getDb2();
  const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = data.userId || (data.visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(data.visitorId, data.visitorId))?.user_id : null);
  await db.prepare(`
    INSERT INTO resumes (id, visitor_id, user_id, filename, file_type, uploaded_at, parsed_successfully, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.filename,
    data.fileType,
    now,
    data.parsedSuccessfully ? 1 : 0,
    now
  );
  return id;
}
async function recordResumeAnalysis(data) {
  const db = getDb2();
  const id = `anl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = data.userId || (data.visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(data.visitorId, data.visitorId))?.user_id : null);
  const userName = await getUserNameById(effectiveUserId);
  const actorName = userName || "Name not provided";
  await db.prepare(`
    INSERT INTO resume_analyses (
      id, visitor_id, user_id, resume_id, file_type, analyzed_at,
      ats_score, keyword_score, formatting_score, section_score,
      analysis_status, detected_keywords, missing_keywords, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.resumeId || null,
    data.fileType,
    now,
    data.atsScore,
    data.keywordScore,
    data.formattingScore,
    data.sectionScore,
    data.analysisStatus,
    JSON.stringify(data.detectedKeywords || []),
    JSON.stringify(data.missingKeywords || []),
    now
  );
  if (effectiveUserId && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    try {
      const insertImp = await db.prepare(`
        INSERT INTO resume_improvements (id, user_id, resume_id, category, title, before_text, after_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const rec of data.recommendations) {
        if (!rec.title) continue;
        const impId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await insertImp.run(
          impId,
          effectiveUserId,
          data.resumeId || null,
          rec.category || "ATS Optimization",
          rec.title,
          rec.originalText || "Previous unoptimized phrasing or missing bullet points",
          rec.improvedText || rec.actionText || "Optimized industry-standard action impact phrasing",
          now
        );
      }
    } catch (e) {
      console.error("Error inserting auto improvements:", e);
    }
  }
  await logAuditEvent({
    eventType: "RESUME_ANALYZED",
    actorType: effectiveUserId ? "USER" : "VISITOR",
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} analyzed resume (${data.fileType.toUpperCase()}) with ATS score ${data.atsScore}/100`,
    metadata: { analysisId: id, atsScore: data.atsScore, fileType: data.fileType, userId: effectiveUserId, userName }
  });
  return id;
}
async function recordAssessmentEvent(data) {
  const db = getDb2();
  const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = data.userId || (data.visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(data.visitorId, data.visitorId))?.user_id : null);
  const userName = await getUserNameById(effectiveUserId);
  const actorName = userName || "Name not provided";
  await db.prepare(`
    INSERT INTO assessments (
      id, visitor_id, user_id, skill, score, total_questions,
      passed, status, duration_seconds, started_at, completed_at,
      proctoring_violation_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.skill,
    data.score,
    data.totalQuestions,
    data.passed ? 1 : 0,
    data.status,
    data.durationSeconds || 0,
    data.startedAt || now,
    data.completedAt || now,
    data.proctoringViolationCount || 0,
    now
  );
  if (data.passed) {
    const vsId = `vsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO verified_skills (id, visitor_id, user_id, skill_name, status, assessment_id, verified_at, created_at)
      VALUES (?, ?, ?, ?, 'VERIFIED', ?, ?, ?)
    `).run(vsId, data.visitorId || null, effectiveUserId || null, data.skill, id, now, now);
    await logAuditEvent({
      eventType: "SKILL_VERIFIED",
      actorType: effectiveUserId ? "USER" : "VISITOR",
      actorId: effectiveUserId || data.visitorId,
      description: `${actorName} verified skill "${data.skill}" with score ${data.score}/${data.totalQuestions}`,
      metadata: { skill: data.skill, assessmentId: id, score: data.score, userId: effectiveUserId, userName }
    });
  }
  await logAuditEvent({
    eventType: "ASSESSMENT_COMPLETED",
    actorType: effectiveUserId ? "USER" : "VISITOR",
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} completed ${data.skill} assessment: ${data.score}/${data.totalQuestions} (${data.passed ? "PASSED" : "FAILED"})`,
    metadata: { assessmentId: id, skill: data.skill, score: data.score, passed: data.passed, userId: effectiveUserId, userName }
  });
  return id;
}
async function recordJobSearchEvent(data) {
  const db = getDb2();
  const id = `jsr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = data.userId || (data.visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(data.visitorId, data.visitorId))?.user_id : null);
  const userName = await getUserNameById(effectiveUserId);
  const actorName = userName || "Name not provided";
  await db.prepare(`
    INSERT INTO job_searches (id, visitor_id, user_id, query, location, provider, results_count, searched_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.query,
    data.location || "India",
    data.provider,
    data.resultsCount,
    now,
    now
  );
  await logAuditEvent({
    eventType: "JOB_SEARCHED",
    actorType: effectiveUserId ? "USER" : "VISITOR",
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} searched jobs: "${data.query}" in ${data.location || "India"} (${data.resultsCount} found on ${data.provider})`,
    metadata: { query: data.query, location: data.location, count: data.resultsCount, provider: data.provider, userId: effectiveUserId, userName }
  });
  return id;
}
async function recordJobMatchEvent(data) {
  const db = getDb2();
  const id = `jmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = data.userId || (data.visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(data.visitorId, data.visitorId))?.user_id : null);
  const userName = await getUserNameById(effectiveUserId);
  const actorName = userName || "Name not provided";
  await db.prepare(`
    INSERT INTO job_matches (
      id, visitor_id, user_id, resume_id, job_id, job_title, company,
      match_score, matched_skills, partial_skills, missing_skills, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.resumeId || null,
    data.jobId || null,
    data.jobTitle || "Role",
    data.company || "Company",
    data.matchScore,
    JSON.stringify(data.matchedSkills || []),
    JSON.stringify(data.partialSkills || []),
    JSON.stringify(data.missingSkills || []),
    now
  );
  await logAuditEvent({
    eventType: "JOB_MATCHED",
    actorType: effectiveUserId ? "USER" : "VISITOR",
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} matched job "${data.jobTitle || "Role"}" at ${data.company || "Company"} with score ${Math.round(data.matchScore)}%`,
    metadata: { jobTitle: data.jobTitle, company: data.company, score: data.matchScore, userId: effectiveUserId, userName }
  });
  return id;
}
async function recordFeedbackEvent(data) {
  const db = getDb2();
  const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = data.userId || (data.visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(data.visitorId, data.visitorId))?.user_id : null);
  const userName = await getUserNameById(effectiveUserId);
  const actorName = userName || "Name not provided";
  await db.prepare(`
    INSERT INTO feedback (id, visitor_id, user_id, rating, category, message, suggestions, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)
  `).run(
    id,
    data.visitorId || null,
    effectiveUserId || null,
    data.rating,
    data.category,
    data.message,
    data.suggestions || null,
    now
  );
  await logAuditEvent({
    eventType: "FEEDBACK_SUBMITTED",
    actorType: effectiveUserId ? "USER" : "VISITOR",
    actorId: effectiveUserId || data.visitorId,
    description: `${actorName} submitted feedback (${data.rating}\u2605, ${data.category}): "${data.message.slice(0, 50)}"`,
    metadata: { rating: data.rating, category: data.category, userId: effectiveUserId, userName }
  });
  return id;
}
async function getRealAdminStats() {
  const db = getDb2();
  const visitorsCount = (await db.prepare("SELECT COUNT(*) as c FROM visitors").get()).c;
  const analysesCount = (await db.prepare("SELECT COUNT(*) as c FROM resume_analyses").get()).c;
  const avgAts = (await db.prepare("SELECT ROUND(AVG(ats_score), 1) as a FROM resume_analyses").get()).a || 0;
  const verifiedCount = (await db.prepare("SELECT COUNT(*) as c FROM verified_skills WHERE status = 'VERIFIED'").get()).c;
  const assessmentsCount = (await db.prepare("SELECT COUNT(*) as c FROM assessments WHERE status IN ('passed', 'completed')").get()).c;
  const jobSearchesCount = (await db.prepare("SELECT COUNT(*) as c FROM job_searches").get()).c;
  const jobMatchesCount = (await db.prepare("SELECT COUNT(*) as c FROM job_matches").get()).c;
  const feedbackCount = (await db.prepare("SELECT COUNT(*) as c FROM feedback").get()).c;
  const atsHistoryRows = await db.prepare(`
    SELECT
      substr(analyzed_at, 1, 10) as date,
      ROUND(AVG(ats_score), 1) as avgScore,
      ROUND(AVG(formatting_score), 1) as avgFormatting,
      ROUND(AVG(keyword_score), 1) as avgKeywords
    FROM resume_analyses
    GROUP BY substr(analyzed_at, 1, 10)
    ORDER BY date ASC
    LIMIT 14
  `).all();
  const skillMasteryRows = await db.prepare(`
    SELECT
      skill,
      COUNT(*) as count,
      ROUND(AVG(score * 10), 1) as avgScore
    FROM assessments
    WHERE passed = 1
    GROUP BY skill
    ORDER BY count DESC
    LIMIT 8
  `).all();
  const auditRows = await db.prepare(`
    SELECT
      a.id,
      a.event_type,
      a.actor_type,
      a.actor_id,
      a.description,
      a.created_at,
      u.name as user_name
    FROM audit_events a
    LEFT JOIN users u ON a.actor_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 10
  `).all();
  const activities = auditRows.map((row) => ({
    id: row.id,
    type: row.event_type.toLowerCase(),
    title: formatAuditEventTitle(row.event_type),
    description: row.description,
    userName: row.user_name || "Name not provided",
    timestamp: formatTimeAgo(row.created_at)
  }));
  const qBankStats = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
      COUNT(DISTINCT skill_slug) as skillsCovered
    FROM assessment_questions
    WHERE is_deleted = 0
  `).get();
  const usersCount = (await db.prepare("SELECT COUNT(*) as c FROM users").get()).c;
  return {
    totalVisitors: usersCount > 0 ? usersCount : visitorsCount,
    totalResumesAnalyzed: analysesCount,
    averageAtsScore: avgAts,
    verifiedSkillsCount: verifiedCount,
    completedAssessmentsCount: assessmentsCount,
    totalJobSearches: jobSearchesCount,
    totalJobMatches: jobMatchesCount,
    totalFeedback: feedbackCount,
    atsHistory: atsHistoryRows,
    skillMastery: skillMasteryRows,
    recentActivities: activities,
    questionBankStats: {
      totalQuestions: qBankStats?.total || 0,
      activeQuestions: qBankStats?.active || 0,
      inactiveQuestions: qBankStats?.inactive || 0,
      skillsCovered: qBankStats?.skillsCovered || 0
    }
  };
}
function formatTimeAgo(dateStr) {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1e3);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  } catch {
    return "Recently";
  }
}
async function getAdminByEmail(email) {
  const db = getDb2();
  return await db.prepare("SELECT id, email, password_hash, role, is_active, last_login_at, created_at FROM admin_users WHERE email = ?").get(email.trim().toLowerCase());
}
async function recordAdminLogin(id) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare("UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(now, now, id);
}
async function getAdminUsers(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.created_at,
      u.last_active_at,
      (SELECT COUNT(*) FROM resumes WHERE user_id = u.id) as resumes_count,
      (SELECT COUNT(*) FROM resume_analyses WHERE user_id = u.id) as analyses_count,
      (SELECT COUNT(*) FROM job_searches WHERE user_id = u.id) as searches_count,
      (SELECT COUNT(*) FROM assessments WHERE user_id = u.id) as assessments_count,
      (SELECT COUNT(*) FROM verified_skills WHERE user_id = u.id AND status = 'VERIFIED') as verified_skills_count
    FROM users u
    ORDER BY u.last_active_at DESC
    LIMIT ?
  `).all(limit);
}
async function getAdminUserDetail(userId) {
  const db = getDb2();
  const user = await db.prepare("SELECT id, name, email, created_at, last_active_at FROM users WHERE id = ?").get(userId);
  if (!user) return null;
  const resumes = await db.prepare("SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC").all(userId);
  const analyses = await db.prepare(`
    SELECT a.*, r.filename
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.user_id = ?
    ORDER BY a.analyzed_at DESC
  `).all(userId);
  const assessments = await db.prepare("SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  const verifiedSkills = await db.prepare("SELECT * FROM verified_skills WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  const searches = await db.prepare("SELECT * FROM job_searches WHERE user_id = ? ORDER BY searched_at DESC").all(userId);
  const matches = await db.prepare("SELECT * FROM job_matches WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  const feedbackList = await db.prepare("SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  return {
    user,
    resumes,
    analyses,
    assessments,
    verifiedSkills,
    searches,
    matches,
    feedback: feedbackList
  };
}
async function getAdminVisitors(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      v.id,
      v.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      u.email as user_email,
      v.first_seen_at,
      v.last_seen_at,
      v.total_sessions,
      v.user_agent,
      (SELECT COUNT(*) FROM resume_analyses WHERE visitor_id = v.id OR user_id = v.user_id) as analyses_count,
      (SELECT COUNT(*) FROM assessments WHERE visitor_id = v.id OR user_id = v.user_id) as assessments_count,
      (SELECT COUNT(*) FROM job_searches WHERE visitor_id = v.id OR user_id = v.user_id) as searches_count,
      (SELECT COUNT(*) FROM feedback WHERE visitor_id = v.id OR user_id = v.user_id) as feedback_count
    FROM visitors v
    LEFT JOIN users u ON v.user_id = u.id
    ORDER BY v.last_seen_at DESC
    LIMIT ?
  `).all(limit);
}
async function getVisitorActivity(visitorId) {
  const db = getDb2();
  const visitor = await db.prepare("SELECT * FROM visitors WHERE id = ? OR anonymous_id = ? OR user_id = ?").get(visitorId, visitorId, visitorId);
  if (!visitor) return null;
  const actualId = visitor.id;
  const userId = visitor.user_id;
  const resumes = await db.prepare("SELECT * FROM resumes WHERE visitor_id = ? OR user_id = ? ORDER BY uploaded_at DESC").all(actualId, userId || actualId);
  const analyses = await db.prepare("SELECT * FROM resume_analyses WHERE visitor_id = ? OR user_id = ? ORDER BY analyzed_at DESC").all(actualId, userId || actualId);
  const assessments = await db.prepare("SELECT * FROM assessments WHERE visitor_id = ? OR user_id = ? ORDER BY completed_at DESC").all(actualId, userId || actualId);
  const searches = await db.prepare("SELECT * FROM job_searches WHERE visitor_id = ? OR user_id = ? ORDER BY searched_at DESC").all(actualId, userId || actualId);
  const matches = await db.prepare("SELECT * FROM job_matches WHERE visitor_id = ? OR user_id = ? ORDER BY created_at DESC").all(actualId, userId || actualId);
  const feedbackList = await db.prepare("SELECT * FROM feedback WHERE visitor_id = ? OR user_id = ? ORDER BY created_at DESC").all(actualId, userId || actualId);
  return {
    visitor,
    resumes,
    analyses,
    assessments,
    searches,
    matches,
    feedback: feedbackList
  };
}
async function getAdminResumeAnalyses(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      a.id,
      a.visitor_id,
      a.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      a.resume_id,
      r.filename,
      a.file_type,
      a.ats_score,
      a.keyword_score,
      a.formatting_score,
      a.section_score,
      a.analysis_status,
      a.detected_keywords,
      a.missing_keywords,
      a.analyzed_at
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.analyzed_at DESC
    LIMIT ?
  `).all(limit);
}
async function getAdminVerifiedSkills(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      s.id,
      s.visitor_id,
      s.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      s.skill_name,
      s.status,
      s.assessment_id,
      s.verified_at,
      s.created_at,
      a.score,
      a.total_questions
    FROM verified_skills s
    LEFT JOIN assessments a ON s.assessment_id = a.id
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT ?
  `).all(limit);
}
async function getAdminAssessments(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      a.id,
      a.visitor_id,
      a.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      a.skill,
      a.score,
      a.total_questions,
      a.passed,
      a.status,
      a.duration_seconds,
      a.started_at,
      a.completed_at,
      a.proctoring_violation_count,
      a.created_at
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `).all(limit);
}
async function getAdminJobSearches(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      j.id,
      j.visitor_id,
      j.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      j.query,
      j.location,
      j.provider,
      j.results_count,
      j.searched_at
    FROM job_searches j
    LEFT JOIN users u ON j.user_id = u.id
    ORDER BY j.searched_at DESC
    LIMIT ?
  `).all(limit);
}
async function getAdminJobMatches(limit = 100) {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      m.id,
      m.visitor_id,
      m.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      m.resume_id,
      m.job_id,
      m.job_title,
      m.company,
      m.match_score,
      m.matched_skills,
      m.partial_skills,
      m.missing_skills,
      m.created_at
    FROM job_matches m
    LEFT JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
    LIMIT ?
  `).all(limit);
}
async function getAdminFeedback(limit = 100, statusFilter) {
  const db = getDb2();
  if (statusFilter && statusFilter !== "all") {
    return await db.prepare(`
      SELECT
        f.id,
        f.visitor_id,
        f.user_id,
        COALESCE(u.name, 'Name not provided') as user_name,
        f.rating,
        f.category,
        f.message,
        f.suggestions,
        f.status,
        f.created_at
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.status = ?
      ORDER BY f.created_at DESC
      LIMIT ?
    `).all(statusFilter, limit);
  }
  return await db.prepare(`
    SELECT
      f.id,
      f.visitor_id,
      f.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      f.rating,
      f.category,
      f.message,
      f.suggestions,
      f.status,
      f.created_at
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
    LIMIT ?
  `).all(limit);
}
async function updateFeedbackStatus(id, status) {
  const db = getDb2();
  const res = await db.prepare("UPDATE feedback SET status = ? WHERE id = ?").run(status, id);
  return res.changes > 0;
}
async function getDetailedAnalytics() {
  const db = getDb2();
  const totalResumes = (await db.prepare("SELECT COUNT(*) as c FROM resumes").get()).c;
  const pdfCount = (await db.prepare("SELECT COUNT(*) as c FROM resumes WHERE LOWER(file_type) LIKE '%pdf%'").get()).c;
  const docxCount = (await db.prepare("SELECT COUNT(*) as c FROM resumes WHERE LOWER(file_type) LIKE '%doc%'").get()).c;
  const successfulAnalyses = (await db.prepare("SELECT COUNT(*) as c FROM resume_analyses WHERE analysis_status = 'COMPLETED'").get()).c;
  const failedAnalyses = (await db.prepare("SELECT COUNT(*) as c FROM resume_analyses WHERE analysis_status != 'COMPLETED'").get()).c;
  const scoreStats = await db.prepare(`
    SELECT
      ROUND(AVG(ats_score), 1) as avgAts,
      ROUND(AVG(keyword_score), 1) as avgKeywords,
      ROUND(AVG(formatting_score), 1) as avgFormatting,
      ROUND(AVG(section_score), 1) as avgSection
    FROM resume_analyses
  `).get();
  const totalSearches = (await db.prepare("SELECT COUNT(*) as c FROM job_searches").get()).c;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const searchesToday = (await db.prepare("SELECT COUNT(*) as c FROM job_searches WHERE substr(searched_at, 1, 10) = ?").get(todayStr)).c;
  const pastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString().slice(0, 10);
  const searchesThisWeek = (await db.prepare("SELECT COUNT(*) as c FROM job_searches WHERE substr(searched_at, 1, 10) >= ?").get(pastWeekDate)).c;
  const topJobTitles = await db.prepare(`
    SELECT query as title, COUNT(*) as count
    FROM job_searches
    GROUP BY query
    ORDER BY count DESC
    LIMIT 5
  `).all();
  const topLocations = await db.prepare(`
    SELECT location, COUNT(*) as count
    FROM job_searches
    WHERE location IS NOT NULL AND location != ''
    GROUP BY location
    ORDER BY count DESC
    LIMIT 5
  `).all();
  const providerCounts = await db.prepare(`
    SELECT provider, COUNT(*) as count, SUM(results_count) as totalResults
    FROM job_searches
    GROUP BY provider
    ORDER BY count DESC
  `).all();
  const avgJobsReturned = (await db.prepare("SELECT ROUND(AVG(results_count), 1) as avg FROM job_searches").get()).avg || 0;
  const totalAssessments = (await db.prepare("SELECT COUNT(*) as c FROM assessments").get()).c;
  const completedAssessments = (await db.prepare("SELECT COUNT(*) as c FROM assessments WHERE status IN ('passed', 'completed', 'failed')").get()).c;
  const passedAssessments = (await db.prepare("SELECT COUNT(*) as c FROM assessments WHERE passed = 1").get()).c;
  const failedAssessments = (await db.prepare("SELECT COUNT(*) as c FROM assessments WHERE passed = 0").get()).c;
  const passRate = completedAssessments > 0 ? Math.round(passedAssessments / completedAssessments * 100) : 0;
  const assessmentScoreStats = await db.prepare(`
    SELECT
      ROUND(AVG(score * 10), 1) as avgScore,
      ROUND(AVG(duration_seconds), 0) as avgDuration
    FROM assessments
  `).get();
  const topVerifiedSkills = await db.prepare(`
    SELECT skill_name as skill, COUNT(*) as count
    FROM verified_skills
    WHERE status = 'VERIFIED'
    GROUP BY skill_name
    ORDER BY count DESC
    LIMIT 6
  `).all();
  return {
    resumeAnalytics: {
      totalResumes,
      pdfCount,
      docxCount,
      successfulAnalyses,
      failedAnalyses,
      avgAtsScore: scoreStats.avgAts || 0,
      avgKeywordScore: scoreStats.avgKeywords || 0,
      avgFormattingScore: scoreStats.avgFormatting || 0,
      avgSectionScore: scoreStats.avgSection || 0
    },
    jobAnalytics: {
      totalSearches,
      searchesToday,
      searchesThisWeek,
      topJobTitles,
      topLocations,
      providerCounts,
      avgJobsReturned
    },
    assessmentAnalytics: {
      totalAssessments,
      completedAssessments,
      passedAssessments,
      failedAssessments,
      passRate,
      avgScore: assessmentScoreStats.avgScore || 0,
      avgDurationSeconds: assessmentScoreStats.avgDuration || 0,
      topVerifiedSkills
    }
  };
}
async function getAdminQuestions(options) {
  const db = getDb2();
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 15));
  const offset = (page - 1) * limit;
  const conditions = ["is_deleted = 0"];
  const params = [];
  if (options.skill && options.skill !== "all") {
    conditions.push("(skill_slug = ? OR LOWER(skill_name) = ?)");
    params.push(options.skill.toLowerCase(), options.skill.toLowerCase());
  }
  if (options.difficulty && options.difficulty !== "all") {
    conditions.push("LOWER(difficulty) = ?");
    params.push(options.difficulty.toLowerCase());
  }
  if (options.questionType && options.questionType !== "all") {
    conditions.push("LOWER(question_type) = ?");
    params.push(options.questionType.toLowerCase());
  }
  if (options.status && options.status !== "all") {
    if (options.status === "active") {
      conditions.push("is_active = 1");
    } else if (options.status === "inactive") {
      conditions.push("is_active = 0");
    }
  }
  if (options.search && options.search.trim()) {
    conditions.push("(question_text LIKE ? OR explanation LIKE ?)");
    const term = `%${options.search.trim()}%`;
    params.push(term, term);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countRow = await db.prepare(`SELECT COUNT(*) as c FROM assessment_questions ${whereClause}`).get(...params);
  const total = countRow.c;
  const totalPages = Math.ceil(total / limit) || 1;
  const rows = await db.prepare(`
    SELECT * FROM assessment_questions
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);
  const questions = rows.map((r) => ({
    id: r.id,
    skill_slug: r.skill_slug,
    skill_name: r.skill_name,
    question_text: r.question_text,
    question_type: r.question_type,
    difficulty: r.difficulty,
    options: JSON.parse(r.options_json || "[]"),
    correct_answer: r.correct_answer,
    explanation: r.explanation,
    time_limit_seconds: r.time_limit_seconds,
    is_active: Boolean(r.is_active),
    is_deleted: Boolean(r.is_deleted),
    created_at: r.created_at,
    updated_at: r.updated_at
  }));
  return { questions, total, page, limit, totalPages };
}
async function getQuestionById(id) {
  const db = getDb2();
  const r = await db.prepare("SELECT * FROM assessment_questions WHERE id = ?").get(id);
  if (!r) return null;
  return {
    id: r.id,
    skill_slug: r.skill_slug,
    skill_name: r.skill_name,
    question_text: r.question_text,
    question_type: r.question_type,
    difficulty: r.difficulty,
    options: JSON.parse(r.options_json || "[]"),
    correct_answer: r.correct_answer,
    explanation: r.explanation,
    time_limit_seconds: r.time_limit_seconds,
    is_active: Boolean(r.is_active),
    is_deleted: Boolean(r.is_deleted),
    created_at: r.created_at,
    updated_at: r.updated_at
  };
}
async function createQuestion(data) {
  const db = getDb2();
  const slug = data.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const id = `qst_${slug}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(`
    INSERT INTO assessment_questions (
      id, skill_slug, skill_name, question_text, question_type,
      difficulty, options_json, correct_answer, explanation,
      time_limit_seconds, is_active, is_deleted, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    slug,
    data.skill,
    data.question_text,
    data.question_type || "MCQ",
    data.difficulty || "Medium",
    JSON.stringify(data.options),
    data.correct_answer,
    data.explanation || null,
    data.time_limit_seconds || 120,
    data.is_active !== false ? 1 : 0,
    now,
    now
  );
  await logAuditEvent({
    eventType: "QUESTION_CREATED",
    actorType: "ADMIN",
    description: `Added new question for ${data.skill}: "${data.question_text.slice(0, 50)}..."`,
    metadata: { questionId: id, skill: data.skill, difficulty: data.difficulty }
  });
  return id;
}
async function updateQuestion(id, data) {
  const db = getDb2();
  const existing = await db.prepare("SELECT * FROM assessment_questions WHERE id = ?").get(id);
  if (!existing) return false;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const skill = data.skill || existing.skill_name;
  const slug = skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const questionText = data.question_text !== void 0 ? data.question_text : existing.question_text;
  const questionType = data.question_type !== void 0 ? data.question_type : existing.question_type;
  const difficulty = data.difficulty !== void 0 ? data.difficulty : existing.difficulty;
  const optionsJson = data.options ? JSON.stringify(data.options) : existing.options_json;
  const correctAnswer = data.correct_answer !== void 0 ? data.correct_answer : existing.correct_answer;
  const explanation = data.explanation !== void 0 ? data.explanation : existing.explanation;
  const timeLimitSeconds = data.time_limit_seconds !== void 0 ? data.time_limit_seconds : existing.time_limit_seconds;
  const isActive = data.is_active !== void 0 ? data.is_active ? 1 : 0 : existing.is_active;
  const res = await db.prepare(`
    UPDATE assessment_questions
    SET skill_slug = ?, skill_name = ?, question_text = ?, question_type = ?,
        difficulty = ?, options_json = ?, correct_answer = ?, explanation = ?,
        time_limit_seconds = ?, is_active = ?, updated_at = ?
    WHERE id = ?
  `).run(
    slug,
    skill,
    questionText,
    questionType,
    difficulty,
    optionsJson,
    correctAnswer,
    explanation,
    timeLimitSeconds,
    isActive,
    now,
    id
  );
  await logAuditEvent({
    eventType: "QUESTION_UPDATED",
    actorType: "ADMIN",
    description: `Updated question ${id} (${skill})`,
    metadata: { questionId: id, skill }
  });
  return res.changes > 0;
}
async function toggleQuestionStatus(id, isActive) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const res = await db.prepare("UPDATE assessment_questions SET is_active = ?, updated_at = ? WHERE id = ?").run(isActive ? 1 : 0, now, id);
  if (res.changes > 0) {
    await logAuditEvent({
      eventType: "QUESTION_STATUS_CHANGED",
      actorType: "ADMIN",
      description: `Set question ${id} status to ${isActive ? "ACTIVE" : "INACTIVE"}`,
      metadata: { questionId: id, isActive }
    });
    return true;
  }
  return false;
}
async function softDeleteQuestion(id) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const res = await db.prepare("UPDATE assessment_questions SET is_deleted = 1, is_active = 0, updated_at = ? WHERE id = ?").run(now, id);
  if (res.changes > 0) {
    await logAuditEvent({
      eventType: "QUESTION_DELETED",
      actorType: "ADMIN",
      description: `Soft-deleted question ${id} from question bank`,
      metadata: { questionId: id }
    });
    return true;
  }
  return false;
}
async function getSkillsCatalogWithMetrics() {
  const db = getDb2();
  const skills = await db.prepare("SELECT * FROM skills_catalog ORDER BY name ASC").all();
  return Promise.all(skills.map(async (s) => {
    const slug = s.slug;
    const qStats = await db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN LOWER(difficulty) = 'easy' THEN 1 ELSE 0 END) as easy,
        SUM(CASE WHEN LOWER(difficulty) = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN LOWER(difficulty) = 'hard' THEN 1 ELSE 0 END) as hard
      FROM assessment_questions
      WHERE skill_slug = ? AND is_deleted = 0
    `).get(slug);
    const attemptsCount = (await db.prepare("SELECT COUNT(*) as c FROM assessments WHERE LOWER(skill) = LOWER(?)").get(s.name)).c;
    const verifiedCount = (await db.prepare("SELECT COUNT(*) as c FROM verified_skills WHERE LOWER(skill_name) = LOWER(?) AND status = 'VERIFIED'").get(s.name)).c;
    const config = await db.prepare("SELECT * FROM assessment_configs WHERE skill_slug = ?").get(slug);
    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      is_active: Boolean(s.is_active),
      totalQuestions: qStats?.total || 0,
      activeQuestions: qStats?.active || 0,
      inactiveQuestions: qStats?.inactive || 0,
      easyQuestions: qStats?.easy || 0,
      mediumQuestions: qStats?.medium || 0,
      hardQuestions: qStats?.hard || 0,
      assessmentCount: attemptsCount,
      verifiedCount,
      config: config ? {
        questionsCount: config.questions_count,
        passPercentage: config.pass_percentage,
        timeLimitMinutes: config.time_limit_minutes
      } : {
        questionsCount: 10,
        passPercentage: 70,
        timeLimitMinutes: 20
      }
    };
  }));
}
async function toggleSkillStatus(id, isActive) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const res = await db.prepare("UPDATE skills_catalog SET is_active = ?, updated_at = ? WHERE id = ?").run(isActive ? 1 : 0, now, id);
  if (res.changes > 0) {
    await logAuditEvent({
      eventType: "SKILL_STATUS_CHANGED",
      actorType: "ADMIN",
      description: `Set skill ${id} status to ${isActive ? "ACTIVE" : "INACTIVE"}`,
      metadata: { skillId: id, isActive }
    });
    return true;
  }
  return false;
}
async function updateSkill(id, data) {
  const db = getDb2();
  const existing = await db.prepare("SELECT * FROM skills_catalog WHERE id = ?").get(id);
  if (!existing) return false;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const name = data.name || existing.name;
  const category = data.category || existing.category;
  const description = data.description !== void 0 ? data.description : existing.description;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const res = await db.prepare(`
    UPDATE skills_catalog
    SET name = ?, slug = ?, category = ?, description = ?, updated_at = ?
    WHERE id = ?
  `).run(name, slug, category, description, now, id);
  return res.changes > 0;
}
async function getAssessmentConfigs() {
  const db = getDb2();
  return await db.prepare(`
    SELECT
      c.*,
      s.name as skill_name,
      s.category as skill_category
    FROM assessment_configs c
    LEFT JOIN skills_catalog s ON c.skill_slug = s.slug
    ORDER BY s.name ASC
  `).all();
}
async function updateAssessmentConfig(skillSlug, data) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await db.prepare("SELECT * FROM assessment_configs WHERE skill_slug = ?").get(skillSlug);
  if (existing) {
    const qCount = data.questionsCount !== void 0 ? data.questionsCount : existing.questions_count;
    const pPerc = data.passPercentage !== void 0 ? data.passPercentage : existing.pass_percentage;
    const tLim = data.timeLimitMinutes !== void 0 ? data.timeLimitMinutes : existing.time_limit_minutes;
    await db.prepare(`
      UPDATE assessment_configs
      SET questions_count = ?, pass_percentage = ?, time_limit_minutes = ?, updated_at = ?
      WHERE skill_slug = ?
    `).run(qCount, pPerc, tLim, now, skillSlug);
  } else {
    await db.prepare(`
      INSERT INTO assessment_configs (id, skill_slug, questions_count, pass_percentage, time_limit_minutes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(`cfg_${skillSlug}`, skillSlug, data.questionsCount || 10, data.passPercentage || 70, data.timeLimitMinutes || 20, now, now);
  }
  await logAuditEvent({
    eventType: "ASSESSMENT_CONFIG_UPDATED",
    actorType: "ADMIN",
    description: `Updated assessment config for ${skillSlug}`,
    metadata: { skillSlug, ...data }
  });
  return true;
}
async function startAssessmentAttempt(skillName, visitorId, userId) {
  const db = getDb2();
  const slug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const skillRow = await db.prepare("SELECT * FROM skills_catalog WHERE slug = ? OR LOWER(name) = ?").get(slug, skillName.toLowerCase());
  if (skillRow && !skillRow.is_active) {
    return {
      success: false,
      error: "skill_inactive",
      message: `${skillName} assessment is currently disabled by the administrator.`
    };
  }
  const config = await db.prepare("SELECT * FROM assessment_configs WHERE skill_slug = ?").get(slug);
  const requiredCount = config?.questions_count || 10;
  const passPercentage = config?.pass_percentage || 70;
  const timeLimitMinutes = config?.time_limit_minutes || 20;
  const activeQuestions = await db.prepare(`
    SELECT * FROM assessment_questions
    WHERE skill_slug = ? AND is_active = 1 AND is_deleted = 0
    ORDER BY RANDOM()
  `).all(slug);
  if (activeQuestions.length < requiredCount) {
    return {
      success: false,
      error: "insufficient_questions",
      message: `${skillName} assessment is currently unavailable because only ${activeQuestions.length} active questions are available. Please contact the administrator.`
    };
  }
  const selectedQuestions = activeQuestions.slice(0, requiredCount);
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const effectiveUserId = userId || (visitorId ? (await db.prepare("SELECT user_id FROM visitors WHERE id = ? OR anonymous_id = ?").get(visitorId, visitorId))?.user_id : null);
  const userName = await getUserNameById(effectiveUserId);
  const actorName = userName || "Name not provided";
  await db.prepare(`
    INSERT INTO assessments (
      id, visitor_id, user_id, skill, score, total_questions,
      passed, status, duration_seconds, started_at, completed_at,
      proctoring_violation_count, created_at
    ) VALUES (?, ?, ?, ?, 0, ?, 0, 'in_progress', ?, ?, NULL, 0, ?)
  `).run(
    attemptId,
    visitorId || null,
    effectiveUserId || null,
    skillRow?.name || skillName,
    requiredCount,
    timeLimitMinutes * 60,
    now,
    now
  );
  const insertSnap = await db.prepare(`
    INSERT INTO assessment_question_snapshots (
      id, assessment_id, question_id, question_order, question_text,
      question_type, difficulty, options_json, correct_answer, explanation,
      selected_answer, is_correct, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)
  `);
  for (let idx = 0; idx < selectedQuestions.length; idx++) {
    const q = selectedQuestions[idx];
    await insertSnap.run(
      `snp_${attemptId}_${idx + 1}`,
      attemptId,
      q.id,
      idx + 1,
      q.question_text,
      q.question_type,
      q.difficulty,
      q.options_json,
      q.correct_answer,
      q.explanation || null,
      now
    );
  }
  await logAuditEvent({
    eventType: "ASSESSMENT_STARTED",
    actorType: effectiveUserId ? "USER" : "VISITOR",
    actorId: effectiveUserId || visitorId,
    description: `${actorName} started ${skillRow?.name || skillName} assessment (Attempt ${attemptId})`,
    metadata: { attemptId, skill: skillRow?.name || skillName, questionsCount: requiredCount, userId: effectiveUserId, userName }
  });
  const passingScore = Math.ceil(requiredCount * (passPercentage / 100));
  return {
    success: true,
    attemptId,
    skill: skillRow?.name || skillName,
    durationSeconds: timeLimitMinutes * 60,
    passingScore,
    totalQuestions: requiredCount,
    passPercentage,
    questions: selectedQuestions.map((q, idx) => ({
      id: `snp_${attemptId}_${idx + 1}`,
      // use snapshot ID for secure answer submission
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      options: JSON.parse(q.options_json || "[]"),
      time_limit_seconds: q.time_limit_seconds || 120
    })),
    startedAt: now
  };
}
async function submitAssessmentAttempt(data) {
  const db = getDb2();
  const attempt = await db.prepare("SELECT * FROM assessments WHERE id = ?").get(data.attemptId);
  if (!attempt) {
    return {
      error: "attempt_not_found",
      message: "Assessment attempt not found."
    };
  }
  if (attempt.status !== "in_progress" && attempt.status !== "in-progress") {
    const certRow = await db.prepare("SELECT certificate_code FROM certificates WHERE assessment_id = ?").get(attempt.id);
    const isTerm = attempt.status === "INCOMPLETE";
    return {
      id: attempt.id,
      skill: attempt.skill,
      score: isTerm ? 0 : attempt.score,
      totalQuestions: attempt.total_questions,
      percentage: isTerm ? 0 : attempt.total_questions > 0 ? Math.round(attempt.score / attempt.total_questions * 100) : 0,
      passed: Boolean(attempt.passed),
      isTerminated: isTerm,
      status: attempt.status,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at || attempt.created_at,
      durationSeconds: attempt.duration_seconds,
      violationCount: attempt.proctoring_violation_count,
      terminationReason: attempt.termination_reason || void 0,
      certificateId: isTerm ? void 0 : certRow?.certificate_code || void 0
    };
  }
  if (data.requesterUserId && attempt.user_id && attempt.user_id !== data.requesterUserId) {
    return {
      error: "unauthorized_candidate",
      message: "Unauthorized: assessment attempt belongs to a different candidate."
    };
  }
  if (data.requesterVisitorId && attempt.visitor_id && attempt.visitor_id !== data.requesterVisitorId && !attempt.user_id) {
    return {
      error: "unauthorized_visitor",
      message: "Unauthorized: assessment attempt belongs to a different visitor."
    };
  }
  const snapshots = await db.prepare(`
    SELECT * FROM assessment_question_snapshots
    WHERE assessment_id = ?
    ORDER BY question_order ASC
  `).all(data.attemptId);
  let score = 0;
  const updateSnap = await db.prepare(`
    UPDATE assessment_question_snapshots
    SET selected_answer = ?, is_correct = ?
    WHERE id = ?
  `);
  const answersMap = data.userAnswers || data.answers || {};
  for (const snap of snapshots) {
    const rawAnswer = answersMap[snap.id] ?? answersMap[snap.question_id];
    let selectedStr = "";
    let isCorrect = false;
    const options = JSON.parse(snap.options_json || "[]");
    if (typeof rawAnswer === "number") {
      selectedStr = `Option ${String.fromCharCode(65 + rawAnswer)}`;
      const letter = String.fromCharCode(65 + rawAnswer);
      isCorrect = snap.correct_answer === selectedStr || snap.correct_answer === letter || snap.correct_answer === options[rawAnswer];
    } else if (typeof rawAnswer === "string") {
      selectedStr = rawAnswer.trim();
      isCorrect = selectedStr.toLowerCase() === snap.correct_answer.trim().toLowerCase() || selectedStr.toLowerCase() === snap.correct_answer.replace("Option ", "").trim().toLowerCase();
    }
    if (isCorrect) {
      score += 1;
    }
    await updateSnap.run(selectedStr || "Unanswered", isCorrect ? 1 : 0, snap.id);
  }
  const violations = (data.proctoringEvents || []).filter(
    (e) => e.severity === "violation" || e.type === "TAB_SWITCH" || e.type === "FULLSCREEN_EXIT"
  );
  const isTerminated = violations.length >= 3 || Boolean(data.terminationReason);
  if (isTerminated) {
    score = 0;
  }
  const totalQuestions = snapshots.length || attempt.total_questions || 10;
  const slug = attempt.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const config = await db.prepare("SELECT * FROM assessment_configs WHERE skill_slug = ?").get(slug);
  const passPercentage = config?.pass_percentage || 70;
  const passingScore = Math.ceil(totalQuestions * (passPercentage / 100));
  const passed = !isTerminated && score >= passingScore;
  const status = isTerminated ? "INCOMPLETE" : passed ? "passed" : "failed";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const maxAllowedDuration = (config?.time_limit_minutes || 20) * 60 + 180;
  const duration = Math.min(data.durationSeconds || attempt.duration_seconds || 0, maxAllowedDuration);
  const terminationReason = isTerminated ? data.terminationReason || `Assessment terminated due to exceeding maximum allowed proctoring violations (${violations.length}/3).` : null;
  if (Array.isArray(data.proctoringEvents) && data.proctoringEvents.length > 0) {
    const insertEvent = await db.prepare(`
      INSERT OR IGNORE INTO proctoring_events (id, assessment_id, event_type, severity, details, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const evt of data.proctoringEvents) {
      await insertEvent.run(
        evt.id || `pevt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        data.attemptId,
        evt.type || "UNKNOWN",
        evt.severity || "info",
        evt.details || "",
        evt.timestamp || now,
        now
      );
    }
  }
  const proctoringEventsJson = JSON.stringify(data.proctoringEvents || []);
  await db.prepare(`
    UPDATE assessments
    SET score = ?, passed = ?, status = ?, duration_seconds = ?,
        completed_at = ?, proctoring_violation_count = ?,
        termination_reason = ?, proctoring_events_json = ?
    WHERE id = ?
  `).run(
    score,
    passed ? 1 : 0,
    status,
    duration,
    now,
    violations.length,
    terminationReason,
    proctoringEventsJson,
    data.attemptId
  );
  const userName = await getUserNameById(attempt.user_id);
  const actorName = userName || "Name not provided";
  let certificateCode;
  if (passed) {
    const vsId = `vsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO verified_skills (id, visitor_id, user_id, skill_name, status, assessment_id, verified_at, created_at)
      VALUES (?, ?, ?, ?, 'VERIFIED', ?, ?, ?)
    `).run(vsId, attempt.visitor_id || null, attempt.user_id || null, attempt.skill, data.attemptId, now, now);
    if (attempt.user_id) {
      certificateCode = `CERT-${(/* @__PURE__ */ new Date()).getFullYear()}-${attempt.skill.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Math.floor(1e5 + Math.random() * 9e5)}`;
      const certId = `crt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.prepare(`
        INSERT INTO certificates (id, user_id, assessment_id, skill, score, total_questions, certificate_code, issue_date, verification_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED', ?)
      `).run(certId, attempt.user_id, data.attemptId, attempt.skill, score, totalQuestions, certificateCode, now, now);
      await syncUserSkillVerification(attempt.user_id, attempt.skill, score, certificateCode, now.split("T")[0]);
    }
    await logAuditEvent({
      eventType: "SKILL_VERIFIED",
      actorType: attempt.user_id ? "USER" : "VISITOR",
      actorId: attempt.user_id || attempt.visitor_id,
      description: `${actorName} verified skill "${attempt.skill}" with score ${score}/${totalQuestions}${certificateCode ? ` (Certificate: ${certificateCode})` : ""}`,
      metadata: { skill: attempt.skill, assessmentId: data.attemptId, score, certificateCode, userId: attempt.user_id, userName }
    });
  }
  await logAuditEvent({
    eventType: isTerminated ? "ASSESSMENT_TERMINATED" : "ASSESSMENT_COMPLETED",
    actorType: attempt.user_id ? "USER" : "VISITOR",
    actorId: attempt.user_id || attempt.visitor_id,
    description: isTerminated ? `${actorName}'s ${attempt.skill} assessment was TERMINATED: ${terminationReason}` : `${actorName} completed ${attempt.skill} assessment: ${score}/${totalQuestions} (${passed ? "PASSED" : "FAILED"})`,
    metadata: {
      attemptId: data.attemptId,
      skill: attempt.skill,
      score,
      passed,
      violations: violations.length,
      terminationReason,
      userId: attempt.user_id,
      userName
    }
  });
  return {
    id: data.attemptId,
    skill: attempt.skill,
    score,
    totalQuestions,
    percentage: isTerminated ? 0 : Math.round(score / totalQuestions * 100),
    passed,
    isTerminated,
    status,
    startedAt: attempt.started_at,
    completedAt: now,
    durationSeconds: duration,
    violationCount: violations.length,
    terminationReason: terminationReason || void 0,
    certificateId: isTerminated ? void 0 : certificateCode || (passed ? `SRA-VER-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}` : void 0)
  };
}
async function getAdminAssessmentAttempts(limit = 100, page = 1) {
  const db = getDb2();
  const offset = (Math.max(1, page) - 1) * limit;
  const total = (await db.prepare("SELECT COUNT(*) as c FROM assessments").get()).c;
  const rows = await db.prepare(`
    SELECT
      a.id,
      a.visitor_id,
      a.user_id,
      COALESCE(u.name, 'Name not provided') as user_name,
      a.skill,
      a.score,
      a.total_questions,
      a.passed,
      a.status,
      a.duration_seconds,
      a.started_at,
      a.completed_at,
      a.proctoring_violation_count,
      a.termination_reason,
      a.created_at
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
  return {
    attempts: rows.map((r) => ({
      ...r,
      passed: Boolean(r.passed),
      percentage: r.total_questions > 0 ? Math.round(r.score / r.total_questions * 100) : 0,
      termination_reason: r.termination_reason || null
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1
  };
}
async function getAssessmentAttemptDetail(attemptId) {
  const db = getDb2();
  const attempt = await db.prepare(`
    SELECT
      a.*,
      COALESCE(u.name, 'Name not provided') as user_name,
      u.email as user_email
    FROM assessments a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `).get(attemptId);
  if (!attempt) return null;
  const snapshots = await db.prepare(`
    SELECT * FROM assessment_question_snapshots
    WHERE assessment_id = ?
    ORDER BY question_order ASC
  `).all(attemptId);
  let proctoringEvents = await db.prepare(`
    SELECT * FROM proctoring_events
    WHERE assessment_id = ?
    ORDER BY timestamp ASC, id ASC
  `).all(attemptId);
  if (proctoringEvents.length === 0 && attempt.proctoring_events_json) {
    try {
      proctoringEvents = JSON.parse(attempt.proctoring_events_json);
    } catch {
    }
  }
  return {
    attempt: {
      ...attempt,
      passed: Boolean(attempt.passed),
      percentage: attempt.total_questions > 0 ? Math.round(attempt.score / attempt.total_questions * 100) : 0,
      termination_reason: attempt.termination_reason || null,
      proctoring_violation_count: attempt.proctoring_violation_count || 0
    },
    snapshots: snapshots.map((s) => ({
      id: s.id,
      questionId: s.question_id,
      questionOrder: s.question_order,
      questionText: s.question_text,
      questionType: s.question_type,
      difficulty: s.difficulty,
      options: JSON.parse(s.options_json || "[]"),
      correctAnswer: s.correct_answer,
      explanation: s.explanation,
      selectedAnswer: s.selected_answer,
      isCorrect: s.is_correct === 1
    })),
    proctoringEvents: proctoringEvents.map((pe) => ({
      id: pe.id,
      type: pe.event_type || pe.type,
      severity: pe.severity,
      details: pe.details,
      timestamp: pe.timestamp
    }))
  };
}
async function getUserDashboardData(userId) {
  const db = getDb2();
  const resumesCount = (await db.prepare("SELECT COUNT(*) as c FROM resumes WHERE user_id = ?").get(userId))?.c || 0;
  const analysesCount = (await db.prepare("SELECT COUNT(*) as c FROM resume_analyses WHERE user_id = ?").get(userId))?.c || 0;
  const avgAtsRow = await db.prepare("SELECT AVG(ats_score) as avg_score FROM resume_analyses WHERE user_id = ?").get(userId);
  const avgAtsScore = avgAtsRow?.avg_score ? Math.round(avgAtsRow.avg_score * 10) / 10 : 0;
  const improvementsCount = (await db.prepare("SELECT COUNT(*) as c FROM resume_improvements WHERE user_id = ?").get(userId))?.c || 0;
  const jobsAppliedCount = (await db.prepare("SELECT COUNT(*) as c FROM job_applications WHERE user_id = ? AND status = 'Applied'").get(userId))?.c || 0;
  const totalApplications = (await db.prepare("SELECT COUNT(*) as c FROM job_applications WHERE user_id = ?").get(userId))?.c || 0;
  const jobMatchesCount = (await db.prepare("SELECT COUNT(*) as c FROM job_matches WHERE user_id = ?").get(userId))?.c || 0;
  const verifiedSkillsCount = (await db.prepare("SELECT COUNT(*) as c FROM verified_skills WHERE user_id = ? AND status = 'VERIFIED'").get(userId))?.c || 0;
  const assessmentsCount = (await db.prepare("SELECT COUNT(*) as c FROM assessments WHERE user_id = ? AND status = 'COMPLETED'").get(userId))?.c || 0;
  const certificatesCount = (await db.prepare("SELECT COUNT(*) as c FROM certificates WHERE user_id = ?").get(userId))?.c || 0;
  const coursesCompletedCount = (await db.prepare("SELECT COUNT(*) as c FROM course_progress WHERE user_id = ? AND status = 'Completed'").get(userId))?.c || 0;
  const resumes = await db.prepare(`
    SELECT id, filename, file_type, uploaded_at, created_at
    FROM resumes
    WHERE user_id = ?
    ORDER BY uploaded_at DESC
  `).all(userId);
  const resumeProgress = await Promise.all(resumes.map(async (r) => {
    const analyses = await db.prepare(`
      SELECT id, ats_score, analyzed_at
      FROM resume_analyses
      WHERE resume_id = ? AND user_id = ?
      ORDER BY analyzed_at DESC
      LIMIT 2
    `).all(r.id, userId);
    const latest = analyses[0] || null;
    const previous = analyses[1] || null;
    const latestScore = latest ? Math.round(latest.ats_score) : null;
    const previousScore = previous ? Math.round(previous.ats_score) : null;
    const improvement = latestScore !== null && previousScore !== null ? latestScore - previousScore : null;
    return {
      id: r.id,
      filename: r.filename,
      fileType: r.file_type,
      uploadedAt: r.uploaded_at,
      latestScore,
      previousScore,
      improvement,
      latestAnalysisDate: latest?.analyzed_at || null,
      latestAnalysisId: latest?.id || null
    };
  }));
  const recentApplications = await db.prepare(`
    SELECT id, job_title, company, location, status, applied_at
    FROM job_applications
    WHERE user_id = ?
    ORDER BY applied_at DESC, created_at DESC
    LIMIT 4
  `).all(userId);
  const recentAssessments = await db.prepare(`
    SELECT id, skill, score, total_questions, passed, status, completed_at
    FROM assessments
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 4
  `).all(userId);
  const recentImprovements = await db.prepare(`
    SELECT id, category, title, before_text, after_text, created_at
    FROM resume_improvements
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 4
  `).all(userId);
  return {
    metrics: {
      totalResumes: resumesCount,
      totalAnalyses: analysesCount,
      avgAtsScore,
      improvementsMade: improvementsCount,
      jobsApplied: jobsAppliedCount,
      totalApplications,
      jobMatches: jobMatchesCount,
      verifiedSkills: verifiedSkillsCount,
      assessmentsCompleted: assessmentsCount,
      certificatesEarned: certificatesCount,
      coursesCompleted: coursesCompletedCount
    },
    resumeProgress,
    recentApplications,
    recentAssessments,
    recentImprovements
  };
}
async function getUserResumes(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT
      r.id,
      r.filename,
      r.file_type,
      r.uploaded_at,
      r.parsed_successfully,
      (SELECT COUNT(*) FROM resume_analyses WHERE resume_id = r.id AND user_id = r.user_id) as analyses_count,
      (SELECT ats_score FROM resume_analyses WHERE resume_id = r.id AND user_id = r.user_id ORDER BY analyzed_at DESC LIMIT 1) as latest_ats_score,
      (SELECT id FROM resume_analyses WHERE resume_id = r.id AND user_id = r.user_id ORDER BY analyzed_at DESC LIMIT 1) as latest_analysis_id
    FROM resumes r
    WHERE r.user_id = ?
    ORDER BY r.uploaded_at DESC
  `).all(userId);
  return rows.map((r) => ({
    ...r,
    parsedSuccessfully: Boolean(r.parsed_successfully),
    latestAtsScore: r.latest_ats_score !== null ? Math.round(r.latest_ats_score) : null
  }));
}
async function getUserAnalyses(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT
      a.*,
      COALESCE(r.filename, 'Resume Document') as resume_filename
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.user_id = ?
    ORDER BY a.analyzed_at DESC
  `).all(userId);
  return rows.map((r) => ({
    id: r.id,
    resumeId: r.resume_id,
    resumeFilename: r.resume_filename,
    fileType: r.file_type,
    analyzedAt: r.analyzed_at,
    atsScore: Math.round(r.ats_score),
    keywordScore: Math.round(r.keyword_score),
    formattingScore: Math.round(r.formatting_score),
    sectionScore: Math.round(r.section_score),
    analysisStatus: r.analysis_status,
    detectedKeywords: JSON.parse(r.detected_keywords || "[]"),
    missingKeywords: JSON.parse(r.missing_keywords || "[]")
  }));
}
async function getUserSingleAnalysis(userId, analysisId) {
  const db = getDb2();
  const row = await db.prepare(`
    SELECT
      a.*,
      COALESCE(r.filename, 'Resume Document') as resume_filename
    FROM resume_analyses a
    LEFT JOIN resumes r ON a.resume_id = r.id
    WHERE a.id = ? AND a.user_id = ?
  `).get(analysisId, userId);
  if (!row) return null;
  return {
    id: row.id,
    resumeId: row.resume_id,
    resumeFilename: row.resume_filename,
    fileType: row.file_type,
    analyzedAt: row.analyzed_at,
    atsScore: Math.round(row.ats_score),
    keywordScore: Math.round(row.keyword_score),
    formattingScore: Math.round(row.formatting_score),
    sectionScore: Math.round(row.section_score),
    analysisStatus: row.analysis_status,
    detectedKeywords: JSON.parse(row.detected_keywords || "[]"),
    missingKeywords: JSON.parse(row.missing_keywords || "[]")
  };
}
async function getUserImprovements(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT
      i.*,
      COALESCE(r.filename, 'Active Resume') as resume_filename
    FROM resume_improvements i
    LEFT JOIN resumes r ON i.resume_id = r.id
    WHERE i.user_id = ?
    ORDER BY i.created_at DESC
  `).all(userId);
  return rows.map((r) => ({
    id: r.id,
    resumeId: r.resume_id,
    resumeFilename: r.resume_filename,
    category: r.category,
    title: r.title,
    beforeText: r.before_text,
    afterText: r.after_text,
    createdAt: r.created_at
  }));
}
async function getUserJobApplications(userId) {
  const db = getDb2();
  return await db.prepare(`
    SELECT *
    FROM job_applications
    WHERE user_id = ?
    ORDER BY applied_at DESC, created_at DESC
  `).all(userId);
}
async function createJobApplication(userId, data) {
  const db = getDb2();
  const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const appliedAt = data.appliedAt || now.split("T")[0];
  const status = data.status || "Applied";
  await db.prepare(`
    INSERT INTO job_applications (
      id, user_id, job_id, job_title, company, location, source,
      job_url, applied_at, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    data.jobId || null,
    data.jobTitle.trim(),
    data.company.trim(),
    data.location?.trim() || null,
    data.source?.trim() || "Manual",
    data.jobUrl?.trim() || null,
    appliedAt,
    status,
    data.notes?.trim() || null,
    now,
    now
  );
  return {
    id,
    userId,
    jobId: data.jobId || null,
    jobTitle: data.jobTitle.trim(),
    company: data.company.trim(),
    location: data.location || null,
    source: data.source || "Manual",
    jobUrl: data.jobUrl || null,
    appliedAt,
    status,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now
  };
}
async function updateJobApplication(userId, applicationId, data) {
  const db = getDb2();
  const existing = await db.prepare("SELECT * FROM job_applications WHERE id = ? AND user_id = ?").get(applicationId, userId);
  if (!existing) {
    throw new Error("Job application not found or unauthorized.");
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(`
    UPDATE job_applications
    SET job_title = COALESCE(?, job_title),
        company = COALESCE(?, company),
        location = COALESCE(?, location),
        source = COALESCE(?, source),
        job_url = COALESCE(?, job_url),
        applied_at = COALESCE(?, applied_at),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes),
        updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(
    data.jobTitle !== void 0 ? data.jobTitle.trim() : null,
    data.company !== void 0 ? data.company.trim() : null,
    data.location !== void 0 ? data.location.trim() : null,
    data.source !== void 0 ? data.source.trim() : null,
    data.jobUrl !== void 0 ? data.jobUrl.trim() : null,
    data.appliedAt !== void 0 ? data.appliedAt : null,
    data.status !== void 0 ? data.status : null,
    data.notes !== void 0 ? data.notes.trim() : null,
    now,
    applicationId,
    userId
  );
  return await db.prepare("SELECT * FROM job_applications WHERE id = ? AND user_id = ?").get(applicationId, userId);
}
async function deleteJobApplication(userId, applicationId) {
  const db = getDb2();
  const res = await db.prepare("DELETE FROM job_applications WHERE id = ? AND user_id = ?").run(applicationId, userId);
  return res.changes > 0;
}
async function getUserJobMatches(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT jm.*, r.filename as resume_filename
    FROM job_matches jm
    LEFT JOIN resumes r ON jm.resume_id = r.id
    WHERE jm.user_id = ?
    ORDER BY jm.created_at DESC
  `).all(userId);
  return rows.map((r) => ({
    id: r.id,
    jobId: r.job_id,
    jobTitle: r.job_title,
    company: r.company,
    matchScore: Math.round(r.match_score),
    matchedSkills: JSON.parse(r.matched_skills || "[]"),
    partialSkills: JSON.parse(r.partial_skills || "[]"),
    missingSkills: JSON.parse(r.missing_skills || "[]"),
    resumeFilename: r.resume_filename,
    createdAt: r.created_at
  }));
}
async function getUserSkillsStatus(userId) {
  const db = getDb2();
  const catalog = await db.prepare("SELECT * FROM skills_catalog WHERE is_active = 1 ORDER BY category, name").all();
  return Promise.all(catalog.map(async (skill) => {
    const verified = await db.prepare(`
      SELECT vs.*, a.score, a.total_questions, c.certificate_code
      FROM verified_skills vs
      LEFT JOIN assessments a ON vs.assessment_id = a.id
      LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
      WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
      ORDER BY vs.verified_at DESC
      LIMIT 1
    `).get(userId, skill.name);
    if (verified) {
      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        description: skill.description,
        status: "VERIFIED",
        score: verified.score ? `${verified.score}/${verified.total_questions}` : null,
        percentage: verified.score ? Math.round(verified.score / verified.total_questions * 100) : null,
        verifiedAt: verified.verified_at,
        certificateCode: verified.certificate_code || null
      };
    }
    const latestAttempt = await db.prepare(`
      SELECT * FROM assessments
      WHERE user_id = ? AND LOWER(skill) = LOWER(?)
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId, skill.name);
    if (latestAttempt) {
      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        description: skill.description,
        status: latestAttempt.passed ? "VERIFIED" : "NOT VERIFIED",
        score: `${latestAttempt.score}/${latestAttempt.total_questions}`,
        percentage: Math.round(latestAttempt.score / latestAttempt.total_questions * 100),
        attemptDate: latestAttempt.completed_at || latestAttempt.created_at,
        certificateCode: null
      };
    }
    return {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      description: skill.description,
      status: "NOT VERIFIED",
      score: null,
      percentage: null,
      verifiedAt: null,
      certificateCode: null
    };
  }));
}
async function getUserAssessments(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT a.*, c.certificate_code
    FROM assessments a
    LEFT JOIN certificates c ON a.id = c.assessment_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(userId);
  return rows.map((r) => ({
    id: r.id,
    skill: r.skill,
    score: r.score,
    totalQuestions: r.total_questions,
    passed: Boolean(r.passed),
    status: r.status,
    durationSeconds: r.duration_seconds,
    violationCount: r.proctoring_violation_count || 0,
    terminationReason: r.termination_reason || null,
    startedAt: r.started_at,
    completedAt: r.completed_at || r.created_at,
    certificateCode: r.certificate_code || null,
    percentage: r.total_questions > 0 ? Math.round(r.score / r.total_questions * 100) : 0
  }));
}
async function getUserCertificates(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT *
    FROM certificates
    WHERE user_id = ?
    ORDER BY issue_date DESC, created_at DESC
  `).all(userId);
  return rows.map((r) => ({
    id: r.id,
    certificateCode: r.certificate_code,
    skill: r.skill,
    score: r.score,
    totalQuestions: r.total_questions,
    percentage: r.total_questions > 0 ? Math.round(r.score / r.total_questions * 100) : 0,
    issueDate: r.issue_date,
    verificationStatus: r.verification_status
  }));
}
async function getCertificateByCode(code) {
  const db = getDb2();
  const row = await db.prepare(`
    SELECT c.*, u.name as user_name
    FROM certificates c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.certificate_code = ?
  `).get(code);
  if (!row) return null;
  return {
    id: row.id,
    certificateCode: row.certificate_code,
    userName: row.user_name || "Verified Professional",
    skill: row.skill,
    score: row.score,
    totalQuestions: row.total_questions,
    percentage: row.total_questions > 0 ? Math.round(row.score / row.total_questions * 100) : 0,
    issueDate: row.issue_date,
    verificationStatus: row.verification_status
  };
}
async function getUserCourses(userId) {
  const db = getDb2();
  const rows = await db.prepare(`
    SELECT
      c.*,
      COALESCE(cp.lessons_completed, 0) as lessons_completed,
      COALESCE(cp.status, 'Not Started') as status,
      cp.completion_date,
      cp.last_accessed_at
    FROM courses c
    LEFT JOIN course_progress cp ON c.id = cp.course_id AND cp.user_id = ?
    ORDER BY c.created_at ASC
  `).all(userId);
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    description: r.description,
    totalLessons: r.total_lessons,
    durationMinutes: r.duration_minutes,
    level: r.level,
    lessonsCompleted: r.lessons_completed,
    status: r.status,
    completionDate: r.completion_date,
    lastAccessedAt: r.last_accessed_at,
    progressPercentage: r.total_lessons > 0 ? Math.min(100, Math.round(r.lessons_completed / r.total_lessons * 100)) : 0
  }));
}
async function updateUserCourseProgress(userId, courseId, lessonsCompleted) {
  const db = getDb2();
  const course = await db.prepare("SELECT id, total_lessons FROM courses WHERE id = ? OR slug = ?").get(courseId, courseId);
  if (!course) {
    throw new Error("Course not found.");
  }
  const resolvedCourseId = course.id;
  const totalLessons = course.total_lessons;
  const clampedCompleted = Math.max(0, Math.min(totalLessons, lessonsCompleted));
  const isCompleted = clampedCompleted >= totalLessons;
  const status = isCompleted ? "Completed" : clampedCompleted > 0 ? "In Progress" : "Not Started";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const completionDate = isCompleted ? now : null;
  const existing = await db.prepare("SELECT id FROM course_progress WHERE user_id = ? AND course_id = ?").get(userId, resolvedCourseId);
  if (existing) {
    await db.prepare(`
      UPDATE course_progress
      SET lessons_completed = ?, status = ?, completion_date = COALESCE(?, completion_date),
          last_accessed_at = ?, updated_at = ?
      WHERE id = ?
    `).run(clampedCompleted, status, completionDate, now, now, existing.id);
  } else {
    const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO course_progress (
        id, user_id, course_id, lessons_completed, total_lessons,
        status, completion_date, last_accessed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, resolvedCourseId, clampedCompleted, totalLessons, status, completionDate, now, now, now);
  }
  return {
    courseId: resolvedCourseId,
    lessonsCompleted: clampedCompleted,
    totalLessons,
    status,
    completionDate
  };
}
async function getUserSkills(userId) {
  const db = getDb2();
  let rows = await db.prepare("SELECT * FROM user_skills WHERE user_id = ? ORDER BY created_at ASC").all(userId);
  if (rows.length === 0) {
    const initialSkills = [
      { name: "Python", category: "Programming" },
      { name: "SQL", category: "Database" },
      { name: "React", category: "Frontend" },
      { name: "AWS", category: "Cloud & DevOps" },
      { name: "Machine Learning", category: "AI / Data" },
      { name: "JavaScript", category: "Programming" },
      { name: "Git", category: "Cloud & DevOps" }
    ];
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const insertStmt = await db.prepare(`
      INSERT OR IGNORE INTO user_skills (
        id, user_id, skill_name, category, status, score, certificate_id,
        verified_date, claimed_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (let i = 0; i < initialSkills.length; i++) {
      const s = initialSkills[i];
      const id = `usk_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      const verified = await db.prepare(`
        SELECT vs.*, a.score as att_score, a.total_questions, c.certificate_code
        FROM verified_skills vs
        LEFT JOIN assessments a ON vs.assessment_id = a.id
        LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
        WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
        ORDER BY vs.verified_at DESC LIMIT 1
      `).get(userId, s.name);
      if (verified) {
        await insertStmt.run(
          id,
          userId,
          s.name,
          s.category,
          "verified",
          verified.att_score || 8,
          verified.certificate_code || null,
          verified.verified_at || now.split("T")[0],
          null,
          now,
          now
        );
      } else {
        await insertStmt.run(
          id,
          userId,
          s.name,
          s.category,
          "not-verified",
          null,
          null,
          null,
          null,
          now,
          now
        );
      }
    }
    rows = await db.prepare("SELECT * FROM user_skills WHERE user_id = ? ORDER BY created_at ASC").all(userId);
  }
  return Promise.all(rows.map(async (r) => {
    let status = r.status;
    let score = r.score;
    let certificateId = r.certificate_id;
    let verifiedDate = r.verified_date;
    if (status !== "verified") {
      const verified = await db.prepare(`
        SELECT vs.*, a.score as att_score, c.certificate_code
        FROM verified_skills vs
        LEFT JOIN assessments a ON vs.assessment_id = a.id
        LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
        WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
        ORDER BY vs.verified_at DESC LIMIT 1
      `).get(userId, r.skill_name);
      if (verified) {
        status = "verified";
        score = verified.att_score;
        certificateId = verified.certificate_code;
        verifiedDate = verified.verified_at;
        await db.prepare(`
          UPDATE user_skills
          SET status = 'verified', score = ?, certificate_id = ?, verified_date = ?, updated_at = ?
          WHERE id = ?
        `).run(score, certificateId, verifiedDate, (/* @__PURE__ */ new Date()).toISOString(), r.id);
      }
    }
    return {
      id: r.id,
      name: r.skill_name,
      category: r.category,
      status,
      score: score || void 0,
      certificateId: certificateId || void 0,
      verifiedDate: verifiedDate || void 0,
      claimedDate: r.claimed_date || void 0
    };
  }));
}
async function addUserSkill(userId, skillName, category, claimDirectly = true) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await db.prepare(
    "SELECT * FROM user_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)"
  ).get(userId, skillName);
  if (existing) {
    if (claimDirectly && existing.status === "not-verified") {
      await db.prepare(`
        UPDATE user_skills
        SET status = 'claimed', claimed_date = ?, updated_at = ?
        WHERE id = ?
      `).run(now.split("T")[0], now, existing.id);
      existing.status = "claimed";
      existing.claimed_date = now.split("T")[0];
    }
    return {
      id: existing.id,
      name: existing.skill_name,
      category: existing.category,
      status: existing.status,
      score: existing.score || void 0,
      certificateId: existing.certificate_id || void 0,
      verifiedDate: existing.verified_date || void 0,
      claimedDate: existing.claimed_date || void 0
    };
  }
  const verified = await db.prepare(`
    SELECT vs.*, a.score as att_score, c.certificate_code
    FROM verified_skills vs
    LEFT JOIN assessments a ON vs.assessment_id = a.id
    LEFT JOIN certificates c ON vs.assessment_id = c.assessment_id
    WHERE vs.user_id = ? AND LOWER(vs.skill_name) = LOWER(?) AND vs.status = 'VERIFIED'
    ORDER BY vs.verified_at DESC LIMIT 1
  `).get(userId, skillName);
  const id = `usk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const status = verified ? "verified" : claimDirectly ? "claimed" : "not-verified";
  const score = verified ? verified.att_score : null;
  const certificateId = verified ? verified.certificate_code : null;
  const verifiedDate = verified ? verified.verified_at : null;
  const claimedDate = claimDirectly ? now.split("T")[0] : null;
  await db.prepare(`
    INSERT INTO user_skills (
      id, user_id, skill_name, category, status, score, certificate_id,
      verified_date, claimed_date, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    skillName,
    category,
    status,
    score,
    certificateId,
    verifiedDate,
    claimedDate,
    now,
    now
  );
  return {
    id,
    name: skillName,
    category,
    status,
    score: score || void 0,
    certificateId: certificateId || void 0,
    verifiedDate: verifiedDate || void 0,
    claimedDate: claimedDate || void 0
  };
}
async function deleteUserSkill(userId, skillIdOrName) {
  const db = getDb2();
  const target = await db.prepare(`
    SELECT * FROM user_skills
    WHERE user_id = ? AND (id = ? OR LOWER(skill_name) = LOWER(?))
  `).get(userId, skillIdOrName, skillIdOrName);
  if (!target) {
    return { success: false, error: "Skill not found in user profile or unauthorized." };
  }
  await db.prepare("DELETE FROM user_skills WHERE id = ? AND user_id = ?").run(target.id, userId);
  const userName = await getUserNameById(userId);
  await logAuditEvent({
    eventType: "SKILL_REMOVED",
    actorType: "USER",
    actorId: userId,
    description: `${userName || "Candidate"} removed skill "${target.skill_name}" from active profile`,
    metadata: {
      skillId: target.id,
      skillName: target.skill_name,
      wasVerified: target.status === "verified",
      certificateId: target.certificate_id || null,
      userId
    }
  });
  return {
    success: true,
    deletedSkill: {
      id: target.id,
      name: target.skill_name,
      status: target.status,
      certificateId: target.certificate_id || void 0
    }
  };
}
async function syncUserSkillVerification(userId, skillName, score, certificateCode, verifiedAt) {
  const db = getDb2();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await db.prepare(
    "SELECT * FROM user_skills WHERE user_id = ? AND LOWER(skill_name) = LOWER(?)"
  ).get(userId, skillName);
  if (existing) {
    await db.prepare(`
      UPDATE user_skills
      SET status = 'verified', score = ?, certificate_id = ?, verified_date = ?, updated_at = ?
      WHERE id = ?
    `).run(score, certificateCode, verifiedAt, now, existing.id);
  } else {
    const catalogItem = await db.prepare("SELECT category FROM skills_catalog WHERE LOWER(name) = LOWER(?)").get(skillName);
    const category = catalogItem?.category || "Technical";
    const id = `usk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.prepare(`
      INSERT INTO user_skills (
        id, user_id, skill_name, category, status, score, certificate_id,
        verified_date, claimed_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'verified', ?, ?, ?, NULL, ?, ?)
    `).run(id, userId, skillName, category, score, certificateCode, verifiedAt, now, now);
  }
}
async function recordProctoringEvent(assessmentId, eventType, severity, details) {
  const db = getDb2();
  const id = `pevt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await db.prepare(`
      INSERT INTO proctoring_events (id, assessment_id, event_type, severity, details, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, assessmentId, eventType, severity, details || null, now, now);
    if (severity === "violation") {
      await db.prepare(`
        UPDATE assessments
        SET proctoring_violation_count = COALESCE(proctoring_violation_count, 0) + 1
        WHERE id = ?
      `).run(assessmentId);
    }
  } catch (err) {
    console.warn("Failed to record proctoring event:", err);
  }
  return { id, assessmentId, eventType, severity, details, timestamp: now };
}
async function getProctoringEvents(limit = 50, assessmentId) {
  const db = getDb2();
  try {
    if (assessmentId) {
      return await db.prepare(`
        SELECT pe.*, a.skill, a.visitor_id, u.name as user_name, u.email as user_email
        FROM proctoring_events pe
        LEFT JOIN assessments a ON pe.assessment_id = a.id
        LEFT JOIN users u ON a.visitor_id = u.id
        WHERE pe.assessment_id = ?
        ORDER BY pe.created_at DESC
        LIMIT ?
      `).all(assessmentId, limit);
    }
    return await db.prepare(`
      SELECT pe.*, a.skill, a.visitor_id, u.name as user_name, u.email as user_email
      FROM proctoring_events pe
      LEFT JOIN assessments a ON pe.assessment_id = a.id
      LEFT JOIN users u ON a.visitor_id = u.id
      ORDER BY pe.created_at DESC
      LIMIT ?
    `).all(limit);
  } catch (err) {
    console.warn("Failed to query proctoring events:", err);
    return [];
  }
}
async function getProctoringSummary() {
  const db = getDb2();
  try {
    const totalEvents = (await db.prepare("SELECT COUNT(*) as count FROM proctoring_events").get())?.count || 0;
    const totalViolations = (await db.prepare("SELECT COUNT(*) as count FROM proctoring_events WHERE severity = 'violation'").get())?.count || 0;
    const totalWarnings = (await db.prepare("SELECT COUNT(*) as count FROM proctoring_events WHERE severity = 'warning'").get())?.count || 0;
    const violationBreakdown = await db.prepare(`
      SELECT event_type, COUNT(*) as count
      FROM proctoring_events
      WHERE severity = 'violation'
      GROUP BY event_type
      ORDER BY count DESC
    `).all();
    const activeOrRecentSessions = await db.prepare(`
      SELECT a.id, a.skill, a.score, a.passed, a.status, a.duration_seconds, a.proctoring_violation_count, a.created_at,
             u.name as user_name, u.email as user_email
      FROM assessments a
      LEFT JOIN users u ON a.visitor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all();
    const recentEvents = await getProctoringEvents(30);
    return {
      totalEvents,
      totalViolations,
      totalWarnings,
      violationBreakdown,
      activeOrRecentSessions,
      recentEvents
    };
  } catch (err) {
    console.warn("Failed to get proctoring summary:", err);
    return {
      totalEvents: 0,
      totalViolations: 0,
      totalWarnings: 0,
      violationBreakdown: [],
      activeOrRecentSessions: [],
      recentEvents: []
    };
  }
}
var import_server_only2, dbInstance, isInitialized, SESSION_SECRET, SEED_COURSES;
var init_db = __esm({
  "src/server/db/index.ts"() {
    "use strict";
    import_server_only2 = __toESM(require_empty());
    init_seedQuestions();
    init_adapter();
    dbInstance = null;
    isInitialized = false;
    SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "smart_resume_ai_super_secret_admin_jwt_key_2026";
    SEED_COURSES = [
      {
        id: "crs_full_stack_dev",
        slug: "full-stack-web-dev",
        title: "Full-Stack Web Development Career Path",
        category: "Software Engineering",
        description: "Master modern full-stack development with Next.js, Node.js, TypeScript, and cloud deployment pipelines.",
        totalLessons: 12,
        durationMinutes: 360,
        level: "Intermediate"
      },
      {
        id: "crs_react_ts_mastery",
        slug: "modern-react-typescript",
        title: "Modern React & TypeScript Mastery",
        category: "Frontend Engineering",
        description: "Deep dive into advanced React patterns, performance optimization, hooks architecture, and strict TypeScript.",
        totalLessons: 10,
        durationMinutes: 240,
        level: "Advanced"
      },
      {
        id: "crs_python_ai_systems",
        slug: "python-data-science-ai",
        title: "Python for Data Science & AI Systems",
        category: "Data & AI",
        description: "Build production AI applications, understand LLM engineering, data manipulation, and modern Python tooling.",
        totalLessons: 15,
        durationMinutes: 450,
        level: "Intermediate"
      },
      {
        id: "crs_system_design",
        slug: "system-design-architecture",
        title: "System Design & Scalable Architecture",
        category: "Architecture",
        description: "Learn distributed caching, microservices, load balancing, message queues, and high-concurrency architectures.",
        totalLessons: 8,
        durationMinutes: 300,
        level: "Advanced"
      },
      {
        id: "crs_tech_interview_ats",
        slug: "tech-interview-ats-strategy",
        title: "Technical Interview & ATS Optimization Strategy",
        category: "Career Prep",
        description: "Proven strategies for resume keyword optimization, behavioral interview storytelling, and technical rounds.",
        totalLessons: 6,
        durationMinutes: 180,
        level: "All Levels"
      },
      {
        id: "crs_sql_cloud_databases",
        slug: "sql-cloud-databases",
        title: "SQL & Cloud Database Management",
        category: "Backend & Data",
        description: "Write complex SQL queries, optimize indexes, manage relational schemas, and migrate to cloud database engines.",
        totalLessons: 8,
        durationMinutes: 220,
        level: "Beginner"
      }
    ];
  }
});

// scripts/test_neon_postgres_db.ts
import dns2 from "dns";
import Module from "module";
import path2 from "path";
try {
  dns2.setDefaultResultOrder?.("ipv4first");
} catch {
}
async function testNeonPostgresWorkflows() {
  const { getDb: getDb3 } = await Promise.resolve().then(() => (init_adapter(), adapter_exports));
  const {
    registerUser: registerUser2,
    loginUser: loginUser2,
    getUserById: getUserById2,
    getUserBySession: getUserBySession2,
    getRealAdminStats: getRealAdminStats2,
    getUserDashboardData: getUserDashboardData2,
    getDetailedAnalytics: getDetailedAnalytics2,
    logAuditEvent: logAuditEvent2
  } = await Promise.resolve().then(() => (init_db(), db_exports));
  console.log("====================================================");
  console.log("VERIFYING NEON POSTGRESQL DATA ACCESS LAYER");
  console.log("====================================================");
  const db = getDb3();
  console.log("Is Postgres active according to adapter?:", db.isPostgres);
  if (!db.isPostgres) {
    throw new Error("Postgres is NOT active! Set POSTGRES_URL or DATABASE_URL before running.");
  }
  console.log("\n1. Testing getRealAdminStats()...");
  const adminStats = await getRealAdminStats2();
  console.log("   Admin stats returned:", {
    totalVisitors: adminStats.totalVisitors,
    totalResumesAnalyzed: adminStats.totalResumesAnalyzed,
    averageAtsScore: adminStats.averageAtsScore,
    verifiedSkillsCount: adminStats.verifiedSkillsCount,
    atsHistoryCount: adminStats.atsHistory.length,
    recentActivitiesCount: adminStats.recentActivities.length
  });
  console.log("\n2. Testing getDetailedAnalytics()...");
  const analytics = await getDetailedAnalytics2();
  console.log("   Detailed analytics returned:", {
    totalResumes: analytics.resumeAnalytics.totalResumes,
    pdfCount: analytics.resumeAnalytics.pdfCount,
    docxCount: analytics.resumeAnalytics.docxCount,
    totalSearches: analytics.jobAnalytics.totalSearches,
    totalAssessments: analytics.assessmentAnalytics.totalAssessments,
    passRate: analytics.assessmentAnalytics.passRate
  });
  const testEmail = `neon_test_${Date.now()}@example.com`;
  const testPassword = "NeonPassword123!";
  const testName = "Neon Verification User";
  console.log(`
3. Testing registerUser() on Neon PostgreSQL with ${testEmail}...`);
  let createdUserId = null;
  try {
    const regResult = await registerUser2({
      email: testEmail,
      password: testPassword,
      name: testName
    });
    createdUserId = regResult.user.id;
    console.log("   Registration succeeded! User ID:", regResult.user.id);
    console.log("   Session Token created:", regResult.sessionToken.slice(0, 15) + "...");
    console.log("\n4. Testing loginUser() on Neon PostgreSQL...");
    const loginResult = await loginUser2({ email: testEmail, password: testPassword });
    console.log("   Valid login succeeded! User name:", loginResult.user.name);
    let invalidRejected = false;
    try {
      await loginUser2({ email: testEmail, password: "WrongPassword123!" });
    } catch (err) {
      if (err.message.includes("Invalid email or password")) {
        invalidRejected = true;
      }
    }
    console.log("   Invalid password rejected cleanly:", invalidRejected);
    if (!invalidRejected) {
      throw new Error("Invalid password was not rejected!");
    }
    console.log("\n5. Testing getUserById() and getUserBySession()...");
    const userById = await getUserById2(regResult.user.id);
    console.log("   getUserById result:", userById ? { id: userById.id, email: userById.email } : null);
    const sessionUser = await getUserBySession2(loginResult.sessionToken);
    console.log("   getUserBySession result:", sessionUser ? { id: sessionUser.id, email: sessionUser.email } : null);
    if (!sessionUser || sessionUser.id !== regResult.user.id) {
      throw new Error("Session token lookup failed on Neon!");
    }
    console.log("\n6. Testing getUserDashboardData()...");
    const dashboardData = await getUserDashboardData2(regResult.user.id);
    console.log("   User dashboard metrics:", {
      totalResumes: dashboardData.metrics.totalResumes,
      avgAtsScore: dashboardData.metrics.avgAtsScore,
      verifiedSkills: dashboardData.metrics.verifiedSkills,
      assessmentsCompleted: dashboardData.metrics.assessmentsCompleted
    });
    console.log("\n7. Testing logAuditEvent()...");
    await logAuditEvent2({
      eventType: "USER_REGISTERED",
      actorType: "USER",
      actorId: regResult.user.id,
      description: "Neon test verification audit event",
      metadata: { test: true }
    });
    console.log("   Audit event logged successfully.");
  } finally {
    if (createdUserId) {
      console.log("\n8. Cleaning up test user from Neon...");
      await db.prepare("DELETE FROM audit_events WHERE actor_id = ?").run(createdUserId);
      await db.prepare("DELETE FROM users WHERE id = ?").run(createdUserId);
      console.log("   Test user cleaned up successfully.");
    }
  }
  console.log("\n====================================================");
  console.log("\u{1F389} ALL NEON POSTGRESQL DATA ACCESS TESTS PASSED!");
  console.log("====================================================\n");
}
testNeonPostgresWorkflows().then(() => process.exit(0)).catch((err) => {
  console.error("Neon test failed:", err);
  process.exit(1);
});
