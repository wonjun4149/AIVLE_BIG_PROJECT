package self.domain;

import java.util.Date;
import lombok.Data;

@Data
public class GetTermQuery {

    private Long id;
    private Long userId;
    private Integer point;
    private Long contractId;
}
