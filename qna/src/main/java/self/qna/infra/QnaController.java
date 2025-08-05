package self.qna.infra;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
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

    @Autowired
    private FirebaseAuth firebaseAuth;

    private String getUidFromToken(String authorizationHeader) throws FirebaseAuthException {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Firebase ID token");
        }
        String token = authorizationHeader.substring(7);
        FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
        return decodedToken.getUid();
    }

    @PostMapping
    public ResponseEntity<?> createQuestion(@RequestBody QuestionDto questionDto,
                                            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            String result = qnaService.createQuestion(questionDto, uid);
            return ResponseEntity.ok("Question created successfully with id: " + result);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating question: " + e.getMessage());
        }
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
    public ResponseEntity<?> getQuestionById(@PathVariable String id,
                                             @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            String uid = null;
            if (authorizationHeader != null) {
                uid = getUidFromToken(authorizationHeader);
            }
            Question question = qnaService.getQuestionById(id, uid);
            if (question != null) {
                return ResponseEntity.ok(question);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching question: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id,
                                            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            qnaService.deleteQuestion(id, uid);
            return ResponseEntity.noContent().build();
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting question: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(@PathVariable String id,
                                            @RequestBody QuestionDto questionDto,
                                            @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            qnaService.updateQuestion(id, questionDto, uid);
            return ResponseEntity.ok().build();
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating question: " + e.getMessage());
        }
    }

    @PostMapping("/{questionId}/answers")
    public ResponseEntity<?> createAnswer(@PathVariable String questionId,
                                          @RequestBody AnswerDto answerDto,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            Answer answer = qnaService.createAnswer(questionId, answerDto.getContent(), uid);
            return ResponseEntity.ok(answer);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating answer: " + e.getMessage());
        }
    }

    @PutMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<?> updateAnswer(@PathVariable String questionId,
                                          @PathVariable String answerId,
                                          @RequestBody AnswerDto answerDto,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            qnaService.updateAnswer(questionId, answerId, answerDto.getContent(), uid);
            return ResponseEntity.noContent().build();
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating answer: " + e.getMessage());
        }
    }

    @DeleteMapping("/{questionId}/answers/{answerId}")
    public ResponseEntity<?> deleteAnswer(@PathVariable String questionId,
                                          @PathVariable String answerId,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            qnaService.deleteAnswer(questionId, answerId, uid);
            return ResponseEntity.noContent().build();
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting answer: " + e.getMessage());
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                         @RequestHeader("Authorization") String authorizationHeader) {
        try {
            String uid = getUidFromToken(authorizationHeader);
            String imageUrl = qnaService.uploadImage(file, uid);
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Failed to verify Firebase ID token: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading image: " + e.getMessage());
        }
    }
}