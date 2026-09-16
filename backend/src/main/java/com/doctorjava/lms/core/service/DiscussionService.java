package com.doctorjava.lms.core.service;
import java.util.List;
import java.util.UUID;

import com.doctorjava.lms.core.dto.DiscussionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.doctorjava.lms.core.entity.Course;
import com.doctorjava.lms.core.entity.Discussion;
import com.doctorjava.lms.core.repository.DiscussionRepository;

@RequiredArgsConstructor
@Service
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final CourseService courseService;

    public List<Discussion> getDiscussionsCourse(UUID courseId) {
        Course course = courseService.getCourseById(courseId);
        return discussionRepository.findByCourse(course);
    }
    public Discussion createDiscussion( DiscussionRequest discussionRequest) {
        Course course = courseService.getCourseById(discussionRequest.getCourse_id());
        Discussion discussion = new Discussion();
        discussion.setUserName(discussionRequest.getName());
        discussion.setCourse(course);
        discussion.setContent(discussionRequest.getContent());
        return discussionRepository.save(discussion);
    }
}
