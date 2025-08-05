package self.qna.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private String imageUrl;
    private transient List<Answer> answers; // DB에 저장하지 않고, 조회 시에만 채워넣는 필드

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
