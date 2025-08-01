package self.qna.infra;

import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import self.qna.domain.Answer;
import self.qna.domain.Question;
import self.qna.domain.QuestionDto;
import self.qna.service.QnaService;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/qna")
public class QnaController {

    @Autowired
    private QnaService qnaService;

    @PostMapping
    public ResponseEntity<String> createQuestion(@RequestBody QuestionDto questionDto,
                                                 @RequestHeader("X-Authenticated-User-Uid") String uid)
            throws ExecutionException, InterruptedException, FirebaseAuthException {
        String result = qnaService.createQuestion(questionDto, uid);
        return ResponseEntity.ok("Question created successfully with id: " + result);
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() throws ExecutionException, InterruptedException {
        List<Question> questions = qnaService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable String id,
                                                    @RequestHeader(value = "X-Authenticated-User-Uid", required = false) String uid)
            throws ExecutionException, InterruptedException {
        Question question = qnaService.getQuestionById(id, uid);
        if (question != null) {
            return ResponseEntity.ok(question);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String id,
                                               @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            qnaService.deleteQuestion(id, uid);
            return ResponseEntity.noContent().build(); // 성공 (204)
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build(); // 권한 없음 (403)
        } catch (Exception e) {
            return ResponseEntity.status(500).build(); // 서버 내부 오류
        }
    }

    @PostMapping("/{questionId}/answers")
    public ResponseEntity<Answer> createAnswer(@PathVariable String questionId,
                                               @RequestBody String content,
                                               @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            // content가 JSON 문자열("내용")로 오는 경우 따옴표 제거
            String plainContent = content.startsWith("\"") && content.endsWith("\"")
                                ? content.substring(1, content.length() - 1)
                                : content;
            Answer answer = qnaService.createAnswer(questionId, plainContent, uid);
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}