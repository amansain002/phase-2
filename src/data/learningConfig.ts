import {
  LearningResource,
  PracticeQuestion,
  ExternalPracticeLink,
  QuickNotes,
} from '../types/learning';

export const LEARNING_XP_CONFIG = {
  videoWatched: 15,
  materialCompleted: 15,
  correctPracticeAnswer: 5,
  quizCompleted: 20,
  dailyChallenge: 25,
  mistakeFixed: 10,
  dailyLearningXpCap: 250,
};

/**
 * Curated authentic learning resources map
 */
export const CURATED_LEARNING_RESOURCES: LearningResource[] = [
  // OPERATING SYSTEMS
  {
    id: 'os_gfg_concepts',
    title: 'Operating Systems Complete Architecture & Memory Management',
    topic: 'Operating Systems',
    type: 'article',
    siteName: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/operating-systems/',
    description: 'Comprehensive tutorials on Process Scheduling, Page Replacement Algorithms, and Deadlocks.',
    estimatedMinutes: 12,
    difficulty: 'intermediate',
    xpReward: 15,
  },
  {
    id: 'os_nptel_lectures',
    title: 'IIT Madras: Operating Systems Principles',
    topic: 'Operating Systems',
    type: 'course',
    siteName: 'NPTEL',
    url: 'https://nptel.ac.in/courses/106106144',
    description: 'Gold-standard academic university lectures on kernel design, virtualization, and concurrency.',
    estimatedMinutes: 45,
    difficulty: 'advanced',
    xpReward: 15,
  },
  {
    id: 'os_w3schools_notes',
    title: 'Operating System Basics & File Systems',
    topic: 'Operating Systems',
    type: 'notes',
    siteName: 'W3Schools',
    url: 'https://www.google.com/search?q=site%3Aw3schools.com+operating+system+concepts',
    description: 'Concise summary of OS functions, multithreading, and virtual memory paging.',
    estimatedMinutes: 8,
    difficulty: 'beginner',
    xpReward: 15,
  },

  // DBMS / SQL
  {
    id: 'dbms_w3schools_sql',
    title: 'Interactive SQL Tutorial & Schema Design',
    topic: 'DBMS',
    type: 'course',
    siteName: 'W3Schools',
    url: 'https://www.w3schools.com/sql/',
    description: 'Hands-on queries covering SELECT, JOINs, GROUP BY, Indexing, and Normalization.',
    estimatedMinutes: 15,
    difficulty: 'beginner',
    xpReward: 15,
  },
  {
    id: 'dbms_gfg_normalization',
    title: 'Database Normalization: 1NF, 2NF, 3NF, BCNF & Acid Properties',
    topic: 'DBMS',
    type: 'article',
    siteName: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/dbms/',
    description: 'Deep dive into relational algebra, indexing (B-Trees / B+ Trees), and transaction isolation.',
    estimatedMinutes: 14,
    difficulty: 'intermediate',
    xpReward: 15,
  },
  {
    id: 'dbms_mdn_storage',
    title: 'Modern Client-Side & Server Storage Paradigms',
    topic: 'DBMS',
    type: 'notes',
    siteName: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Web_framework_features#databases',
    description: 'Relational vs NoSQL trade-offs, ACID guarantees, and ORM integration.',
    estimatedMinutes: 10,
    difficulty: 'intermediate',
    xpReward: 15,
  },

  // DATA STRUCTURES & ALGORITHMS (DSA)
  {
    id: 'dsa_fcc_full_course',
    title: 'freeCodeCamp: Algorithms and Data Structures',
    topic: 'Data Structures',
    type: 'course',
    siteName: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    description: 'Hands-on interactive problem solving covering Big-O, recursion, trees, graphs, and dynamic programming.',
    estimatedMinutes: 30,
    difficulty: 'intermediate',
    xpReward: 15,
  },
  {
    id: 'dsa_gfg_roadmap',
    title: 'Complete DSA Roadmap & Patterns Guide',
    topic: 'Data Structures',
    type: 'article',
    siteName: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/',
    description: 'Standard interview patterns: Two Pointers, Sliding Window, DFS/BFS, and Backtracking.',
    estimatedMinutes: 15,
    difficulty: 'intermediate',
    xpReward: 15,
  },

  // ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
  {
    id: 'ml_google_crash_course',
    title: 'Google Machine Learning Crash Course with TensorFlow',
    topic: 'Artificial Intelligence',
    type: 'course',
    siteName: 'Google Developers',
    url: 'https://developers.google.com/machine-learning/crash-course',
    description: 'Fast-paced, practical introduction to ML fundamentals, loss functions, neural nets, and validation.',
    estimatedMinutes: 25,
    difficulty: 'beginner',
    xpReward: 15,
  },
  {
    id: 'ml_kaggle_learn',
    title: 'Kaggle Intro to Machine Learning & Feature Engineering',
    topic: 'Artificial Intelligence',
    type: 'course',
    siteName: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    description: 'Build your first models using scikit-learn, decision trees, random forests, and cross-validation.',
    estimatedMinutes: 20,
    difficulty: 'beginner',
    xpReward: 15,
  },
  {
    id: 'ml_sklearn_docs',
    title: 'Scikit-Learn Official User Guide & API Reference',
    topic: 'Artificial Intelligence',
    type: 'cheatsheet',
    siteName: 'scikit-learn.org',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    description: 'Official documentation for classification, regression, clustering, and dimensionality reduction.',
    estimatedMinutes: 15,
    difficulty: 'intermediate',
    xpReward: 15,
  },

  // COMPUTER NETWORKS
  {
    id: 'cn_gfg_osi_tcp',
    title: 'Computer Networks: OSI 7-Layer Model & TCP/IP Protocol Suite',
    topic: 'Computer Networks',
    type: 'article',
    siteName: 'GeeksforGeeks',
    url: 'https://www.geeksforgeeks.org/computer-network-tutorials/',
    description: 'In-depth explanation of IP subnetting, routing protocols (OSPF, BGP), HTTP/HTTPS, and DNS.',
    estimatedMinutes: 12,
    difficulty: 'intermediate',
    xpReward: 15,
  },

  // FINANCE & BUSINESS
  {
    id: 'fin_investopedia_basics',
    title: 'Investopedia: Financial Statements & Capital Budgeting Guide',
    topic: 'Finance',
    type: 'article',
    siteName: 'Investopedia',
    url: 'https://www.investopedia.com/financial-term-dictionary-4769738',
    description: 'Master Cash Flow statements, Balance Sheets, NPV, IRR, and portfolio risk management.',
    estimatedMinutes: 12,
    difficulty: 'beginner',
    xpReward: 15,
  },
  {
    id: 'fin_khan_academy',
    title: 'Khan Academy: Finance and Capital Markets',
    topic: 'Finance',
    type: 'course',
    siteName: 'Khan Academy',
    url: 'https://www.khanacademy.org/economics-finance-domain/core-finance',
    description: 'Clear visual video explanations on interest, bonds, stocks, options, and inflation.',
    estimatedMinutes: 20,
    difficulty: 'beginner',
    xpReward: 15,
  },

  // FITNESS & HEALTH
  {
    id: 'fit_nhs_guidelines',
    title: 'NHS: Physical Activity & Hypertrophy Recovery Guidelines',
    topic: 'Fitness',
    type: 'article',
    siteName: 'NHS UK',
    url: 'https://www.nhs.uk/live-well/exercise/',
    description: 'Evidence-based advice on aerobic conditioning, muscle-strengthening exercise, and sleep.',
    estimatedMinutes: 8,
    difficulty: 'beginner',
    xpReward: 15,
  },
];

