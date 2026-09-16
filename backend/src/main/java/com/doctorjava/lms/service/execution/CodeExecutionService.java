package com.doctorjava.lms.service.execution;

public interface CodeExecutionService {
    /**
     * Execute source code in an isolated sandbox.
     *
     * @param language     e.g. JAVA
     * @param sourceCode   full program source
     * @param stdin        program stdin
     * @param timeLimitMs  wall-clock / CPU limit hint
     * @param memoryLimitKb memory limit hint (may not be strictly enforced by all runtimes)
     */
    ExecutionResult execute(String language, String sourceCode, String stdin, int timeLimitMs, int memoryLimitKb);
}
