package com.tns.appraisal.form;

import com.tns.appraisal.common.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for AppraisalForm entity.
 */
@Repository
public interface AppraisalFormRepository extends BaseRepository<AppraisalForm, Long> {

    List<AppraisalForm> findByCycleId(Long cycleId);

    Optional<AppraisalForm> findByCycleIdAndEmployeeId(Long cycleId, Long employeeId);

    boolean existsByCycleIdAndEmployeeId(Long cycleId, Long employeeId);

    List<AppraisalForm> findByEmployeeId(Long employeeId);

    List<AppraisalForm> findByManagerId(Long managerId);

    List<AppraisalForm> findByBackupReviewerId(Long backupReviewerId);

    @Query("SELECT f FROM AppraisalForm f WHERE f.cycleId = :cycleId AND f.status = :status")
    List<AppraisalForm> findByCycleIdAndStatus(@Param("cycleId") Long cycleId,
                                               @Param("status") String status);

    @Query("SELECT COUNT(f) FROM AppraisalForm f WHERE f.cycleId = :cycleId")
    long countByCycleId(@Param("cycleId") Long cycleId);
}
