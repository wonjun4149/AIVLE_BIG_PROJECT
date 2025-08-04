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

    public void validate() {
        // 이벤트 데이터의 유효성을 검사하는 로직 (필요 시 구현)
    }
}
