export interface CompanyDNA {
    name: string;
    category: 'Service MNC' | 'Product MNC' | 'Consulting' | 'Startup';
    interviewStyle: string;
    focusAreas: string[];
    commonTopics: string[];
    gradingRubric: {
        technical: number;
        communication: number;
        behavioral: number;
        process: number;
        integrity?: number; // AI-cheating detection weight
    };
    secretTriggers: string[];
    rejectionSignals: string[];
    interviewerAdvice: string;
    roleSpecifics: {
        [role: string]: {
            expectations: string[];
            mandatorySkills: string[];
        };
    };
    rounds: string[];
    diagnosticWeights: {
        missingMetrics: number; // Penalty for no numbers
        pluralOwnership: number; // Penalty for "We" instead of "I"
        noTradeoffs: number; // Penalty for ignoring compromises
        techSlop: number; // Penalty for vague terminology
        highHesitation: number; // Penalty for filler words/stalling
    };
}

export const companyData: Record<string, CompanyDNA> = {
    'TCS': {
        name: 'TCS',
        category: 'Service MNC',
        interviewStyle: 'NQT Filtered -> Technical (Breadth) -> Managerial -> HR.',
        focusAreas: ['Core DSA', 'DBMS', 'OOP Principles', 'SDLC Models'],
        commonTopics: ['SQL DDL vs DML', 'Hoisting', 'Middlewares', 'CEO & Innovations'],
        gradingRubric: { technical: 0.8, communication: 0.6, behavioral: 0.8, process: 0.7, integrity: 0.9 },
        secretTriggers: [
            'Knowledge of current CEO (K. Krithivasan)',
            'Stability & Long-term Reliability',
            'Notice Period Flexibility',
            'Code Readability over Complexity'
        ],
        rejectionSignals: [
            'Lag in response (AI assist detection)',
            'Weak SDLC fundamentals',
            'Circular reasoning in HR round',
            'Inability to define "Agile" in a corporate context',
            'Foundational Trivia failure (OOPs/DBMS core definitions)'
        ],
        interviewerAdvice: 'Focus on breadth. Show brand alignment. Tolerant of Hinglish, but requires clear CS fundamentals (OOPs/SOLID).',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Version control (Git)', 'MERN basics', 'MVC understanding'],
                mandatorySkills: ['React', 'NodeJS', 'MongoDB', 'Express', 'SQL']
            }
        },
        rounds: ['compass-behavioral-intro', 'debug-react-hook-loop', 'node-middleware-auth'],
        diagnosticWeights: {
            missingMetrics: 0.3,
            pluralOwnership: 0.3,
            noTradeoffs: 0.4,
            techSlop: 0.4,
            highHesitation: 0.5
        }
    },
    'Deloitte': {
        name: 'Deloitte',
        category: 'Consulting',
        interviewStyle: 'Hypothesis-driven Case Interviews + Technical Defense.',
        focusAreas: ['Architecture', 'Agile', 'Case Analysis', 'Client Readiness'],
        commonTopics: ['MECE Framework', '3-Tier Architecture', 'SQL vs NoSQL trade-offs', 'SOLID Principles'],
        gradingRubric: { technical: 0.7, communication: 0.9, behavioral: 0.8, process: 0.9 },
        secretTriggers: [
            'Defensibility of thinking (why this choice?)',
            'MECE structure in case analysis (Mutually Exclusive, Collectively Exhaustive)',
            'Client-ready presence & tone',
            'Structured requirement gathering'
        ],
        rejectionSignals: [
            'Indecisiveness under pressure',
            'Lack of "Professional Presence"',
            'Poor requirement clarification',
            'Over-application to unrelated service lines'
        ],
        interviewerAdvice: 'Be consultative. Don\'t just build; explain how it solves the client\'s business logic. Use the RADIO framework.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Frontend-Backend security sync', 'Enterprise-ready thinking', 'TDD/BDD awareness'],
                mandatorySkills: ['React', 'Node.js', 'SQL', 'Git', 'TypeScript']
            }
        },
        rounds: ['deloitte-mece-case', 'review-callback-hell', 'node-middleware-auth'],
        diagnosticWeights: {
            missingMetrics: 0.4,
            pluralOwnership: 0.3,
            noTradeoffs: 0.8, // Consulting focus
            techSlop: 0.7,
            highHesitation: 0.6
        }
    },
    'Amazon': {
        name: 'Amazon',
        category: 'Product MNC',
        interviewStyle: 'Leadership Principle (LP) Probing + Bar Raiser Review.',
        focusAreas: ['DSA Optimization', 'System Design (HLD/LLD)', 'Leadership Principles'],
        commonTopics: ['STAR Method', 'Impact Metrics (>$1M)', 'Scalability', 'CAP Theorem', 'L1-L3 Deep Probing'],
        gradingRubric: { technical: 0.9, communication: 0.7, behavioral: 0.9, process: 0.8 },
        secretTriggers: [
            'Detailed STAR stories with specific "I" contributions',
            'Ownership evidence (fixing things without being asked)',
            'Action-oriented data-driven impact',
            'Simplicity in code design'
        ],
        rejectionSignals: [
            'Recency Bias (lack of high-impact recent work)',
            'Giving "We" instead of "I" in STAR stories',
            'Low-value stories with no metrics',
            'Inability to handle "Bar Raiser" deep-dives (why? why? why?)',
            'Hand-waving on system failure modes (e.g., retries/concurrency)'
        ],
        interviewerAdvice: 'Quantify everything. Use the 16 Leadership Principles. Be prepared to walk through your specific "Scenario Analysis" for system failures.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Deep JS internals', 'Memory management in Node', 'High availability sets'],
                mandatorySkills: ['JavaScript', 'AWS', 'React', 'Node.js', 'Redis', 'NoSQL']
            }
        },
        rounds: ['compass-behavioral-intro', 'react-custom-hook-memory', 'faang-retry-storm-diag'],
        diagnosticWeights: {
            missingMetrics: 0.8, // Amazon CRITICAL
            pluralOwnership: 0.7, // Amazon CRITICAL (Ownership LP)
            noTradeoffs: 0.5,
            techSlop: 0.6,
            highHesitation: 0.4
        }
    },
    'Microsoft': {
        name: 'Microsoft',
        category: 'Product MNC',
        interviewStyle: 'Engineering Judgment focused. "Growth Mindset" evaluation.',
        focusAreas: ['Design Maturity', 'Extensibility', 'Versioning', 'AI System Design'],
        commonTopics: ['HLD/LLD', 'Cold start latency', 'Authentic Ownership', 'Distributed Systems'],
        gradingRubric: { technical: 0.9, communication: 0.8, behavioral: 0.8, process: 0.7 },
        secretTriggers: [
            'Handling of "unknown unknowns"',
            'Admitting mistakes (Growth Mindset)',
            'Backward compatibility thinking',
            'Focus on engineering excellence over speed'
        ],
        rejectionSignals: [
            'Canned/Scripted answers',
            'Over-engineering simple problems',
            'Panic under ambiguity',
            'Inability to discuss distributed cache or concurrency'
        ],
        interviewerAdvice: 'Focus on extensibility. Be honest about failures. Discuss AI orchestration costs and engineering trade-offs.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['JSON-driven engines', 'AI orchestration', 'Production monitoring'],
                mandatorySkills: ['Node.js', 'React 19 (RSCs)', 'TypeScript', 'System Design', 'Azure']
            }
        },
        rounds: ['microsoft-distributed-cache', 'react19-rsc-boundary', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.5,
            pluralOwnership: 0.4,
            noTradeoffs: 0.7,
            techSlop: 0.6,
            highHesitation: 0.3
        }
    },
    'FAANG (Universal)': {
        name: 'FAANG',
        category: 'Product MNC',
        interviewStyle: 'Scenario-Based Debugging -> Deep System Design -> Cultural Bar Raiser.',
        focusAreas: ['Engineering Judgment', 'Scale Diagnostics', 'Concept Clarity'],
        commonTopics: ['React Fiber internals', 'libuv Event Loop', 'Retry Storms', 'Consistency Models'],
        gradingRubric: { technical: 1.0, communication: 0.8, behavioral: 0.9, process: 0.9 },
        secretTriggers: [
            'Reasoning from First Principles',
            'Layered Debugging (Client -> Gateway -> DB)',
            'Quantifying tradeoffs with metrics',
            'Handling performance regressions',
            'Scenario Analysis (diagnosing system traces)'
        ],
        rejectionSignals: [
            'Surface-level knowledge (can\'t explain RSCs internals or React Compiler)',
            'Slop City (ignoring security/validation/concurrency)',
            'Hand-waving during system design',
            'Inability to walk through system logs or failure modes'
        ],
        interviewerAdvice: 'The FAANG Diagnostician will give you logs. Walk the stack systematically. Probes on React 19 RSCs and Node 23 concurrency are mandatory.',
        roleSpecifics: {
            'Senior Full-Stack': {
                expectations: ['Architectural foresight', 'Operational reliability', 'React Compiler mastery'],
                mandatorySkills: ['React 19', 'Node.js 23', 'Distributed Systems', 'Observability', 'Retry Storm Prevention']
            }
        },
        rounds: ['faang-retry-storm-diag', 'react-context-perf', 'node-backpressure-handler'],
        diagnosticWeights: {
            missingMetrics: 0.7,
            pluralOwnership: 0.6,
            noTradeoffs: 0.8,
            techSlop: 0.9,
            highHesitation: 0.5
        }
    },
    'Accenture': {
        name: 'Accenture',
        category: 'Service MNC',
        interviewStyle: 'Gamified Cognitive Tests + communication Screen -> Technical Round.',
        focusAreas: ['Digital Fluency', 'Emotional Resilience', 'Gamified Pattern Matching'],
        commonTopics: ['SOAR Method', 'MVC Architecture', 'Verbal Fluency', 'Digital Core'],
        gradingRubric: { technical: 0.6, communication: 0.9, behavioral: 0.8, process: 0.8 },
        secretTriggers: [
            'Identify problems before assignment',
            '50/50 Rule in dialogue (Listening as much as talking)',
            'Learning Agility in new tech stacks',
            'Pattern matching speed'
        ],
        rejectionSignals: [
            'Lack of pronunciation clarity',
            'Poor emotional resilience during pressure tests',
            'Basic/Generic projects that lack innovation',
            'Failing the automated communication round'
        ],
        interviewerAdvice: 'Nail the initial screening. Be concise, professional, and highlight your versatility across domains.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Professional pronunciation', 'Client-centric behavior', 'Versatility'],
                mandatorySkills: ['JavaScript', 'HTML/CSS', 'React', 'Node.js', 'Agile']
            }
        },
        rounds: ['compass-behavioral-intro', 'debug-react-hook-loop', 'node-middleware-auth'],
        diagnosticWeights: {
            missingMetrics: 0.2, // Focus on communication
            pluralOwnership: 0.2,
            noTradeoffs: 0.3,
            techSlop: 0.4,
            highHesitation: 0.8 // Critical for Accenture
        }
    },
    'Startup (Seed-Growth)': {
        name: 'Startup',
        category: 'Startup',
        interviewStyle: 'Shipping Ability & Partner Mindset. High velocity loops.',
        focusAreas: ['Product Thinking', 'Intrinsic Motivation', 'Velocity', 'Generalist Skills'],
        commonTopics: ['Project from scratch', 'Minimal direction handling', 'Chaotic reality check'],
        gradingRubric: { technical: 0.8, communication: 0.7, behavioral: 0.9, process: 0.5 },
        secretTriggers: [
            'Build ability (Zero-to-One)',
            'Trajectory/Growth potential',
            'Identifying product bugs before they are assigned',
            'Founder-level ownership'
        ],
        rejectionSignals: [
            'Waiting for instructions',
            'Preference for narrow/defined roles',
            'Notice period > 45 days',
            'Inability to handle ambiguity',
            'Service-mindset (waiting for Jira tickets vs building features)'
        ],
        interviewerAdvice: 'Show projects you built from scratch. Mastery of the Machine Coding Gauntlet (90m). Probes for "Product Ownership" vs "Service execution".',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['SaaS boilerplate speed', 'End-to-end feature ownership', 'Modularity (Strategy Pattern)'],
                mandatorySkills: ['React 19', 'Node.js', 'MongoDB Sharding', 'Deployment (Vercel/AWS)', 'Strategy Pattern']
            }
        },
        rounds: ['compass-behavioral-intro', 'zomato-rag-optimization', 'swiggy-vanilla-nested-comments'],
        diagnosticWeights: {
            missingMetrics: 0.6,
            pluralOwnership: 0.8, // Startup Ownership
            noTradeoffs: 0.6,
            techSlop: 0.5,
            highHesitation: 0.4
        }
    },
    'Zomato': {
        name: 'Zomato',
        category: 'Product MNC',
        interviewStyle: 'Product Operator Round -> AI/ML Context Deep-Dive -> Cultural Fit.',
        focusAreas: ['Hyper-local Logistics', 'AI Agents (RAG)', 'DynamoDB Design'],
        commonTopics: ['Single-table NoSQL design', 'Context Engineering', 'Latencies & Delivery algorithms'],
        gradingRubric: { technical: 0.9, communication: 0.8, behavioral: 0.9, process: 0.7 },
        secretTriggers: [
            'Identifying product bugs before assignment',
            'Zero-to-One build ability in MERN',
            'Deep knowledge of DynamoDB GSI/LSI partitioning',
            'AI prompt cost optimization'
        ],
        rejectionSignals: [
            'Explainability failure (can\'t justify AI code)',
            'Waiting for instructions (Low agency)',
            'Ignoring security & NoSQL injection risks',
            'Proposing solutions based on "vibe-checks" rather than metrics',
            'Tier-3 rote-learning (memorized leetcode without pattern recognition)'
        ],
        interviewerAdvice: 'Be a Product Engineer. Probing for pattern recognition (Sliding Window/Graphs) over memorized problems.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['AI Agent integration', 'Sub-second search optimization', 'Single-table modelling'],
                mandatorySkills: ['Node.js', 'React', 'DynamoDB', 'LLM Prompt Engineering']
            }
        },
        rounds: ['zomato-rag-optimization', 'swiggy-vanilla-nested-comments', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.7,
            pluralOwnership: 0.7,
            noTradeoffs: 0.6,
            techSlop: 0.6,
            highHesitation: 0.4
        }
    },
    'Swiggy': {
        name: 'Swiggy',
        category: 'Product MNC',
        interviewStyle: 'Vanilla JS Machine Coding -> Fast Data Pipeline -> CI/CD Ownership.',
        focusAreas: ['Fast Data (Kafka/Confluent)', 'Sub-second Latency', 'Infrastructure Simplification'],
        commonTopics: ['Vanilla JS DOM Manipulation', 'Message Broker architecture', 'Fault tolerance in real-time'],
        gradingRubric: { technical: 0.9, communication: 0.7, behavioral: 0.8, process: 0.9 },
        secretTriggers: [
            'Functional Fluency (code compiles on first attempt)',
            'Product Empathy (how tech impacts conversion)',
            'Full-stack CI/CD ownership',
            'Refactoring "slop" into performant modules'
        ],
        rejectionSignals: [
            'Basic/Generic projects that lack innovation',
            'Over-reliance on libraries for basic logic',
            'Inability to debug distributed failures via traces',
            'Ignoring bundle size & performance observability'
        ],
        interviewerAdvice: 'Master the fundamentals. Be ready to code without React/libraries in the machine round. Ownership is everything.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Sub-second UI response', 'Kafka stream integration', 'Automated rollbacks'],
                mandatorySkills: ['JavaScript (Vanilla)', 'React', 'Node.js', 'Kafka', 'Redis']
            }
        },
        rounds: ['swiggy-vanilla-nested-comments', 'debug-node-memory-leak', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.6,
            pluralOwnership: 0.6,
            noTradeoffs: 0.7,
            techSlop: 0.6,
            highHesitation: 0.4
        }
    },
    'Razorpay': {
        name: 'Razorpay',
        category: 'Product MNC',
        interviewStyle: 'Architectural Rigor -> Security & Compliance -> Fintech System Design.',
        focusAreas: ['Transactional Integrity', 'RBAC & Security', 'Financial Compliance'],
        commonTopics: ['ACID in NoSQL', 'Auth & RBAC design', 'Idempotency in payments', 'Secure API design'],
        gradingRubric: { technical: 0.9, communication: 0.8, behavioral: 0.8, process: 0.9 },
        secretTriggers: [
            'Security First mindset (anticipating XSS/CSRF)',
            'Mastery of transactional state machines',
            'Deep understanding of API idempotency',
            'Regulatory awareness in code architecture'
        ],
        rejectionSignals: [
            'Security neglect or "vibe-checks" on data integrity',
            'Ignoring race conditions in multi-tenant systems',
            'Weak knowledge of Node.js event loop internals',
            'Lack of accountability in bug triaging'
        ],
        interviewerAdvice: 'Precision matters. Fintech has zero room for error. Show you can architect for reliability and regulatory compliance.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Secure-by-design architecture', 'Transactional consistency', 'Zero-downtime migrations'],
                mandatorySkills: ['Node.js', 'Java/Spring (optional/awareness)', 'React', 'SQL/NoSQL Hybrid']
            }
        },
        rounds: ['razorpay-idempotency-key', 'node-stream-processing', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.8, // Fintech precision
            pluralOwnership: 0.6,
            noTradeoffs: 0.9, // Security tradeoffs
            techSlop: 0.8,
            highHesitation: 0.4
        }
    },
    'Google': {
        name: 'Google',
        category: 'Product MNC',
        interviewStyle: 'First Principles DSA -> High-Scale System Design -> Googliness & Leadership.',
        focusAreas: ['Algorithms (Optimization)', 'Distributed Systems', 'Googliness', 'Privacy & Security'],
        commonTopics: ['Big O Analysis', 'Graph Theory', 'MapReduce basics', 'Privacy by Design'],
        gradingRubric: { technical: 1.0, communication: 0.8, behavioral: 0.8, process: 0.9 },
        secretTriggers: [
            'Optimization from O(N) to O(log N)',
            'Considering edge cases before implementation',
            'Strong theoretical foundation (comp-sci fundamentals)',
            'Collaborative problem solving'
        ],
        rejectionSignals: [
            'Brute force only without optimization target',
            'Difficulty with basic complexity analysis',
            'Lack of curiosity about Google\'s scale',
            'Siloed thinking (failing to consider system impact)'
        ],
        interviewerAdvice: 'Think out loud. Focus on efficiency. Google interviewers love seeing how you handle ambiguity and scale.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['High efficiency UI', 'Scalable backend logic', 'Deep knowledge of browser internals'],
                mandatorySkills: ['React', 'Node.js', 'TypeScript', 'System Design']
            }
        },
        rounds: ['google-lru-ttl', 'faang-retry-storm-diag', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.4,
            pluralOwnership: 0.3,
            noTradeoffs: 0.9, // Google CRITICAL (Engineering Judgment)
            techSlop: 0.8, // Google CRITICAL (Precision)
            highHesitation: 0.5
        }
    },
    'Meta': {
        name: 'Meta',
        category: 'Product MNC',
        interviewStyle: 'Product Architecture -> Mobile/Web Efficiency -> Cultural Alignment.',
        focusAreas: ['Frontend Performance', 'Product Sense', 'Real-time Systems', 'UI Interaction'],
        commonTopics: ['React Internals', 'GraphQL vs REST', 'Optimistic UI', 'Relay/Apollo'],
        gradingRubric: { technical: 0.9, communication: 0.8, behavioral: 0.8, process: 0.9 },
        secretTriggers: [
            'Focus on "End-to-End" user experience',
            'Understanding of the "Move Fast" philosophy with quality',
            'Data-informed UI decisions',
            'React performance mastery'
        ],
        rejectionSignals: [
            'Ignoring client-side performance',
            'Lack of product empathy',
            'Over-engineering common UI patterns',
            'Weak knowledge of state management'
        ],
        interviewerAdvice: 'Meta is very product-focused. Show that you care about the impact your code has on the user.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['High-performance React', 'GraphQL integration', 'Mobile-first thinking'],
                mandatorySkills: ['React', 'Relay/GraphQL', 'Node.js', 'System Design']
            }
        },
        rounds: ['meta-feed-rendering', 'react-context-perf', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.6,
            pluralOwnership: 0.6,
            noTradeoffs: 0.8,
            techSlop: 0.7,
            highHesitation: 0.4
        }
    },
    'Netflix': {
        name: 'Netflix',
        category: 'Product MNC',
        interviewStyle: 'Technical Depth Round -> Culture of Freedom & Responsibility -> Senior Review.',
        focusAreas: ['System Resilience', 'Microservices', 'Observability', 'Netflix Culture'],
        commonTopics: ['Chaos Engineering', 'gRPC', 'Reactive Programming', 'Content Delivery Networks'],
        gradingRubric: { technical: 1.0, communication: 0.9, behavioral: 1.0, process: 0.8 },
        secretTriggers: [
            'Culture Memo alignment (Radical Candor)',
            'Ownership of failures',
            'Understanding of "The No Rules Rules" philosophy',
            'Focus on observability and monitoring'
        ],
        rejectionSignals: [
            'Lack of "Culture Fit" (Netflix is very particular)',
            'Weak understanding of distributed systems',
            'Ignoring system failure modes',
            'Resistance to feedback'
        ],
        interviewerAdvice: 'Read the Netflix Culture Memo. Be honest, direct, and show your technical depth in distributed systems.',
        roleSpecifics: {
            'Full-Stack (MERN)': {
                expectations: ['Resilient Microservices', 'High-throughput APIs', 'Edge computing'],
                mandatorySkills: ['Node.js', 'React', 'Distributed Systems', 'Observability']
            }
        },
        rounds: ['netflix-circuit-breaker', 'node-backpressure-handler', 'compass-behavioral-intro'],
        diagnosticWeights: {
            missingMetrics: 0.5,
            pluralOwnership: 0.9, // Netflix Culture
            noTradeoffs: 0.9,
            techSlop: 0.8,
            highHesitation: 0.5
        }
    }
};
