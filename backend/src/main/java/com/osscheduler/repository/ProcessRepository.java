package com.osscheduler.repository;

import com.osscheduler.model.Process;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessRepository extends JpaRepository<Process, String> {

    List<Process> findAllByOrderByInputOrderAsc();

    Optional<Process> findByPidIgnoreCase(String pid);

    boolean existsByPidIgnoreCase(String pid);
}
