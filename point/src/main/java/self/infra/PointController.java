package self.infra;

import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import self.domain.*;

//<<< Clean Arch / Inbound Adaptor

@RestController
@RequestMapping(value = "/api/points")
@Transactional
public class PointController {

    @Autowired
    PointRepository pointRepository;

    // Firebase UID로 포인트 조회
    @GetMapping("/{firebaseUid}")
    public ResponseEntity<?> getPointByFirebaseUid(@PathVariable String firebaseUid) {
        try {
            // Firebase UID로 포인트 조회
            Optional<Point> pointOpt = pointRepository.findByFirebaseUid(firebaseUid);

            if (pointOpt.isPresent()) {
                Point point = pointOpt.get();
                return ResponseEntity.ok(new PointResponse(
                        point.getId(),
                        point.getFirebaseUid(),
                        point.getAmount()));
            } else {
                // 포인트가 없으면 0포인트로 초기화
                Point newPoint = new Point();
                newPoint.setFirebaseUid(firebaseUid);
                newPoint.setAmount(0);
                pointRepository.save(newPoint);

                return ResponseEntity.ok(new PointResponse(
                        newPoint.getId(),
                        newPoint.getFirebaseUid(),
                        newPoint.getAmount()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 조회 실패: " + e.getMessage());
        }
    }

    // 포인트 충전 API (Query Parameter 방식)
    @PostMapping("/{firebaseUid}/charge")
    public ResponseEntity<?> chargePoint(@PathVariable String firebaseUid, @RequestParam Integer amount) {
        try {
            Optional<Point> pointOpt = pointRepository.findByFirebaseUid(firebaseUid);
            Point point;

            if (pointOpt.isPresent()) {
                point = pointOpt.get();
                point.setAmount(point.getAmount() + amount);
            } else {
                point = new Point();
                point.setFirebaseUid(firebaseUid);
                point.setAmount(amount);
            }

            pointRepository.save(point);

            // 이벤트 발행
            PointPurchased pointPurchased = new PointPurchased(point);
            pointPurchased.publishAfterCommit();

            return ResponseEntity.ok(new PointResponse(
                    point.getId(),
                    point.getFirebaseUid(),
                    point.getAmount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 충전 실패: " + e.getMessage());
        }
    }

    // 포인트 수동 차감 API
    @PostMapping("/{firebaseUid}/reduce")
    public ResponseEntity<?> reducePoint(@PathVariable String firebaseUid, @RequestParam Integer amount) {
        try {
            Optional<Point> pointOpt = pointRepository.findByFirebaseUid(firebaseUid);

            if (pointOpt.isPresent()) {
                Point point = pointOpt.get();

                if (point.getAmount() >= amount) {
                    point.setAmount(point.getAmount() - amount);
                    pointRepository.save(point);

                    // 이벤트 발행
                    PointReduced pointReduced = new PointReduced(point);
                    pointReduced.publishAfterCommit();

                    return ResponseEntity.ok(new PointResponse(
                            point.getId(),
                            point.getFirebaseUid(),
                            point.getAmount()));
                } else {
                    return ResponseEntity.badRequest().body(
                            "포인트 부족. 보유: " + point.getAmount() + ", 필요: " + amount);
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 차감 실패: " + e.getMessage());
        }
    }

    // JSON 방식 충전 API (기존 호환성 유지)
    @PostMapping("/charge")
    public ResponseEntity<?> chargePointJson(@RequestBody ChargePointRequest request) {
        try {
            Optional<Point> pointOpt = pointRepository.findByFirebaseUid(request.getFirebaseUid());
            Point point;

            if (pointOpt.isPresent()) {
                point = pointOpt.get();
                point.setAmount(point.getAmount() + request.getAmount());
            } else {
                point = new Point();
                point.setFirebaseUid(request.getFirebaseUid());
                point.setAmount(request.getAmount());
            }

            pointRepository.save(point);

            // 이벤트 발행
            PointPurchased pointPurchased = new PointPurchased(point);
            pointPurchased.publishAfterCommit();

            return ResponseEntity.ok(new PointResponse(
                    point.getId(),
                    point.getFirebaseUid(),
                    point.getAmount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 충전 실패: " + e.getMessage());
        }
    }

    // Response DTO
    public static class PointResponse {
        private Long id;
        private String firebaseUid;
        private Integer amount;

        public PointResponse(Long id, String firebaseUid, Integer amount) {
            this.id = id;
            this.firebaseUid = firebaseUid;
            this.amount = amount;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getFirebaseUid() {
            return firebaseUid;
        }

        public Integer getAmount() {
            return amount;
        }
    }

    // Request DTO
    public static class ChargePointRequest {
        private String firebaseUid;
        private Integer amount;

        // Getters and Setters
        public String getFirebaseUid() {
            return firebaseUid;
        }

        public void setFirebaseUid(String firebaseUid) {
            this.firebaseUid = firebaseUid;
        }

        public Integer getAmount() {
            return amount;
        }

        public void setAmount(Integer amount) {
            this.amount = amount;
        }
    }
}
// >>> Clean Arch / Inbound Adaptor