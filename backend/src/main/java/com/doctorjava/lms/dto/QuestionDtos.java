package com.doctorjava.lms.dto;
import com.doctorjava.lms.entity.Question; import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.util.*;
public final class QuestionDtos { private QuestionDtos(){}
 public record OptionRequest(@NotBlank String key,@NotBlank String text,boolean correct){}
 public record QuestionRequest(@NotNull Question.QuestionType type,@NotNull Long subjectId,@NotNull Long topicId,String subtopic,@NotNull Question.Difficulty difficulty,
   String questionText,String codeContent,String codeLanguage,@NotBlank String explanation,@NotNull @DecimalMin("0.01") BigDecimal marks,@NotNull @DecimalMin("0.00") BigDecimal negativeMarks,
   @NotEmpty @Size(min=4,max=4) List<OptionRequest> options,String status){}
 public record OptionResponse(Long id,String key,String text){}
 public record AdminOptionResponse(Long id,String key,String text,boolean correct){}
 public record AdminQuestionResponse(Long id,String questionCode,String type,Long subjectId,String subject,Long topicId,String topic,String subtopic,String difficulty,String questionText,String codeContent,String codeLanguage,String explanation,BigDecimal marks,BigDecimal negativeMarks,String status,List<AdminOptionResponse> options){}
 public record StudentQuestionResponse(Long id,String type,String topic,String difficulty,String questionText,String codeContent,String codeLanguage,List<OptionResponse> options){}
}
