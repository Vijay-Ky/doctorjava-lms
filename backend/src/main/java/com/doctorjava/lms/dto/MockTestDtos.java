package com.doctorjava.lms.dto;
import com.doctorjava.lms.entity.Question; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.util.*;
public final class MockTestDtos { private MockTestDtos(){}
 public record TestRequest(@NotBlank String title,String description,@NotNull Long subjectId,@NotNull Question.Difficulty difficulty,@NotNull @Min(1) Integer durationMinutes,@NotNull @DecimalMin("0.01") BigDecimal marksPerQuestion,@NotNull @DecimalMin("0.00") BigDecimal negativeMarks,@NotNull @Min(0) @Max(100) Integer passPercentage,String instructions,@NotEmpty List<Long> questionIds,boolean published){}
 public record TestCardResponse(Long id,String testCode,String title,String description,String subject,String difficulty,Integer durationMinutes,Integer totalQuestions,BigDecimal marksPerQuestion,BigDecimal negativeMarks,Integer passPercentage,boolean published){}
 public record TestDetailResponse(Long id,String testCode,String title,String description,String subject,String difficulty,Integer durationMinutes,Integer totalQuestions,BigDecimal marksPerQuestion,BigDecimal negativeMarks,Integer passPercentage,String instructions,List<QuestionDtos.StudentQuestionResponse> questions){}
 public record AttemptStartResponse(Long attemptId,String attemptCode,java.time.LocalDateTime startedAt,java.time.LocalDateTime expiresAt,Integer durationSeconds,String title,List<QuestionDtos.StudentQuestionResponse> questions){}
 public record AnswerRequest(Long selectedOptionId,Boolean markedForReview,Boolean visited,Long timeSpentSeconds){}
 public record SubmitResponse(Long attemptId,java.math.BigDecimal score,java.math.BigDecimal maxScore,java.math.BigDecimal percentage,Integer correct,Integer incorrect,Integer unanswered,boolean passed,long timeTakenSeconds,List<AnswerReview> answers){}
 public record AnswerReview(Long questionId,String type,String topic,String questionText,String codeContent,String codeLanguage,List<QuestionDtos.OptionResponse> options,Long selectedOptionId,Long correctOptionId,Boolean correct,String explanation,BigDecimal awardedMarks){}
}
