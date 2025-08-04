package self.domain;

import org.springframework.cloud.gcp.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface PointRepository extends FirestoreReactiveRepository<Point> {
    Mono<Point> findByUserId(String userId);
}