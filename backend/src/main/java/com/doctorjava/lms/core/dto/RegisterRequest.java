package com.doctorjava.lms.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Public registration payload. Intentionally has NO role field —
 * public signup always creates USER accounts only.
 */
@Data
public class RegisterRequest {
    @NotBlank
    @Size(max = 100)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    private String mobileNumber;
    private String profession;
    private String location;
    private String dob;
    private String gender;
    private String linkedin_url;
    private String github_url;

    /** Optional referrer user ID from ?ref= */
    private String referredBy;
}
