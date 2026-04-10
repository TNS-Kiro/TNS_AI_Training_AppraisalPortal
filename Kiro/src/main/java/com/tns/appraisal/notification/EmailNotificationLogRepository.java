package com.tns.appraisal.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface EmailNotificationLogRepository extends JpaRepository<EmailNotificationLog, Long> {

    @Query("SELECT e FROM EmailNotificationLog e WHERE " +
           "(:recipientEmail IS NULL OR e.recipientEmail LIKE CONCAT('%', :recipientEmail, '%')) AND " +
           "(:triggerEvent IS NULL OR e.triggerEvent = :triggerEvent) AND " +
           "(:status IS NULL OR e.status = :status) " +
           "ORDER BY e.createdAt DESC")
    Page<EmailNotificationLog> searchNotificationLogs(
        @Param("recipientEmail") String recipientEmail,
        @Param("triggerEvent") String triggerEvent,
        @Param("status") String status,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate,
        Pageable pageable
    );
}
