package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class PointPurchased extends AbstractEvent {

    private Long id;
    private Integer amount;
    private String userId; // Long -> String으로 변경 (Firebase UID 저장)

    public PointPurchased(Point aggregate) {
        super(aggregate);
    }

    public PointPurchased() {
        super();
    }

}
// >>> DDD / Domain Event