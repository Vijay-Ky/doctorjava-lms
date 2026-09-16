package com.doctorjava.lms.controller;
import com.doctorjava.lms.dto.MockTestDtos.*; import com.doctorjava.lms.service.MockTestService; import jakarta.validation.Valid; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1/admin/mock-tests")
public class MockTestAdminController{
 private final MockTestService service; public MockTestAdminController(MockTestService service){this.service=service;}
 @GetMapping public List<TestCardResponse> list(){return service.list();}
 @PostMapping public TestCardResponse create(@Valid @RequestBody TestRequest request){return service.create(request);}
 @PutMapping("/{id}") public TestCardResponse update(@PathVariable Long id,@Valid @RequestBody TestRequest request){return service.update(id,request);}
 @DeleteMapping("/{id}") public void delete(@PathVariable Long id){service.delete(id);}
}
