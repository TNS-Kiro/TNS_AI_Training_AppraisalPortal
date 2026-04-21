package com.tns.appraisal.notification;

import com.tns.appraisal.common.BaseRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for NotificationTemplate entity.
 */
@Repository
public interface NotificationTemplateRepository extends BaseRepository<NotificationTemplate, Long> {

    /**
     * Find template by trigger event.
     */
    Optional<NotificationTemplate> findByTriggerEvent(String triggerEvent);

    /**
     * Find active template by trigger event.
     */
    Optional<NotificationTemplate> findByTriggerEventAndIsActiveTrue(String triggerEvent);
}
