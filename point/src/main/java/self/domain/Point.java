package self.domain;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Point {

    // Firestore 문서 ID를 저장할 필드
    private String id;

    private Integer amount;

    private String userId; // Firebase UID

    // JPA 관련 어노테이션 및 정적 메소드 모두 제거
    // 포인트 차감 로직 등은 PointService 클래스로 이동해야 함
}
