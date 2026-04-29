package com.tns.appraisal.form;

import com.tns.appraisal.common.BaseRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppraisalFormRepository extends BaseRepository<AppraisalForm, Long> {

    List<AppraisalForm> findByCycle_Id(Long cycleId);

    @Query("SELECT f FROM AppraisalForm f " +
           "LEFT JOIN FETCH f.cycle " +
           "LEFT JOIN FETCH f.employee " +
           "LEFT JOIN FETCH f.manager " +
           "LEFT JOIN FETCH f.backupReviewer " +
           "LEFT JOIN FETCH f.template " +
           "WHERE f.cycle.id = :cycleId")
    List<AppraisalForm> findByCycleIdWithRelations(@Param("cycleId") Long cycleId);

    @Query("SELECT f FROM AppraisalForm f " +
           "LEFT JOIN FETCH f.cycle " +
           "LEFT JOIN FETCH f.employee " +
           "LEFT JOIN FETCH f.manager " +
           "LEFT JOIN FETCH f.backupReviewer " +
           "LEFT JOIN FETCH f.template " +
           "WHERE f.employee.id = :employeeId ORDER BY f.createdAt DESC")
    List<AppraisalForm> findByEmployeeIdWithRelations(@Param("employeeId") Long employeeId);

    @Query("SELECT f FROM AppraisalForm f " +
           "LEFT JOIN FETCH f.cycle " +
           "LEFT JOIN FETCH f.employee " +
           "LEFT JOIN FETCH f.manager " +
           "LEFT JOIN FETCH f.backupReviewer " +
           "LEFT JOIN FETCH f.template " +
           "WHERE f.id = :id")
    Optional<AppraisalForm> findByIdWithRelations(@Param("id") Long id);

    Optional<AppraisalForm> findByCycle_IdAndEmployee_Id(Long cycleId, Long employeeId);

    boolean existsByCycle_IdAndEmployee_Id(Long cycleId, Long employeeId);

    List<AppraisalForm> findByEmployee_Id(Long employeeId);

    List<AppraisalForm> findByEmployee_IdOrderByCreatedAtDesc(Long employeeId);

    @Query("SELECT f FROM AppraisalForm f " +
           "LEFT JOIN FETCH f.cycle " +
           "LEFT JOIN FETCH f.employee " +
           "LEFT JOIN FETCH f.manager " +
           "LEFT JOIN FETCH f.template " +
           "WHERE f.manager.id = :managerId")
    List<AppraisalForm> findByManager_Id(@Param("managerId") Long managerId);

    List<AppraisalForm> findByManager_IdAndStatus(Long managerId, FormStatus status);

    List<AppraisalForm> findByCycle_IdAndManager_Id(Long cycleId, Long managerId);

    List<AppraisalForm> findByCycle_IdAndBackupReviewer_Id(Long cycleId, Long backupReviewerId);

    long countByCycle_IdAndStatus(Long cycleId, FormStatus status);
}
