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
@RequestMapping(value="/api/points")
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
                    point.getAmount()
                ));
            } else {
                // 포인트가 없으면 0포인트로 초기화
                Point newPoint = new Point();
                newPoint.setFirebaseUid(firebaseUid);
                newPoint.setAmount(0);
                pointRepository.save(newPoint);
                
                return ResponseEntity.ok(new PointResponse(
                    newPoint.getId(),
                    newPoint.getFirebaseUid(),
                    newPoint.getAmount()
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("포인트 조회 실패: " + e.getMessage());
        }
    }

    // 포인트 충전 API
    @PostMapping("/charge")
    public ResponseEntity<?> chargePoint(@RequestBody ChargePointRequest request) {
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
            
            return ResponseEntity.ok(new PointResponse(
                point.getId(),
                point.getFirebaseUid(),
                point.getAmount()
            ));
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
        public Long getId() { return id; }
        public String getFirebaseUid() { return firebaseUid; }
        public Integer getAmount() { return amount; }
    }

    // Request DTO
    public static class ChargePointRequest {
        private String firebaseUid;
        private Integer amount;

        // Getters and Setters
        public String getFirebaseUid() { return firebaseUid; }
        public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
    }
}
//>>> Clean Arch / Inbound Adaptor