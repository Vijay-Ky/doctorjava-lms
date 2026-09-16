package com.doctorjava.lms.service.execution;

public record ExecutionResult(
        String stdout,
        String stderr,
        int exitCode,
        long runtimeMs,
        long memoryKb,
        boolean timedOut,
        boolean compileError
) {
    public static ExecutionResult compileError(String stderr) {
        return new ExecutionResult("", stderr == null ? "" : stderr, -1, 0, 0, false, true);
    }

    public static ExecutionResult timeout(long runtimeMs) {
        return new ExecutionResult("", "Time limit exceeded", -1, runtimeMs, 0, true, false);
    }
}
