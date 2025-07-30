package self.domain;

import java.util.Date;
import lombok.Data;

@Data
public class GetTermQuery {

    private Long id;
    private String userId;
    private Integer point;
}
