package com.kuizu.backend.repository;

import com.kuizu.backend.entity.ClassStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassStatisticRepository extends JpaRepository<ClassStatistic, Long> {
}
