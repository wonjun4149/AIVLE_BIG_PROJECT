package self.domain;

import self.infra.AbstractEvent;
import java.util.Date;

public class PointPurchased extends AbstractEvent {

    private String id;
    private String userId;
    private Integer amount;

    public PointPurchased(Point aggregate) {
        super(aggregate);
        this.id = aggregate.getId();
        this.userId = aggregate.getUserId();
        this.amount = aggregate.getAmount();
        // 부모 클래스의 timestamp를 사용하므로 별도 설정 필요 없음
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public Integer getAmount() {
        return amount;
    }
}