package com.cova.taskmanager.task;

import com.cova.taskmanager.user.User;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByUser(User user, Pageable pageable);
}
