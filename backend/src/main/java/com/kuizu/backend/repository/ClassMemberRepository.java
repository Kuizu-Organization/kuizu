package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ClassMember;
import com.kuizu.backend.entity.StudyClass;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, ClassMember.ClassMemberId> {
    List<ClassMember> findByStudyClass(StudyClass studyClass);
    List<ClassMember> findByUser(User user);
}
