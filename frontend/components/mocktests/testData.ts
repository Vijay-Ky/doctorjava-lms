export interface Question {
  id: string;
  topic: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MockTest {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  description: string;
  passPercentage: number;
  questions: Question[];
}

export interface AttemptAnswer {
  questionId: string;
  selectedIndex: number | null;
  markedForReview: boolean;
  visited: boolean;
}

export interface AttemptResult {
  testId: string;
  testTitle: string;
  submittedAt: string;
  timeTakenSeconds: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  scorePercentage: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  answers: AttemptAnswer[];
}

export const MOCK_TESTS: MockTest[] = [
  {
    id: "core-java",
    title: "Core Java Fundamentals",
    category: "Core Java",
    difficulty: "Beginner",
    durationMinutes: 10,
    passPercentage: 60,
    description:
      "Tests your grip on OOP concepts, collections, exception handling and multithreading basics.",
    questions: [
      {
        id: "cj-1",
        topic: "OOP",
        text: "Which OOP principle allows a class to acquire properties and behavior of another class?",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
        correctIndex: 1,
        explanation:
          "Inheritance lets a subclass acquire the fields and methods of a parent class, enabling code reuse.",
      },
      {
        id: "cj-2",
        topic: "Data Types",
        text: "What is the default value of a boolean instance variable in Java?",
        options: ["true", "false", "0", "null"],
        correctIndex: 1,
        explanation: "Uninitialized boolean instance variables default to false in Java.",
      },
      {
        id: "cj-3",
        topic: "Collections",
        text: "Which collection class does NOT allow duplicate elements?",
        options: ["ArrayList", "LinkedList", "HashSet", "Vector"],
        correctIndex: 2,
        explanation: "HashSet is backed by a hash table and does not permit duplicate elements.",
      },
      {
        id: "cj-4",
        topic: "Exception Handling",
        text: "Which block always executes whether or not an exception is thrown?",
        options: ["try", "catch", "finally", "throw"],
        correctIndex: 2,
        explanation: "The finally block executes regardless of whether an exception occurred, unless the JVM exits.",
      },
      {
        id: "cj-5",
        topic: "Multithreading",
        text: "Which method is used to start a new thread's execution in Java?",
        options: ["run()", "start()", "execute()", "init()"],
        correctIndex: 1,
        explanation: "start() creates a new call stack and invokes run() on a separate thread; calling run() directly does not spawn a thread.",
      },
      {
        id: "cj-6",
        topic: "Keywords",
        text: "Which keyword is used to prevent a class from being subclassed?",
        options: ["static", "final", "const", "sealed"],
        correctIndex: 1,
        explanation: "A class declared final cannot be extended by any other class.",
      },
      {
        id: "cj-7",
        topic: "Memory Management",
        text: "Which part of JVM memory stores objects created using 'new'?",
        options: ["Stack", "Heap", "Method Area", "Register"],
        correctIndex: 1,
        explanation: "All objects and their instance variables are allocated on the Heap in Java.",
      },
      {
        id: "cj-8",
        topic: "Interfaces",
        text: "Since which Java version can interfaces have default methods with implementation?",
        options: ["Java 6", "Java 7", "Java 8", "Java 11"],
        correctIndex: 2,
        explanation: "Java 8 introduced default and static methods in interfaces.",
      },
    ],
  },
  {
    id: "spring-boot",
    title: "Spring Boot & Microservices",
    category: "Spring Boot",
    difficulty: "Intermediate",
    durationMinutes: 12,
    passPercentage: 60,
    description:
      "Covers Spring Boot annotations, REST API design, dependency injection and microservices architecture.",
    questions: [
      {
        id: "sb-1",
        topic: "Annotations",
        text: "Which annotation marks a class as a Spring Boot REST controller returning JSON/XML directly?",
        options: ["@Controller", "@RestController", "@Service", "@Repository"],
        correctIndex: 1,
        explanation: "@RestController combines @Controller and @ResponseBody, so return values are written directly to the response body.",
      },
      {
        id: "sb-2",
        topic: "Dependency Injection",
        text: "What is the primary design pattern Spring uses for dependency injection?",
        options: ["Singleton", "Inversion of Control", "Factory", "Observer"],
        correctIndex: 1,
        explanation: "Spring's DI is an implementation of the Inversion of Control (IoC) principle.",
      },
      {
        id: "sb-3",
        topic: "REST APIs",
        text: "Which HTTP method is idempotent and used to update an entire resource?",
        options: ["POST", "PUT", "PATCH", "GET"],
        correctIndex: 1,
        explanation: "PUT replaces the full resource and produces the same result no matter how many times it's called — making it idempotent.",
      },
      {
        id: "sb-4",
        topic: "Configuration",
        text: "Which file/format is most commonly used for externalized Spring Boot configuration?",
        options: ["web.xml", "application.properties / application.yml", "beans.xml", "pom.json"],
        correctIndex: 1,
        explanation: "Spring Boot auto-loads configuration from application.properties or application.yml on the classpath.",
      },
      {
        id: "sb-5",
        topic: "Microservices",
        text: "Which component in a microservices architecture handles routing requests to the correct service?",
        options: ["Config Server", "API Gateway", "Service Registry", "Circuit Breaker"],
        correctIndex: 1,
        explanation: "An API Gateway sits in front of services and routes, aggregates, or filters incoming client requests.",
      },
      {
        id: "sb-6",
        topic: "Data Access",
        text: "Which Spring Data interface provides built-in CRUD operations with minimal code?",
        options: ["JpaRepository", "EntityManager", "DataSource", "JdbcTemplate"],
        correctIndex: 0,
        explanation: "JpaRepository extends CrudRepository and PagingAndSortingRepository, giving CRUD out of the box.",
      },
      {
        id: "sb-7",
        topic: "Resilience",
        text: "Which pattern prevents cascading failures by stopping calls to a failing downstream service?",
        options: ["Load Balancing", "Circuit Breaker", "Caching", "Sharding"],
        correctIndex: 1,
        explanation: "A Circuit Breaker (e.g. Resilience4j) trips after repeated failures and fails fast instead of overloading a struggling service.",
      },
      {
        id: "sb-8",
        topic: "Annotations",
        text: "Which annotation injects a Spring-managed bean into a field or constructor?",
        options: ["@Bean", "@Autowired", "@Component", "@Value"],
        correctIndex: 1,
        explanation: "@Autowired tells Spring to resolve and inject a matching bean automatically.",
      },
    ],
  },
  {
    id: "full-stack",
    title: "Full Stack Combined Mock",
    category: "Full Stack",
    difficulty: "Advanced",
    durationMinutes: 15,
    passPercentage: 65,
    description:
      "A mixed placement-style test spanning Java, Spring Boot, React, SQL and system design fundamentals.",
    questions: [
      {
        id: "fs-1",
        topic: "React",
        text: "Which React hook is used to perform side effects like data fetching?",
        options: ["useState", "useEffect", "useMemo", "useRef"],
        correctIndex: 1,
        explanation: "useEffect runs side effects after render, making it the standard place for data fetching.",
      },
      {
        id: "fs-2",
        topic: "SQL",
        text: "Which SQL clause is used to filter grouped rows after a GROUP BY?",
        options: ["WHERE", "HAVING", "FILTER", "ORDER BY"],
        correctIndex: 1,
        explanation: "HAVING filters aggregated groups, whereas WHERE filters rows before aggregation.",
      },
      {
        id: "fs-3",
        topic: "System Design",
        text: "What is the primary purpose of database indexing?",
        options: ["Reduce storage size", "Speed up read queries", "Enforce foreign keys", "Encrypt data"],
        correctIndex: 1,
        explanation: "Indexes create a fast lookup structure so the database avoids full table scans on reads.",
      },
      {
        id: "fs-4",
        topic: "Java",
        text: "Which functional interface represents a function that takes one argument and returns a boolean?",
        options: ["Supplier<T>", "Predicate<T>", "Function<T,R>", "Consumer<T>"],
        correctIndex: 1,
        explanation: "Predicate<T> defines a test(T t) method returning a boolean — perfect for filtering.",
      },
      {
        id: "fs-5",
        topic: "React",
        text: "What does React's virtual DOM primarily optimize?",
        options: ["Network requests", "Bundle size", "Re-render / DOM update performance", "SEO ranking"],
        correctIndex: 2,
        explanation: "The virtual DOM diffs changes in memory and batches minimal real-DOM updates for performance.",
      },
      {
        id: "fs-6",
        topic: "DevOps",
        text: "In Docker, what does an 'image' become once it is executed?",
        options: ["A volume", "A container", "A registry", "A Dockerfile"],
        correctIndex: 1,
        explanation: "A running instance of a Docker image is called a container.",
      },
      {
        id: "fs-7",
        topic: "System Design",
        text: "Which approach is best suited for scaling a stateless REST API under high traffic?",
        options: ["Vertical scaling only", "Horizontal scaling with a load balancer", "Increasing DB replicas only", "Reducing API endpoints"],
        correctIndex: 1,
        explanation: "Stateless services scale well horizontally — you add more instances behind a load balancer.",
      },
      {
        id: "fs-8",
        topic: "Java",
        text: "What does the 'volatile' keyword guarantee in Java?",
        options: [
          "Thread-safe increments",
          "Visibility of variable updates across threads",
          "Atomic compound operations",
          "Faster garbage collection",
        ],
        correctIndex: 1,
        explanation: "volatile ensures a variable's value is always read from/written to main memory, giving visibility guarantees (not atomicity).",
      },
      {
        id: "fs-9",
        topic: "SQL",
        text: "Which JOIN returns all rows from the left table and matched rows from the right table?",
        options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"],
        correctIndex: 2,
        explanation: "LEFT JOIN keeps every row from the left table, filling unmatched right-side columns with NULL.",
      },
      {
        id: "fs-10",
        topic: "React",
        text: "Which state management approach is built into React for sharing state across deeply nested components without prop drilling?",
        options: ["Redux", "Context API", "Local Storage", "Zustand"],
        correctIndex: 1,
        explanation: "React's built-in Context API lets you share values across the tree without passing props manually at every level.",
      },
    ],
  },
];
