package self.domain;

import lombok.Data;
import lombok.ToString;
import self.infra.AbstractEvent;

@Data
@ToString
public class TermCreateRequested extends AbstractEvent {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String productName;
    private String requirement;
    private String userCompany;
    private String client;
    private String termType;
    private String userId;

    public TermCreateRequested(){
        super();
    }
}