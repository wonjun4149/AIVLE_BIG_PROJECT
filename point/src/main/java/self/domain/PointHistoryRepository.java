package self.domain;

import org.springframework.cloud.gcp.data.firestore.FirestoreReactiveRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.Date;

@Repository
public interface PointHistoryRepository extends FirestoreReactiveRepository<PointHistory> {
    // Firestore에서 "Between"을 지원하지 않으므로, GreaterThanEqual과 LessThan으로 대체
    Flux<PointHistory> findByUserIdAndTypeAndTimestampGreaterThanEqualAndTimestampLessThan(String userId, String type, Date start, Date end);
}
