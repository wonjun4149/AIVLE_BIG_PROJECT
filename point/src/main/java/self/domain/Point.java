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
// <<< DDD / Aggregate Root
public class Point {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Integer amount;

    private String userId; // Firebase UID를 직접 저장

    @PostPersist
    public void onPostPersist() {
        PointPurchased pointPurchased = new PointPurchased(this);
        pointPurchased.publishAfterCommit();
    }

    public static PointRepository repository() {
        PointRepository pointRepository = PointApplication.applicationContext.getBean(
                PointRepository.class);
        return pointRepository;
    }

    // <<< Clean Arch / Port Method
    public static void reducePointForTermCreate(TermCreateRequested termCreateRequested) {
        // Firebase UID로 포인트 찾아서 차감
        repository().findByUserId(termCreateRequested.getFirebaseUid())
                .ifPresent(point -> {
                    if (point.getAmount() >= 5000) { // 공통 차감 비용
                        point.setAmount(point.getAmount() - 5000);
                        repository().save(point);

                        PointReduced pointReduced = new PointReduced(point);
                        pointReduced.publishAfterCommit();

                        System.out.println("일반 약관 생성 포인트 차감 완료: " +
                                termCreateRequested.getFirebaseUid() +
                                ", 차감: 5000, 남은 포인트: " + point.getAmount());
                    } else {
                        System.out.println("포인트 부족: " + termCreateRequested.getFirebaseUid() +
                                ", 보유: " + point.getAmount() + ", 필요: 5000");
                    }
                });
    }

    // >>> Clean Arch / Port Method
    // <<< Clean Arch / Port Method
    public static void reducePointForForeignTermCreate(ForeignTermCreateRequested foreignTermCreateRequested) {
        // Firebase UID로 포인트 찾아서 차감
        repository().findByUserId(foreignTermCreateRequested.getFirebaseUid())
                .ifPresent(point -> {
                    if (point.getAmount() >= 5000) { // 공통 차감 비용
                        point.setAmount(point.getAmount() - 5000);
                        repository().save(point);

                        PointReduced pointReduced = new PointReduced(point);
                        pointReduced.publishAfterCommit();

                        System.out.println("외국어 약관 생성 포인트 차감 완료: " +
                                foreignTermCreateRequested.getFirebaseUid() +
                                ", 차감: 5000, 남은 포인트: " + point.getAmount());
                    } else {
                        System.out.println("포인트 부족: " + foreignTermCreateRequested.getFirebaseUid() +
                                ", 보유: " + point.getAmount() + ", 필요: 5000");
                    }
                });
    }

    // >>> Clean Arch / Port Method
    // <<< Clean Arch / Port Method
    public static void reducePointForRiskDetect(RiskDetectRequested riskDetectRequested) {
        // Firebase UID로 포인트 찾아서 차감
        repository().findByUserId(riskDetectRequested.getFirebaseUid())
                .ifPresent(point -> {
                    if (point.getAmount() >= 5000) { // 공통 차감 비용
                        point.setAmount(point.getAmount() - 5000);
                        repository().save(point);

                        PointReduced pointReduced = new PointReduced(point);
                        pointReduced.publishAfterCommit();

                        System.out.println("리스크 검사 포인트 차감 완료: " +
                                riskDetectRequested.getFirebaseUid() +
                                ", 차감: 5000, 남은 포인트: " + point.getAmount());
                    } else {
                        System.out.println("포인트 부족: " + riskDetectRequested.getFirebaseUid() +
                                ", 보유: " + point.getAmount() + ", 필요: 5000");
                    }
                });
    }

    // >>> Clean Arch / Port Method
    // <<< Clean Arch / Port Method
    public static void reducePointForAiTermModify(AiTermModifyRequested aiTermModifyRequested) {
        // Firebase UID로 포인트 찾아서 차감
        repository().findByUserId(aiTermModifyRequested.getFirebaseUid())
                .ifPresent(point -> {
                    if (point.getAmount() >= 5000) { // 공통 차감 비용
                        point.setAmount(point.getAmount() - 5000);
                        repository().save(point);

                        PointReduced pointReduced = new PointReduced(point);
                        pointReduced.publishAfterCommit();

                        System.out.println("AI 약관 수정 포인트 차감 완료: " +
                                aiTermModifyRequested.getFirebaseUid() +
                                ", 차감: 5000, 남은 포인트: " + point.getAmount());
                    } else {
                        System.out.println("포인트 부족: " + aiTermModifyRequested.getFirebaseUid() +
                                ", 보유: " + point.getAmount() + ", 필요: 5000");
                    }
                });
    }
    // >>> Clean Arch / Port Method
}
// >>> DDD / Aggregate Root