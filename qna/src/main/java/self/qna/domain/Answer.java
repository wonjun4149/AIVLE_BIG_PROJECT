package self.qna.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.util.Date;

@Data
public class Answer {
    private String id;
    private String content;
    private String authorId;
    private String authorName;
    private Date createdAt;
    private Date updatedAt;

    // authorName 필드에 대한 getter를 직접 구현하여 이름 마스킹 처리
    public String getAuthorName() {
        if (this.authorName == null || this.authorName.isEmpty()) {
            return "";
        }
        if (this.authorName.length() <= 2) {
            return this.authorName.substring(0, 1) + "*";
        }
        return this.authorName.substring(0, 1) + "*".repeat(this.authorName.length() - 1);
    }
}