/**
 * Prewritten High-Yield AI Quick Notes per Topic
 */
export const QUICK_NOTES_MAP: Record<string, QuickNotes> = {
  'Operating Systems': {
    topic: 'Operating Systems',
    title: 'Process Scheduling, Paging & Deadlocks',
    summary:
      'The OS orchestrates hardware abstraction, multi-tasking, memory protection, and process synchronization.',
    keyPoints: [
      'CPU Scheduling: Round Robin (time quantum), Shortest Job First (SJF minimizes avg wait time), Multi-level Feedback Queue.',
      'Virtual Memory & Paging: Paging avoids external fragmentation; TLB (Translation Lookaside Buffer) caches recent virtual-to-physical address translations.',
      'Deadlock Conditions (Coffman): Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Avoidance via Banker\'s Algorithm.',
      'Page Replacement: FIFO (suffers from Belady\'s Anomaly), LRU (optimal stack-based practical policy), Optimal (theoretical benchmark).',
    ],
    codeOrFormula: 'Effective Access Time (EAT) = (Hit_Ratio × (TLB + Mem)) + ((1 - Hit_Ratio) × (TLB + 2 × Mem))',
    miniQuiz: [
      {
        question: 'Which page replacement algorithm can experience Belady’s anomaly?',
        answer: 'FIFO (First-In, First-Out)',
      },
      {
        question: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
        answer: 'To cache page table translations in hardware and speed up virtual address lookup.',
      },
      {
        question: 'Name one Coffman condition required for deadlock.',
        answer: 'Circular Wait (or Mutual Exclusion, Hold & Wait, No Preemption).',
      },
    ],
  },
  DBMS: {
    topic: 'DBMS',
    title: 'Relational Algebra, SQL Normalization & ACID Properties',
    summary:
      'Database Management Systems guarantee data integrity, relational structure, concurrent access, and durable persistence.',
    keyPoints: [
      'ACID Guarantees: Atomicity (all or nothing), Consistency (preserves invariants), Isolation (serializable concurrent execution), Durability (committed writes survive crashes via WAL).',
      'Normalization Hierarchy: 1NF (atomic attributes), 2NF (no partial dependencies on composite keys), 3NF (no transitive dependencies), BCNF (every determinant is a candidate key).',
      'Indexing: B+ Trees store all records in linked leaves, allowing O(log N) point queries and lightning-fast range scans.',
      'SQL Joins: INNER JOIN, LEFT OUTER JOIN (keeps unmatched left rows), FULL OUTER JOIN, CROSS JOIN (Cartesian product).',
    ],
    codeOrFormula: 'SELECT s.name, AVG(g.score) FROM students s JOIN grades g ON s.id = g.student_id GROUP BY s.name HAVING AVG(g.score) >= 80;',
    miniQuiz: [
      {
        question: 'What does the "I" in ACID stand for?',
        answer: 'Isolation (ensures transactions run independently without intermediate interference).',
      },
      {
        question: 'Why are B+ Trees preferred over binary search trees for disk-based databases?',
        answer: 'High fan-out reduces tree height and minimizes expensive disk I/O operations.',
      },
      {
        question: 'Which normal form eliminates transitive functional dependencies?',
        answer: 'Third Normal Form (3NF).',
      },
    ],
  },
  'Data Structures': {
    topic: 'Data Structures',
    title: 'Asymptotic Complexity, Trees & Graphs',
    summary:
      'Mastering core structures and algorithm paradigms enables scalable problem solving and optimal time/space trade-offs.',
    keyPoints: [
      'Big-O Asymptotics: Constant O(1) < Logarithmic O(log N) < Linear O(N) < Linearithmic O(N log N) < Quadratic O(N²).',
      'Arrays vs Linked Lists: Arrays offer O(1) random index access with cache locality; Linked Lists allow O(1) pointer insertions without reallocation.',
      'Graph Traversals: BFS uses a Queue to find shortest unweighted paths; DFS uses a Stack/Recursion for cycle detection and topological sorting.',
      'Dynamic Programming: Solves problems with Optimal Substructure and Overlapping Subproblems (Memoization top-down vs Tabulation bottom-up).',
    ],
    codeOrFormula: 'Binary Search: mid = low + ((high - low) / 2); Time Complexity: O(log N), Space: O(1)',
    miniQuiz: [
      {
        question: 'What is the average time complexity to search an element in a Hash Table?',
        answer: 'O(1) amortized constant time.',
      },
      {
        question: 'Which traversal visits nodes level-by-level in a tree or graph?',
        answer: 'Breadth-First Search (BFS).',
      },
      {
        question: 'What data structure is used internally by the call stack during recursion?',
        answer: 'A Stack (LIFO - Last In First Out).',
      },
    ],
  },
};

