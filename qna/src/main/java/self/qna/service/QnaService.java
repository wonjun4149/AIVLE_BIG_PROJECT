package self.qna.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import self.qna.domain.Answer;
import self.qna.domain.Question;
import self.qna.domain.QuestionDto;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class QnaService {

    public static final String COLLECTION_NAME = "questions";

    public String createQuestion(QuestionDto questionDto, String uid) throws ExecutionException, InterruptedException, FirebaseAuthException {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);
        String authorName = userRecord.getDisplayName();
        if (authorName == null || authorName.isEmpty()) {
            authorName = "Anonymous";
        }

        Question question = new Question();
        question.setId(UUID.randomUUID().toString());
        question.setTitle(questionDto.getTitle());
        question.setContent(questionDto.getContent());
        question.setAuthorId(uid);
        question.setAuthorName(authorName);
        question.setCreatedAt(new Date());
        question.setUpdatedAt(new Date());
        question.setViewCount(0); // 조회수 0으로 초기화
        question.setAnswers(new ArrayList<>()); // Initialize with empty list

        Firestore dbFirestore = FirestoreClient.getFirestore();
        dbFirestore.collection(COLLECTION_NAME).document(question.getId()).set(question).get();
        return question.getId();
    }

    public List<Question> getAllQuestions() throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        ApiFuture<QuerySnapshot> future = dbFirestore.collection(COLLECTION_NAME).get();
        List<QueryDocumentSnapshot> documents = future.get().getDocuments();
        List<Question> questions = new ArrayList<>();
        for (QueryDocumentSnapshot document : documents) {
            questions.add(document.toObject(Question.class));
        }
        return questions;
    }

    public Question getQuestionById(String id, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (documentSnapshot.exists()) {
            Question question = documentSnapshot.toObject(Question.class);

            // 작성자가 아니고, 로그인한 사용자일 경우에만 조회수 증가
            boolean shouldIncreaseView = uid != null && !uid.equals(question.getAuthorId());
            if (shouldIncreaseView) {
                documentReference.update("viewCount", FieldValue.increment(1));
                // 화면에 바로 반영되도록 객체의 조회수도 1 증가시켜서 리턴
                question.setViewCount(question.getViewCount() + 1);
            }
            
            return question;
        }
        return null;
    }

    public void deleteQuestion(String id, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (!documentSnapshot.exists()) {
            throw new RuntimeException("Question not found with id: " + id);
        }

        Question question = documentSnapshot.toObject(Question.class);
        if (question == null || !question.getAuthorId().equals(uid)) {
            throw new SecurityException("User is not authorized to delete this question.");
        }

        documentReference.delete();
    }

    public Answer createAnswer(String questionId, String content, String uid) throws FirebaseAuthException {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);
        String authorName = userRecord.getDisplayName() != null ? userRecord.getDisplayName() : "Anonymous";

        Answer answer = new Answer();
        answer.setId(UUID.randomUUID().toString());
        answer.setContent(content);
        answer.setAuthorId(uid);
        answer.setAuthorName(authorName);
        answer.setCreatedAt(new Date());

        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference questionRef = dbFirestore.collection(COLLECTION_NAME).document(questionId);

        questionRef.update("answers", FieldValue.arrayUnion(answer));

        return answer;
    }
}