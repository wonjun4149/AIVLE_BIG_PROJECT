package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class InfoModified extends AbstractEvent {

    private Long id;
    private String name;
    private Email email;
    private String password;
    private String company;

    public InfoModified(User aggregate) {
        super(aggregate);
    }

    public InfoModified() {
        super();
    }
}
//>>> DDD / Domain Event