/**
 * Built-In Multiple Choice Question Bank (5+ per main topic)
 */
export const PRACTICE_QUESTION_BANK: PracticeQuestion[] = [
  // OPERATING SYSTEMS (5)
  {
    id: 'os_q1',
    topic: 'Operating Systems',
    difficulty: 'medium',
    question: 'Which of the following conditions is NOT one of Coffman’s four necessary conditions for deadlock?',
    options: [
      'Mutual Exclusion',
      'Preemption by higher-priority process',
      'Hold and Wait',
      'Circular Wait',
    ],
    correctIndex: 1,
    explanation: 'Deadlock requires NO preemption (resources cannot be forcibly confiscated). If preemption is allowed, deadlock is broken.',
  },
  {
    id: 'os_q2',
    topic: 'Operating Systems',
    difficulty: 'easy',
    question: 'What phenomenon occurs when increasing the number of page frames results in an increase in page faults?',
    options: [
      'Thrashing',
      'Belady’s Anomaly',
      'Cache Invalidation',
      'Deadlock Convoy',
    ],
    correctIndex: 1,
    explanation: 'Belady’s Anomaly is a counter-intuitive phenomenon observed primarily in FIFO page replacement.',
  },
  {
    id: 'os_q3',
    topic: 'Operating Systems',
    difficulty: 'medium',
    question: 'Which CPU scheduling algorithm gives the minimum average waiting time for a given set of processes?',
    options: [
      'First-Come First-Served (FCFS)',
      'Round Robin (RR)',
      'Shortest Job First (SJF)',
      'Priority Scheduling without preemption',
    ],
    correctIndex: 2,
    explanation: 'Shortest Job First (SJF) is mathematically provable to yield the minimum average waiting time.',
  },
  {
    id: 'os_q4',
    topic: 'Operating Systems',
    difficulty: 'hard',
    question: 'A system with 3 processes shares 4 instances of a single resource. What is the maximum resource demand per process that guarantees no deadlock can occur?',
    options: ['1', '2', '3', '4'],
    correctIndex: 1,
    explanation: 'For N processes and M resources, deadlock-free condition: sum of max demands < M + N. Here: 3 * D < 4 + 3 = 7 => D <= 2.',
  },
  {
    id: 'os_q5',
    topic: 'Operating Systems',
    difficulty: 'easy',
    question: 'What hardware component speeds up virtual-to-physical address translation?',
    options: [
      'Instruction Cache',
      'Translation Lookaside Buffer (TLB)',
      'Memory Management Unit ROM',
      'DMA Controller',
    ],
    correctIndex: 1,
    explanation: 'The TLB is an associative high-speed hardware cache that stores recent page table translations.',
  },

  // DBMS / SQL (5)
  {
    id: 'db_q1',
    topic: 'DBMS',
    difficulty: 'easy',
    question: 'Which SQL clause is used to filter grouped rows resulting from a GROUP BY statement?',
    options: ['WHERE', 'HAVING', 'FILTER BY', 'ORDER BY'],
    correctIndex: 1,
    explanation: 'HAVING filters aggregate groups, whereas WHERE filters individual rows before grouping occurs.',
  },
  {
    id: 'db_q2',
    topic: 'DBMS',
    difficulty: 'medium',
    question: 'A table is in 3NF if it is in 2NF and has no transitive dependencies. What additional rule elevates it to BCNF?',
    options: [
      'Every determinant must be a candidate key',
      'All multi-valued dependencies must be eliminated',
      'Composite foreign keys must be null',
      'It must not contain any composite primary key',
    ],
    correctIndex: 0,
    explanation: 'Boyce-Codd Normal Form (BCNF) strictly requires that for every functional dependency X -> Y, X must be a superkey/candidate key.',
  },
  {
    id: 'db_q3',
    topic: 'DBMS',
    difficulty: 'medium',
    question: 'In the ACID model, which property ensures that partial transaction modifications are rolled back upon failure?',
    options: ['Consistency', 'Atomicity', 'Isolation', 'Durability'],
    correctIndex: 1,
    explanation: 'Atomicity enforces the "all-or-nothing" rule: either all operations in the transaction succeed, or the system rolls back to the prior state.',
  },
  {
    id: 'db_q4',
    topic: 'DBMS',
    difficulty: 'hard',
    question: 'Why are B+ Trees preferred over standard B-Trees in database index design?',
    options: [
      'They require zero disk seeks',
      'All data records reside in leaf nodes, creating a sequential linked list ideal for range queries',
      'They use binary splits instead of multi-way nodes',
      'They don’t require rebalancing during deletions',
    ],
    correctIndex: 1,
    explanation: 'In B+ Trees, internal nodes only store navigation keys while all data resides in linked leaf nodes, enabling fast sequential range scans.',
  },
  {
    id: 'db_q5',
    topic: 'DBMS',
    difficulty: 'easy',
    question: 'Which join returns all rows from both tables, joining matches where available and placing NULLs where there is no match?',
    options: [
      'INNER JOIN',
      'LEFT OUTER JOIN',
      'RIGHT OUTER JOIN',
      'FULL OUTER JOIN',
    ],
    correctIndex: 3,
    explanation: 'FULL OUTER JOIN combines the results of both left and right outer joins.',
  },

  // DATA STRUCTURES (5)
  {
    id: 'dsa_q1',
    topic: 'Data Structures',
    difficulty: 'easy',
    question: 'What is the worst-case time complexity of searching an element in an unbalanced Binary Search Tree (BST)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctIndex: 2,
    explanation: 'In a degenerate (skewed) BST, the tree resembles a linked list, degrading search time to O(N).',
  },
  {
    id: 'dsa_q2',
    topic: 'Data Structures',
    difficulty: 'medium',
    question: 'Which data structure is primarily used to evaluate arithmetic expressions written in Postfix notation (Reverse Polish Notation)?',
    options: ['Queue', 'Stack', 'Min-Heap', 'Hash Table'],
    correctIndex: 1,
    explanation: 'A Stack stores operands until an operator is encountered, popping the top two operands to evaluate.',
  },
  {
    id: 'dsa_q3',
    topic: 'Data Structures',
    difficulty: 'medium',
    question: 'What is the time complexity of building a Binary Heap of N elements from an unsorted array using bottom-up heapify?',
    options: ['O(N log N)', 'O(N)', 'O(log N)', 'O(N²)'],
    correctIndex: 1,
    explanation: 'Building a heap with bottom-up heapify takes linear O(N) time because lower levels with more nodes have lower heights.',
  },
  {
    id: 'dsa_q4',
    topic: 'Data Structures',
    difficulty: 'hard',
    question: 'Which algorithm finds the single-source shortest path in a graph with non-negative edge weights in O((V + E) log V) time?',
    options: [
      'Bellman-Ford Algorithm',
      'Dijkstra’s Algorithm with a Min-Heap',
      'Floyd-Warshall Algorithm',
      'Kruskal’s Algorithm',
    ],
    correctIndex: 1,
    explanation: 'Dijkstra’s algorithm using an adjacency list and binary min-heap runs in O((V + E) log V) time.',
  },
  {
    id: 'dsa_q5',
    topic: 'Data Structures',
    difficulty: 'easy',
    question: 'In a Circular Queue implemented with an array of size N, what condition signifies that the queue is completely full?',
    options: [
      '(rear + 1) % N == front',
      'rear == front',
      'rear == N - 1',
      'front == 0',
    ],
    correctIndex: 0,
    explanation: 'In a circular array implementation with a dummy slot, (rear + 1) % N == front indicates the queue is full.',
  },
];

