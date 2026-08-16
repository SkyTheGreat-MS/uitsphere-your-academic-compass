package backend.repository;

import backend.entity.ClaimStatus;
import backend.entity.LostFoundClaim;
import backend.entity.LostFoundPost;
import backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LostFoundClaimRepository extends JpaRepository<LostFoundClaim, Long> {

    List<LostFoundClaim> findByPostOrderByCreatedAtDesc(LostFoundPost post);

    List<LostFoundClaim> findByPostAndStatusOrderByCreatedAtDesc(LostFoundPost post, ClaimStatus status);

    List<LostFoundClaim> findByClaimantOrderByCreatedAtDesc(Student claimant);

    Optional<LostFoundClaim> findByIdAndPost(Long id, LostFoundPost post);

    Optional<LostFoundClaim> findByIdAndClaimant(Long id, Student claimant);
}