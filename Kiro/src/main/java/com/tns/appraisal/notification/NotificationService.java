package com.tns.appraisal.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for managing email notifications with async sending.
 */
@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([^}]+)\\}\\}");

    private final JavaMailSender mailSender;
    private final NotificationTemplateRepository templateRepository;
    private final EmailNotificationLogRepository logRepository;

    public NotificationService(JavaMailSender mailSender,
                              NotificationTemplateRepository templateRepository,
                              EmailNotificationLogRepository logRepository) {
        this.mailSender = mailSender;
        this.templateRepository = templateRepository;
        this.logRepository = logRepository;
    }

    /**
     * Send notification asynchronously based on trigger event.
     */
    @Async
    @Transactional
    public void sendNotificationAsync(String triggerEvent, String recipientEmail, 
                                     Map<String, String> placeholders) {
        try {
            NotificationTemplate template = templateRepository
                .findByTriggerEventAndIsActiveTrue(triggerEvent)
                .orElseThrow(() -> new RuntimeException("No active template found for event: " + triggerEvent));

            String subject = substitutePlaceholders(template.getSubject(), placeholders);
            String body = substitutePlaceholders(template.getBody(), placeholders);

            sendEmail(recipientEmail, subject, body);
            logNotification(recipientEmail, triggerEvent, subject, body, "SENT", null);
            
            logger.info("Notification sent successfully: event={}, recipient={}", triggerEvent, recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send notification: event={}, recipient={}", triggerEvent, recipientEmail, e);
            logNotification(recipientEmail, triggerEvent, "", "", "FAILED", e.getMessage());
        }
    }

    /**
     * Substitute placeholders in template text.
     */
    private String substitutePlaceholders(String template, Map<String, String> placeholders) {
        if (template == null || placeholders == null) {
            return template;
        }

        StringBuffer result = new StringBuffer();
        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);

        while (matcher.find()) {
            String placeholder = matcher.group(1);
            String replacement = placeholders.getOrDefault(placeholder, "");
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);

        return result.toString();
    }

    /**
     * Send email using JavaMailSender.
     */
    private void sendEmail(String to, String subject, String body) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, true); // true = HTML
        helper.setFrom("noreply@tns.com");

        mailSender.send(message);
    }

    /**
     * Log notification attempt.
     */
    private void logNotification(String recipientEmail, String triggerEvent, String subject,
                                 String body, String status, String errorMessage) {
        EmailNotificationLog log = new EmailNotificationLog();
        log.setRecipientEmail(recipientEmail);
        log.setTriggerEvent(triggerEvent);
        log.setSubject(subject);
        log.setStatus(status);
        log.setErrorMessage(errorMessage);
        logRepository.save(log);
    }

    /**
     * Get notification template by trigger event.
     */
    @Transactional(readOnly = true)
    public NotificationTemplate getTemplate(String triggerEvent) {
        return templateRepository.findByTriggerEvent(triggerEvent)
            .orElseThrow(() -> new RuntimeException("Template not found: " + triggerEvent));
    }

    /**
     * Get all notification templates.
     */
    @Transactional(readOnly = true)
    public Page<NotificationTemplate> getAllTemplates(Pageable pageable) {
        return templateRepository.findAll(pageable);
    }

    /**
     * Update notification template.
     */
    @Transactional
    public NotificationTemplate updateTemplate(Long id, String subject, String body, Boolean isActive) {
        NotificationTemplate template = templateRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Template not found: " + id));
        
        template.setSubject(subject);
        template.setBody(body);
        template.setIsActive(isActive);
        
        return templateRepository.save(template);
    }

    /**
     * Search notification logs with filters.
     */
    @Transactional(readOnly = true)
    public Page<EmailNotificationLog> searchNotificationLogs(String recipientEmail, String triggerEvent,
                                                             String status, Instant startDate, 
                                                             Instant endDate, Pageable pageable) {
        return logRepository.searchNotificationLogs(recipientEmail, triggerEvent, status, 
                                                   startDate, endDate, pageable);
    }
}
