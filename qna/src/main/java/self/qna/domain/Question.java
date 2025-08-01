package self.qna.domain;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class Question {
    private String id; // Firestore document ID
    private String title;
    private String content;
    private String authorId; // User ID
    private String authorName;
    private Date createdAt;
    private Date updatedAt;
    private int viewCount;
    private List<Answer> answers; // Embedded or sub-collection
}
