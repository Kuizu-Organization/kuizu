package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ClassJoinRequest;
import com.kuizu.backend.entity.StudyClass;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassJoinRequestRepository extends JpaRepository<ClassJoinRequest, Long> {
    List<ClassJoinRequest> findByStudyClassAndStatus(StudyClass studyClass, String status);
    List<ClassJoinRequest> findByUser(User user);
}
