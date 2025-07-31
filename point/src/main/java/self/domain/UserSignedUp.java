package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;
import self.infra.AbstractEvent;

@Data
public class UserSignedUp extends AbstractEvent {

    private Long id;
    private String userId; // Firebase UID
    private String name;
    private String email;
    private String password;
    private String company;
}
