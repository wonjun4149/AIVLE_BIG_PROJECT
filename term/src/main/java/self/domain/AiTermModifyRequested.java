package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class AiTermModifyRequested extends AbstractEvent {

    private Long id;
    private Long userId;
    private String title;
    private String category;
    private String productName;
    private String content;
    private String requirement;
    private String version;
    private String memo;
    private String origin;
    private Date createdAt;
    private Date modifiedAt;
    private Date expiresAt;
    private String risk;
    private String feedback;
    private String client;
    private String userCompany;

    public AiTermModifyRequested(Term aggregate) {
        super(aggregate);
    }

    public AiTermModifyRequested() {
        super();
    }
}
//>>> DDD / Domain Event
