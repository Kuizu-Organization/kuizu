package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.ClassInfoResponse;
import com.kuizu.backend.dto.response.ClassMaterialResponse;
import com.kuizu.backend.dto.response.ClassResponse;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.entity.ClassJoinRequest;
import com.kuizu.backend.entity.ClassMember;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.dto.request.CreateClassRequest;
import java.util.UUID;
import com.kuizu.backend.repository.ClassJoinRequestRepository;
import com.kuizu.backend.repository.ClassMemberRepository;
import com.kuizu.backend.repository.ClassRepository;
import com.kuizu.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ClassJoinRequestRepository classJoinRequestRepository;

    public ClassService(ClassRepository classRepository, UserRepository userRepository, ClassMemberRepository classMemberRepository, ClassJoinRequestRepository classJoinRequestRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.classMemberRepository = classMemberRepository;
        this.classJoinRequestRepository = classJoinRequestRepository;
    }

    public ClassInfoResponse findClassById(Long classId, String username) {
        Class clazz = classRepository.findByClassId(classId).orElseThrow(() -> new ApiException("Class not found with id: " + classId));
        List<ClassMaterialResponse> classMaterialResponseList = clazz.getClassMaterials()
                .stream()
                .map(m -> new ClassMaterialResponse(
                        m.getMaterialId(),
                        m.getMaterialType(),
                        m.getMaterialRefId()
                )).toList();

        Boolean isOwner = false;
        Boolean isMember = false;

        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                isOwner = clazz.getOwner().getUserId().equals(user.getUserId());
                isMember = classMemberRepository.existsById(new ClassMember.ClassMemberId(classId, user.getUserId()));
            }
        }

        return new ClassInfoResponse(
                clazz.getClassId(),
                clazz.getOwner().getUserId(),
                clazz.getOwner().getDisplayName(),
                clazz.getClassName(),
                clazz.getDescription(),
                classMaterialResponseList,
                isMember,
                isOwner
        );
    }

    public List<ClassResponse> findClassesByName(String name) {
        return classRepository.findByClassNameContainingIgnoreCase(name)
                .stream()
                .map(c -> new ClassResponse(
                        c.getClassId(),
                        c.getOwner().getUserId(),
                        c.getOwner().getDisplayName(),
                        c.getClassName(),
                        c.getDescription()
                ))
                .toList();
    }

    public List<ClassResponse> getUserClasses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        
        List<Class> ownedClasses = classRepository.findByOwner(user);
        List<Class> joinedClasses = classMemberRepository.findByUser(user)
                .stream()
                .map(ClassMember::getClazz)
                .toList();
                
        Set<Class> allClasses = new HashSet<>(ownedClasses);
        allClasses.addAll(joinedClasses);
        
        return allClasses.stream()
                .map(c -> new ClassResponse(
                        c.getClassId(),
                        c.getOwner().getUserId(),
                        c.getOwner().getDisplayName(),
                        c.getClassName(),
                        c.getDescription()
                ))
                .toList();
    }

    public ClassResponse createClass(CreateClassRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));

        if (user.getRole() != User.UserRole.ROLE_TEACHER && user.getRole() != User.UserRole.ROLE_ADMIN) {
            throw new ApiException("Only teachers or administrators can create classes");
        }

        String joinCode = generateJoinCode();

        Class newClass = Class.builder()
                .owner(user)
                .className(request.getClassName())
                .description(request.getDescription())
                .visibility(request.getVisibility() != null ? request.getVisibility() : "PUBLIC")
                .status("ACTIVE")
                .joinCode(joinCode)
                .build();

        newClass = classRepository.save(newClass);

        return new ClassResponse(
                newClass.getClassId(),
                newClass.getOwner().getUserId(),
                newClass.getOwner().getDisplayName(),
                newClass.getClassName(),
                newClass.getDescription()
        );
    }

    private String generateJoinCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public void joinClass(Long classId, String username, String joinCode, String message) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        // Check if user is owner
        if (clazz.getOwner().getUserId().equals(user.getUserId())) {
            throw new ApiException("User is already the owner of this class");
        }

        // Check if user is already a member
        ClassMember.ClassMemberId memberId = new ClassMember.ClassMemberId(classId, user.getUserId());
        if (classMemberRepository.existsById(memberId)) {
            throw new ApiException("User is already a member of this class");
        }

        if (joinCode != null && !joinCode.isEmpty()) {
            joinClassByCode(clazz, user, joinCode);
        } else {
            requestToJoinClass(clazz, user, message);
        }
    }

    private void joinClassByCode(Class clazz, User user, String joinCode) {
        if (!joinCode.equals(clazz.getJoinCode())) {
            throw new ApiException("Invalid join code provided");
        }

        ClassMember member = ClassMember.builder()
                .id(new ClassMember.ClassMemberId(clazz.getClassId(), user.getUserId()))
                .clazz(clazz)
                .user(user)
                .role("MEMBER")
                .joinedBy(user.getUserId())
                .build();
        
        classMemberRepository.save(member);
    }

    private void requestToJoinClass(Class clazz, User user, String message) {
        ClassJoinRequest request = ClassJoinRequest.builder()
                .clazz(clazz)
                .user(user)
                .message(message)
                .status("PENDING")
                .build();
                
        classJoinRequestRepository.save(request);
    }

    public void leaveClass(Long classId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        if (clazz.getOwner().getUserId().equals(user.getUserId())) {
            throw new ApiException("Owner cannot leave their own class");
        }

        ClassMember.ClassMemberId memberId = new ClassMember.ClassMemberId(classId, user.getUserId());
        ClassMember member = classMemberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException("User is not a member of this class"));

        classMemberRepository.delete(member);
    }

    public String getJoinCode(Long classId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        boolean isOwner = clazz.getOwner().getUserId().equals(user.getUserId());
        boolean isMember = classMemberRepository.existsById(new ClassMember.ClassMemberId(classId, user.getUserId()));

        if (!isOwner && !isMember) {
            throw new ApiException("Only class members or the owner can view the join code");
        }

        return clazz.getJoinCode();
    }
}
