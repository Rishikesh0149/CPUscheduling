package com.osscheduler.repository;

import com.osscheduler.model.SchedulingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchedulingHistoryRepository extends JpaRepository<SchedulingHistory, Long> {

    List<SchedulingHistory> findAllByOrderByRunAtDesc();
}
