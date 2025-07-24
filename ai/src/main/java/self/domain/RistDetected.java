package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class RistDetected extends AbstractEvent {

    private Long id;
    private Long termId;
    private String termTile;
    private String termCategory;
    private String termProductName;
    private String termContent;
    private Long termVersion;
    private String termRequirement;
    private String termRisk;
    private String termFeedback;

    public RistDetected(Ai aggregate) {
        super(aggregate);
    }

    public RistDetected() {
        super();
    }
}
//>>> DDD / Domain Event
