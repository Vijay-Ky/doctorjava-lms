package com.doctorjava.lms.core.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

/**
 * Official BSP/Cloud API only. Sends pre-approved templates to opted-in numbers.
 * Configure WHATSAPP_PROVIDER=meta|twilio|gupshup and related env keys.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    private final JdbcTemplate jdbc;

    @Value("${whatsapp.provider:}")
    private String provider;

    @Value("${whatsapp.api-key:}")
    private String apiKey;

    @Value("${whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.enabled:false}")
    private boolean enabled;

    public void sendTemplate(String e164Phone, String templateName, Map<String, String> variables, boolean optedIn) {
        if (!optedIn) {
            log.info("WhatsApp skipped — user not opted in: {}", e164Phone);
            logSend(e164Phone, templateName, "SKIPPED_OPT_IN", null);
            return;
        }
        if (!enabled || apiKey == null || apiKey.isBlank()) {
            log.info("WhatsApp (disabled/dev) to={} template={}", e164Phone, templateName);
            logSend(e164Phone, templateName, "SKIPPED", null);
            return;
        }
        try {
            // Meta Cloud API style endpoint (BSP can be swapped by provider base URL)
            String body = "{\"messaging_product\":\"whatsapp\",\"to\":\"" + e164Phone
                    + "\",\"type\":\"template\",\"template\":{\"name\":\"" + templateName + "\",\"language\":{\"code\":\"en\"}}}";
            String url = "https://graph.facebook.com/v18.0/" + phoneNumberId + "/messages";
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> res = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());
            String status = res.statusCode() >= 200 && res.statusCode() < 300 ? "SENT" : "FAILED";
            logSend(e164Phone, templateName, status, status.equals("FAILED") ? res.body() : null);
        } catch (Exception e) {
            logSend(e164Phone, templateName, "FAILED", e.getMessage());
        }
    }

    private void logSend(String phone, String template, String status, String err) {
        try {
            UUID id = UUID.randomUUID();
            jdbc.update(
                    "INSERT INTO lms_whatsapp_log (id, recipient_phone, template_name, status, error_message, created_at) VALUES (?,?,?,?,?,NOW())",
                    uuidBytes(id), phone, template, status, err != null && err.length() > 500 ? err.substring(0, 500) : err);
        } catch (Exception e) {
            log.debug("whatsapp log: {}", e.getMessage());
        }
    }

    private static byte[] uuidBytes(UUID u) {
        long m = u.getMostSignificantBits();
        long l = u.getLeastSignificantBits();
        byte[] b = new byte[16];
        for (int i = 0; i < 8; i++) b[i] = (byte) (m >>> (8 * (7 - i)));
        for (int i = 8; i < 16; i++) b[i] = (byte) (l >>> (8 * (15 - i)));
        return b;
    }
}
