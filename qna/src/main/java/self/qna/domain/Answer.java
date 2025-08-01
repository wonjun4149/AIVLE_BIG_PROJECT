package self.qna.domain;

import lombok.Data;
import java.util.Date;

@Data
public class Answer {
    private String id;
    private String content;
    private String authorId;
    private String authorName;
    private Date createdAt;
}
