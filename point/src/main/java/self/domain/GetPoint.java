package self.domain;

import lombok.Data;

//<<< EDA / CQRS
@Data
public class GetPoint {

    private String id;
    private String userid;
    private Long point;
}
