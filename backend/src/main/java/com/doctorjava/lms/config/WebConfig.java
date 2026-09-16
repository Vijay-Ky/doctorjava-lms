package com.doctorjava.lms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${app.cors.allowed-origin:http://localhost:3000}") private String allowedOrigin;
    @Override public void addCorsMappings(CorsRegistry registry){
        registry.addMapping("/api/**").allowedOrigins(allowedOrigin).allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS").allowedHeaders("*");
    }
}
