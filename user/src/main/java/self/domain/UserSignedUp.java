package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.*;
import self.domain.*;
import self.infra.AbstractEvent;

//<<< DDD / Domain Event
@Data
@ToString
public class UserSignedUp extends AbstractEvent {

    private Long id;
    private String name;
    private Email email;
    private String password;
    private String company;

    public UserSignedUp(User aggregate) {
        super(aggregate);
    }

    public UserSignedUp() {
        super();
    }
}
//>>> DDD / Domain Event
