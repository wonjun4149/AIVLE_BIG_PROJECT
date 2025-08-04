package self.infra;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import self.domain.Point;
import self.service.PointService;

@RestController
@RequestMapping(value = "/api/points")
public class PointController {

    @Autowired
    private PointService pointService;

    // Firebase UID로 포인트 조회
    @GetMapping("/{firebaseUid}")
    public Mono<ResponseEntity<Object>> getPointByFirebaseUid(@PathVariable String firebaseUid) {
        return pointService.getOrCreatePoint(firebaseUid)
                .map(point -> ResponseEntity.ok(new PointResponse(point.getId(), point.getUserId(), point.getAmount())))
                .cast(ResponseEntity.class)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().body("포인트 조회 실패: " + e.getMessage())))
                .map(response -> (ResponseEntity<Object>) response);
    }

    // 포인트 충전 API
    @PostMapping("/{firebaseUid}/charge")
    public Mono<ResponseEntity<Object>> chargePoint(@PathVariable String firebaseUid, @RequestBody ChargeRequest chargeRequest) {
        return pointService.chargePoint(firebaseUid, chargeRequest.getAmount())
                .map(updatedPoint -> ResponseEntity.ok(new PointResponse(updatedPoint.getId(), updatedPoint.getUserId(), updatedPoint.getAmount())))
                .cast(ResponseEntity.class)
                .onErrorResume(IllegalArgumentException.class, e -> Mono.just(ResponseEntity.badRequest().body(e.getMessage())))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(500).body("포인트 충전 실패: " + e.getMessage())))
                .map(response -> (ResponseEntity<Object>) response);
    }

    // 포인트 수동 차감 API
    @PostMapping("/{firebaseUid}/reduce")
    public Mono<ResponseEntity<Object>> reducePoint(@PathVariable String firebaseUid, @RequestParam Integer amount) {
        return pointService.reducePointManually(firebaseUid, amount)
                .map(updatedPoint -> ResponseEntity.ok(new PointResponse(updatedPoint.getId(), updatedPoint.getUserId(), updatedPoint.getAmount())))
                .cast(ResponseEntity.class)
                .onErrorResume(IllegalArgumentException.class, e -> Mono.just(ResponseEntity.badRequest().body(e.getMessage())))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(500).body("포인트 차감 실패: " + e.getMessage())))
                .map(response -> (ResponseEntity<Object>) response);
    }

    // Request DTO for charging points
    public static class ChargeRequest {
        private Integer amount;
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
    }

    // Response DTO
    public static class PointResponse {
        private String id;
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