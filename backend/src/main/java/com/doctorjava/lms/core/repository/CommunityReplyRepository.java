package com.doctorjava.lms.core.repository;
import com.doctorjava.lms.core.entity.CommunityReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CommunityReplyRepository extends JpaRepository<CommunityReply, UUID> {
    List<CommunityReply> findByPostIdOrderByCreatedAtAsc(UUID postId);
}