/**
 * External Practice Platform Links
 */
export const EXTERNAL_PRACTICE_LINKS: ExternalPracticeLink[] = [
  {
    id: 'prac_leetcode_dsa',
    siteName: 'LeetCode',
    topic: 'Data Structures',
    difficulty: 'medium',
    title: 'Top Interview 150 Algorithms & Data Structures',
    description: 'Solve real company interview problems on Arrays, Trees, Dynamic Programming, and Graphs.',
    url: 'https://leetcode.com/problemset/all/',
    badge: 'Coding & DSA',
    xpReward: 15,
  },
  {
    id: 'prac_gfg_practice',
    siteName: 'GeeksforGeeks Practice',
    topic: 'Data Structures',
    difficulty: 'easy',
    title: 'Curated Topic-wise Problem Tracks',
    description: 'Practice company-wise coding questions with step-by-step editorial explanations.',
    url: 'https://practice.geeksforgeeks.org/',
    badge: 'Problem Solving',
    xpReward: 15,
  },
  {
    id: 'prac_hackerrank_sql',
    siteName: 'HackerRank',
    topic: 'DBMS',
    difficulty: 'medium',
    title: 'SQL Skills Certification & Practice Domain',
    description: 'Practice basic to advanced queries: aggregations, joins, subqueries, and window functions.',
    url: 'https://www.hackerrank.com/domains/sql',
    badge: 'SQL & Database',
    xpReward: 15,
  },
  {
    id: 'prac_sqlzoo',
    siteName: 'SQLZoo',
    topic: 'DBMS',
    difficulty: 'easy',
    title: 'Interactive Live SQL Sandbox & Quizzes',
    description: 'Instant SQL query runner directly against live relational schemas.',
    url: 'https://sqlzoo.net/',
    badge: 'SQL Queries',
    xpReward: 15,
  },
  {
    id: 'prac_kaggle_competitions',
    siteName: 'Kaggle',
    topic: 'Artificial Intelligence',
    difficulty: 'hard',
    title: 'Kaggle Datasets & Community Competitions',
    description: 'Train machine learning models on real-world datasets and evaluate submission metrics.',
    url: 'https://www.kaggle.com/competitions',
    badge: 'ML & Data Science',
    xpReward: 15,
  },
  {
    id: 'prac_indiabix_aptitude',
    siteName: 'IndiaBix',
    topic: 'Aptitude & Reasoning',
    difficulty: 'easy',
    title: 'Quantitative Aptitude & Logical Reasoning Tests',
    description: 'Time and work, percentages, syllogisms, and coding-decoding practice tests.',
    url: 'https://www.indiabix.com/',
    badge: 'Aptitude Tests',
    xpReward: 15,
  },
];

/**
 * Builds authentic search URL for any arbitrary skill or topic
 */
export function buildSearchURL(platform: string, query: string): string {
  const q = encodeURIComponent(query.trim());
  switch (platform.toLowerCase()) {
    case 'youtube':
      return `https://www.youtube.com/results?search_query=${q}+tutorial`;
    case 'geeksforgeeks':
      return `https://www.geeksforgeeks.org/search/?q=${q}`;
    case 'w3schools':
      return `https://www.google.com/search?q=site%3Aw3schools.com+${q}`;
    case 'mdn':
      return `https://developer.mozilla.org/en-US/search?q=${q}`;
    case 'freecodecamp':
      return `https://www.freecodecamp.org/news/search/?query=${q}`;
    case 'leetcode':
      return `https://leetcode.com/problemset/all/?search=${q}`;
    case 'kaggle':
      return `https://www.kaggle.com/search?q=${q}`;
    case 'khan academy':
      return `https://www.khanacademy.org/search?page_search_query=${q}`;
    default:
      return `https://www.google.com/search?q=${q}+tutorial`;
  }
}
