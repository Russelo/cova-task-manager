package com.cova.taskmanager.task;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cova.taskmanager.auth.RegisterRequest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class TaskCrudIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void fullCrudFlowRespectsOwnershipAndSoftDelete() throws Exception {
        String ownerToken = registerAndGetToken("owner-" + UUID.randomUUID() + "@cova.dev");
        String intruderToken = registerAndGetToken("intruder-" + UUID.randomUUID() + "@cova.dev");

        String createBody = objectMapper.writeValueAsString(new TaskRequest("Write report", "Q3 summary", TaskStatus.TODO));
        String createResponse = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Write report"))
                .andReturn().getResponse().getContentAsString();
        String taskId = objectMapper.readTree(createResponse).get("id").asText();

        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(taskId));

        String updateBody = objectMapper.writeValueAsString(new TaskRequest("Write report v2", "Q3 final", TaskStatus.DONE));
        mockMvc.perform(put("/api/tasks/{id}", taskId)
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DONE"));

        mockMvc.perform(get("/api/tasks/{id}", taskId).header("Authorization", "Bearer " + intruderToken))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/tasks/{id}", taskId).header("Authorization", "Bearer " + intruderToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/tasks/{id}", taskId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    private String registerAndGetToken(String email) throws Exception {
        String body = objectMapper.writeValueAsString(
                new RegisterRequest("Test", "User", email, "password123", "password123"));
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }
}
