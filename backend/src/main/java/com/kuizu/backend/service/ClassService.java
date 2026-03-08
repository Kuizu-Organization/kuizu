package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.ClassInfoResponse;
import com.kuizu.backend.dto.response.ClassMaterialResponse;
import com.kuizu.backend.dto.response.ClassMemberResponse;
import com.kuizu.backend.dto.response.ClassJoinRequestResponse;
import com.kuizu.backend.dto.response.ClassResponse;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.entity.ClassJoinRequest;
import com.kuizu.backend.entity.ClassMember;
import com.kuizu.backend.entity.User;
import com.kuizu.backend.dto.request.CreateClassRequest;
import com.kuizu.backend.dto.request.UpdateClassRequest;
import com.kuizu.backend.dto.request.JoinRequestAction;
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
        return convertToClassInfoResponse(clazz, username);
    }

    private ClassInfoResponse convertToClassInfoResponse(Class clazz, String username) {
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
                isMember = classMemberRepository.existsById(new ClassMember.ClassMemberId(clazz.getClassId(), user.getUserId()));
            }
        }

        List<ClassMemberResponse> members = null;
        List<ClassJoinRequestResponse> joinRequests = null;

        if (isOwner) {
            members = clazz.getClassMembers().stream()
                    .map(m -> new ClassMemberResponse(
                            m.getUser().getUserId(),
                            m.getUser().getDisplayName(),
                            m.getRole(),
                            m.getJoinedAt()
                    )).toList();
            
            members = new java.util.ArrayList<>(members);
            // Add owner to the members list as well for display
            members.add(0, new ClassMemberResponse(
                clazz.getOwner().getUserId(),
                clazz.getOwner().getDisplayName(),
                "OWNER",
                null // Owner doesn't have joinedAt in ClassMember
            ));

            joinRequests = classJoinRequestRepository.findByClazzAndStatus(clazz, "PENDING").stream()
                    .map(r -> new ClassJoinRequestResponse(
                            r.getRequestId(),
                            r.getUser().getUserId(),
                            r.getUser().getDisplayName(),
                            r.getMessage(),
                            r.getStatus(),
                            r.getRequestedAt()
                    )).toList();
        }

        return new ClassInfoResponse(
                clazz.getClassId(),
                clazz.getOwner().getUserId(),
                clazz.getOwner().getDisplayName(),
                clazz.getClassName(),
                clazz.getDescription(),
                clazz.getVisibility(),
                classMaterialResponseList,
                isMember,
                isOwner,
                members,
                joinRequests
        );
    }

    public List<ClassResponse> findClassesByName(String name) {
        return classRepository.findByClassNameContainingIgnoreCase(name)
                .stream()
                .map(this::convertToClassResponse)
                .toList();
    }

    private ClassResponse convertToClassResponse(Class c) {
        return new ClassResponse(
                c.getClassId(),
                c.getOwner().getUserId(),
                c.getOwner().getDisplayName(),
                c.getClassName(),
                c.getDescription(),
                c.getVisibility()
        );
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
                .map(this::convertToClassResponse)
                .toList();
    }

    public ClassInfoResponse createClass(CreateClassRequest request, String username) {
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

        return convertToClassInfoResponse(newClass, username);
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

    public ClassInfoResponse updateClass(Long classId, UpdateClassRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        if (!clazz.getOwner().getUserId().equals(user.getUserId())) {
            throw new ApiException("Only the class owner can update class details");
        }

        if (request.getClassName() != null && !request.getClassName().isBlank()) {
            clazz.setClassName(request.getClassName());
        }
        
        if (request.getDescription() != null) {
            clazz.setDescription(request.getDescription());
        }

        if (request.getVisibility() != null) {
            clazz.setVisibility(request.getVisibility());
        }

        clazz = classRepository.save(clazz);

        return convertToClassInfoResponse(clazz, username);
    }

    public void deleteClass(Long classId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("User not found: " + username));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        if (!clazz.getOwner().getUserId().equals(user.getUserId())) {
            throw new ApiException("Only the class owner can delete the class");
        }

        classRepository.delete(clazz);
    }

    public void removeMember(Long classId, String targetUserId, String requesterUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ApiException("User not found: " + requesterUsername));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        if (!clazz.getOwner().getUserId().equals(requester.getUserId())) {
            throw new ApiException("Only the class owner can remove members");
        }

        if (clazz.getOwner().getUserId().equals(targetUserId)) {
            throw new ApiException("Cannot remove the owner from the class");
        }

        ClassMember.ClassMemberId memberId = new ClassMember.ClassMemberId(classId, targetUserId);
        ClassMember member = classMemberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException("User is not a member of this class"));

        classMemberRepository.delete(member);
    }

    public void processJoinRequest(Long classId, Long requestId, JoinRequestAction action, String requesterUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new ApiException("User not found: " + requesterUsername));
        
        Class clazz = classRepository.findByClassId(classId)
                .orElseThrow(() -> new ApiException("Class not found: " + classId));

        if (!clazz.getOwner().getUserId().equals(requester.getUserId())) {
            throw new ApiException("Only the class owner can process join requests");
        }

        ClassJoinRequest request = classJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException("Join request not found: " + requestId));

        if (!request.getClazz().getClassId().equals(classId)) {
            throw new ApiException("Join request does not belong to this class");
        }

        if (!"PENDING".equals(request.getStatus())) {
            throw new ApiException("Join request has already been processed");
        }

        String status = action.getStatus();
        if ("ACCEPTED".equalsIgnoreCase(status)) {
            request.setStatus("ACCEPTED");
            
            // Add user as member
            ClassMember member = ClassMember.builder()
                    .id(new ClassMember.ClassMemberId(clazz.getClassId(), request.getUser().getUserId()))
                    .clazz(clazz)
                    .user(request.getUser())
                    .role("MEMBER")
                    .joinedBy(requester.getUserId())
                    .build();
            
            classMemberRepository.save(member);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            request.setStatus("REJECTED");
        } else {
            throw new ApiException("Invalid status: " + status);
        }

        request.setRespondedAt(java.time.LocalDateTime.now());
        request.setRespondedBy(requester.getUserId());
        classJoinRequestRepository.save(request);
    }
}
