package com.kuizu.backend.repository;

import com.kuizu.backend.entity.UserStatistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserStatisticRepository extends JpaRepository<UserStatistic, String> {
}
