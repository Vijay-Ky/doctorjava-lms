package com.doctorjava.lms.controller;
import com.doctorjava.lms.entity.*; import com.doctorjava.lms.repository.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/v1/catalog") public class CatalogController{
 private final SubjectRepository subjects; private final TopicRepository topics; public CatalogController(SubjectRepository s,TopicRepository t){subjects=s;topics=t;}
 @GetMapping("/subjects") public List<Subject> subjects(){return subjects.findAll();}
 @GetMapping("/subjects/{id}/topics") public List<Topic> topics(@PathVariable Long id){return topics.findBySubjectIdOrderByNameAsc(id);}
}
