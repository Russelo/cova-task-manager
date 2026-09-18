package com.cova.taskmanager.task;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(@Valid @RequestBody TaskRequest request, Authentication authentication) {
        return taskService.create(request, authentication);
    }

    @GetMapping
    public Page<TaskResponse> list(@RequestParam(required = false) TaskStatus status,
                                    @RequestParam(required = false) String search,
                                    @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
                                    Authentication authentication) {
        return taskService.list(status, search, pageable, authentication);
    }

    @GetMapping("/{id}")
    public TaskResponse get(@PathVariable UUID id, Authentication authentication) {
        return taskService.get(id, authentication);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable UUID id,
                                @Valid @RequestBody TaskRequest request,
                                Authentication authentication) {
        return taskService.update(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication authentication) {
        taskService.delete(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
