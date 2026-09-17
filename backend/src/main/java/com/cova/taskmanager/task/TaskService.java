package com.cova.taskmanager.task;

import com.cova.taskmanager.user.User;
import com.cova.taskmanager.user.UserRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public TaskResponse create(TaskRequest request, Authentication authentication) {
        Task task = new Task();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setUser(currentUser(authentication));
        return TaskResponse.from(taskRepository.save(task));
    }

    public Page<TaskResponse> list(TaskStatus status, String search, Pageable pageable, Authentication authentication) {
        User user = currentUser(authentication);
        Page<Task> page;
        if (status != null && search != null && !search.isBlank()) {
            page = taskRepository.findByUserAndStatusAndTitleContainingIgnoreCase(user, status, search, pageable);
        } else if (status != null) {
            page = taskRepository.findByUserAndStatus(user, status, pageable);
        } else if (search != null && !search.isBlank()) {
            page = taskRepository.findByUserAndTitleContainingIgnoreCase(user, search, pageable);
        } else {
            page = taskRepository.findByUser(user, pageable);
        }
        return page.map(TaskResponse::from);
    }

    public TaskResponse get(UUID id, Authentication authentication) {
        return TaskResponse.from(loadOwnedTask(id, authentication));
    }

    public TaskResponse update(UUID id, TaskRequest request, Authentication authentication) {
        Task task = loadOwnedTask(id, authentication);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        return TaskResponse.from(taskRepository.save(task));
    }

    public void delete(UUID id, Authentication authentication) {
        Task task = loadOwnedTask(id, authentication);
        taskRepository.delete(task);
    }

    private User currentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    /**
     * Ownership check (IDOR prevention): a task id alone is not enough to access it — it must
     * also belong to the authenticated user. Not found and "not yours" both resolve to 404, so
     * callers can't distinguish a missing task from someone else's task.
     */
    private Task loadOwnedTask(UUID id, Authentication authentication) {
        User user = currentUser(authentication);
        return taskRepository.findById(id)
                .filter(task -> task.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }
}
