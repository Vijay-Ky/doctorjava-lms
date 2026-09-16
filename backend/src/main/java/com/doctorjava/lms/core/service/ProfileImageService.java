package com.doctorjava.lms.core.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Locale;

/**
 * Validates and sanitizes profile images: 2MB cap, magic-byte type check, re-encode (strip EXIF).
 */
@Service
public class ProfileImageService {

    private static final long MAX_BYTES = 2L * 1024 * 1024;

    public byte[] process(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Empty file");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Profile image must be <= 2MB");
        }
        byte[] raw = file.getBytes();
        String type = sniff(raw);
        if (type == null) {
            throw new IllegalArgumentException("Only JPEG, PNG, or WebP images are allowed");
        }
        // Re-encode JPEG/PNG via ImageIO to strip metadata / embedded payloads
        if ("jpeg".equals(type) || "png".equals(type)) {
            BufferedImage img = ImageIO.read(new ByteArrayInputStream(raw));
            if (img == null) {
                throw new IllegalArgumentException("Invalid image data");
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            String format = "jpeg".equals(type) ? "jpg" : "png";
            if (!ImageIO.write(img, format, out)) {
                throw new IllegalArgumentException("Failed to re-encode image");
            }
            return out.toByteArray();
        }
        // WebP: accept raw after magic check (ImageIO may lack WebP writer)
        return raw;
    }

    /** Magic-byte sniff — do not trust client Content-Type */
    static String sniff(byte[] data) {
        if (data.length < 12) return null;
        // JPEG FF D8 FF
        if ((data[0] & 0xFF) == 0xFF && (data[1] & 0xFF) == 0xD8 && (data[2] & 0xFF) == 0xFF) return "jpeg";
        // PNG 89 50 4E 47
        if ((data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47) return "png";
        // WebP: RIFF....WEBP
        if (data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F'
                && data[8] == 'W' && data[9] == 'E' && data[10] == 'B' && data[11] == 'P') return "webp";
        return null;
    }
}
