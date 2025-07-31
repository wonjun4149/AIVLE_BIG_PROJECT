package self.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import self.domain.*;

import java.util.concurrent.ExecutionException;

@Service
public class PointService {

    @Autowired
    private PointRepository pointRepository;

    @Autowired
    private StreamBridge streamBridge;

    private static final int DEDUCTION_AMOUNT = 5000; // 공통 차감 비용

    // 이벤트 기반 포인트 차감
    public void reducePointForEvent(String userId, String reason) throws ExecutionException, InterruptedException {
        pointRepository.findByUserId(userId).ifPresent(point -> {
            if (point.getAmount() >= DEDUCTION_AMOUNT) {
                point.setAmount(point.getAmount() - DEDUCTION_AMOUNT);
                try {
                    pointRepository.save(point);
                    PointReduced pointReduced = new PointReduced(point);
                    streamBridge.send("event-out", pointReduced);
                    System.out.println("포인트 차감 완료: " + userId + ", 사유: " + reason +
                                       ", 차감: " + DEDUCTION_AMOUNT + ", 남은 포인트: " + point.getAmount());
                } catch (ExecutionException | InterruptedException e) {
                    throw new RuntimeException(e);
                }
            } else {
                System.out.println("포인트 부족: " + userId + ", 보유: " + point.getAmount() +
                                   ", 필요: " + DEDUCTION_AMOUNT);
            }
        });
    }
    
    // 회원가입 시 초기 포인트 지급
    public void createInitialPoint(UserSignedUp event) throws ExecutionException, InterruptedException {
        Point point = new Point();
        point.setUserId(event.getUserId());
        point.setAmount(100000); // 초기 지급 포인트
        pointRepository.save(point);

        PointPurchased pointPurchased = new PointPurchased(point);
        streamBridge.send("event-out", pointPurchased);
    }

    // 컨트롤러용 메소드들
    public Point getOrCreatePoint(String userId) throws ExecutionException, InterruptedException {
        return pointRepository.findByUserId(userId).orElseGet(() -> {
            Point newPoint = new Point();
            newPoint.setUserId(userId);
            newPoint.setAmount(0);
            try {
                return pointRepository.save(newPoint);
            } catch (ExecutionException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        });
    }

    public Point chargePoint(String userId, int amount) throws ExecutionException, InterruptedException {
        Point point = getOrCreatePoint(userId);
        point.setAmount(point.getAmount() + amount);
        pointRepository.save(point);

        PointPurchased pointPurchased = new PointPurchased(point);
        streamBridge.send("event-out", pointPurchased);
        return point;
    }

    public Point reducePointManually(String userId, int amount) throws ExecutionException, InterruptedException {
        Point point = getOrCreatePoint(userId);
        if (point.getAmount() < amount) {
            throw new IllegalArgumentException("포인트 부족. 보유: " + point.getAmount() + ", 필요: " + amount);
        }
        point.setAmount(point.getAmount() - amount);
        pointRepository.save(point);

        PointReduced pointReduced = new PointReduced(point);
        streamBridge.send("event-out", pointReduced);
        return point;
    }
}