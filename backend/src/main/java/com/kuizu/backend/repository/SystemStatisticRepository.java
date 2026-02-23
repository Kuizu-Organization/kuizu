package com.kuizu.backend.repository;

import com.kuizu.backend.entity.SystemStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemStatisticRepository extends JpaRepository<SystemStatistic, String> {
}
