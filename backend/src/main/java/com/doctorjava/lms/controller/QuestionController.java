package com.doctorjava.lms.controller;

import com.doctorjava.lms.dto.QuestionDtos.*; import com.doctorjava.lms.entity.Question; import com.doctorjava.lms.service.QuestionService; import jakarta.validation.Valid; import org.springframework.data.domain.Page; import org.springframework.web.bind.annotation.*;

@RestController("practiceQuestionController") @RequestMapping("/api/v1/admin/questions")
public class QuestionController {
    private final QuestionService service; public QuestionController(QuestionService service){this.service=service;}
    @GetMapping public Page<AdminQuestionResponse> list(@RequestParam(required=false) String search,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return service.list(search,page,Math.min(size,100));}
    @GetMapping("/{id}") public AdminQuestionResponse get(@PathVariable Long id){return service.get(id);}
    @PostMapping public AdminQuestionResponse create(@Valid @RequestBody QuestionRequest request){return service.create(request);}
    @PutMapping("/{id}") public AdminQuestionResponse update(@PathVariable Long id,@Valid @RequestBody QuestionRequest request){return service.update(id,request);}
    @DeleteMapping("/{id}") public void archive(@PathVariable Long id){service.archive(id);}
    @PatchMapping("/{id}/status") public AdminQuestionResponse status(@PathVariable Long id,@RequestBody StatusRequest request){ return service.updateStatus(id, Question.QuestionStatus.valueOf(request.status())); }
    public record StatusRequest(String status){}
}
