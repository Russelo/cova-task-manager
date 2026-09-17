package com.cova.taskmanager.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cova.taskmanager.user.User;
import com.cova.taskmanager.user.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    private User owner;
    private User intruder;

    @BeforeEach
    void setUp() {
        owner = new User();
        ReflectionTestUtils.setField(owner, "id", UUID.randomUUID());
        owner.setEmail("owner@cova.dev");

        intruder = new User();
        ReflectionTestUtils.setField(intruder, "id", UUID.randomUUID());
        intruder.setEmail("intruder@cova.dev");
    }

    private TaskService taskService() {
        return new TaskService(taskRepository, userRepository);
    }

    @Test
    void create_savesTaskForCurrentUser() {
        when(authentication.getName()).thenReturn("owner@cova.dev");
        when(userRepository.findByEmail("owner@cova.dev")).thenReturn(Optional.of(owner));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TaskRequest request = new TaskRequest("Write report", "Q3 summary", TaskStatus.TODO);
        TaskResponse response = taskService().create(request, authentication);

        assertThat(response.title()).isEqualTo("Write report");
        verify(taskRepository).save(argThat(task -> task.getUser() == owner));
    }

    @Test
    void get_returnsTaskWhenOwnedByCurrentUser() {
        Task task = new Task();
        ReflectionTestUtils.setField(task, "id", UUID.randomUUID());
        task.setUser(owner);
        task.setTitle("Mine");

        when(authentication.getName()).thenReturn("owner@cova.dev");
        when(userRepository.findByEmail("owner@cova.dev")).thenReturn(Optional.of(owner));
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        TaskResponse response = taskService().get(task.getId(), authentication);

        assertThat(response.title()).isEqualTo("Mine");
    }

    @Test
    void get_throwsNotFoundWhenTaskBelongsToAnotherUser() {
        Task task = new Task();
        ReflectionTestUtils.setField(task, "id", UUID.randomUUID());
        task.setUser(owner);

        when(authentication.getName()).thenReturn("intruder@cova.dev");
        when(userRepository.findByEmail("intruder@cova.dev")).thenReturn(Optional.of(intruder));
        when(taskRepository.findById(task.getId())).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService().get(task.getId(), authentication))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void delete_throwsNotFoundWhenTaskDoesNotExist() {
        UUID missingId = UUID.randomUUID();
        when(authentication.getName()).thenReturn("owner@cova.dev");
        when(userRepository.findByEmail("owner@cova.dev")).thenReturn(Optional.of(owner));
        when(taskRepository.findById(missingId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService().delete(missingId, authentication))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }
}
