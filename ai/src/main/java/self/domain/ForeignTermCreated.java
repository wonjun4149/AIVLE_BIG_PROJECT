package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class ForeignTermCreated extends AbstractEvent {

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

    public ForeignTermCreated(Ai aggregate) {
        super(aggregate);
    }

    public ForeignTermCreated() {
        super();
    }
}
//>>> DDD / Domain Event
