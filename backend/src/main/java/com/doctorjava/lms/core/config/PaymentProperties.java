package com.doctorjava.lms.core.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "payment")
public class PaymentProperties {
    private String currency = "INR";
    private String successUrl;
    private String cancelUrl;
    private Razorpay razorpay = new Razorpay();
    private Stripe stripe = new Stripe();

    @Data
    public static class Razorpay {
        private String keyId;
        private String keySecret;
    }

    @Data
    public static class Stripe {
        private String secretKey;
        private String publishableKey;
        private String webhookSecret;
    }
}
