package com.cova.taskmanager.user;

public record UserResponse(String firstName, String lastName, String email) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getFirstName(), user.getLastName(), user.getEmail());
    }
}
