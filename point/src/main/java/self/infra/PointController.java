package self.infra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import self.domain.Point;
import self.domain.PointPurchased;
import self.domain.PointReduced;
import self.service.PointService; // PointService import

import java.util.Optional;

@RestController
@RequestMapping(value = "/api/points")
@CrossOrigin(origins = "*")
public class PointController {

    @Autowired
    private PointService pointService; // PointRepository -> PointService

    // Firebase UID로 포인트 조회
    @GetMapping("/{firebaseUid}")
    public ResponseEntity<?> getPointByFirebaseUid(@PathVariable String firebaseUid) {
        try {
            // PointService를 통해 포인트 조회
            Point point = pointService.getOrCreatePoint(firebaseUid);
            return ResponseEntity.ok(new PointResponse(point.getId(), point.getUserId(), point.getAmount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 조회 실패: " + e.getMessage());
        }
    }

    // 포인트 충전 API
    @PostMapping("/{firebaseUid}/charge")
    public ResponseEntity<?> chargePoint(@PathVariable String firebaseUid, @RequestParam Integer amount) {
        try {
            Point updatedPoint = pointService.chargePoint(firebaseUid, amount);
            return ResponseEntity.ok(new PointResponse(updatedPoint.getId(), updatedPoint.getUserId(), updatedPoint.getAmount()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 충전 실패: " + e.getMessage());
        }
    }

    // 포인트 수동 차감 API
    @PostMapping("/{firebaseUid}/reduce")
    public ResponseEntity<?> reducePoint(@PathVariable String firebaseUid, @RequestParam Integer amount) {
        try {
            Point updatedPoint = pointService.reducePointManually(firebaseUid, amount);
            return ResponseEntity.ok(new PointResponse(updatedPoint.getId(), updatedPoint.getUserId(), updatedPoint.getAmount()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 차감 실패: " + e.getMessage());
        }
    }

    // Response DTO
    public static class PointResponse {
        private String id; // Long -> String
        private String userId;
        private Integer amount;

        public PointResponse(String id, String userId, Integer amount) {
            this.id = id;
            this.userId = userId;
            this.amount = amount;
        }

        // Getters
        public String getId() { return id; }
        public String getUserId() { return userId; }
        public Integer getAmount() { return amount; }
    }
}
