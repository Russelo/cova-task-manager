package com.cova.taskmanager.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull TaskStatus status
) {
}
