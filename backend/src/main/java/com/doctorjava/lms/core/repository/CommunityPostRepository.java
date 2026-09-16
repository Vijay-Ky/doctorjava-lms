package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CommunityPostRepository extends JpaRepository<CommunityPost, UUID> {
    List<CommunityPost> findAllByOrderByPinnedDescCreatedAtDesc();
    List<CommunityPost> findByCourseIdOrderByPinnedDescCreatedAtDesc(UUID courseId);
}
