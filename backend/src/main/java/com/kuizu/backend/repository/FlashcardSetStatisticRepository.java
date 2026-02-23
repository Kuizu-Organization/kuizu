package com.kuizu.backend.repository;

import com.kuizu.backend.entity.FlashcardSetStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashcardSetStatisticRepository extends JpaRepository<FlashcardSetStatistic, Long> {
}
