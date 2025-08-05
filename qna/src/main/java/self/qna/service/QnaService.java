package self.qna.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.Bucket;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import self.qna.domain.Answer;
import self.qna.domain.PagedResponse;
import self.qna.domain.Question;
import self.qna.domain.QuestionDto;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class QnaService {

    public static final String COLLECTION_NAME = "questions";
    public static final String ANSWERS_SUBCOLLECTION = "answers";

    // ... createQuestion, getAllQuestions ... (이전과 동일)
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
        question.setImageUrl(questionDto.getImageUrl());
        question.setAuthorId(uid);
        question.setAuthorName(authorName);
        question.setCreatedAt(new Date());
        question.setUpdatedAt(new Date());
        question.setViewCount(0);

        Firestore dbFirestore = FirestoreClient.getFirestore();
        dbFirestore.collection(COLLECTION_NAME).document(question.getId()).set(question).get();
        return question.getId();
    }

    public PagedResponse<Question> getAllQuestions(int page, int size) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        
        ApiFuture<QuerySnapshot> countFuture = dbFirestore.collection(COLLECTION_NAME).get();
        long totalElements = countFuture.get().size();
        int totalPages = (int) Math.ceil((double) totalElements / size);

        ApiFuture<QuerySnapshot> dataFuture = dbFirestore.collection(COLLECTION_NAME)
                .orderBy("createdAt", Query.Direction.DESCENDING)
                .offset(page * size)
                .limit(size)
                .get();
        
        List<Question> questions = dataFuture.get().toObjects(Question.class);

        PagedResponse<Question> response = new PagedResponse<>();
        response.setContent(questions);
        response.setPageNumber(page);
        response.setPageSize(size);
        response.setTotalElements(totalElements);
        response.setTotalPages(totalPages);
        response.setLast(page >= totalPages - 1);

        return response;
    }

    public Question getQuestionById(String id, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (documentSnapshot.exists()) {
            Question question = documentSnapshot.toObject(Question.class);

            ApiFuture<QuerySnapshot> answersFuture = documentReference.collection(ANSWERS_SUBCOLLECTION)
                    .orderBy("createdAt", Query.Direction.ASCENDING).get();
            List<Answer> answers = answersFuture.get().toObjects(Answer.class);
            question.setAnswers(answers);

            boolean shouldIncreaseView = uid != null && !uid.equals(question.getAuthorId());
            if (shouldIncreaseView) {
                documentReference.update("viewCount", FieldValue.increment(1));
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
        if (question == null || !uid.equals(question.getAuthorId())) {
            throw new SecurityException("User is not authorized to delete this question.");
        }

        if (question.getImageUrl() != null && !question.getImageUrl().isEmpty()) {
            deleteImageFromStorage(question.getImageUrl());
        }
        documentReference.delete();
    }

    public Answer createAnswer(String questionId, String content, String uid) throws FirebaseAuthException, ExecutionException, InterruptedException {
        UserRecord userRecord = FirebaseAuth.getInstance().getUser(uid);
        String authorName = userRecord.getDisplayName() != null ? userRecord.getDisplayName() : "Anonymous";

        Answer answer = new Answer();
        answer.setId(UUID.randomUUID().toString());
        answer.setContent(content);
        answer.setAuthorId(uid);
        answer.setAuthorName(authorName);
        answer.setCreatedAt(new Date());
        answer.setUpdatedAt(new Date()); // 생성 시에도 updatedAt 설정

        Firestore dbFirestore = FirestoreClient.getFirestore();
        dbFirestore.collection(COLLECTION_NAME).document(questionId)
                   .collection(ANSWERS_SUBCOLLECTION).document(answer.getId()).set(answer).get();

        return answer;
    }

    public void updateAnswer(String questionId, String answerId, String content, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference answerRef = dbFirestore.collection(COLLECTION_NAME).document(questionId)
                                                 .collection(ANSWERS_SUBCOLLECTION).document(answerId);
        
        DocumentSnapshot answerSnapshot = answerRef.get().get();
        if (!answerSnapshot.exists()) {
            throw new RuntimeException("Answer not found");
        }

        Answer answer = answerSnapshot.toObject(Answer.class);
        if (answer == null || !uid.equals(answer.getAuthorId())) {
            throw new SecurityException("User is not authorized to update this answer.");
        }

        answerRef.update("content", content, "updatedAt", new Date());
    }

    public void deleteAnswer(String questionId, String answerId, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference answerRef = dbFirestore.collection(COLLECTION_NAME).document(questionId)
                                                 .collection(ANSWERS_SUBCOLLECTION).document(answerId);
        
        DocumentSnapshot answerSnapshot = answerRef.get().get();
        if (!answerSnapshot.exists()) {
            // 이미 삭제되었거나 없는 경우, 오류 대신 정상 종료
            return;
        }

        Answer answer = answerSnapshot.toObject(Answer.class);
        if (answer == null || !uid.equals(answer.getAuthorId())) {
            throw new SecurityException("User is not authorized to delete this answer.");
        }

        answerRef.delete();
    }

    // ... (updateQuestion, deleteImageFromStorage, uploadImage는 이전과 동일) ...
    public void updateQuestion(String id, QuestionDto questionDto, String uid) throws ExecutionException, InterruptedException {
        Firestore dbFirestore = FirestoreClient.getFirestore();
        DocumentReference documentReference = dbFirestore.collection(COLLECTION_NAME).document(id);
        DocumentSnapshot documentSnapshot = documentReference.get().get();

        if (!documentSnapshot.exists()) {
            throw new RuntimeException("Question not found with id: " + id);
        }

        Question existingQuestion = documentSnapshot.toObject(Question.class);
        if (existingQuestion == null || !uid.equals(existingQuestion.getAuthorId())) {
            throw new SecurityException("User is not authorized to update this question.");
        }

        boolean isImageDeleted = (questionDto.getImageUrl() == null || questionDto.getImageUrl().isEmpty()) 
                                && (existingQuestion.getImageUrl() != null && !existingQuestion.getImageUrl().isEmpty());

        if (isImageDeleted) {
            deleteImageFromStorage(existingQuestion.getImageUrl());
        }

        Map<String, Object> updates = new HashMap<>();
        updates.put("title", questionDto.getTitle());
        updates.put("content", questionDto.getContent());
        updates.put("updatedAt", new Date());
        updates.put("imageUrl", questionDto.getImageUrl());

        documentReference.update(updates);
    }

    private void deleteImageFromStorage(String imageUrl) {
        try {
            Bucket bucket = StorageClient.getInstance().bucket();
            String bucketName = bucket.getName();
            String prefix = "https://storage.googleapis.com/" + bucketName + "/";
            if (!imageUrl.startsWith(prefix)) {
                String objectName = imageUrl.split("/o/")[1].split("\\?")[0];
                objectName = URLDecoder.decode(objectName, StandardCharsets.UTF_8);
                bucket.get(objectName).delete();
                return;
            }
            String objectName = imageUrl.substring(prefix.length());
            
            Blob blob = bucket.get(objectName);
            if (blob != null) {
                blob.delete();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String uploadImage(MultipartFile file, String uid) throws IOException, FirebaseAuthException {
        if (uid == null || uid.isEmpty()) {
            throw new SecurityException("User must be authenticated to upload images.");
        }

        Bucket bucket = StorageClient.getInstance().bucket();
        String fileName = "qna-images/" + uid + "/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        
        try (InputStream content = file.getInputStream()) {
            Blob blob = bucket.create(fileName, content, file.getContentType());
            blob.createAcl(com.google.cloud.storage.Acl.of(com.google.cloud.storage.Acl.User.ofAllUsers(), com.google.cloud.storage.Acl.Role.READER));
            return String.format("https://storage.googleapis.com/%s/%s", bucket.getName(), fileName);
        }
    }
}
