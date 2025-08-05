package self.qna.infra;

import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import self.qna.domain.*;
import self.qna.service.QnaService;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/qna")
public class QnaController {

    @Autowired
    private QnaService qnaService;

    // ... (질문 관련 CRUD는 동일) ...
    @PostMapping
    public ResponseEntity<String> createQuestion(@RequestBody QuestionDto questionDto,
                                                 @RequestHeader("X-Authenticated-User-Uid") String uid)
            throws ExecutionException, InterruptedException, FirebaseAuthException {
        String result = qnaService.createQuestion(questionDto, uid);
        return ResponseEntity.ok("Question created successfully with id: " + result);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<Question>> getAllQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size)
            throws ExecutionException, InterruptedException {
        PagedResponse<Question> pagedResponse = qnaService.getAllQuestions(page, size);
        return ResponseEntity.ok(pagedResponse);
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
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateQuestion(@PathVariable String id,
                                               @RequestBody QuestionDto questionDto,
                                               @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            qnaService.updateQuestion(id, questionDto, uid);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{questionId}/answers")
    public ResponseEntity<Answer> createAnswer(@PathVariable String questionId,
                                               @RequestBody AnswerDto answerDto,
                                               @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            Answer answer = qnaService.createAnswer(questionId, answerDto.getContent(), uid);
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<Void> updateAnswer(@PathVariable String questionId,
                                             @PathVariable String answerId,
                                             @RequestBody AnswerDto answerDto,
                                             @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            qnaService.updateAnswer(questionId, answerId, answerDto.getContent(), uid);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable String questionId,
                                             @PathVariable String answerId,
                                             @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            qnaService.deleteAnswer(questionId, answerId, uid);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file,
                                                           @RequestHeader("X-Authenticated-User-Uid") String uid) {
        try {
            String imageUrl = qnaService.uploadImage(file, uid);
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
