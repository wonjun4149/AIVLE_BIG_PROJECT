package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class TermCreateRequested extends AbstractEvent {

    private Long id;
    private Long userId;
    private String title;
    private String category;
    private String productName;
    private String content;
    private String requirement;
    private String version;
    private Date createdAt;
    private Date expiresAt;
    private String feedback;
    private String client;
    private String userCompany;

    public TermCreateRequested(Term aggregate) {
        super(aggregate);
    }

    public TermCreateRequested() {
        super();
    }
}
//>>> DDD / Domain Event
