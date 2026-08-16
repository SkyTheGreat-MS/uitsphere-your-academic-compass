package backend.repository;

import backend.entity.ClaimMessage;
import backend.entity.LostFoundClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimMessageRepository extends JpaRepository<ClaimMessage, Long> {

    List<ClaimMessage> findByClaimOrderByCreatedAtAsc(LostFoundClaim claim);
}