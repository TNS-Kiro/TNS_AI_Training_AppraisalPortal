package com.tns.appraisal.dashboard;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<DashboardEntity, Long> {

    @Query("SELECT COUNT(f) FROM DashboardEntity f WHERE f.employeeId = :employeeId")
    Long countFormsByEmployee(@Param("employeeId") Long employeeId);

    @Query("SELECT COUNT(f) FROM DashboardEntity f WHERE f.employeeId = :employeeId AND f.status = :status")
    Long countFormsByEmployeeAndStatus(@Param("employeeId") Long employeeId, @Param("status") String status);

    @Query("SELECT COUNT(f) FROM DashboardEntity f WHERE f.reviewerId = :reviewerId")
    Long countFormsByReviewer(@Param("reviewerId") Long reviewerId);

    @Query("SELECT COUNT(f) FROM DashboardEntity f WHERE f.reviewerId = :reviewerId AND f.status = :status")
    Long countFormsByReviewerAndStatus(@Param("reviewerId") Long reviewerId, @Param("status") String status);

    @Query("SELECT COUNT(f) FROM DashboardEntity f")
    Long countAllForms();

    @Query("SELECT COUNT(f) FROM DashboardEntity f WHERE f.status = :status")
    Long countFormsByStatus(@Param("status") String status);

    @Query("SELECT f.status, COUNT(f) FROM DashboardEntity f GROUP BY f.status")
    List<Object[]> getStatusDistribution();

    // Employee form status list for a cycle (or all cycles)
    @Query(value = """
        SELECT f.id, u.full_name, u.department, f.status,
               f.submitted_at, f.reviewed_at, f.pdf_storage_path,
               ac.name, ac.id
        FROM appraisal_forms f
        JOIN users u ON f.employee_id = u.id
        JOIN appraisal_cycles ac ON f.cycle_id = ac.id
        WHERE (:cycleId IS NULL OR f.cycle_id = :cycleId)
        ORDER BY u.full_name
        """, nativeQuery = true)
    List<Object[]> getEmployeeFormStatusRaw(@Param("cycleId") Long cycleId);

    // All cycles with form counts
    @Query(value = """
        SELECT ac.id, ac.name, ac.status, ac.start_date, ac.end_date,
               COUNT(f.id),
               SUM(CASE WHEN f.status = 'REVIEWED_AND_COMPLETED' THEN 1 ELSE 0 END)
        FROM appraisal_cycles ac
        LEFT JOIN appraisal_forms f ON f.cycle_id = ac.id
        GROUP BY ac.id, ac.name, ac.status, ac.start_date, ac.end_date
        ORDER BY ac.start_date DESC
        """, nativeQuery = true)
    List<Object[]> getAllCyclesRaw();

    // Form detail for read-only view
    @Query(value = """
        SELECT f.id, u.full_name, u.department, m.full_name,
               f.status, f.form_data, f.submitted_at, f.reviewed_at,
               f.pdf_storage_path, ac.name
        FROM appraisal_forms f
        JOIN users u ON f.employee_id = u.id
        LEFT JOIN users m ON f.manager_id = m.id
        JOIN appraisal_cycles ac ON f.cycle_id = ac.id
        WHERE f.id = :formId
        """, nativeQuery = true)
    List<Object[]> getFormDetailRaw(@Param("formId") Long formId);

    // Department stats via JOIN
    @Query(value = """
        SELECT u.department,
               COUNT(f.id),
               SUM(CASE WHEN f.status = 'REVIEWED_AND_COMPLETED' THEN 1 ELSE 0 END)
        FROM appraisal_forms f
        JOIN users u ON f.employee_id = u.id
        GROUP BY u.department
        """, nativeQuery = true)
    List<Object[]> getDepartmentStatsRaw();

    // Cycle stats
    @Query(value = """
        SELECT ac.name,
               COUNT(f.id),
               SUM(CASE WHEN f.status = 'REVIEWED_AND_COMPLETED' THEN 1 ELSE 0 END)
        FROM appraisal_forms f
        JOIN appraisal_cycles ac ON f.cycle_id = ac.id
        GROUP BY ac.name
        """, nativeQuery = true)
    List<Object[]> getCycleStatsRaw();

    // Team member stats for manager
    @Query(value = """
        SELECT u.full_name, f.status, COUNT(f.id)
        FROM appraisal_forms f
        JOIN users u ON f.employee_id = u.id
        WHERE f.manager_id = :reviewerId
        GROUP BY u.full_name, f.status
        """, nativeQuery = true)
    List<Object[]> getTeamMemberStatsRaw(@Param("reviewerId") Long reviewerId);
}
