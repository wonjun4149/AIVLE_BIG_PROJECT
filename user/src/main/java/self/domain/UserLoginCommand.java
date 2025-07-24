package self.domain;

import java.time.LocalDate;
import java.util.*;
import lombok.Data;

@Data
public class UserLoginCommand {

    private Long id;
    private String email;
    private String password;
}
