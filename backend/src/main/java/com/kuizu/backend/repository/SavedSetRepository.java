package com.kuizu.backend.repository;

import com.kuizu.backend.entity.SavedSet;
import com.kuizu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedSetRepository extends JpaRepository<SavedSet, SavedSet.SavedSetId> {
    List<SavedSet> findByUserOrderBySavedAtDesc(User user);
    
    boolean existsById_UserIdAndId_SetId(String userId, Long setId);
    
    void deleteById_UserIdAndId_SetId(String userId, Long setId);
}
