package com.kuizu.backend.service;

import com.kuizu.backend.dto.response.ClassInfoResponse;
import com.kuizu.backend.dto.response.ClassMaterialResponse;
import com.kuizu.backend.dto.response.ClassResponse;
import com.kuizu.backend.entity.Class;
import com.kuizu.backend.exception.ApiException;
import com.kuizu.backend.entity.ClassMember;
import com.kuizu.backend.entity.User;
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

    public ClassService(ClassRepository classRepository, UserRepository userRepository, ClassMemberRepository classMemberRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.classMemberRepository = classMemberRepository;
    }

    public ClassInfoResponse findClassById(Long classId) {
        Class clazz = classRepository.findByClassId(classId).orElseThrow(() -> new ApiException("Class not found with id: " + classId));
        List<ClassMaterialResponse> classMaterialResponseList = clazz.getClassMaterials()
                .stream()
                .map(m -> new ClassMaterialResponse(
                        m.getMaterialId(),
                        m.getMaterialType(),
                        m.getMaterialRefId()
                )).toList();

        return new ClassInfoResponse(
                clazz.getClassId(),
                clazz.getOwner().getUserId(),
                clazz.getOwner().getDisplayName(),
                clazz.getClassName(),
                clazz.getDescription(),
                classMaterialResponseList
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
}
