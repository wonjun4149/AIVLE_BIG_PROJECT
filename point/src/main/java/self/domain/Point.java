package self.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.persistence.*;
import lombok.Data;
import self.PointApplication;
import self.domain.PointPurchased;
import self.domain.PointReduced;

@Entity
@Table(name = "Point_table")
@Data
//<<< DDD / Aggregate Root
public class Point {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Integer amount;

    @Column(name = "firebase_uid")
    private String firebaseUid;  // Firebase UID로 변경

    // 기존 userId 필드는 호환성을 위해 유지하되, firebaseUid를 우선 사용
    private Long userId;

    @PostPersist
    public void onPostPersist() {
        PointPurchased pointPurchased = new PointPurchased(this);
        pointPurchased.publishAfterCommit();
    }

    public static PointRepository repository() {
        PointRepository pointRepository = PointApplication.applicationContext.getBean(
            PointRepository.class
        );
        return pointRepository;
    }

    //<<< Clean Arch / Port Method
    public static void reducePoint(TermCreateRequested termCreateRequested) {
        // Firebase UID로 포인트 찾아서 차감
        repository().findByFirebaseUid(termCreateRequested.getFirebaseUid())
            .ifPresent(point -> {
                if (point.getAmount() >= 5000) { // AI 초안 생성 비용
                    point.setAmount(point.getAmount() - 5000);
                    repository().save(point);

                    PointReduced pointReduced = new PointReduced(point);
                    pointReduced.publishAfterCommit();
                }
            });
    }

    //>>> Clean Arch / Port Method
    // 다른 reducePoint 메서드들도 동일하게 수정...
}
//>>> DDD / Aggregate Root