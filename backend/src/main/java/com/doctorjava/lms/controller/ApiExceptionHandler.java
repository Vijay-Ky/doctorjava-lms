package com.doctorjava.lms.controller;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.time.*; import java.util.*;
@RestControllerAdvice public class ApiExceptionHandler{
 @ExceptionHandler(NoSuchElementException.class) ResponseEntity<ApiError> notFound(NoSuchElementException e){return ResponseEntity.status(404).body(new ApiError(false,e.getMessage(),"NOT_FOUND",LocalDateTime.now()));}
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<ApiError> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(new ApiError(false,e.getMessage(),"BAD_REQUEST",LocalDateTime.now()));}
 @ExceptionHandler(IllegalStateException.class) ResponseEntity<ApiError> state(IllegalStateException e){return ResponseEntity.status(409).body(new ApiError(false,e.getMessage(),"INVALID_STATE",LocalDateTime.now()));}
 public record ApiError(boolean success,String message,String code,LocalDateTime timestamp){}
}
