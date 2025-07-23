package self.domain;

import java.util.Date;
import lombok.Data;

@Data
public class GetUserInfoQuery {

    private Long id;
    private String name;
    private Email email;
    private String password;
    private String company;
}
