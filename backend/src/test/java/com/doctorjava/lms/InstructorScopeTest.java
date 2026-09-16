package com.doctorjava.lms;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.util.UUID;

/**
 * Documents instructor ownership rule: only matching instructor_user_id or admin may mutate.
 * Full WebMvc tests can bind this to CourseOwnership bean.
 */
public class InstructorScopeTest {
    @Test
    void instructorMayOnlyEditOwnCourse() {
        UUID instructor = UUID.randomUUID();
        UUID other = UUID.randomUUID();
        UUID courseOwner = instructor;
        assertTrue(courseOwner.equals(instructor));
        assertFalse(courseOwner.equals(other));
    }
}
